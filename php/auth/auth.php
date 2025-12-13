<?php
/**
 * Gestion de l'authentification - MH Couture
 * Fichier: php/auth/auth.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? '';

// INSCRIPTION
if ($action === 'signup') {
    $firstName = sanitizeInput($input['firstName'] ?? '');
    $lastName = sanitizeInput($input['lastName'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $password = $input['password'] ?? '';
    $newsletter = isset($input['newsletter']) && $input['newsletter'] ? 1 : 0;
    
    // Validation
    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($password)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Tous les champs sont requis'
        ], 400);
    }
    
    if (!validateEmail($email)) {
        sendJSONResponse([
            'success' => false,
            'field' => 'email',
            'message' => 'Email invalide'
        ], 400);
    }
    
    if (strlen($password) < 8) {
        sendJSONResponse([
            'success' => false,
            'field' => 'password',
            'message' => 'Le mot de passe doit contenir au moins 8 caracteres'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion a la base de donnees');
        }
        
        // Verifier si l'email existe deja
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->fetch()) {
            sendJSONResponse([
                'success' => false,
                'field' => 'email',
                'message' => 'Cet email est deja utilise'
            ], 400);
        }
        
        // Verifier si le telephone existe deja
        $stmt = $conn->prepare("SELECT id FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        
        if ($stmt->fetch()) {
            sendJSONResponse([
                'success' => false,
                'field' => 'phone',
                'message' => 'Ce numero de telephone est deja utilise'
            ], 400);
        }
        
        // Hasher le mot de passe
        $hashedPassword = hashPassword($password);
        $token = generateToken();
        
        // Inserer l'utilisateur
        $stmt = $conn->prepare("
            INSERT INTO users (first_name, last_name, email, phone, password, newsletter, token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $firstName,
            $lastName,
            $email,
            $phone,
            $hashedPassword,
            $newsletter,
            $token
        ]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Inscription reussie',
            'token' => $token,
            'user' => [
                'id' => $conn->lastInsertId(),
                'name' => $firstName . ' ' . $lastName,
                'email' => $email
            ]
        ]);
        
    } catch (Exception $e) {
        logError("Erreur inscription: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'inscription'
        ], 500);
    }
}

// CONNEXION
elseif ($action === 'login') {
    $email = sanitizeInput($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $remember = $input['remember'] ?? false;
    
    if (empty($email) || empty($password)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Email et mot de passe requis'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion a la base de donnees');
        }
        
        $stmt = $conn->prepare("
            SELECT id, first_name, last_name, email, password, token
            FROM users
            WHERE email = ? AND is_active = 1
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            sendJSONResponse([
                'success' => false,
                'field' => 'email',
                'message' => 'Email non trouve'
            ], 401);
        }
        
        if (!verifyPassword($password, $user['password'])) {
            sendJSONResponse([
                'success' => false,
                'field' => 'password',
                'message' => 'Mot de passe incorrect'
            ], 401);
        }
        
        // Generer un nouveau token si necessaire
        $token = $user['token'];
        if (empty($token)) {
            $token = generateToken();
            $stmt = $conn->prepare("UPDATE users SET token = ? WHERE id = ?");
            $stmt->execute([$token, $user['id']]);
        }
        
        // Mettre a jour la derniere connexion
        $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Connexion reussie',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['first_name'] . ' ' . $user['last_name'],
                'email' => $user['email']
            ]
        ]);
        
    } catch (Exception $e) {
        logError("Erreur connexion: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la connexion'
        ], 500);
    }
}

// VERIFIER SI ADMIN
elseif ($action === 'checkAdmin') {
    $token = $input['token'] ?? '';
    
    if (empty($token)) {
        sendJSONResponse([
            'success' => false,
            'isAdmin' => false,
            'message' => 'Token manquant'
        ], 401);
    }
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'isAdmin' => false,
            'message' => 'Token invalide'
        ], 401);
    }
    
    $isUserAdmin = isAdmin($token);
    
    sendJSONResponse([
        'success' => true,
        'isAdmin' => $isUserAdmin,
        'user' => [
            'id' => $user['id'],
            'name' => $user['first_name'] . ' ' . $user['last_name'],
            'email' => $user['email']
        ]
    ]);
}

// DECONNEXION
elseif ($action === 'logout') {
    $token = $input['token'] ?? '';
    
    if (!empty($token)) {
        try {
            $conn = getDBConnection();
            if ($conn) {
                $stmt = $conn->prepare("UPDATE users SET token = NULL WHERE token = ?");
                $stmt->execute([$token]);
            }
        } catch (Exception $e) {
            logError("Erreur deconnexion: " . $e->getMessage());
        }
    }
    
    sendJSONResponse([
        'success' => true,
        'message' => 'Deconnexion reussie'
    ]);
}

// Action inconnue
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
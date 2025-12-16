
<?php
/**
 * API Reset Password - MH Couture
 * Fichier: php/auth/password-reset.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? '';

// DEMANDE DE RESET
if ($action === 'request_reset') {
    $email = sanitizeInput($input['email'] ?? '');
    
    if (empty($email)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Email requis'
        ], 400);
    }
    
    if (!validateEmail($email)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Email invalide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier si l'email existe
        $stmt = $conn->prepare("SELECT id, first_name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // Pour la sécurité, on ne dit pas que l'email n'existe pas
            sendJSONResponse([
                'success' => true,
                'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé'
            ]);
        }
        
        // Générer un token de reset
        $resetToken = generateToken(32);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Supprimer les anciens tokens
        $stmt = $conn->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        // Créer le nouveau token
        $stmt = $conn->prepare("
            INSERT INTO password_resets (user_id, token, expires_at, created_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$user['id'], $resetToken, $expiresAt]);
        
        // Envoyer l'email
        $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/reset-password.php?token=" . $resetToken;
        
        $emailSubject = "Réinitialisation de votre mot de passe - MH Couture";
        $emailBody = "
Bonjour {$user['first_name']},

Vous avez demandé la réinitialisation de votre mot de passe sur MH Couture.

Cliquez sur ce lien pour créer un nouveau mot de passe :
$resetLink

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.

Cordialement,
L'équipe MH Couture
        ";
        
        sendEmail($email, $emailSubject, $emailBody);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Un email de réinitialisation a été envoyé'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur request_reset: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la demande'
        ], 500);
    }
}

// VALIDER LE TOKEN
elseif ($action === 'validate_token') {
    $token = sanitizeInput($input['token'] ?? '');
    
    if (empty($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Token manquant'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT user_id, expires_at 
            FROM password_resets 
            WHERE token = ? AND used = 0
        ");
        $stmt->execute([$token]);
        $reset = $stmt->fetch();
        
        if (!$reset) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Token invalide ou déjà utilisé'
            ], 400);
        }
        
        if (strtotime($reset['expires_at']) < time()) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Token expiré'
            ], 400);
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Token valide'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur validate_token: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur de validation'
        ], 500);
    }
}

// RESET LE MOT DE PASSE
elseif ($action === 'reset_password') {
    $token = sanitizeInput($input['token'] ?? '');
    $newPassword = $input['new_password'] ?? '';
    
    if (empty($token) || empty($newPassword)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Données manquantes'
        ], 400);
    }
    
    if (strlen($newPassword) < 8) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Le mot de passe doit contenir au moins 8 caractères'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier le token
        $stmt = $conn->prepare("
            SELECT user_id, expires_at 
            FROM password_resets 
            WHERE token = ? AND used = 0
        ");
        $stmt->execute([$token]);
        $reset = $stmt->fetch();
        
        if (!$reset) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Token invalide'
            ], 400);
        }
        
        if (strtotime($reset['expires_at']) < time()) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Token expiré'
            ], 400);
        }
        
        // Hasher le nouveau mot de passe
        $hashedPassword = hashPassword($newPassword);
        
        // Mettre à jour le mot de passe
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $reset['user_id']]);
        
        // Marquer le token comme utilisé
        $stmt = $conn->prepare("UPDATE password_resets SET used = 1 WHERE token = ?");
        $stmt->execute([$token]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Mot de passe changé avec succès'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur reset_password: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la réinitialisation'
        ], 500);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
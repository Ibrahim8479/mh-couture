<?php
/**
 * API Gestion des Messages de Contact - MH Couture (version corrigée)
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
setJSONHeaders();

switch ($action) {
    case 'send':
        $name = sanitizeInput($input['name'] ?? '');
        $email = sanitizeInput($input['email'] ?? '');
        $message = sanitizeInput($input['message'] ?? '');
        if (!$name || !$email || !$message) {
            sendJSONResponse(['success' => false, 'message' => 'Tous les champs sont obligatoires'], 400);
        }
        if (!validateEmail($email)) {
            sendJSONResponse(['success' => false, 'message' => 'Email invalide'], 400);
        }
        try {
            $conn = getDBConnection();
            $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$name, $email, $message]);
            sendEmail(ADMIN_EMAIL, 'Nouveau message de contact', "De: $name <$email>\n\n$message");
            sendJSONResponse(['success' => true, 'message' => 'Message envoyé avec succès']);
        } catch (Exception $e) {
            logError('send contact: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => 'Erreur lors de l\'envoi'], 500);
        }
        break;
    case 'getAllMessages':
        $token = $_GET['token'] ?? '';
        if (!isAdmin($token)) {
            sendJSONResponse(['success' => false, 'message' => 'Accès refusé'], 403);
        }
        try {
            $conn = getDBConnection();
            $stmt = $conn->prepare("SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC");
            $stmt->execute();
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendJSONResponse(['success' => true, 'messages' => $messages]);
        } catch (Exception $e) {
            logError('getAllMessages: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => 'Erreur chargement messages'], 500);
        }
        break;
    default:
        sendJSONResponse(['success' => false, 'message' => 'Action non reconnue'], 400);
}
<?php
/**
 * API Gestion des Messages de Contact - MH Couture
 * Fichier: php/api/contact.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? '';

// ENVOYER UN MESSAGE DE CONTACT
if ($action === 'sendContactMessage') {
    $firstName = sanitizeInput($input['firstName'] ?? '');
    $lastName = sanitizeInput($input['lastName'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $subject = sanitizeInput($input['subject'] ?? '');
    $message = sanitizeInput($input['message'] ?? '');
    
    // Validation
    if (empty($firstName) || empty($lastName) || empty($email) || 
        empty($subject) || empty($message)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Tous les champs obligatoires doivent etre remplis'
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
        
        // Inserer le message
        $stmt = $conn->prepare("
            INSERT INTO contact_messages 
            (first_name, last_name, email, phone, subject, message, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), 'unread')
        ");
        
        $stmt->execute([
            $firstName,
            $lastName,
            $email,
            $phone,
            $subject,
            $message
        ]);
        
        $message_id = $conn->lastInsertId();
        
        // Envoyer un email de notification
        $emailSubject = "Nouveau message de contact: $subject";
        $emailBody = "
Nouveau message recu sur MH Couture

De: $firstName $lastName
Email: $email
Telephone: $phone
Sujet: $subject

Message:
$message

---
Message ID: $message_id
        ";
        
        sendEmail('info@mhcouture.com', $emailSubject, $emailBody, $email);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Message envoye avec succes',
            'message_id' => $message_id
        ]);
        
    } catch (Exception $e) {
        logError("Erreur send contact: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'envoi du message'
        ], 500);
    }
}

// RECUPERER TOUS LES MESSAGES (Admin)
elseif ($action === 'getAllMessages') {
    $token = $_GET['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Acces non autorise'
        ], 403);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $status = $_GET['status'] ?? 'all';
        
        $sql = "SELECT * FROM contact_messages";
        
        if ($status !== 'all') {
            $sql .= " WHERE status = ?";
            $stmt = $conn->prepare($sql . " ORDER BY created_at DESC");
            $stmt->execute([$status]);
        } else {
            $stmt = $conn->prepare($sql . " ORDER BY created_at DESC");
            $stmt->execute();
        }
        
        $messages = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'messages' => $messages
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllMessages: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la recuperation'
        ], 500);
    }
}

// MARQUER COMME LU (Admin)
elseif ($action === 'markAsRead') {
    $token = $input['token'] ?? '';
    $message_id = intval($input['message_id'] ?? 0);
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Acces non autorise'
        ], 403);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            UPDATE contact_messages SET status = 'read' WHERE id = ?
        ");
        $stmt->execute([$message_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Message marque comme lu'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur markAsRead: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise a jour'
        ], 500);
    }
}

// SUPPRIMER UN MESSAGE (Admin)
elseif ($action === 'deleteMessage') {
    $token = $input['token'] ?? '';
    $message_id = intval($input['message_id'] ?? 0);
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Acces non autorise'
        ], 403);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$message_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Message supprime'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur deleteMessage: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
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
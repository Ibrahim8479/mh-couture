<?php
/**
 * ============================================
 * FICHIER: php/api/contact.php (COMPLET)
 * ============================================
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
    if (empty($firstName) || empty($lastName) || empty($email) || empty($subject) || empty($message)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Tous les champs obligatoires doivent être remplis'
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
        
        $stmt = $conn->prepare("
            INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'unread', NOW())
        ");
        
        $stmt->execute([
            $firstName,
            $lastName,
            $email,
            $phone,
            $subject,
            $message
        ]);
        
        // Envoyer un email de confirmation au client
        $emailSubject = "Confirmation de réception - MH Couture";
        $emailBody = "
Bonjour $firstName $lastName,

Nous avons bien reçu votre message concernant: $subject

Nous vous répondrons dans les plus brefs délais.

Cordialement,
L'équipe MH Couture
        ";
        
        sendEmail($email, $emailSubject, $emailBody);
        
        // Notifier l'admin
        $adminEmailSubject = "Nouveau message de contact - MH Couture";
        $adminEmailBody = "
Nouveau message reçu de:
Nom: $firstName $lastName
Email: $email
Téléphone: $phone
Sujet: $subject

Message:
$message
        ";
        
        sendEmail(ADMIN_EMAIL, $adminEmailSubject, $adminEmailBody);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Message envoyé avec succès'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur sendContactMessage: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'envoi'
        ], 500);
    }
}

// OBTENIR TOUS LES MESSAGES (Admin)
elseif ($action === 'getAllMessages') {
    $token = $_GET['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->query("
            SELECT id, first_name, last_name, email, phone, subject, message, status, created_at
            FROM contact_messages
            ORDER BY created_at DESC
        ");
        $messages = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'messages' => $messages,
            'count' => count($messages)
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllMessages: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
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
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("UPDATE contact_messages SET status = 'read' WHERE id = ?");
        $stmt->execute([$message_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Marqué comme lu'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur markAsRead: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
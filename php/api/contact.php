<?php
/**
 * API Messages de Contact - MH Couture
 * php/api/contact.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Erreur de connexion');
    }

    switch ($action) {
        case 'sendMessage':
            $input = getJSONInput();
            
            $first_name = sanitizeInput($input['firstName'] ?? '');
            $last_name = sanitizeInput($input['lastName'] ?? '');
            $email = sanitizeInput($input['email'] ?? '');
            $phone = sanitizeInput($input['phone'] ?? '');
            $subject = sanitizeInput($input['subject'] ?? '');
            $message = sanitizeInput($input['message'] ?? '');
            
            // Validation
            if (empty($first_name) || empty($last_name) || empty($email) || empty($subject) || empty($message)) {
                throw new Exception('Tous les champs obligatoires doivent être remplis');
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Email invalide');
            }
            
            // Insérer le message
            $stmt = $conn->prepare("
                INSERT INTO contact_messages 
                (first_name, last_name, email, phone, subject, message, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'unread', NOW())
            ");
            
            $stmt->execute([
                $first_name,
                $last_name,
                $email,
                $phone,
                $subject,
                $message
            ]);
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Message envoyé avec succès'
            ]);
            break;

        default:
            sendJSONResponse([
                'success' => false,
                'message' => 'Action non reconnue'
            ], 400);
    }

} catch (Exception $e) {
    logError("Erreur Contact API: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => $e->getMessage()
    ], 500);
}
?>
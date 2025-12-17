<?php
/**
 * API Messages de Contact - MH Couture
 * Fichier: php/api/contact.php
 * VERSION FINALE CORRIGÉE
 */

// ✅ CORRECTION 1: Headers UTF-8 corrects
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Erreur de connexion à la base de données');
    }

    switch ($action) {
        // ✅ CORRECTION 2: Action correcte "sendMessage"
        case 'sendMessage':
            $input = getJSONInput();
            
            // ✅ CORRECTION 3: Accepter les deux formats de noms
            $first_name = sanitizeInput($input['firstName'] ?? $input['first_name'] ?? '');
            $last_name = sanitizeInput($input['lastName'] ?? $input['last_name'] ?? '');
            $email = sanitizeInput($input['email'] ?? '');
            $phone = sanitizeInput($input['phone'] ?? '');
            $subject = sanitizeInput($input['subject'] ?? '');
            $message = sanitizeInput($input['message'] ?? '');
            
            // Validation complète
            if (empty($first_name)) {
                throw new Exception('Le prénom est requis');
            }
            
            if (empty($last_name)) {
                throw new Exception('Le nom est requis');
            }
            
            if (empty($email)) {
                throw new Exception('L\'email est requis');
            }
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Email invalide');
            }
            
            if (empty($subject)) {
                throw new Exception('Le sujet est requis');
            }
            
            if (empty($message)) {
                throw new Exception('Le message est requis');
            }
            
            // Validation longueur
            if (strlen($first_name) < 2 || strlen($first_name) > 100) {
                throw new Exception('Le prénom doit contenir entre 2 et 100 caractères');
            }
            
            if (strlen($last_name) < 2 || strlen($last_name) > 100) {
                throw new Exception('Le nom doit contenir entre 2 et 100 caractères');
            }
            
            if (strlen($message) < 10) {
                throw new Exception('Le message doit contenir au moins 10 caractères');
            }
            
            // ✅ CORRECTION 4: Vérifier si l'utilisateur n'envoie pas trop de messages
            $stmt = $conn->prepare("
                SELECT COUNT(*) as count 
                FROM contact_messages 
                WHERE email = ? 
                AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
            ");
            $stmt->execute([$email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result['count'] >= 5) {
                throw new Exception('Trop de messages envoyés. Veuillez attendre avant de réessayer.');
            }
            
            // Insérer le message
            $stmt = $conn->prepare("
                INSERT INTO contact_messages 
                (first_name, last_name, email, phone, subject, message, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'unread', NOW())
            ");
            
            $result = $stmt->execute([
                $first_name,
                $last_name,
                $email,
                $phone,
                $subject,
                $message
            ]);
            
            if (!$result) {
                throw new Exception('Erreur lors de l\'enregistrement du message');
            }
            
            // ✅ CORRECTION 5: Envoyer un email de notification (optionnel)
            // sendEmailNotification($email, $first_name, $last_name, $subject, $message);
            
            echo json_encode([
                'success' => true,
                'message' => 'Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.'
            ], JSON_UNESCAPED_UNICODE);
            break;
            
        // ✅ CORRECTION 6: Ajouter action pour récupérer les messages (Admin)
        case 'getAllMessages':
            $token = $_GET['token'] ?? '';
            
            if (!isAdmin($token)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $stmt = $conn->query("
                SELECT * FROM contact_messages 
                ORDER BY 
                    CASE status 
                        WHEN 'unread' THEN 1 
                        WHEN 'read' THEN 2 
                        ELSE 3 
                    END,
                    created_at DESC
            ");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'messages' => $messages
            ], JSON_UNESCAPED_UNICODE);
            break;
            
        // ✅ CORRECTION 7: Marquer un message comme lu
        case 'markAsRead':
            $input = getJSONInput();
            $token = $input['token'] ?? '';
            
            if (!isAdmin($token)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $message_id = intval($input['message_id'] ?? 0);
            
            if ($message_id <= 0) {
                throw new Exception('ID de message invalide');
            }
            
            $stmt = $conn->prepare("
                UPDATE contact_messages 
                SET status = 'read' 
                WHERE id = ?
            ");
            $stmt->execute([$message_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Message marqué comme lu'
            ], JSON_UNESCAPED_UNICODE);
            break;
            
        // ✅ CORRECTION 8: Supprimer un message
        case 'deleteMessage':
            $input = getJSONInput();
            $token = $input['token'] ?? '';
            
            if (!isAdmin($token)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            $message_id = intval($input['message_id'] ?? 0);
            
            if ($message_id <= 0) {
                throw new Exception('ID de message invalide');
            }
            
            $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
            $stmt->execute([$message_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Message supprimé'
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Action non reconnue: ' . $action
            ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    error_log("Erreur Contact API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// ✅ FONCTION OPTIONNELLE: Envoyer email de notification
function sendEmailNotification($user_email, $first_name, $last_name, $subject, $message) {
    $admin_email = 'info@mhcouture.com'; // Email de l'admin
    
    $email_subject = "Nouveau message de contact - MH Couture";
    $email_body = "
        Nouveau message reçu sur MH Couture
        
        De: $first_name $last_name
        Email: $user_email
        Sujet: $subject
        
        Message:
        $message
    ";
    
    $headers = "From: no-reply@mhcouture.com\r\n";
    $headers .= "Reply-To: $user_email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Envoyer à l'admin
    @mail($admin_email, $email_subject, $email_body, $headers);
    
    // Envoyer confirmation au client
    $client_subject = "Confirmation de réception - MH Couture";
    $client_body = "
        Bonjour $first_name $last_name,
        
        Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.
        Notre équipe vous répondra dans les plus brefs délais.
        
        Votre message:
        $message
        
        Cordialement,
        L'équipe MH Couture
    ";
    
    @mail($user_email, $client_subject, $client_body, "From: info@mhcouture.com\r\nContent-Type: text/plain; charset=UTF-8");
}
?>
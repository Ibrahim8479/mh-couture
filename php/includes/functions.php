<?php
/**
 * Fonctions communes - MH Couture
 * Fichier: php/includes/functions.php
 * CORRIGÉ avec support admin
 */
   
// Definir les headers JSON pour les API
function setJSONHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Fonction pour envoyer une reponse JSON
function sendJSONResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Fonction pour recuperer les donnees JSON de la requete
function getJSONInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

// Fonction pour valider l'email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Fonction pour valider le telephone (format Niger)
function validatePhone($phone) {
    // Format: +227 XX XX XX XX ou variations
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return strlen($phone) >= 8;
}

// Fonction pour generer un token unique
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Fonction pour hasher un mot de passe
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Fonction pour verifier un mot de passe
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Fonction pour generer un numero de commande
function generateOrderNumber($prefix = 'CMD') {
    return $prefix . '-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
}

// Fonction pour formater un prix en FCFA
function formatPrice($price) {
    return number_format($price, 0, ',', ' ') . ' FCFA';
}

// Fonction pour nettoyer les donnees
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Fonction pour verifier le token utilisateur
function getUserIdFromToken($token) {
    require_once __DIR__ . '/../config/database.php';
    
    $conn = getDBConnection();
    if (!$conn) return null;
    
    try {
        $stmt = $conn->prepare("
            SELECT id, email, first_name, last_name, is_admin 
            FROM users 
            WHERE token = ? AND is_active = 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        return $user ? $user : null;
    } catch (PDOException $e) {
        error_log("Erreur getUserIdFromToken: " . $e->getMessage());
        return null;
    }
}

// Fonction pour verifier si l'utilisateur est admin
function isAdmin($token) {
    $user = getUserIdFromToken($token);
    if (!$user) return false;
    
    // Vérifier le champ is_admin dans la base de données
    return $user['is_admin'] == 1;
}

// Fonction pour gerer l'upload de fichiers
function uploadFile($file, $targetDir = '../../uploads/products/') {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Erreur lors de l\'upload'];
    }
    
    // Creer le dossier s'il n'existe pas
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    
    // Extensions autorisees
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($fileExtension, $allowedExtensions)) {
        return ['success' => false, 'message' => 'Type de fichier non autorise'];
    }
    
    // Taille maximale: 5MB
    if ($file['size'] > 5 * 1024 * 1024) {
        return ['success' => false, 'message' => 'Fichier trop volumineux (max 5MB)'];
    }
    
    // Generer un nom unique
    $fileName = uniqid() . '_' . time() . '.' . $fileExtension;
    $targetPath = $targetDir . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return [
            'success' => true,
            'filename' => $fileName,
            'path' => $targetPath
        ];
    } else {
        return ['success' => false, 'message' => 'Erreur lors de l\'enregistrement'];
    }
}

// Fonction pour envoyer un email
function sendEmail($to, $subject, $message, $from = 'info@mhcouture.com') {
    $headers = "From: $from\r\n";
    $headers .= "Reply-To: $from\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // En developpement, juste logger
    error_log("Email envoye a $to: $subject");
    
    // En production, decommenter:
    // return mail($to, $subject, $message, $headers);
    
    return true;
}

// Fonction pour logger les erreurs
function logError($message, $context = []) {
    $logMessage = date('[Y-m-d H:i:s] ') . $message;
    if (!empty($context)) {
        $logMessage .= ' - Context: ' . json_encode($context);
    }
    error_log($logMessage);
}
?>
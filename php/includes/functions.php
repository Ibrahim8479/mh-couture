<?php
/**
 * Fonctions communes - MH Couture
 * Fichier: php/includes/functions.php
 */

// Headers JSON pour API
function setJSONHeaders() {
    header('Content-Type: application/json; charset=utf-8');
}

// Réponse JSON standard
function sendJSONResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Lire le JSON envoyé
function getJSONInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// Nettoyage des données
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Récupérer l'utilisateur depuis le token
function getUserIdFromToken($token) {
    if (!$token) return null;

    $conn = getDBConnection();
    if (!$conn) return null;

    try {
        $stmt = $conn->prepare("
            SELECT id, email, first_name, last_name, is_admin
            FROM users
            WHERE token = ? AND is_active = 1
            LIMIT 1
        ");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (PDOException $e) {
        error_log('getUserIdFromToken: ' . $e->getMessage());
        return null;
    }
}

// Vérifier admin
function isAdmin($token) {
    $user = getUserIdFromToken($token);
    return $user && intval($user['is_admin']) === 1;
}

// Logger erreurs
function logError($message) {
    error_log('[MH COUTURE] ' . $message);
}

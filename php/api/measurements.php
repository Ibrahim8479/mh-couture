<?php
/**
 * API Mesures Utilisateur - MH Couture
 * Fichier: php/api/measurements.php
 * VERSION COMPLÈTE
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

$token = $_GET['token'] ?? '';
if (empty($token)) {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
}

// Récupérer l'utilisateur
function getUserFromToken($token) {
    if (empty($token)) return null;
    
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("SELECT * FROM users WHERE token = ? AND is_active = 1");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return null;
    }
}

$user = getUserFromToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Non authentifié'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Erreur de connexion');
    }

    switch ($action) {
        // RÉCUPÉRER LES MESURES
        case 'getMeasurements':
            $stmt = $conn->prepare("
                SELECT * FROM custom_measurements 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$user['id']]);
            $measurements = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'measurements' => $measurements ?: []
            ], JSON_UNESCAPED_UNICODE);
            break;

        // SAUVEGARDER LES MESURES
        case 'saveMeasurements':
            $input = getJSONInput();
            $measurements = $input['measurements'] ?? [];
            
            // Validation
            $chest = floatval($measurements['chest'] ?? 0);
            $waist = floatval($measurements['waist'] ?? 0);
            $hips = floatval($measurements['hips'] ?? 0);
            $shoulders = floatval($measurements['shoulders'] ?? 0);
            $armLength = floatval($measurements['armLength'] ?? 0);
            $legLength = floatval($measurements['legLength'] ?? 0);
            
            // Vérifier si l'utilisateur a déjà des mesures
            $stmt = $conn->prepare("SELECT id FROM custom_measurements WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                // UPDATE
                $stmt = $conn->prepare("
                    UPDATE custom_measurements 
                    SET chest = ?, waist = ?, hips = ?, 
                        shoulder_width = ?, arm_length = ?, leg_length = ?,
                        updated_at = NOW()
                    WHERE user_id = ?
                ");
                $stmt->execute([
                    $chest, $waist, $hips,
                    $shoulders, $armLength, $legLength,
                    $user['id']
                ]);
            } else {
                // INSERT
                $stmt = $conn->prepare("
                    INSERT INTO custom_measurements 
                    (user_id, name, chest, waist, hips, shoulder_width, arm_length, leg_length, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                $stmt->execute([
                    $user['id'],
                    $user['first_name'] . ' ' . $user['last_name'],
                    $chest, $waist, $hips,
                    $shoulders, $armLength, $legLength
                ]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Mesures enregistrées avec succès'
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
    error_log("Erreur Measurements API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
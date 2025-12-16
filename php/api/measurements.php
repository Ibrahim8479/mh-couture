
<?php
/**
 * API Gestion des Mesures - MH Couture (version corrigée)
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
setJSONHeaders();
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = getJSONInput();

switch ($action) {
    case 'getMeasurements':
        $token = $_GET['token'] ?? '';
        $user = getUserIdFromToken($token);
        if (!$user) {
            sendJSONResponse(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        try {
            $conn = getDBConnection();
            $stmt = $conn->prepare("SELECT id, chest, waist, hips, shoulder_width, arm_length, leg_length, neck FROM custom_measurements WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$user['id']]);
            $measurements = $stmt->fetch();
            if ($measurements) {
                sendJSONResponse(['success' => true, 'measurements' => $measurements]);
            } else {
                sendJSONResponse(['success' => true, 'measurements' => null]);
            }
        } catch (Exception $e) {
            logError('getMeasurements: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => 'Erreur chargement mesures'], 500);
        }
        break;
    case 'saveMeasurements':
        $token = $input['token'] ?? '';
        $measurements = $input['measurements'] ?? [];
        $user = getUserIdFromToken($token);
        if (!$user) {
            sendJSONResponse(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        if (empty($measurements)) {
            sendJSONResponse(['success' => false, 'message' => 'Aucune mesure fournie'], 400);
        }
        try {
            $conn = getDBConnection();
            $stmt = $conn->prepare("SELECT id FROM custom_measurements WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $existing = $stmt->fetch();
            if ($existing) {
                $stmt = $conn->prepare("UPDATE custom_measurements SET chest = ?, waist = ?, hips = ?, shoulder_width = ?, arm_length = ?, leg_length = ?, neck = ?, updated_at = NOW() WHERE user_id = ?");
                $stmt->execute([
                    floatval($measurements['chest'] ?? 0),
                    floatval($measurements['waist'] ?? 0),
                    floatval($measurements['hips'] ?? 0),
                    floatval($measurements['shoulders'] ?? 0),
                    floatval($measurements['armLength'] ?? 0),
                    floatval($measurements['legLength'] ?? 0),
                    floatval($measurements['neck'] ?? 0),
                    $user['id']
                ]);
            } else {
                $stmt = $conn->prepare("INSERT INTO custom_measurements (user_id, chest, waist, hips, shoulder_width, arm_length, leg_length, neck, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
                $stmt->execute([
                    $user['id'],
                    floatval($measurements['chest'] ?? 0),
                    floatval($measurements['waist'] ?? 0),
                    floatval($measurements['hips'] ?? 0),
                    floatval($measurements['shoulders'] ?? 0),
                    floatval($measurements['armLength'] ?? 0),
                    floatval($measurements['legLength'] ?? 0),
                    floatval($measurements['neck'] ?? 0)
                ]);
            }
            sendJSONResponse(['success' => true, 'message' => 'Mesures enregistrées avec succès']);
        } catch (Exception $e) {
            logError('saveMeasurements: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => "Erreur lors de l'enregistrement"], 500);
        }
        break;
    case 'deleteMeasurements':
        $token = $input['token'] ?? '';
        $user = getUserIdFromToken($token);
        if (!$user) {
            sendJSONResponse(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        try {
            $conn = getDBConnection();
            $stmt = $conn->prepare("DELETE FROM custom_measurements WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            sendJSONResponse(['success' => true, 'message' => 'Mesures supprimées']);
        } catch (Exception $e) {
            logError('deleteMeasurements: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => 'Erreur lors de la suppression'], 500);
        }
        break;
    default:
        sendJSONResponse(['success' => false, 'message' => 'Action non reconnue'], 400);
}
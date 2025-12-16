<?php
/**
 * API Gestion des Mesures - MH Couture
 * Fichier: php/api/measurements.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = getJSONInput();

// RECUPERER LES MESURES DE L'UTILISATEUR
if ($action === 'getMeasurements') {
    $token = $_GET['token'] ?? '';
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT id, chest, waist, hips, shoulder_width, arm_length, leg_length, neck
            FROM custom_measurements
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $measurements = $stmt->fetch();
        
        if ($measurements) {
            sendJSONResponse([
                'success' => true,
                'measurements' => [
                    'id' => $measurements['id'],
                    'chest' => $measurements['chest'],
                    'waist' => $measurements['waist'],
                    'hips' => $measurements['hips'],
                    'shoulder_width' => $measurements['shoulder_width'],
                    'arm_length' => $measurements['arm_length'],
                    'leg_length' => $measurements['leg_length'],
                    'neck' => $measurements['neck']
                ]
            ]);
        } else {
            sendJSONResponse([
                'success' => true,
                'measurements' => null
            ]);
        }
        
    } catch (Exception $e) {
        logError("Erreur getMeasurements: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la récupération'
        ], 500);
    }
}

// SAUVEGARDER LES MESURES
elseif ($action === 'saveMeasurements') {
    $token = $input['token'] ?? '';
    $measurements = $input['measurements'] ?? [];
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    // Validation
    if (empty($measurements)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Aucune mesure fournie'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier si des mesures existent déjà
        $stmt = $conn->prepare("SELECT id FROM custom_measurements WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Mettre à jour les mesures existantes
            $stmt = $conn->prepare("
                UPDATE custom_measurements
                SET chest = ?,
                    waist = ?,
                    hips = ?,
                    shoulder_width = ?,
                    arm_length = ?,
                    leg_length = ?,
                    neck = ?,
                    updated_at = NOW()
                WHERE user_id = ?
            ");
            
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
            // Créer de nouvelles mesures
            $stmt = $conn->prepare("
                INSERT INTO custom_measurements 
                (user_id, chest, waist, hips, shoulder_width, arm_length, leg_length, neck, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
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
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Mesures enregistrées avec succès'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur saveMeasurements: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'enregistrement'
        ], 500);
    }
}

// SUPPRIMER LES MESURES
elseif ($action === 'deleteMeasurements') {
    $token = $input['token'] ?? '';
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("DELETE FROM custom_measurements WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Mesures supprimées'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur deleteMeasurements: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
        ], 500);
    }
}

// Action inconnue
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
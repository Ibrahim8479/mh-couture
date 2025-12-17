<?php
/**
 * API Commandes Sur Mesure - MH Couture
 * Fichier: php/api/custom-orders.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = getJSONInput();

// RÉCUPÉRER TOUTES LES COMMANDES SUR MESURE (ADMIN)
if ($action === 'getAllCustomOrders') {
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
            SELECT 
                co.*,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                u.email as customer_email,
                u.phone as customer_phone
            FROM custom_orders co
            LEFT JOIN users u ON co.user_id = u.id
            ORDER BY co.created_at DESC
        ");
        
        $orders = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllCustomOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement: ' . $e->getMessage()
        ], 500);
    }
}

// RÉCUPÉRER LES COMMANDES SUR MESURE DE L'UTILISATEUR
elseif ($action === 'getUserCustomOrders') {
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
            SELECT *
            FROM custom_orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $orders = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getUserCustomOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// CRÉER UNE COMMANDE SUR MESURE
elseif ($action === 'createCustomOrder') {
    $token = $input['token'] ?? '';
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    // Récupérer les données
    $full_name = sanitizeInput($input['full_name'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $garment_type = sanitizeInput($input['garment_type'] ?? '');
    $category = sanitizeInput($input['category'] ?? '');
    $fabric_type = sanitizeInput($input['fabric_type'] ?? '');
    $color = sanitizeInput($input['color'] ?? '');
    $design_details = sanitizeInput($input['design_details'] ?? '');
    $measurements = json_encode($input['measurements'] ?? []);
    $budget = floatval($input['budget'] ?? 0);
    $deadline = sanitizeInput($input['deadline'] ?? '');
    $additional_notes = sanitizeInput($input['additional_notes'] ?? '');
    
    // Validation
    if (empty($full_name) || empty($email) || empty($phone) || empty($garment_type)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Informations requises manquantes'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Générer un numéro de commande
        $order_number = 'CO-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        $stmt = $conn->prepare("
            INSERT INTO custom_orders (
                user_id, order_number, full_name, email, phone,
                garment_type, category, fabric_type, color,
                design_details, measurements, budget, deadline,
                additional_notes, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        
        $stmt->execute([
            $user['id'],
            $order_number,
            $full_name,
            $email,
            $phone,
            $garment_type,
            $category,
            $fabric_type,
            $color,
            $design_details,
            $measurements,
            $budget,
            $deadline,
            $additional_notes
        ]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande sur mesure créée avec succès',
            'order_id' => $conn->lastInsertId(),
            'order_number' => $order_number
        ]);
        
    } catch (Exception $e) {
        logError("Erreur createCustomOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la création'
        ], 500);
    }
}

// RÉCUPÉRER LES DÉTAILS D'UNE COMMANDE SUR MESURE
elseif ($action === 'getCustomOrderDetails') {
    $token = $_GET['token'] ?? '';
    $order_id = intval($_GET['order_id'] ?? 0);
    
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
        
        // Vérifier si admin ou propriétaire
        if (isAdmin($token)) {
            $stmt = $conn->prepare("SELECT * FROM custom_orders WHERE id = ?");
            $stmt->execute([$order_id]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM custom_orders WHERE id = ? AND user_id = ?");
            $stmt->execute([$order_id, $user['id']]);
        }
        
        $order = $stmt->fetch();
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Décoder les mesures JSON
        if ($order['measurements']) {
            $order['measurements'] = json_decode($order['measurements'], true);
        }
        
        sendJSONResponse([
            'success' => true,
            'order' => $order
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getCustomOrderDetails: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// METTRE À JOUR LE STATUT D'UNE COMMANDE SUR MESURE (ADMIN)
elseif ($action === 'updateCustomOrderStatus') {
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    // Valider le statut
    $valid_statuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!in_array($status, $valid_statuses)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Statut invalide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            UPDATE custom_orders 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$status, $order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Statut mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateCustomOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

// ANNULER UNE COMMANDE SUR MESURE
elseif ($action === 'cancelCustomOrder') {
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    
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
        
        // Vérifier que la commande appartient à l'utilisateur
        $stmt = $conn->prepare("SELECT id, status FROM custom_orders WHERE id = ? AND user_id = ?");
        $stmt->execute([$order_id, $user['id']]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Vérifier que la commande peut être annulée
        if ($order['status'] === 'completed') {
            sendJSONResponse([
                'success' => false,
                'message' => 'Impossible d\'annuler une commande terminée'
            ], 400);
        }
        
        // Annuler la commande
        $stmt = $conn->prepare("UPDATE custom_orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande annulée'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur cancelCustomOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'annulation'
        ], 500);
    }
}

// Action inconnue
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue: ' . $action
        ], 400);
}
?>
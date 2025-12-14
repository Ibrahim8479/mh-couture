<?php
/**
 * API Gestion des Commandes - MH Couture
 * Fichier: php/api/orders.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = getJSONInput();

// RECUPERER LES COMMANDES DE L'UTILISATEUR
if ($action === 'getUserOrders') {
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
            SELECT id, order_number, total_amount, status, created_at
            FROM orders
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
        logError("Erreur getUserOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la récupération'
        ], 500);
    }
}

// RECUPERER LES DETAILS D'UNE COMMANDE
elseif ($action === 'getOrderDetails') {
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
        
        // Récupérer la commande (vérifier que l'utilisateur en est propriétaire)
        $stmt = $conn->prepare("
            SELECT id, order_number, total_amount, status, created_at, payment_status
            FROM orders
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$order_id, $user['id']]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Récupérer les articles de la commande
        $stmt = $conn->prepare("
            SELECT oi.id, oi.product_id, oi.quantity, oi.price,
                   p.name, p.image_url, p.category
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$order_id]);
        $items = $stmt->fetchAll();
        
        $order['items'] = $items;
        
        sendJSONResponse([
            'success' => true,
            'order' => $order
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getOrderDetails: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la récupération'
        ], 500);
    }
}

// CREER UNE COMMANDE
elseif ($action === 'createOrder') {
    $token = $input['token'] ?? '';
    $items = $input['items'] ?? [];
    $shippingAddress = $input['shippingAddress'] ?? '';
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    if (empty($items)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Panier vide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Calculer le montant total
        $totalAmount = 0;
        foreach ($items as $item) {
            $totalAmount += floatval($item['price']) * intval($item['quantity']);
        }
        
        // Créer la commande
        $orderNumber = generateOrderNumber();
        
        $stmt = $conn->prepare("
            INSERT INTO orders (user_id, order_number, total_amount, shipping_address, status)
            VALUES (?, ?, ?, ?, 'pending')
        ");
        
        $stmt->execute([
            $user['id'],
            $orderNumber,
            $totalAmount,
            $shippingAddress
        ]);
        
        $orderId = $conn->lastInsertId();
        
        // Ajouter les articles de la commande
        $stmt = $conn->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
        ");
        
        foreach ($items as $item) {
            $stmt->execute([
                $orderId,
                intval($item['product_id']),
                intval($item['quantity']),
                floatval($item['price'])
            ]);
        }
        
        // Vider le panier
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande créée avec succès',
            'order_id' => $orderId,
            'order_number' => $orderNumber
        ]);
        
    } catch (Exception $e) {
        logError("Erreur createOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la création'
        ], 500);
    }
}

// ANNULER UNE COMMANDE
elseif ($action === 'cancelOrder') {
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
        $stmt = $conn->prepare("SELECT id FROM orders WHERE id = ? AND user_id = ?");
        $stmt->execute([$order_id, $user['id']]);
        
        if (!$stmt->fetch()) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Annuler la commande
        $stmt = $conn->prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?");
        $stmt->execute([$order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande annulée'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur cancelOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'annulation'
        ], 500);
    }
}

// METTRE A JOUR LE STATUT D'UNE COMMANDE (Admin)
elseif ($action === 'updateOrderStatus') {
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
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
        
        $stmt = $conn->prepare("
            UPDATE orders 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$status, $order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Statut mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
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
<?php
/**
 * API Administration - MH Couture
 * Fichier: php/api/admin.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? '';
$token = $_GET['token'] ?? $_POST['token'] ?? '';

// Verifier si admin
if (!isAdmin($token)) {
    sendJSONResponse([
        'success' => false,
        'message' => 'Acces non autorise'
    ], 403);
}

// STATISTIQUES DU TABLEAU DE BORD
if ($action === 'getDashboardStats') {
    try {
        $conn = getDBConnection();
        
        // Compter produits
        $stmt = $conn->query("SELECT COUNT(*) as count FROM products");
        $products = $stmt->fetch()['count'];
        
        // Compter commandes
        $stmt = $conn->query("SELECT COUNT(*) as count FROM orders");
        $orders = $stmt->fetch()['count'];
        
        // Compter utilisateurs
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
        $users = $stmt->fetch()['count'];
        
        // Total revenus
        $stmt = $conn->query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'");
        $revenue = $stmt->fetch()['total'] ?? 0;
        
        sendJSONResponse([
            'success' => true,
            'stats' => [
                'products' => $products,
                'orders' => $orders,
                'users' => $users,
                'revenue' => number_format($revenue, 0, ',', ' ')
            ]
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getDashboardStats: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// COMMANDES RECENTES
elseif ($action === 'getRecentOrders') {
    $limit = intval($_GET['limit'] ?? 10);
    
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("
            SELECT o.*, u.first_name, u.last_name,
                   CONCAT(u.first_name, ' ', u.last_name) as customer_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        $orders = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getRecentOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// TOUTES LES COMMANDES
elseif ($action === 'getAllOrders') {
    try {
        $conn = getDBConnection();
        $stmt = $conn->query("
            SELECT o.*, u.first_name, u.last_name,
                   CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                   COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ");
        $orders = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// TOUS LES UTILISATEURS
elseif ($action === 'getAllUsers') {
    try {
        $conn = getDBConnection();
        $stmt = $conn->query("
            SELECT id, first_name, last_name, email, phone, created_at, is_active
            FROM users
            ORDER BY created_at DESC
        ");
        $users = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'users' => $users
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllUsers: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// DETAILS D'UNE COMMANDE
elseif ($action === 'getOrderDetails') {
    $order_id = intval($_GET['order_id'] ?? 0);
    
    try {
        $conn = getDBConnection();
        
        // Info commande
        $stmt = $conn->prepare("
            SELECT o.*, u.first_name, u.last_name, u.email, u.phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        ");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvee'
            ], 404);
        }
        
        // Articles de la commande
        $stmt = $conn->prepare("
            SELECT oi.*, p.name as product_name, p.image_url
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
            'message' => 'Erreur'
        ], 500);
    }
}

// METTRE A JOUR LE STATUT D'UNE COMMANDE
elseif ($action === 'updateOrderStatus') {
    $input = getJSONInput();
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("
            UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?
        ");
        $stmt->execute([$status, $order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Statut mis a jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// Action inconnu
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
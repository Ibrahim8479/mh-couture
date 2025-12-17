<?php
/**
 * API Administration - MH Couture
 * Fichier: php/api/admin.php
 * VERSION COMPLÈTE
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? '';
$input = getJSONInput();

if (empty($action) && !empty($input['action'])) {
    $action = $input['action'];
}

$token = $_GET['token'] ?? $_POST['token'] ?? $input['token'] ?? '';

// Vérifier si admin
if (!isAdmin($token)) {
    sendJSONResponse([
        'success' => false,
        'message' => 'Accès non autorisé'
    ], 403);
}

// STATISTIQUES DU TABLEAU DE BORD
if ($action === 'getDashboardStats') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
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

// COMMANDES RÉCENTES
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
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
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
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
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
            SELECT id, first_name, last_name, email, phone, created_at, last_login, 
                   is_active, is_admin, newsletter
            FROM users
            ORDER BY created_at DESC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
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

// DÉTAILS D'UNE COMMANDE
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
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
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
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
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

// METTRE À JOUR LE STATUT D'UNE COMMANDE
elseif ($action === 'updateOrderStatus') {
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
            'message' => 'Statut mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// ACTIVER/DÉSACTIVER UN UTILISATEUR
elseif ($action === 'toggleUserStatus') {
    $user_id = intval($input['user_id'] ?? 0);
    $status = intval($input['status'] ?? 1);
    
    if (!$user_id) {
        sendJSONResponse([
            'success' => false,
            'message' => 'ID utilisateur manquant'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        
        $stmt = $conn->prepare("
            UPDATE users 
            SET is_active = ? 
            WHERE id = ?
        ");
        $stmt->execute([$status, $user_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Statut utilisateur mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur toggleUserStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

// PROMOUVOIR/RÉTROGRADER UN ADMIN
elseif ($action === 'toggleAdminStatus') {
    $user_id = intval($input['user_id'] ?? 0);
    $is_admin = intval($input['is_admin'] ?? 0);
    
    if (!$user_id) {
        sendJSONResponse([
            'success' => false,
            'message' => 'ID utilisateur manquant'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        
        $stmt = $conn->prepare("
            UPDATE users 
            SET is_admin = ? 
            WHERE id = ?
        ");
        $stmt->execute([$is_admin, $user_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Statut administrateur mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur toggleAdminStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

// STATISTIQUES UTILISATEUR
elseif ($action === 'getUserStats') {
    $user_id = intval($_GET['user_id'] ?? 0);
    
    if (!$user_id) {
        sendJSONResponse([
            'success' => false,
            'message' => 'ID utilisateur manquant'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        
        // Nombre de commandes
        $stmt = $conn->prepare("
            SELECT COUNT(*) as total 
            FROM orders 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $orders_count = $stmt->fetch()['total'] ?? 0;
        
        // Total dépensé
        $stmt = $conn->prepare("
            SELECT SUM(total_amount) as total 
            FROM orders 
            WHERE user_id = ? AND status = 'completed'
        ");
        $stmt->execute([$user_id]);
        $total_spent = $stmt->fetch()['total'] ?? 0;
        
        // Articles dans le panier
        $stmt = $conn->prepare("
            SELECT SUM(quantity) as total 
            FROM cart 
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $cart_items = $stmt->fetch()['total'] ?? 0;
        
        sendJSONResponse([
            'success' => true,
            'stats' => [
                'orders' => $orders_count,
                'spent' => $total_spent,
                'cart' => $cart_items
            ]
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getUserStats: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
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
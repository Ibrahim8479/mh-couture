<?php
/**
 * API Administration - MH Couture
 * Fichier: php/api/admin.php
 * VERSION COMPLÈTE ET MISE À JOUR
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

// Support pour GET et POST
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Pour les requêtes JSON POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

$token = $_GET['token'] ?? $_POST['token'] ?? '';

// Si le token est dans le body JSON
if (empty($token) && !empty($input)) {
    $token = $input['token'] ?? '';
}

// Vérifier si admin pour toutes les actions sauf getDashboardStats
$requiresAuth = ['getDashboardStats', 'getRecentOrders', 'getAllOrders', 'getAllUsers', 
                 'getOrderDetails', 'updateOrderStatus'];

if (in_array($action, $requiresAuth) && !isAdmin($token)) {
    sendJSONResponse([
        'success' => false,
        'message' => 'Accès non autorisé'
    ], 403);
}

// ================================
// STATISTIQUES DU TABLEAU DE BORD
// ================================
if ($action === 'getDashboardStats') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion à la base de données');
        }
        
        // Compter produits
        $stmt = $conn->query("SELECT COUNT(*) as count FROM products");
        $products = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
        
        // Compter commandes
        $stmt = $conn->query("SELECT COUNT(*) as count FROM orders");
        $orders = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
        
        // Compter utilisateurs
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
        $users = $stmt->fetch(PDO::FETCH_ASSOC)['count'] ?? 0;
        
        // Total revenus
        $stmt = $conn->query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'");
        $revenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
        
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
            'message' => 'Erreur lors du chargement des statistiques'
        ], 500);
    }
}

// ================================
// COMMANDES RÉCENTES
// ================================
elseif ($action === 'getRecentOrders') {
    $limit = intval($_GET['limit'] ?? 10);
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT o.*, 
                   CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as customer_name
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

// ================================
// TOUTES LES COMMANDES
// ================================
elseif ($action === 'getAllOrders') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->query("
            SELECT o.*, 
                   CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as customer_name,
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
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// ================================
// TOUS LES UTILISATEURS
// ================================
elseif ($action === 'getAllUsers') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->query("
            SELECT id, first_name, last_name, email, phone, created_at, is_active, is_admin
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
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// ================================
// DÉTAILS D'UNE COMMANDE
// ================================
elseif ($action === 'getOrderDetails') {
    $order_id = intval($_GET['order_id'] ?? 0);
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
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
            exit;
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
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// ================================
// METTRE À JOUR LE STATUT D'UNE COMMANDE
// ================================
elseif ($action === 'updateOrderStatus') {
    $input = getJSONInput();
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (empty($order_id) || empty($status)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Paramètres manquants'
        ], 400);
        exit;
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
            'message' => 'Statut mis à jour avec succès'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

// ================================
// OBTENIR LES MESSAGES DE CONTACT
// ================================
elseif ($action === 'getAllMessages') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->query("
            SELECT id, name, email, subject, message, status, created_at
            FROM contact_messages
            ORDER BY created_at DESC
        ");
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendJSONResponse([
            'success' => true,
            'messages' => $messages
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllMessages: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// ================================
// ACTION INCONNUE
// ================================
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue: ' . $action
    ], 400);
}
?>
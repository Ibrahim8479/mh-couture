<?php
/**
 * API Administration - MH Couture
 * Fichier: php/api/admin.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? '';
$token  = $_GET['token'] ?? $_POST['token'] ?? '';

// Vérifier si admin
if (!isAdmin($token)) {
    sendJSONResponse([
        'success' => false,
        'message' => 'Accès non autorisé'
    ], 403);
}

// ================================
// STATISTIQUES DU DASHBOARD
// ================================
if ($action === 'getDashboardStats') {
    try {
        $conn = getDBConnection();

        $products = $conn->query("SELECT COUNT(*) FROM products")->fetchColumn();
        $orders   = $conn->query("SELECT COUNT(*) FROM orders")->fetchColumn();
        $users    = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $revenue  = $conn->query("
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE status = 'completed'
        ")->fetchColumn();

        sendJSONResponse([
            'success' => true,
            'stats' => [
                'products' => (int)$products,
                'orders'   => (int)$orders,
                'users'    => (int)$users,
                'revenue'  => number_format($revenue, 0, ',', ' ')
            ]
        ]);
    } catch (Exception $e) {
        logError('getDashboardStats: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur dashboard'
        ], 500);
    }
}

// ================================
// COMMANDES RÉCENTES
// ================================
elseif ($action === 'getRecentOrders') {
    try {
        $limit = intval($_GET['limit'] ?? 5);
        $conn = getDBConnection();

        $stmt = $conn->prepare("
            SELECT o.*, 
                   CONCAT(u.first_name, ' ', u.last_name) AS customer_name
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);

        sendJSONResponse([
            'success' => true,
            'orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    } catch (Exception $e) {
        logError('getRecentOrders: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur chargement commandes'
        ], 500);
    }
}

// ================================
// TOUTES LES COMMANDES
// ================================
elseif ($action === 'getAllOrders') {
    try {
        $conn = getDBConnection();

        $stmt = $conn->query("
            SELECT o.*, 
                   CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                   COUNT(oi.id) AS items_count
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            LEFT JOIN order_items oi ON oi.order_id = o.id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ");

        sendJSONResponse([
            'success' => true,
            'orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    } catch (Exception $e) {
        logError('getAllOrders: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur commandes'
        ], 500);
    }
}

// ================================
// TOUS LES UTILISATEURS
// ================================
elseif ($action === 'getAllUsers') {
    try {
        $conn = getDBConnection();

        $stmt = $conn->query("
            SELECT id, first_name, last_name, email, phone, created_at, is_admin
            FROM users
            ORDER BY created_at DESC
        ");

        sendJSONResponse([
            'success' => true,
            'users' => $stmt->fetchAll(PDO::FETCH_ASSOC)
        ]);
    } catch (Exception $e) {
        logError('getAllUsers: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur utilisateurs'
        ], 500);
    }
}

// ================================
// ACTION INCONNUE
// ================================
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}

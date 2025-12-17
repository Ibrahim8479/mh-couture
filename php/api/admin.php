<?php
/**
 * API Administration Corrigée - MH Couture
 * php/api/admin.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

$token = $_GET['token'] ?? $_POST['token'] ?? $input['token'] ?? '';

// Vérifier si admin
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

    switch ($action) {
        // ===== DASHBOARD =====
        case 'getDashboardStats':
            $stats = [
                'products' => $conn->query("SELECT COUNT(*) as c FROM products")->fetch()['c'] ?? 0,
                'orders' => $conn->query("SELECT COUNT(*) as c FROM orders")->fetch()['c'] ?? 0,
                'users' => $conn->query("SELECT COUNT(*) as c FROM users")->fetch()['c'] ?? 0,
                'revenue' => $conn->query("SELECT SUM(total_amount) as t FROM orders WHERE status = 'completed'")->fetch()['t'] ?? 0
            ];
            
            sendJSONResponse([
                'success' => true,
                'stats' => [
                    'products' => $stats['products'],
                    'orders' => $stats['orders'],
                    'users' => $stats['users'],
                    'revenue' => number_format($stats['revenue'], 0, ',', ' ') . ' FCFA'
                ]
            ]);
            break;

        // ===== COMMANDES SUR MESURE =====
        case 'getAllCustomOrders':
            $stmt = $conn->query("
                SELECT * FROM custom_orders 
                ORDER BY created_at DESC
            ");
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Décoder les images JSON
            foreach ($orders as &$order) {
                if (!empty($order['reference_images'])) {
                    $order['images'] = json_decode($order['reference_images'], true) ?: [];
                } else {
                    $order['images'] = [];
                }
            }
            
            sendJSONResponse([
                'success' => true,
                'orders' => $orders
            ]);
            break;

        case 'updateCustomOrderStatus':
            $input = getJSONInput();
            $order_id = intval($input['order_id'] ?? 0);
            $status = sanitizeInput($input['status'] ?? '');
            
            $valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
            if (!in_array($status, $valid_statuses)) {
                throw new Exception('Statut invalide');
            }
            
            $stmt = $conn->prepare("UPDATE custom_orders SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $order_id]);
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Statut mis à jour'
            ]);
            break;

        // ===== MESSAGES DE CONTACT =====
        case 'getAllMessages':
            $stmt = $conn->query("
                SELECT * FROM contact_messages 
                ORDER BY created_at DESC
            ");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            sendJSONResponse([
                'success' => true,
                'messages' => $messages
            ]);
            break;

        case 'markMessageAsRead':
            $input = getJSONInput();
            $message_id = intval($input['message_id'] ?? 0);
            
            $stmt = $conn->prepare("UPDATE contact_messages SET status = 'read' WHERE id = ?");
            $stmt->execute([$message_id]);
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Message marqué comme lu'
            ]);
            break;

        case 'deleteMessage':
            $input = getJSONInput();
            $message_id = intval($input['message_id'] ?? 0);
            
            $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
            $stmt->execute([$message_id]);
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Message supprimé'
            ]);
            break;

        // ===== UTILISATEURS =====
        case 'getAllUsers':
            $stmt = $conn->query("
                SELECT id, first_name, last_name, email, phone, 
                       created_at, last_login, is_active, is_admin
                FROM users
                ORDER BY created_at DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            sendJSONResponse([
                'success' => true,
                'users' => $users
            ]);
            break;

        case 'toggleUserStatus':
            $input = getJSONInput();
            $user_id = intval($input['user_id'] ?? 0);
            $status = intval($input['status'] ?? 1);
            
            $stmt = $conn->prepare("UPDATE users SET is_active = ? WHERE id = ?");
            $stmt->execute([$status, $user_id]);
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Statut utilisateur mis à jour'
            ]);
            break;

        // ===== COMMANDES =====
        case 'getAllOrders':
            $stmt = $conn->query("
                SELECT o.*, 
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
            break;

        case 'updateOrderStatus':
            $input = getJSONInput();
            $order_id = intval($input['order_id'] ?? 0);
            $status = sanitizeInput($input['status'] ?? '');
            
            $stmt = $conn->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $order_id]);
            
            sendJSONResponse([
                'success' => true,
                'message' => 'Statut commande mis à jour'
            ]);
            break;

        default:
            sendJSONResponse([
                'success' => false,
                'message' => 'Action non reconnue: ' . $action
            ], 400);
    }

} catch (Exception $e) {
    logError("Erreur Admin API: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ], 500);
}
?>
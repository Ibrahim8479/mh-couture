<?php
/**
 * API Administration - MH Couture
 * Fichier: php/api/admin.php
 * VERSION FINALE CORRIGÉE
 */

// ✅ CORRECTION 1: Headers UTF-8 corrects
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Gérer OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

$token = $_GET['token'] ?? $_POST['token'] ?? '';
if (empty($token) && !empty($input)) {
    $token = $input['token'] ?? '';
}

// ✅ CORRECTION 2: Vérification admin stricte
if (!isAdmin($token)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Accès non autorisé - Droits administrateur requis'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Erreur de connexion à la base de données');
    }

    switch ($action) {
        // ===== DASHBOARD =====
        case 'getDashboardStats':
            // ✅ CORRECTION 3: Statistiques complètes et optimisées
            $stats = [];
            
            // Produits
            $stmt = $conn->query("SELECT COUNT(*) as total, SUM(stock) as total_stock FROM products");
            $products = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['products'] = [
                'total' => $products['total'] ?? 0,
                'total_stock' => $products['total_stock'] ?? 0
            ];
            
            // Commandes normales
            $stmt = $conn->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
                FROM orders
            ");
            $orders = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['orders'] = $orders;
            
            // Commandes sur mesure
            $stmt = $conn->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress
                FROM custom_orders
            ");
            $custom_orders = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['custom_orders'] = $custom_orders;
            
            // Utilisateurs
            $stmt = $conn->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
                FROM users
            ");
            $users = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['users'] = $users;
            
            // Revenus
            $stmt = $conn->query("
                SELECT 
                    SUM(total_amount) as total,
                    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as completed,
                    SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN total_amount ELSE 0 END) as this_month
                FROM orders
            ");
            $revenue = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['revenue'] = [
                'total' => number_format($revenue['total'] ?? 0, 0, ',', ' ') . ' FCFA',
                'completed' => number_format($revenue['completed'] ?? 0, 0, ',', ' ') . ' FCFA',
                'this_month' => number_format($revenue['this_month'] ?? 0, 0, ',', ' ') . ' FCFA'
            ];
            
            // Messages non lus
            $stmt = $conn->query("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'unread'");
            $messages = $stmt->fetch(PDO::FETCH_ASSOC);
            $stats['unread_messages'] = $messages['count'] ?? 0;
            
            echo json_encode([
                'success' => true,
                'stats' => $stats
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        // ===== COMMANDES SUR MESURE =====
        case 'getAllCustomOrders':
            $stmt = $conn->query("
                SELECT * FROM custom_orders 
                ORDER BY 
                    CASE status 
                        WHEN 'pending' THEN 1
                        WHEN 'confirmed' THEN 2
                        WHEN 'in_progress' THEN 3
                        WHEN 'completed' THEN 4
                        ELSE 5
                    END,
                    created_at DESC
            ");
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Décoder les images JSON
            foreach ($orders as &$order) {
                if (!empty($order['reference_images'])) {
                    $images = json_decode($order['reference_images'], true);
                    $order['images'] = is_array($images) ? $images : [];
                } else {
                    $order['images'] = [];
                }
            }
            
            echo json_encode([
                'success' => true,
                'orders' => $orders
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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
            
            echo json_encode([
                'success' => true,
                'message' => 'Statut mis à jour'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ===== MESSAGES DE CONTACT =====
        case 'getAllMessages':
            $stmt = $conn->query("
                SELECT * FROM contact_messages 
                ORDER BY 
                    CASE status 
                        WHEN 'unread' THEN 1
                        WHEN 'read' THEN 2
                        ELSE 3
                    END,
                    created_at DESC
            ");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'messages' => $messages
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'markMessageAsRead':
            $input = getJSONInput();
            $message_id = intval($input['message_id'] ?? 0);
            
            if ($message_id <= 0) {
                throw new Exception('ID invalide');
            }
            
            $stmt = $conn->prepare("UPDATE contact_messages SET status = 'read' WHERE id = ?");
            $stmt->execute([$message_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Message marqué comme lu'
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'deleteMessage':
            $input = getJSONInput();
            $message_id = intval($input['message_id'] ?? 0);
            
            if ($message_id <= 0) {
                throw new Exception('ID invalide');
            }
            
            $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
            $stmt->execute([$message_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Message supprimé'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ===== UTILISATEURS =====
        case 'getAllUsers':
            $stmt = $conn->query("
                SELECT 
                    id, first_name, last_name, email, phone, 
                    created_at, last_login, is_active, is_admin
                FROM users
                ORDER BY created_at DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'users' => $users
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'toggleUserStatus':
            $input = getJSONInput();
            $user_id = intval($input['user_id'] ?? 0);
            $status = intval($input['status'] ?? 1);
            
            if ($user_id <= 0) {
                throw new Exception('ID utilisateur invalide');
            }
            
            // ✅ CORRECTION 4: Ne pas désactiver son propre compte
            $current_user = getUserFromToken($token);
            if ($current_user && $current_user['id'] == $user_id) {
                throw new Exception('Vous ne pouvez pas modifier le statut de votre propre compte');
            }
            
            $stmt = $conn->prepare("UPDATE users SET is_active = ? WHERE id = ?");
            $stmt->execute([$status, $user_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Statut utilisateur mis à jour'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ✅ CORRECTION 5: Ajouter promotion admin
        case 'toggleUserAdmin':
            $input = getJSONInput();
            $user_id = intval($input['user_id'] ?? 0);
            $is_admin = intval($input['is_admin'] ?? 0);
            
            if ($user_id <= 0) {
                throw new Exception('ID utilisateur invalide');
            }
            
            // Ne pas modifier son propre statut admin
            $current_user = getUserFromToken($token);
            if ($current_user && $current_user['id'] == $user_id) {
                throw new Exception('Vous ne pouvez pas modifier vos propres droits administrateur');
            }
            
            $stmt = $conn->prepare("UPDATE users SET is_admin = ? WHERE id = ?");
            $stmt->execute([$is_admin, $user_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Droits administrateur mis à jour'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ===== COMMANDES NORMALES =====
        case 'getAllOrders':
            $stmt = $conn->query("
                SELECT o.*, 
                       CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                       u.email as customer_email,
                       COUNT(oi.id) as items_count
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ");
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'orders' => $orders
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'getOrderDetails':
            $order_id = intval($_GET['order_id'] ?? 0);
            
            if ($order_id <= 0) {
                throw new Exception('ID commande invalide');
            }
            
            // Commande
            $stmt = $conn->prepare("
                SELECT o.*, 
                       CONCAT(u.first_name, ' ', u.last_name) as customer_name,
                       u.email as customer_email,
                       u.phone as customer_phone
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                WHERE o.id = ?
            ");
            $stmt->execute([$order_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                throw new Exception('Commande non trouvée');
            }
            
            // Articles
            $stmt = $conn->prepare("
                SELECT oi.*, p.name as product_name, p.image_url
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$order_id]);
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'order' => $order
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            break;

        case 'updateOrderStatus':
            $input = getJSONInput();
            $order_id = intval($input['order_id'] ?? 0);
            $status = sanitizeInput($input['status'] ?? '');
            
            $valid_statuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!in_array($status, $valid_statuses)) {
                throw new Exception('Statut invalide');
            }
            
            $stmt = $conn->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $order_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Statut commande mis à jour'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ✅ CORRECTION 6: Ajouter gestion galerie
        case 'getGalleryStats':
            $stmt = $conn->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured,
                    SUM(CASE WHEN category = 'homme' THEN 1 ELSE 0 END) as homme,
                    SUM(CASE WHEN category = 'femme' THEN 1 ELSE 0 END) as femme,
                    SUM(CASE WHEN category = 'enfant' THEN 1 ELSE 0 END) as enfant
                FROM gallery
            ");
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'stats' => $stats
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
    error_log("Erreur Admin API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// ✅ FONCTION HELPER
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
?>
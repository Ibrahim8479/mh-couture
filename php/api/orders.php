<?php
/**
 * API Commandes - MH Couture
 * Fichier: php/api/orders.php
 * VERSION COMPLÈTE
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

$token = $_GET['token'] ?? '';
if (empty($token)) {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
}

// Récupérer l'utilisateur
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

$user = getUserFromToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Non authentifié'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Erreur de connexion');
    }

    switch ($action) {
        // RÉCUPÉRER LES COMMANDES DE L'UTILISATEUR
        case 'getUserOrders':
            $stmt = $conn->prepare("
                SELECT o.*, COUNT(oi.id) as items_count
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ");
            $stmt->execute([$user['id']]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'orders' => $orders
            ], JSON_UNESCAPED_UNICODE);
            break;

        // RÉCUPÉRER UNE COMMANDE SPÉCIFIQUE
        case 'getOrderDetails':
            $order_id = intval($_GET['order_id'] ?? 0);
            
            if ($order_id <= 0) {
                throw new Exception('ID commande invalide');
            }
            
            // Récupérer la commande
            $stmt = $conn->prepare("
                SELECT * FROM orders 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$order_id, $user['id']]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Commande non trouvée'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Récupérer les articles
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

        // CRÉER UNE COMMANDE
        case 'createOrder':
            $input = getJSONInput();
            
            $cart_items = $input['items'] ?? [];
            $shipping_address = sanitizeInput($input['shipping_address'] ?? '');
            $mobile_number = sanitizeInput($input['mobile_number'] ?? '');
            $payment_method = sanitizeInput($input['payment_method'] ?? 'cash');
            $notes = sanitizeInput($input['notes'] ?? '');
            
            if (empty($cart_items)) {
                throw new Exception('Panier vide');
            }
            
            // Calculer le total
            $total = 0;
            foreach ($cart_items as $item) {
                $total += floatval($item['price']) * intval($item['quantity']);
            }
            
            // Générer numéro de commande
            $order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            
            // Insérer la commande
            $stmt = $conn->prepare("
                INSERT INTO orders 
                (order_number, user_id, total_amount, status, payment_method, 
                 shipping_address, mobile_number, notes, created_at)
                VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $order_number,
                $user['id'],
                $total,
                $payment_method,
                $shipping_address,
                $mobile_number,
                $notes
            ]);
            
            $order_id = $conn->lastInsertId();
            
            // Insérer les articles
            $stmt = $conn->prepare("
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)
            ");
            
            foreach ($cart_items as $item) {
                $stmt->execute([
                    $order_id,
                    intval($item['product_id']),
                    intval($item['quantity']),
                    floatval($item['price'])
                ]);
                
                // Décrémenter le stock
                $stmt2 = $conn->prepare("
                    UPDATE products 
                    SET stock = stock - ? 
                    WHERE id = ? AND stock >= ?
                ");
                $stmt2->execute([
                    intval($item['quantity']),
                    intval($item['product_id']),
                    intval($item['quantity'])
                ]);
            }
            
            // Vider le panier
            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Commande créée avec succès',
                'order_id' => $order_id,
                'order_number' => $order_number
            ], JSON_UNESCAPED_UNICODE);
            break;

        // ANNULER UNE COMMANDE
        case 'cancelOrder':
            $input = getJSONInput();
            $order_id = intval($input['order_id'] ?? 0);
            
            if ($order_id <= 0) {
                throw new Exception('ID commande invalide');
            }
            
            // Vérifier que la commande appartient à l'utilisateur
            $stmt = $conn->prepare("
                SELECT id, status FROM orders 
                WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$order_id, $user['id']]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Commande non trouvée'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            
            // Vérifier que la commande peut être annulée
            if ($order['status'] === 'completed' || $order['status'] === 'cancelled') {
                throw new Exception('Cette commande ne peut pas être annulée');
            }
            
            // Annuler
            $stmt = $conn->prepare("
                UPDATE orders 
                SET status = 'cancelled', updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$order_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Commande annulée'
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
    error_log("Erreur Orders API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
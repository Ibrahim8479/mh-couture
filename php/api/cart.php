/**
 * ============================================
 * FICHIER 2: php/api/cart.php (COMPLET)
 * ============================================
 */
?>
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = getJSONInput();

// AJOUTER AU PANIER
if ($action === 'add') {
    $token = $input['token'] ?? '';
    $product_id = intval($input['product_id'] ?? 0);
    $quantity = intval($input['quantity'] ?? 1);
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    if ($product_id <= 0 || $quantity <= 0) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Données invalides'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier le stock
        $stmt = $conn->prepare("SELECT stock FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);
        }
        
        if ($product['stock'] < $quantity) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Stock insuffisant'
            ], 400);
        }
        
        // Vérifier si déjà dans le panier
        $stmt = $conn->prepare("
            SELECT id, quantity FROM cart 
            WHERE user_id = ? AND product_id = ?
        ");
        $stmt->execute([$user['id'], $product_id]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Mettre à jour la quantité
            $newQuantity = $existing['quantity'] + $quantity;
            
            if ($newQuantity > $product['stock']) {
                sendJSONResponse([
                    'success' => false,
                    'message' => 'Stock insuffisant pour cette quantité'
                ], 400);
            }
            
            $stmt = $conn->prepare("
                UPDATE cart SET quantity = ? WHERE id = ?
            ");
            $stmt->execute([$newQuantity, $existing['id']]);
        } else {
            // Ajouter au panier
            $stmt = $conn->prepare("
                INSERT INTO cart (user_id, product_id, quantity, added_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$user['id'], $product_id, $quantity]);
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Ajouté au panier'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur add cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'ajout'
        ], 500);
    }
}

// OBTENIR LE PANIER
elseif ($action === 'getAll') {
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
            SELECT c.id as cart_id, c.quantity, c.added_at,
                   p.id as product_id, p.name, p.description, p.category,
                   p.price, p.image_url, p.stock,
                   (c.quantity * p.price) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.added_at DESC
        ");
        $stmt->execute([$user['id']]);
        $items = $stmt->fetchAll();
        
        $total = 0;
        foreach ($items as $item) {
            $total += floatval($item['subtotal']);
        }
        
        sendJSONResponse([
            'success' => true,
            'items' => $items,
            'total' => $total,
            'count' => count($items)
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAll cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// METTRE À JOUR LA QUANTITÉ
elseif ($action === 'updateQuantity') {
    $token = $input['token'] ?? '';
    $cart_id = intval($input['cart_id'] ?? 0);
    $quantity = intval($input['quantity'] ?? 1);
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifié'
        ], 401);
    }
    
    if ($quantity < 1) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Quantité invalide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier le stock
        $stmt = $conn->prepare("
            SELECT c.id, p.stock 
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.id = ? AND c.user_id = ?
        ");
        $stmt->execute([$cart_id, $user['id']]);
        $item = $stmt->fetch();
        
        if (!$item) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Article non trouvé'
            ], 404);
        }
        
        if ($quantity > $item['stock']) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Stock insuffisant'
            ], 400);
        }
        
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
        $stmt->execute([$quantity, $cart_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Quantité mise à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateQuantity cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// RETIRER DU PANIER
elseif ($action === 'remove') {
    $token = $input['token'] ?? '';
    $cart_id = intval($input['cart_id'] ?? 0);
    
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
            DELETE FROM cart WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$cart_id, $user['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Retiré du panier'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur remove cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// COMPTER LES ARTICLES DU PANIER
elseif ($action === 'count') {
    $token = $_GET['token'] ?? '';
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse(['success' => true, 'count' => 0]);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT COUNT(*) as total FROM cart WHERE user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $result = $stmt->fetch();
        
        sendJSONResponse([
            'success' => true,
            'count' => intval($result['total'] ?? 0)
        ]);
        
    } catch (Exception $e) {
        sendJSONResponse(['success' => true, 'count' => 0]);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
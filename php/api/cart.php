<?php
/**
 * API Gestion du Panier - MH Couture
 * Fichier: php/api/cart.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? $_GET['action'] ?? '';

// AJOUTER AU PANIER
if ($action === 'add') {
    $token = $input['token'] ?? '';
    $product_id = intval($input['product_id'] ?? 0);
    $quantity = intval($input['quantity'] ?? 1);
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Utilisateur non authentifie'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Verifier si le produit existe deja dans le panier
        $stmt = $conn->prepare("
            SELECT id, quantity FROM cart 
            WHERE user_id = ? AND product_id = ?
        ");
        $stmt->execute([$user['id'], $product_id]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            // Mettre a jour la quantite
            $newQuantity = $existing['quantity'] + $quantity;
            $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
            $stmt->execute([$newQuantity, $existing['id']]);
        } else {
            // Ajouter nouveau produit au panier
            $stmt = $conn->prepare("
                INSERT INTO cart (user_id, product_id, quantity, added_at)
                VALUES (?, ?, ?, NOW())
            ");
            $stmt->execute([$user['id'], $product_id, $quantity]);
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit ajoute au panier'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur add to cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'ajout au panier'
        ], 500);
    }
}

// COMPTER LES ARTICLES
elseif ($action === 'count') {
    $token = $_GET['token'] ?? '';
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse(['success' => false, 'count' => 0]);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT SUM(quantity) as total FROM cart WHERE user_id = ?
        ");
        $stmt->execute([$user['id']]);
        $result = $stmt->fetch();
        
        sendJSONResponse([
            'success' => true,
            'count' => intval($result['total'] ?? 0)
        ]);
        
    } catch (Exception $e) {
        sendJSONResponse(['success' => false, 'count' => 0]);
    }
}

// OBTENIR TOUS LES ARTICLES DU PANIER
elseif ($action === 'getAll') {
    $token = $_GET['token'] ?? '';
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifie'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT 
                c.id as cart_id,
                c.quantity,
                p.id as product_id,
                p.name,
                p.description,
                p.price,
                p.image_url,
                (p.price * c.quantity) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.added_at DESC
        ");
        $stmt->execute([$user['id']]);
        $items = $stmt->fetchAll();
        
        $total = array_sum(array_column($items, 'subtotal'));
        
        sendJSONResponse([
            'success' => true,
            'items' => $items,
            'total' => $total
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAll cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la recuperation'
        ], 500);
    }
}

// SUPPRIMER UN ARTICLE
elseif ($action === 'remove') {
    $token = $input['token'] ?? '';
    $cart_id = intval($input['cart_id'] ?? 0);
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifie'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
        $stmt->execute([$cart_id, $user['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit retire du panier'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur remove from cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
        ], 500);
    }
}

// METTRE A JOUR LA QUANTITE
elseif ($action === 'updateQuantity') {
    $token = $input['token'] ?? '';
    $cart_id = intval($input['cart_id'] ?? 0);
    $quantity = intval($input['quantity'] ?? 1);
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifie'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        if ($quantity <= 0) {
            $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
            $stmt->execute([$cart_id, $user['id']]);
        } else {
            $stmt = $conn->prepare("
                UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?
            ");
            $stmt->execute([$quantity, $cart_id, $user['id']]);
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Quantite mise a jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur update quantity: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise a jour'
        ], 500);
    }
}

// VIDER LE PANIER
elseif ($action === 'clear') {
    $token = $input['token'] ?? '';
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Non authentifie'
        ], 401);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Panier vide'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur clear cart: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du vidage du panier'
        ], 500);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
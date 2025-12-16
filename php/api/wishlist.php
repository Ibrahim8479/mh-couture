<?php
/**
 * API Wishlist / Favoris - MH Couture
 * Fichier: php/api/wishlist.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? $_GET['action'] ?? '';

// AJOUTER AUX FAVORIS
if ($action === 'add') {
    $token = $input['token'] ?? '';
    $product_id = intval($input['product_id'] ?? 0);
    
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
        
        // Vérifier si déjà dans les favoris
        $stmt = $conn->prepare("
            SELECT id FROM wishlist 
            WHERE user_id = ? AND product_id = ?
        ");
        $stmt->execute([$user['id'], $product_id]);
        
        if ($stmt->fetch()) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Déjà dans les favoris'
            ], 400);
        }
        
        // Ajouter aux favoris
        $stmt = $conn->prepare("
            INSERT INTO wishlist (user_id, product_id, added_at)
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$user['id'], $product_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Ajouté aux favoris'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur add wishlist: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'ajout'
        ], 500);
    }
}

// RETIRER DES FAVORIS
elseif ($action === 'remove') {
    $token = $input['token'] ?? '';
    $product_id = intval($input['product_id'] ?? 0);
    
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
            DELETE FROM wishlist 
            WHERE user_id = ? AND product_id = ?
        ");
        $stmt->execute([$user['id'], $product_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Retiré des favoris'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur remove wishlist: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
        ], 500);
    }
}

// OBTENIR LES FAVORIS
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
            SELECT 
                w.id as wishlist_id,
                w.added_at,
                p.id as product_id,
                p.name,
                p.description,
                p.category,
                p.price,
                p.image_url,
                p.stock
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.added_at DESC
        ");
        $stmt->execute([$user['id']]);
        $items = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'items' => $items,
            'count' => count($items)
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAll wishlist: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la récupération'
        ], 500);
    }
}

// COMPTER LES FAVORIS
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
            SELECT COUNT(*) as total FROM wishlist WHERE user_id = ?
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

// VÉRIFIER SI DANS LES FAVORIS
elseif ($action === 'check') {
    $token = $_GET['token'] ?? '';
    $product_id = intval($_GET['product_id'] ?? 0);
    
    $user = getUserIdFromToken($token);
    
    if (!$user) {
        sendJSONResponse([
            'success' => true,
            'inWishlist' => false
        ]);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT id FROM wishlist 
            WHERE user_id = ? AND product_id = ?
        ");
        $stmt->execute([$user['id'], $product_id]);
        
        sendJSONResponse([
            'success' => true,
            'inWishlist' => $stmt->fetch() !== false
        ]);
        
    } catch (Exception $e) {
        sendJSONResponse([
            'success' => true,
            'inWishlist' => false
        ]);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
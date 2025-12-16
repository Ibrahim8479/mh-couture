<?php
/**
 * ============================================
 * FICHIER 1: php/api/products.php (COMPLET)
 * ============================================
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$input = getJSONInput();

// OBTENIR TOUS LES PRODUITS
if ($action === 'getAll') {
    $category = $_GET['category'] ?? 'all';
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $sql = "SELECT id, name, description, category, price, image_url, stock, is_custom, created_at 
                FROM products 
                WHERE stock > 0";
        
        if ($category !== 'all') {
            $sql .= " AND category = :category";
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $conn->prepare($sql);
        
        if ($category !== 'all') {
            $stmt->bindParam(':category', $category);
        }
        
        $stmt->execute();
        $products = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'products' => $products,
            'count' => count($products)
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAll products: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la récupération'
        ], 500);
    }
}

// OBTENIR UN PRODUIT PAR ID
elseif ($action === 'getById') {
    $id = intval($_GET['id'] ?? 0);
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
            FROM products WHERE id = ?
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        if ($product) {
            // Incrémenter les vues
            $stmt = $conn->prepare("UPDATE products SET views = views + 1 WHERE id = ?");
            $stmt->execute([$id]);
            
            sendJSONResponse([
                'success' => true,
                'product' => $product
            ]);
        } else {
            sendJSONResponse([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], 404);
        }
        
    } catch (Exception $e) {
        logError("Erreur getById product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// CRÉER UN PRODUIT (Admin)
elseif ($action === 'create') {
    $token = $_POST['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    $name = sanitizeInput($_POST['name'] ?? '');
    $description = sanitizeInput($_POST['description'] ?? '');
    $category = sanitizeInput($_POST['category'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $isCustom = isset($_POST['is_custom']) ? 1 : 0;
    
    if (empty($name) || empty($category) || $price <= 0) {
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
        
        // Upload de l'image si présente
        $imageUrl = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = uploadFile($_FILES['image']);
            if ($uploadResult['success']) {
                $imageUrl = 'uploads/products/' . $uploadResult['filename'];
            }
        }
        
        $stmt = $conn->prepare("
            INSERT INTO products (name, description, category, price, stock, image_url, is_custom, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $name,
            $description,
            $category,
            $price,
            $stock,
            $imageUrl,
            $isCustom
        ]);
        
        $productId = $conn->lastInsertId();
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'product_id' => $productId
        ]);
        
    } catch (Exception $e) {
        logError("Erreur create product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la création'
        ], 500);
    }
}

// METTRE À JOUR UN PRODUIT (Admin)
elseif ($action === 'update') {
    $token = $_POST['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    $id = intval($_POST['id'] ?? 0);
    $name = sanitizeInput($_POST['name'] ?? '');
    $description = sanitizeInput($_POST['description'] ?? '');
    $category = sanitizeInput($_POST['category'] ?? '');
    $price = floatval($_POST['price'] ?? 0);
    $stock = intval($_POST['stock'] ?? 0);
    $isCustom = isset($_POST['is_custom']) ? 1 : 0;
    
    if ($id <= 0 || empty($name) || empty($category) || $price <= 0) {
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
        
        // Récupérer l'ancienne image
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $oldProduct = $stmt->fetch();
        
        $imageUrl = $oldProduct['image_url'];
        
        // Upload nouvelle image si présente
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = uploadFile($_FILES['image']);
            if ($uploadResult['success']) {
                $imageUrl = 'uploads/products/' . $uploadResult['filename'];
                
                // Supprimer l'ancienne image si elle existe
                if ($oldProduct['image_url'] && file_exists($oldProduct['image_url'])) {
                    unlink($oldProduct['image_url']);
                }
            }
        }
        
        $stmt = $conn->prepare("
            UPDATE products 
            SET name = ?, description = ?, category = ?, price = ?, 
                stock = ?, image_url = ?, is_custom = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            $name,
            $description,
            $category,
            $price,
            $stock,
            $imageUrl,
            $isCustom,
            $id
        ]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur update product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

// SUPPRIMER UN PRODUIT (Admin)
elseif ($action === 'delete') {
    $token = $input['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    $id = intval($input['id'] ?? 0);
    
    if ($id <= 0) {
        sendJSONResponse([
            'success' => false,
            'message' => 'ID invalide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Récupérer l'image pour la supprimer
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        if ($product && $product['image_url'] && file_exists($product['image_url'])) {
            unlink($product['image_url']);
        }
        
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit supprimé'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur delete product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
        ], 500);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
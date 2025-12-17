<?php
/**
 * API Gestion des Produits - MH Couture
 * Fichier: php/api/products.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// RÉCUPÉRER TOUS LES PRODUITS
if ($action === 'getAll') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion à la base de données');
        }
        
        $stmt = $conn->prepare("
            SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
            FROM products
            WHERE stock > 0
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $products = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'products' => $products
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAll products: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement des produits'
        ], 500);
    }
}

// CRÉER UN PRODUIT (Admin uniquement)
elseif ($action === 'create') {
    $token = $_POST['token'] ?? '';
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
        
        $name = sanitizeInput($_POST['name'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $description = sanitizeInput($_POST['description'] ?? '');
        $is_custom = isset($_POST['is_custom']) ? intval($_POST['is_custom']) : 0;
        
        // Gestion de l'image
        $image_url = '';
        if (isset($_FILES['image'])) {
            $uploadResult = uploadFile($_FILES['image']);
            if ($uploadResult['success']) {
                $image_url = 'uploads/products/' . $uploadResult['filename'];
            }
        }
        
        $stmt = $conn->prepare("
            INSERT INTO products (name, description, category, price, image_url, stock, is_custom)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $name,
            $description,
            $category,
            $price,
            $image_url,
            $stock,
            $is_custom
        ]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'product_id' => $conn->lastInsertId()
        ]);
        
    } catch (Exception $e) {
        logError("Erreur create product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la création du produit'
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
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $id = intval($_POST['id'] ?? 0);
        $name = sanitizeInput($_POST['name'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $description = sanitizeInput($_POST['description'] ?? '');
        $is_custom = isset($_POST['is_custom']) ? intval($_POST['is_custom']) : 0;
        
        // Récupérer l'ancienne image
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        $image_url = $product['image_url'] ?? '';
        
        // Gestion de la nouvelle image
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            if ($image_url && file_exists('../../' . $image_url)) {
                unlink('../../' . $image_url);
            }
            
            $uploadResult = uploadFile($_FILES['image']);
            if ($uploadResult['success']) {
                $image_url = 'uploads/products/' . $uploadResult['filename'];
            }
        }
        
        $stmt = $conn->prepare("
            UPDATE products
            SET name = ?, description = ?, category = ?, price = ?, 
                image_url = ?, stock = ?, is_custom = ?, updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([
            $name,
            $description,
            $category,
            $price,
            $image_url,
            $stock,
            $is_custom,
            $id
        ]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit mis à jour avec succès'
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
    $input = getJSONInput();
    $token = $input['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    try {
        $id = intval($input['id'] ?? 0);
        
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Récupérer l'image avant suppression
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        // Supprimer le produit
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        
        // Supprimer l'image
        if ($product && $product['image_url'] && file_exists('../../' . $product['image_url'])) {
            unlink('../../' . $product['image_url']);
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur delete product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la suppression'
        ], 500);
    }
}

// RÉCUPÉRER UN PRODUIT PAR ID
elseif ($action === 'getById') {
    try {
        $id = intval($_GET['id'] ?? 0);
        
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT id, name, description, category, price, image_url, stock, is_custom
            FROM products
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        
        if ($product) {
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
            'message' => 'Erreur lors de la récupération'
        ], 500);
    }
}

// Action inconnue
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
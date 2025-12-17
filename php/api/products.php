<?php
/**
 * API Gestion des Produits - MH Couture
 * Fichier: php/api/products.php
 * VERSION CORRIGÉE
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
        
        // Vérifier si admin pour voir tous les produits
        $token = $_GET['token'] ?? '';
        $isAdmin = isAdmin($token);
        
        if ($isAdmin) {
            // Admin voit TOUS les produits (même stock 0)
            $stmt = $conn->prepare("
                SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
                FROM products
                ORDER BY created_at DESC
            ");
        } else {
            // Utilisateurs voient seulement produits en stock
            $stmt = $conn->prepare("
                SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
                FROM products
                WHERE stock > 0
                ORDER BY created_at DESC
            ");
        }
        
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendJSONResponse([
            'success' => true,
            'products' => $products
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAll products: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement des produits: ' . $e->getMessage()
        ], 500);
    }
}

// RÉCUPÉRER UN PRODUIT PAR ID
elseif ($action === 'getById') {
    try {
        $id = intval($_GET['id'] ?? 0);
        
        if ($id <= 0) {
            throw new Exception('ID invalide');
        }
        
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
            FROM products
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
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
            'message' => 'Erreur: ' . $e->getMessage()
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
        
        // Validation
        if (empty($name) || empty($category) || $price <= 0) {
            throw new Exception('Données invalides');
        }
        
        // Gestion de l'image
        $image_url = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadResult = uploadFile($_FILES['image'], __DIR__ . '/../../uploads/products/');
            if ($uploadResult['success']) {
                $image_url = 'uploads/products/' . $uploadResult['filename'];
            } else {
                throw new Exception($uploadResult['message']);
            }
        }
        
        $stmt = $conn->prepare("
            INSERT INTO products (name, description, category, price, image_url, stock, is_custom, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
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
            'message' => 'Erreur: ' . $e->getMessage()
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
        
        // Validation
        if ($id <= 0 || empty($name) || empty($category) || $price <= 0) {
            throw new Exception('Données invalides');
        }
        
        // Récupérer l'ancienne image
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            throw new Exception('Produit non trouvé');
        }
        
        $image_url = $product['image_url'];
        
        // Gestion de la nouvelle image
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            // Supprimer l'ancienne image
            if ($image_url && file_exists(__DIR__ . '/../../' . $image_url)) {
                @unlink(__DIR__ . '/../../' . $image_url);
            }
            
            $uploadResult = uploadFile($_FILES['image'], __DIR__ . '/../../uploads/products/');
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
            'message' => 'Erreur: ' . $e->getMessage()
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
        
        if ($id <= 0) {
            throw new Exception('ID invalide');
        }
        
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Récupérer l'image avant suppression
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$product) {
            throw new Exception('Produit non trouvé');
        }
        
        // Supprimer le produit
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);
        
        // Supprimer l'image
        if ($product['image_url'] && file_exists(__DIR__ . '/../../' . $product['image_url'])) {
            @unlink(__DIR__ . '/../../' . $product['image_url']);
        }
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur delete product: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ], 500);
    }
}

// Action inconnue
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue: ' . $action
    ], 400);
}
?>
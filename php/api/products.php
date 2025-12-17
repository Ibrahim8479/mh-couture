<?php
/**
 * API Gestion des Produits - MH Couture
 * Fichier: php/api/products.php
 * VERSION FINALE CORRIGÉE
 */

// ✅ CORRECTION 1: Headers UTF-8 corrects
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

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
        
        // ✅ CORRECTION 2: S'assurer que image_url est défini
        foreach ($products as &$product) {
            if (empty($product['image_url'])) {
                $product['image_url'] = null;
            }
        }
        
        // ✅ CORRECTION 3: JSON avec encodage UTF-8 correct
        echo json_encode([
            'success' => true,
            'products' => $products
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } catch (Exception $e) {
        logError("Erreur getAll products: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors du chargement des produits: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
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
            // ✅ CORRECTION: Vérifier image_url
            if (empty($product['image_url'])) {
                $product['image_url'] = null;
            }
            
            echo json_encode([
                'success' => true,
                'product' => $product
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Produit non trouvé'
            ], JSON_UNESCAPED_UNICODE);
        }
        
    } catch (Exception $e) {
        logError("Erreur getById product: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// CRÉER UN PRODUIT (Admin uniquement)
elseif ($action === 'create') {
    $token = $_POST['token'] ?? '';
    
    if (!isAdmin($token)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], JSON_UNESCAPED_UNICODE);
        exit;
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
        
        // ✅ CORRECTION 4: Validation de la catégorie
        $valid_categories = ['homme', 'femme', 'enfant'];
        if (!in_array($category, $valid_categories)) {
            throw new Exception('Catégorie invalide. Choisir: homme, femme ou enfant');
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
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit créé avec succès',
            'product_id' => $conn->lastInsertId()
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        logError("Erreur create product: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// METTRE À JOUR UN PRODUIT (Admin)
elseif ($action === 'update') {
    $token = $_POST['token'] ?? '';
    
    if (!isAdmin($token)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], JSON_UNESCAPED_UNICODE);
        exit;
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
        
        // ✅ CORRECTION: Validation de la catégorie
        $valid_categories = ['homme', 'femme', 'enfant'];
        if (!in_array($category, $valid_categories)) {
            throw new Exception('Catégorie invalide');
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
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit mis à jour avec succès'
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        logError("Erreur update product: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// SUPPRIMER UN PRODUIT (Admin)
elseif ($action === 'delete') {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
    
    if (!isAdmin($token)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], JSON_UNESCAPED_UNICODE);
        exit;
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
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        logError("Erreur delete product: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// Action inconnue
else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Action non reconnue: ' . $action
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
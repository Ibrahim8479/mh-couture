<?php
/**
 * API Gestion des Produits - MH Couture
 * Fichier: php/api/products.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ================================
// RECUPERER TOUS LES PRODUITS (ADMIN)
// ================================
if ($action === 'getAll') {
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur connexion DB');
        }

        // ADMIN VOIT TOUS LES PRODUITS
        $stmt = $conn->prepare("
            SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
            FROM products
            ORDER BY created_at DESC
        ");
        $stmt->execute();

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendJSONResponse([
            'success' => true,
            'products' => $products
        ]);
    } catch (Exception $e) {
        logError('getAll products: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur chargement produits: ' . $e->getMessage()
        ], 500);
    }
}

// ================================
// RECUPERER UN PRODUIT PAR ID
// ================================
elseif ($action === 'getById') {
    try {
        $id = intval($_GET['id'] ?? 0);
        if (!$id) {
            throw new Exception('ID manquant');
        }

        $conn = getDBConnection();
        $stmt = $conn->prepare("
            SELECT id, name, description, category, price, image_url, stock, is_custom, created_at
            FROM products
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception('Produit non trouvé');
        }

        sendJSONResponse([
            'success' => true,
            'product' => $product
        ]);
    } catch (Exception $e) {
        logError('getById product: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => $e->getMessage()
        ], 404);
    }
}

// ================================
// CREER UN PRODUIT (ADMIN)
// ================================
elseif ($action === 'create') {
    $token = $_POST['token'] ?? '';
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès refusé'
        ], 403);
        exit;
    }

    try {
        $conn = getDBConnection();

        $name = sanitizeInput($_POST['name'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $description = sanitizeInput($_POST['description'] ?? '');
        $is_custom = intval($_POST['is_custom'] ?? 0);

        // Validation
        if (empty($name) || empty($category) || $price <= 0) {
            throw new Exception('Données invalides');
        }

        $image_url = '';
        if (!empty($_FILES['image']['name'])) {
            $upload = uploadFile($_FILES['image']);
            if ($upload['success']) {
                $image_url = 'uploads/products/' . $upload['filename'];
            } else {
                throw new Exception('Erreur upload image: ' . ($upload['message'] ?? 'Inconnue'));
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
        logError('create product: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur création produit: ' . $e->getMessage()
        ], 500);
    }
}

// ================================
// MODIFIER UN PRODUIT (ADMIN) ✅
// ================================
elseif ($action === 'update') {
    $token = $_POST['token'] ?? '';
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès refusé'
        ], 403);
        exit;
    }

    try {
        $conn = getDBConnection();

        $id = intval($_POST['id'] ?? 0);
        $name = sanitizeInput($_POST['name'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $description = sanitizeInput($_POST['description'] ?? '');
        $is_custom = intval($_POST['is_custom'] ?? 0);

        // Validation
        if (!$id || empty($name) || empty($category) || $price <= 0) {
            throw new Exception('Données invalides');
        }

        // Vérifier si le produit existe
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            throw new Exception('Produit non trouvé');
        }

        // Gérer l'image
        $image_url = $existing['image_url'];
        if (!empty($_FILES['image']['name'])) {
            $upload = uploadFile($_FILES['image']);
            if ($upload['success']) {
                // Supprimer l'ancienne image
                if (!empty($image_url) && file_exists('../../' . $image_url)) {
                    unlink('../../' . $image_url);
                }
                $image_url = 'uploads/products/' . $upload['filename'];
            } else {
                throw new Exception('Erreur upload image: ' . ($upload['message'] ?? 'Inconnue'));
            }
        }

        // Mettre à jour le produit
        $stmt = $conn->prepare("
            UPDATE products 
            SET name = ?, 
                description = ?, 
                category = ?, 
                price = ?, 
                image_url = ?, 
                stock = ?, 
                is_custom = ?
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
            'message' => 'Produit modifié avec succès'
        ]);
    } catch (Exception $e) {
        logError('update product: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur modification produit: ' . $e->getMessage()
        ], 500);
    }
}

// ================================
// SUPPRIMER UN PRODUIT (ADMIN)
// ================================
elseif ($action === 'delete') {
    $input = getJSONInput();
    $token = $input['token'] ?? '';

    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès refusé'
        ], 403);
        exit;
    }

    try {
        $id = intval($input['id'] ?? 0);
        if (!$id) {
            throw new Exception('ID manquant');
        }

        $conn = getDBConnection();

        // Récupérer image
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception('Produit non trouvé');
        }

        // Supprimer produit
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        // Supprimer image
        if (!empty($product['image_url']) && file_exists('../../' . $product['image_url'])) {
            unlink('../../' . $product['image_url']);
        }

        sendJSONResponse([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ]);
    } catch (Exception $e) {
        logError('delete product: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur suppression: ' . $e->getMessage()
        ], 500);
    }
}

// ================================
// ACTION INCONNUE
// ================================
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue: ' . $action
    ], 400);
}
?>
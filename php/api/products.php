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

        // ⚠️ ADMIN VOIT TOUS LES PRODUITS
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
            'message' => 'Erreur chargement produits'
        ], 500);
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
    }

    try {
        $conn = getDBConnection();

        $name = sanitizeInput($_POST['name'] ?? '');
        $category = sanitizeInput($_POST['category'] ?? '');
        $price = floatval($_POST['price'] ?? 0);
        $stock = intval($_POST['stock'] ?? 0);
        $description = sanitizeInput($_POST['description'] ?? '');
        $is_custom = intval($_POST['is_custom'] ?? 0);

        $image_url = '';
        if (!empty($_FILES['image']['name'])) {
            $upload = uploadFile($_FILES['image']);
            if ($upload['success']) {
                $image_url = 'uploads/products/' . $upload['filename'];
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

        sendJSONResponse(['success' => true]);
    } catch (Exception $e) {
        logError('create product: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur création produit'
        ], 500);
    }
}

<?php
/**
 * API Gestion des Produits - MH Couture (version corrigée)
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';
setJSONHeaders();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'getAll':
        try {
            $conn = getDBConnection();
            if (!$conn) throw new Exception('Erreur connexion DB');
            $stmt = $conn->prepare("SELECT id, name, description, category, price, image_url, stock, is_custom, created_at FROM products ORDER BY created_at DESC");
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendJSONResponse(['success' => true, 'products' => $products]);
        } catch (Exception $e) {
            logError('getAll products: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => 'Erreur chargement produits'], 500);
        }
        break;
    case 'create':
        $token = $_POST['token'] ?? '';
        if (!isAdmin($token)) {
            sendJSONResponse(['success' => false, 'message' => 'Accès refusé'], 403);
        }
        try {
            $conn = getDBConnection();
            $name = sanitizeInput($_POST['name'] ?? '');
            $category = sanitizeInput($_POST['category'] ?? '');
            $price = floatval($_POST['price'] ?? 0);
            $stock = intval($_POST['stock'] ?? 0);
            $description = sanitizeInput($_POST['description'] ?? '');
            $is_custom = intval($_POST['is_custom'] ?? 0);
            $image_url = '';
            if (!empty($_FILES['image']['name'])) {
                $upload = uploadFile($_FILES['image']);
                if ($upload['success']) {
                    $image_url = 'uploads/products/' . $upload['filename'];
                }
            }
            $stmt = $conn->prepare("INSERT INTO products (name, description, category, price, image_url, stock, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $description, $category, $price, $image_url, $stock, $is_custom]);
            sendJSONResponse(['success' => true]);
        } catch (Exception $e) {
            logError('create product: ' . $e->getMessage());
            sendJSONResponse(['success' => false, 'message' => 'Erreur création produit'], 500);
        }
        break;
    // ... Ajoutez ici les autres actions CRUD (update, delete, getById, etc.)
    default:
        sendJSONResponse(['success' => false, 'message' => 'Action non reconnue'], 400);
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
    }

    try {
        $id = intval($input['id'] ?? 0);
        $conn = getDBConnection();

        // Récupérer image
        $stmt = $conn->prepare("SELECT image_url FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        // Supprimer produit
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        // Supprimer image
        if (!empty($product['image_url']) && file_exists('../../' . $product['image_url'])) {
            unlink('../../' . $product['image_url']);
        }

        sendJSONResponse(['success' => true]);
    } catch (Exception $e) {
        logError('delete product: ' . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur suppression'
        ], 500);
    }
}

// ================================
// ACTION INCONNUE
// ================================
else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}

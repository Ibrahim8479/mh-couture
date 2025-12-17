<?php
// ===============================
// products.php - VERSION COMPLÈTE CORRIGÉE
// Gestion des produits (CRUD + upload image)
// ===============================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ===============================
// OUTILS
// ===============================
function sendJSONResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function uploadFile($file) {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return [
            'success' => false,
            'message' => 'Erreur PHP upload: ' . ($file['error'] ?? 'inconnue')
        ];
    }

    $allowed = ['jpg','jpeg','png','gif','webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    if ($file['size'] > $maxSize) {
        return ['success' => false, 'message' => 'Image trop volumineuse'];
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        return ['success' => false, 'message' => 'Format image non autorisé'];
    }

    $uploadDir = __DIR__ . '/../../uploads/products/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $filename = uniqid('prod_', true) . '.' . $ext;
    $target = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $target)) {
        return ['success' => false, 'message' => 'Impossible d\'enregistrer le fichier'];
    }

    return ['success' => true, 'filename' => $filename];
}

// ===============================
// ACTIONS
// ===============================
try {
    if ($method === 'GET' && $action === 'getAll') {
        $stmt = $pdo->query('SELECT * FROM products ORDER BY created_at DESC');
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendJSONResponse(['success' => true, 'products' => $products]);
    }

    if ($method === 'POST' && $action === 'create') {
        $name        = trim($_POST['name'] ?? '');
        $category    = $_POST['category'] ?? '';
        $price       = (float) ($_POST['price'] ?? 0);
        $stock       = (int) ($_POST['stock'] ?? 0);
        $description = $_POST['description'] ?? '';
        $is_custom   = isset($_POST['is_custom']) ? 1 : 0;

        if ($name === '' || $category === '') {
            throw new Exception('Nom ou catégorie manquant');
        }

        if (!isset($_FILES['image'])) {
            throw new Exception('Image requise');
        }

        $upload = uploadFile($_FILES['image']);
        if (empty($upload['success'])) {
            throw new Exception('Erreur upload image: ' . ($upload['message'] ?? 'Inconnue'));
        }

        $image_url = 'uploads/products/' . $upload['filename'];

        $stmt = $pdo->prepare('INSERT INTO products (name, category, price, stock, description, image_url, is_custom, created_at) VALUES (?,?,?,?,?,?,?,NOW())');
        $stmt->execute([$name, $category, $price, $stock, $description, $image_url, $is_custom]);

        sendJSONResponse(['success' => true, 'message' => 'Produit ajouté avec succès']);
    }

    if ($method === 'POST' && $action === 'update') {
        if (empty($_POST['id'])) {
            throw new Exception('ID produit manquant');
        }

        $id = (int) $_POST['id'];

        $stmt = $pdo->prepare('SELECT image_url FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            throw new Exception('Produit introuvable');
        }

        $name        = trim($_POST['name'] ?? '');
        $category    = $_POST['category'] ?? '';
        $price       = (float) ($_POST['price'] ?? 0);
        $stock       = (int) ($_POST['stock'] ?? 0);
        $description = $_POST['description'] ?? '';
        $is_custom   = isset($_POST['is_custom']) ? 1 : 0;

        if ($name === '' || $category === '') {
            throw new Exception('Nom ou catégorie manquant');
        }

        $image_url = $existing['image_url'];

        // ✅ upload seulement si nouvelle image
        if (
            isset($_FILES['image']) &&
            $_FILES['image']['error'] === UPLOAD_ERR_OK &&
            !empty($_FILES['image']['name'])
        ) {
            $upload = uploadFile($_FILES['image']);
            if (empty($upload['success'])) {
                throw new Exception('Erreur upload image: ' . ($upload['message'] ?? 'Inconnue'));
            }

            if (!empty($image_url) && file_exists(__DIR__ . '/../../' . $image_url)) {
                unlink(__DIR__ . '/../../' . $image_url);
            }

            $image_url = 'uploads/products/' . $upload['filename'];
        }

        $stmt = $pdo->prepare('UPDATE products SET name=?, category=?, price=?, stock=?, description=?, image_url=?, is_custom=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$name, $category, $price, $stock, $description, $image_url, $is_custom, $id]);

        sendJSONResponse(['success' => true, 'message' => 'Produit modifié avec succès']);
    }

    if ($method === 'POST' && $action === 'delete') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = (int) ($data['id'] ?? 0);
        if (!$id) throw new Exception('ID manquant');

        $stmt = $pdo->prepare('SELECT image_url FROM products WHERE id = ?');
        $stmt->execute([$id]);
        $p = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($p && !empty($p['image_url']) && file_exists(__DIR__ . '/../../' . $p['image_url'])) {
            unlink(__DIR__ . '/../../' . $p['image_url']);
        }

        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);

        sendJSONResponse(['success' => true, 'message' => 'Produit supprimé']);
    }

    sendJSONResponse(['success' => false, 'message' => 'Action non reconnue'], 400);

} catch (Exception $e) {
    sendJSONResponse([
        'success' => false,
        'message' => $e->getMessage()
    ], 500);
}

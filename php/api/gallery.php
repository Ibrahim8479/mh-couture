<?php
/**
 * Gallery API - MH Couture
 * Fichier: php/api/gallery.php
 * VERSION CORRIGÉE
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Récupérer l'action
$action = $_GET['action'] ?? $_POST['action'] ?? 'getAll';

try {
    $conn = getDBConnection();
    
    if (!$conn) {
        throw new Exception('Erreur de connexion à la base de données');
    }
    
    switch ($action) {
        case 'getAll':
            // Récupérer toutes les images de la galerie
            $stmt = $conn->query("SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC");
            $gallery = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'gallery' => $gallery
            ]);
            break;
            
        case 'getById':
            $id = intval($_GET['id'] ?? 0);
            
            $stmt = $conn->prepare("SELECT * FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($item) {
                echo json_encode([
                    'success' => true,
                    'item' => $item
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Image non trouvée'
                ]);
            }
            break;
            
        case 'create':
            // Vérifier si admin
            $token = $_POST['token'] ?? '';
            if (!isAdmin($token)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ]);
                exit;
            }
            
            $title = sanitizeInput($_POST['title'] ?? '');
            $description = sanitizeInput($_POST['description'] ?? '');
            $category = sanitizeInput($_POST['category'] ?? '');
            $display_order = intval($_POST['display_order'] ?? 0);
            $is_featured = isset($_POST['is_featured']) ? 1 : 0;
            
            // Validation
            if (empty($title) || empty($category)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Titre et catégorie requis'
                ]);
                exit;
            }
            
            // Upload de l'image
            $image_url = '';
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $upload_dir = __DIR__ . '/../../uploads/gallery/';
                if (!file_exists($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }
                
                $file_extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                if (!in_array($file_extension, $allowed_extensions)) {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Format d\'image non valide'
                    ]);
                    exit;
                }
                
                $new_filename = uniqid() . '_' . time() . '.' . $file_extension;
                $upload_path = $upload_dir . $new_filename;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
                    $image_url = 'uploads/gallery/' . $new_filename;
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Erreur lors de l\'upload de l\'image'
                    ]);
                    exit;
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Image requise'
                ]);
                exit;
            }
            
            // Insérer dans la base de données
            $stmt = $conn->prepare("INSERT INTO gallery (title, description, category, image_url, is_featured, display_order, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$title, $description, $category, $image_url, $is_featured, $display_order]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Image ajoutée à la galerie',
                'id' => $conn->lastInsertId()
            ]);
            break;
            
        case 'update':
            // Vérifier si admin
            $token = $_POST['token'] ?? '';
            if (!isAdmin($token)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ]);
                exit;
            }
            
            $id = intval($_POST['id'] ?? 0);
            $title = sanitizeInput($_POST['title'] ?? '');
            $description = sanitizeInput($_POST['description'] ?? '');
            $category = sanitizeInput($_POST['category'] ?? '');
            $display_order = intval($_POST['display_order'] ?? 0);
            $is_featured = isset($_POST['is_featured']) ? 1 : 0;
            
            if ($id <= 0 || empty($title) || empty($category)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Données invalides'
                ]);
                exit;
            }
            
            // Récupérer l'image actuelle
            $stmt = $conn->prepare("SELECT image_url FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$current) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Image non trouvée'
                ]);
                exit;
            }
            
            $image_url = $current['image_url'];
            
            // Upload nouvelle image si fournie
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $upload_dir = __DIR__ . '/../../uploads/gallery/';
                if (!file_exists($upload_dir)) {
                    mkdir($upload_dir, 0777, true);
                }
                
                $file_extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                if (in_array($file_extension, $allowed_extensions)) {
                    $new_filename = uniqid() . '_' . time() . '.' . $file_extension;
                    $upload_path = $upload_dir . $new_filename;
                    
                    if (move_uploaded_file($_FILES['image']['tmp_name'], $upload_path)) {
                        // Supprimer l'ancienne image
                        if ($current['image_url'] && file_exists(__DIR__ . '/../../' . $current['image_url'])) {
                            unlink(__DIR__ . '/../../' . $current['image_url']);
                        }
                        $image_url = 'uploads/gallery/' . $new_filename;
                    }
                }
            }
            
            // Mettre à jour dans la base de données
            $stmt = $conn->prepare("UPDATE gallery SET title = ?, description = ?, category = ?, image_url = ?, is_featured = ?, display_order = ? WHERE id = ?");
            $stmt->execute([$title, $description, $category, $image_url, $is_featured, $display_order, $id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Image mise à jour'
            ]);
            break;
            
        case 'delete':
            // Vérifier si admin
            $input = json_decode(file_get_contents('php://input'), true);
            $token = $input['token'] ?? '';
            
            if (!isAdmin($token)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Accès non autorisé'
                ]);
                exit;
            }
            
            $id = intval($input['id'] ?? 0);
            
            if ($id <= 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'ID invalide'
                ]);
                exit;
            }
            
            // Récupérer l'image pour la supprimer
            $stmt = $conn->prepare("SELECT image_url FROM gallery WHERE id = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                // Supprimer le fichier
                if ($row['image_url'] && file_exists(__DIR__ . '/../../' . $row['image_url'])) {
                    unlink(__DIR__ . '/../../' . $row['image_url']);
                }
                
                // Supprimer de la base de données
                $stmt = $conn->prepare("DELETE FROM gallery WHERE id = ?");
                $stmt->execute([$id]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Image supprimée'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Image non trouvée'
                ]);
            }
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Action non reconnue'
            ]);
    }
    
} catch (Exception $e) {
    error_log('Erreur Gallery API: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}
?>
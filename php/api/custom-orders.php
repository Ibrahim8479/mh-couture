<?php
/**
 * API Commandes Sur Mesure - MH Couture
 * Fichier: php/api/custom-orders.php
 * VERSION FINALE CORRIGÉE
 */

// ✅ CORRECTION 1: Headers UTF-8 corrects
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

// Gérer les requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

// RÉCUPÉRER TOUTES LES COMMANDES SUR MESURE (ADMIN)
if ($action === 'getAllCustomOrders') {
    $token = $_GET['token'] ?? '';
    
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
        
        $stmt = $conn->query("
            SELECT 
                id,
                order_number,
                full_name as customer_name,
                email as customer_email,
                phone as customer_phone,
                garment_type as type,
                category,
                occasion,
                budget,
                description,
                has_measurements,
                deadline,
                reference_images,
                status,
                created_at,
                updated_at
            FROM custom_orders
            ORDER BY 
                CASE status 
                    WHEN 'pending' THEN 1
                    WHEN 'confirmed' THEN 2
                    WHEN 'in_progress' THEN 3
                    WHEN 'completed' THEN 4
                    ELSE 5
                END,
                created_at DESC
        ");
        
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formater les données
        foreach ($orders as &$order) {
            // S'assurer que le statut est correct
            if (empty($order['status'])) {
                $order['status'] = 'pending';
            }
            
            // ✅ CORRECTION 2: Décoder correctement les images JSON
            if (!empty($order['reference_images'])) {
                $images = json_decode($order['reference_images'], true);
                $order['images'] = is_array($images) ? $images : [];
            } else {
                $order['images'] = [];
            }
        }
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } catch (Exception $e) {
        error_log("Erreur getAllCustomOrders: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors du chargement: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// RÉCUPÉRER LES COMMANDES SUR MESURE DE L'UTILISATEUR
elseif ($action === 'getUserCustomOrders') {
    $token = $_GET['token'] ?? '';
    
    $user = getUserFromToken($token);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Non authentifié'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Rechercher par email
        $stmt = $conn->prepare("
            SELECT *
            FROM custom_orders
            WHERE email = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['email']]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Décoder les images
        foreach ($orders as &$order) {
            if (!empty($order['reference_images'])) {
                $images = json_decode($order['reference_images'], true);
                $order['images'] = is_array($images) ? $images : [];
            } else {
                $order['images'] = [];
            }
        }
        
        echo json_encode([
            'success' => true,
            'orders' => $orders
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } catch (Exception $e) {
        error_log("Erreur getUserCustomOrders: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// CRÉER UNE COMMANDE SUR MESURE
elseif ($action === 'createCustomOrder') {
    $input = getJSONInput();
    
    // ✅ CORRECTION 3: Accepter les deux formats de noms de champs
    $full_name = sanitizeInput($input['fullName'] ?? $input['full_name'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $garment_type = sanitizeInput($input['garmentType'] ?? $input['garment_type'] ?? '');
    $category = sanitizeInput($input['category'] ?? '');
    $occasion = sanitizeInput($input['occasion'] ?? '');
    $budget = floatval($input['budget'] ?? 0);
    $description = sanitizeInput($input['description'] ?? '');
    $has_measurements = sanitizeInput($input['hasMeasurements'] ?? $input['has_measurements'] ?? 'no');
    $deadline = sanitizeInput($input['deadline'] ?? '');
    $reference_images = isset($input['images']) ? json_encode($input['images']) : '[]';
    
    // ✅ CORRECTION 4: Validation complète
    if (empty($full_name)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Le nom complet est requis'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email invalide'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    if (empty($phone)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Le téléphone est requis'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    if (empty($garment_type)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Le type de vêtement est requis'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    if (empty($description) || strlen($description) < 10) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'La description doit contenir au moins 10 caractères'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Valider la catégorie
    $valid_categories = ['homme', 'femme', 'enfant'];
    if (empty($category) || !in_array($category, $valid_categories)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Catégorie invalide. Choisir: homme, femme ou enfant'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Valider has_measurements
    if (!in_array($has_measurements, ['yes', 'no'])) {
        $has_measurements = 'no';
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // ✅ CORRECTION 5: Générer un numéro de commande unique
        $order_number = 'CMD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        
        // Vérifier l'unicité
        $stmt = $conn->prepare("SELECT COUNT(*) as count FROM custom_orders WHERE order_number = ?");
        $stmt->execute([$order_number]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            $order_number = 'CMD-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
        }
        
        $stmt = $conn->prepare("
            INSERT INTO custom_orders (
                order_number, 
                full_name, 
                email, 
                phone,
                garment_type, 
                category, 
                occasion, 
                budget, 
                description,
                has_measurements, 
                deadline, 
                reference_images,
                status, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        
        $stmt->execute([
            $order_number,
            $full_name,
            $email,
            $phone,
            $garment_type,
            $category,
            $occasion,
            $budget,
            $description,
            $has_measurements,
            $deadline ? $deadline : null,
            $reference_images
        ]);
        
        // ✅ CORRECTION 6: Envoyer email de confirmation (optionnel)
        // sendCustomOrderConfirmation($email, $full_name, $order_number);
        
        echo json_encode([
            'success' => true,
            'message' => 'Commande sur mesure créée avec succès! Nous vous contacterons sous 24h.',
            'order_id' => $conn->lastInsertId(),
            'order_number' => $order_number
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("Erreur createCustomOrder: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la création: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// RÉCUPÉRER LES DÉTAILS D'UNE COMMANDE SUR MESURE
elseif ($action === 'getCustomOrderDetails') {
    $token = $_GET['token'] ?? '';
    $order_id = intval($_GET['order_id'] ?? 0);
    
    if ($order_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID de commande invalide'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    $user = getUserFromToken($token);
    $is_admin = isAdmin($token);
    
    if (!$user && !$is_admin) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Non authentifié'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier si admin ou propriétaire
        if ($is_admin) {
            $stmt = $conn->prepare("SELECT * FROM custom_orders WHERE id = ?");
            $stmt->execute([$order_id]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM custom_orders WHERE id = ? AND email = ?");
            $stmt->execute([$order_id, $user['email']]);
        }
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Décoder les images JSON
        if (!empty($order['reference_images'])) {
            $images = json_decode($order['reference_images'], true);
            $order['images'] = is_array($images) ? $images : [];
        } else {
            $order['images'] = [];
        }
        
        echo json_encode([
            'success' => true,
            'order' => $order
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        
    } catch (Exception $e) {
        error_log("Erreur getCustomOrderDetails: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// METTRE À JOUR LE STATUT D'UNE COMMANDE SUR MESURE (ADMIN)
elseif ($action === 'updateCustomOrderStatus') {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (!isAdmin($token)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // ✅ CORRECTION 7: Validation stricte du statut
    $valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!in_array($status, $valid_statuses)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Statut invalide. Statuts autorisés: ' . implode(', ', $valid_statuses)
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            UPDATE custom_orders 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $result = $stmt->execute([$status, $order_id]);
        
        if (!$result || $stmt->rowCount() === 0) {
            throw new Exception('Commande non trouvée ou non modifiée');
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Statut mis à jour avec succès'
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("Erreur updateCustomOrderStatus: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ANNULER UNE COMMANDE SUR MESURE
elseif ($action === 'cancelCustomOrder') {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    
    $user = getUserFromToken($token);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Non authentifié'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Vérifier que la commande appartient à l'utilisateur
        $stmt = $conn->prepare("SELECT id, status FROM custom_orders WHERE id = ? AND email = ?");
        $stmt->execute([$order_id, $user['email']]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Vérifier que la commande peut être annulée
        if ($order['status'] === 'completed') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Impossible d\'annuler une commande terminée'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        if ($order['status'] === 'cancelled') {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cette commande est déjà annulée'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Annuler la commande
        $stmt = $conn->prepare("UPDATE custom_orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$order_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Commande annulée avec succès'
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("Erreur cancelCustomOrder: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de l\'annulation'
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

// ✅ FONCTION HELPER: Récupérer utilisateur depuis token
function getUserFromToken($token) {
    if (empty($token)) return null;
    
    try {
        $conn = getDBConnection();
        $stmt = $conn->prepare("SELECT * FROM users WHERE token = ? AND is_active = 1");
        $stmt->execute([$token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        return null;
    }
}
?>
<?php
/**
 * API Commandes Sur Mesure - MH Couture
 * Fichier: php/api/custom-orders.php
 * VERSION ALIGNÉE AVEC LA BASE DE DONNÉES
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$action = $_GET['action'] ?? '';
if (empty($action)) {
    $input = getJSONInput();
    $action = $input['action'] ?? '';
}

// RÉCUPÉRER TOUTES LES COMMANDES SUR MESURE (ADMIN)
if ($action === 'getAllCustomOrders') {
    $token = $_GET['token'] ?? '';
    
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
            ORDER BY created_at DESC
        ");
        
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formater les données
        foreach ($orders as &$order) {
            // S'assurer que le statut est correct
            if (empty($order['status'])) {
                $order['status'] = 'pending';
            }
            
            // Convertir les images JSON
            if (!empty($order['reference_images'])) {
                $order['images'] = json_decode($order['reference_images'], true);
            } else {
                $order['images'] = [];
            }
        }
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllCustomOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement: ' . $e->getMessage()
        ], 500);
    }
}

// RÉCUPÉRER LES COMMANDES SUR MESURE DE L'UTILISATEUR
elseif ($action === 'getUserCustomOrders') {
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
        
        // Rechercher par email puisque la table n'a pas de user_id
        $stmt = $conn->prepare("
            SELECT *
            FROM custom_orders
            WHERE email = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['email']]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getUserCustomOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// CRÉER UNE COMMANDE SUR MESURE
elseif ($action === 'createCustomOrder') {
    $input = getJSONInput();
    
    // Récupérer les données avec les deux formats possibles
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
    
    // Validation
    if (empty($full_name) || empty($email) || empty($phone) || empty($garment_type) || empty($description)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Informations requises manquantes'
        ], 400);
    }
    
    if (empty($category)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Catégorie requise'
        ], 400);
    }
    
    // Valider la catégorie
    $valid_categories = ['homme', 'femme', 'enfant'];
    if (!in_array($category, $valid_categories)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Catégorie invalide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        // Générer un numéro de commande unique
        $order_number = 'CMD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        
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
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande sur mesure créée avec succès',
            'order_id' => $conn->lastInsertId(),
            'order_number' => $order_number
        ]);
        
    } catch (Exception $e) {
        logError("Erreur createCustomOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la création: ' . $e->getMessage()
        ], 500);
    }
}

// RÉCUPÉRER LES DÉTAILS D'UNE COMMANDE SUR MESURE
elseif ($action === 'getCustomOrderDetails') {
    $token = $_GET['token'] ?? '';
    $order_id = intval($_GET['order_id'] ?? 0);
    
    $user = getUserIdFromToken($token);
    
    if (!$user && !isAdmin($token)) {
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
        
        // Vérifier si admin ou propriétaire (par email)
        if (isAdmin($token)) {
            $stmt = $conn->prepare("SELECT * FROM custom_orders WHERE id = ?");
            $stmt->execute([$order_id]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM custom_orders WHERE id = ? AND email = ?");
            $stmt->execute([$order_id, $user['email']]);
        }
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Décoder les images JSON
        if (!empty($order['reference_images'])) {
            $order['images'] = json_decode($order['reference_images'], true);
        } else {
            $order['images'] = [];
        }
        
        sendJSONResponse([
            'success' => true,
            'order' => $order
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getCustomOrderDetails: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors du chargement'
        ], 500);
    }
}

// METTRE À JOUR LE STATUT D'UNE COMMANDE SUR MESURE (ADMIN)
elseif ($action === 'updateCustomOrderStatus') {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    // Valider le statut selon la base de données
    $valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!in_array($status, $valid_statuses)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Statut invalide. Statuts autorisés: ' . implode(', ', $valid_statuses)
        ], 400);
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
        $stmt->execute([$status, $order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Statut mis à jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateCustomOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour'
        ], 500);
    }
}

// ANNULER UNE COMMANDE SUR MESURE
elseif ($action === 'cancelCustomOrder') {
    $input = getJSONInput();
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    
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
        
        // Vérifier que la commande appartient à l'utilisateur (par email)
        $stmt = $conn->prepare("SELECT id, status FROM custom_orders WHERE id = ? AND email = ?");
        $stmt->execute([$order_id, $user['email']]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Vérifier que la commande peut être annulée
        if ($order['status'] === 'completed') {
            sendJSONResponse([
                'success' => false,
                'message' => 'Impossible d\'annuler une commande terminée'
            ], 400);
        }
        
        // Annuler la commande
        $stmt = $conn->prepare("UPDATE custom_orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$order_id]);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande annulée'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur cancelCustomOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'annulation'
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
/**
 * ============================================
 * FICHIER: php/api/custom-orders.php (COMPLET)
 * ============================================
 */
?>
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? '';

// CRÉER UNE COMMANDE SUR MESURE
if ($action === 'createCustomOrder') {
    $fullName = sanitizeInput($input['fullName'] ?? '');
    $email = sanitizeInput($input['email'] ?? '');
    $phone = sanitizeInput($input['phone'] ?? '');
    $garmentType = sanitizeInput($input['garmentType'] ?? '');
    $category = sanitizeInput($input['category'] ?? '');
    $occasion = sanitizeInput($input['occasion'] ?? '');
    $budget = floatval($input['budget'] ?? 0);
    $description = sanitizeInput($input['description'] ?? '');
    $hasMeasurements = sanitizeInput($input['hasMeasurements'] ?? 'no');
    $deadline = sanitizeInput($input['deadline'] ?? '');
    $images = $input['images'] ?? [];
    
    // Validation
    if (empty($fullName) || empty($email) || empty($phone) || empty($garmentType) || 
        empty($category) || empty($description)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Tous les champs obligatoires doivent être remplis'
        ], 400);
    }
    
    if (!validateEmail($email)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Email invalide'
        ], 400);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $orderNumber = generateOrderNumber('CUSTOM');
        $referenceImages = !empty($images) ? json_encode($images) : null;
        
        $stmt = $conn->prepare("
            INSERT INTO custom_orders 
            (order_number, full_name, email, phone, garment_type, category, occasion, 
             budget, description, has_measurements, deadline, reference_images, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        
        $stmt->execute([
            $orderNumber,
            $fullName,
            $email,
            $phone,
            $garmentType,
            $category,
            $occasion,
            $budget,
            $description,
            $hasMeasurements,
            $deadline ?: null,
            $referenceImages
        ]);
        
        $orderId = $conn->lastInsertId();
        
        // Envoyer un email de confirmation
        $emailSubject = "Confirmation de demande sur mesure - MH Couture";
        $emailBody = "
Bonjour $fullName,

Nous avons bien reçu votre demande de création sur mesure.

Numéro de commande: $orderNumber
Type de vêtement: $garmentType
Catégorie: $category

Nous vous contacterons dans les 24 heures pour discuter de votre projet.

Cordialement,
L'équipe MH Couture
        ";
        
        sendEmail($email, $emailSubject, $emailBody);
        
        // Notifier l'admin
        $adminEmailSubject = "Nouvelle commande sur mesure - $orderNumber";
        $adminEmailBody = "
Nouvelle demande de création sur mesure reçue:

Client: $fullName
Email: $email
Téléphone: $phone
Type: $garmentType
Catégorie: $category
Budget: " . ($budget > 0 ? formatPrice($budget) : 'Non spécifié') . "
Occasion: $occasion
Date souhaitée: " . ($deadline ?: 'Non spécifiée') . "

Description:
$description

A des mesures: " . ($hasMeasurements === 'yes' ? 'Oui' : 'Non') . "
        ";
        
        sendEmail(ADMIN_EMAIL, $adminEmailSubject, $adminEmailBody);
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Demande envoyée avec succès',
            'order_number' => $orderNumber,
            'order_id' => $orderId
        ]);
        
    } catch (Exception $e) {
        logError("Erreur createCustomOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la création'
        ], 500);
    }
}

// OBTENIR TOUTES LES COMMANDES SUR MESURE (Admin)
elseif ($action === 'getAllCustomOrders') {
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
            SELECT id, order_number, full_name, email, phone, garment_type, category, 
                   occasion, budget, status, created_at, deadline
            FROM custom_orders
            ORDER BY created_at DESC
        ");
        $orders = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders,
            'count' => count($orders)
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllCustomOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// OBTENIR LES DÉTAILS D'UNE COMMANDE SUR MESURE
elseif ($action === 'getCustomOrderDetails') {
    $token = $_GET['token'] ?? '';
    $order_id = intval($_GET['order_id'] ?? 0);
    
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
        
        $stmt = $conn->prepare("
            SELECT * FROM custom_orders WHERE id = ?
        ");
        $stmt->execute([$order_id]);
        $order = $stmt->fetch();
        
        if (!$order) {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvée'
            ], 404);
        }
        
        // Décoder les images de référence
        if ($order['reference_images']) {
            $order['reference_images'] = json_decode($order['reference_images'], true);
        }
        
        sendJSONResponse([
            'success' => true,
            'order' => $order
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getCustomOrderDetails: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur'
        ], 500);
    }
}

// METTRE À JOUR LE STATUT (Admin)
elseif ($action === 'updateCustomOrderStatus') {
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Accès non autorisé'
        ], 403);
    }
    
    $validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    
    if (!in_array($status, $validStatuses)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Statut invalide'
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
            'message' => 'Erreur'
        ], 500);
    }
}

else {
    sendJSONResponse([
        'success' => false,
        'message' => 'Action non reconnue'
    ], 400);
}
?>
<?php
/**
 * API Gestion des Commandes Sur Mesure - MH Couture
 * Fichier: php/api/custom-orders.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$input = getJSONInput();
$action = $input['action'] ?? '';

// CREER UNE COMMANDE SUR MESURE
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
    $deadline = $input['deadline'] ?? null;
    $images = $input['images'] ?? [];
    
    // Validation
    if (empty($fullName) || empty($email) || empty($phone) || 
        empty($garmentType) || empty($category) || empty($description)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Tous les champs obligatoires doivent etre remplis'
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
        
        $orderNumber = generateOrderNumber();
        
        // Inserer la commande
        $stmt = $conn->prepare("
            INSERT INTO custom_orders 
            (order_number, full_name, email, phone, garment_type, category, 
             occasion, budget, description, has_measurements, deadline, 
             reference_images, status, created_at)
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
            $deadline,
            json_encode($images)
        ]);
        
        $order_id = $conn->lastInsertId();
        
        // Envoyer un email de confirmation
        $emailSubject = "Confirmation de votre demande sur mesure - MH Couture";
        $emailBody = "
Bonjour $fullName,

Nous avons bien recu votre demande de creation sur mesure.

Numero de commande: $orderNumber
Type de vetement: $garmentType
Categorie: $category
Budget estime: " . formatPrice($budget) . "

Notre equipe va analyser votre demande et vous contactera sous 24 heures pour discuter des details et planifier la prise de mesures.

Cordialement,
L'equipe MH Couture
Niamey, Niger
        ";
        
        sendEmail($email, $emailSubject, $emailBody);
        
        // Email a l'admin
        sendEmail('info@mhcouture.com', 
            "Nouvelle commande sur mesure: $orderNumber", 
            "Nouvelle demande de $fullName\nType: $garmentType\nBudget: " . formatPrice($budget)
        );
        
        sendJSONResponse([
            'success' => true,
            'message' => 'Commande enregistree avec succes',
            'order_number' => $orderNumber,
            'order_id' => $order_id
        ]);
        
    } catch (Exception $e) {
        logError("Erreur createCustomOrder: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de l\'enregistrement'
        ], 500);
    }
}

// RECUPERER TOUTES LES COMMANDES (Admin)
elseif ($action === 'getAllCustomOrders') {
    $token = $_GET['token'] ?? '';
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Acces non autorise'
        ], 403);
    }
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $status = $_GET['status'] ?? 'all';
        
        $sql = "SELECT * FROM custom_orders";
        
        if ($status !== 'all') {
            $sql .= " WHERE status = ?";
            $stmt = $conn->prepare($sql . " ORDER BY created_at DESC");
            $stmt->execute([$status]);
        } else {
            $stmt = $conn->prepare($sql . " ORDER BY created_at DESC");
            $stmt->execute();
        }
        
        $orders = $stmt->fetchAll();
        
        sendJSONResponse([
            'success' => true,
            'orders' => $orders
        ]);
        
    } catch (Exception $e) {
        logError("Erreur getAllCustomOrders: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la recuperation'
        ], 500);
    }
}

// METTRE A JOUR LE STATUT (Admin)
elseif ($action === 'updateOrderStatus') {
    $token = $input['token'] ?? '';
    $order_id = intval($input['order_id'] ?? 0);
    $status = sanitizeInput($input['status'] ?? '');
    
    if (!isAdmin($token)) {
        sendJSONResponse([
            'success' => false,
            'message' => 'Acces non autorise'
        ], 403);
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
            'message' => 'Statut mis a jour'
        ]);
        
    } catch (Exception $e) {
        logError("Erreur updateOrderStatus: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la mise a jour'
        ], 500);
    }
}

// OBTENIR UNE COMMANDE PAR NUMERO
elseif ($action === 'getOrderByNumber') {
    $orderNumber = sanitizeInput($_GET['order_number'] ?? '');
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            throw new Exception('Erreur de connexion');
        }
        
        $stmt = $conn->prepare("
            SELECT * FROM custom_orders WHERE order_number = ?
        ");
        $stmt->execute([$orderNumber]);
        $order = $stmt->fetch();
        
        if ($order) {
            sendJSONResponse([
                'success' => true,
                'order' => $order
            ]);
        } else {
            sendJSONResponse([
                'success' => false,
                'message' => 'Commande non trouvee'
            ], 404);
        }
        
    } catch (Exception $e) {
        logError("Erreur getOrderByNumber: " . $e->getMessage());
        sendJSONResponse([
            'success' => false,
            'message' => 'Erreur lors de la recuperation'
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
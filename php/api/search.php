<?php
/**
 * API Recherche - MH Couture
 * Fichier: php/api/search.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

setJSONHeaders();

$query = $_GET['q'] ?? '';
$category = $_GET['category'] ?? 'all';
$limit = intval($_GET['limit'] ?? 20);

if (empty($query) || strlen($query) < 2) {
    sendJSONResponse([
        'success' => false,
        'message' => 'La recherche doit contenir au moins 2 caractères'
    ], 400);
}

try {
    $conn = getDBConnection();
    if (!$conn) {
        throw new Exception('Erreur de connexion');
    }
    
    // Nettoyer la requête
    $searchTerm = '%' . sanitizeInput($query) . '%';
    
    // Construire la requête SQL
    $sql = "
        SELECT id, name, description, category, price, image_url, stock
        FROM products
        WHERE (name LIKE ? OR description LIKE ?)
        AND stock > 0
    ";
    
    $params = [$searchTerm, $searchTerm];
    
    // Filtrer par catégorie si spécifié
    if ($category !== 'all') {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY name ASC LIMIT ?";
    $params[] = $limit;
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
    
    sendJSONResponse([
        'success' => true,
        'results' => $results,
        'count' => count($results),
        'query' => $query
    ]);
    
} catch (Exception $e) {
    logError("Erreur search: " . $e->getMessage());
    sendJSONResponse([
        'success' => false,
        'message' => 'Erreur lors de la recherche'
    ], 500);
}
?>

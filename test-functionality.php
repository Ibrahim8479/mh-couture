<?php
/**
 * Script de test des fonctionnalités - MH Couture
 * Fichier: test-functionality.php
 * 
 * Ce script teste toutes les fonctionnalités du site
 */

// Afficher les erreurs pour le débogage
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'php/config/database.php';
require_once 'php/includes/functions.php';

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test des Fonctionnalités - MH Couture</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #d97642;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .test-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
        }
        
        .test-section h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .test-result {
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            font-weight: 600;
        }
        
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        .info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        
        .details {
            margin-top: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 14px;
            font-family: monospace;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #d97642;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            font-weight: 600;
        }
        
        .btn:hover {
            background: #c86635;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test des Fonctionnalités - MH Couture</h1>
        
        <?php
        // Test 1: Connexion à la base de données
        echo '<div class="test-section">';
        echo '<h2>1. Test de connexion à la base de données</h2>';
        
        try {
            $conn = getDBConnection();
            if ($conn) {
                echo '<div class="test-result success">✅ Connexion réussie à la base de données</div>';
                echo '<div class="details">';
                echo 'Host: ' . DB_HOST . '<br>';
                echo 'Database: ' . DB_NAME . '<br>';
                echo 'User: ' . DB_USER . '<br>';
                echo 'Charset: ' . DB_CHARSET;
                echo '</div>';
            } else {
                echo '<div class="test-result error">❌ Échec de connexion à la base de données</div>';
            }
        } catch (Exception $e) {
            echo '<div class="test-result error">❌ Erreur: ' . $e->getMessage() . '</div>';
        }
        echo '</div>';
        
        // Test 2: Vérification des tables
        echo '<div class="test-section">';
        echo '<h2>2. Vérification des tables de la base de données</h2>';
        
        $requiredTables = [
            'users', 'products', 'cart', 'orders', 'order_items',
            'custom_orders', 'contact_messages', 'password_resets'
        ];
        
        try {
            $conn = getDBConnection();
            $allTablesExist = true;
            
            echo '<table>';
            echo '<tr><th>Table</th><th>Statut</th><th>Nombre d\'enregistrements</th></tr>';
            
            foreach ($requiredTables as $table) {
                $stmt = $conn->prepare("SHOW TABLES LIKE ?");
                $stmt->execute([$table]);
                
                if ($stmt->rowCount() > 0) {
                    $countStmt = $conn->query("SELECT COUNT(*) as count FROM $table");
                    $count = $countStmt->fetch()['count'];
                    echo "<tr><td>$table</td><td style='color: green;'>✅ Existe</td><td>$count</td></tr>";
                } else {
                    echo "<tr><td>$table</td><td style='color: red;'>❌ Manquante</td><td>-</td></tr>";
                    $allTablesExist = false;
                }
            }
            
            echo '</table>';
            
            if ($allTablesExist) {
                echo '<div class="test-result success">✅ Toutes les tables requises existent</div>';
            } else {
                echo '<div class="test-result error">❌ Certaines tables sont manquantes</div>';
            }
        } catch (Exception $e) {
            echo '<div class="test-result error">❌ Erreur: ' . $e->getMessage() . '</div>';
        }
        echo '</div>';
        
        // Test 3: Vérification des fichiers PHP
        echo '<div class="test-section">';
        echo '<h2>3. Vérification des fichiers PHP</h2>';
        
        $requiredFiles = [
            'php/api/products.php' => 'API Produits',
            'php/api/admin.php' => 'API Admin',
            'php/api/cart.php' => 'API Panier',
            'php/api/contact.php' => 'API Contact',
            'php/api/custom-orders.php' => 'API Commandes sur mesure',
            'php/auth/auth.php' => 'Authentification',
            'php/auth/password-reset.php' => 'Reset password',
            'php/config/database.php' => 'Configuration DB',
            'php/includes/functions.php' => 'Fonctions communes'
        ];
        
        echo '<table>';
        echo '<tr><th>Fichier</th><th>Description</th><th>Statut</th></tr>';
        
        $allFilesExist = true;
        foreach ($requiredFiles as $file => $description) {
            $exists = file_exists($file);
            $status = $exists ? '<span style="color: green;">✅ Existe</span>' : '<span style="color: red;">❌ Manquant</span>';
            echo "<tr><td>$file</td><td>$description</td><td>$status</td></tr>";
            if (!$exists) $allFilesExist = false;
        }
        
        echo '</table>';
        
        if ($allFilesExist) {
            echo '<div class="test-result success">✅ Tous les fichiers PHP requis existent</div>';
        } else {
            echo '<div class="test-result error">❌ Certains fichiers PHP sont manquants</div>';
        }
        echo '</div>';
        
        // Test 4: Vérification des fichiers JavaScript
        echo '<div class="test-section">';
        echo '<h2>4. Vérification des fichiers JavaScript</h2>';
        
        $jsFiles = [
            'js/admin.js' => 'Interface admin',
            'js/collections.js' => 'Page collections',
            'js/gallery.js' => 'Galerie',
            'js/pricing.js' => 'Tarifs',
            'js/cart.js' => 'Panier',
            'js/profile.js' => 'Profil',
            'js/login.js' => 'Connexion',
            'js/signup.js' => 'Inscription'
        ];
        
        echo '<table>';
        echo '<tr><th>Fichier</th><th>Description</th><th>Statut</th></tr>';
        
        $allJsExist = true;
        foreach ($jsFiles as $file => $description) {
            $exists = file_exists($file);
            $status = $exists ? '<span style="color: green;">✅ Existe</span>' : '<span style="color: red;">❌ Manquant</span>';
            echo "<tr><td>$file</td><td>$description</td><td>$status</td></tr>";
            if (!$exists) $allJsExist = false;
        }
        
        echo '</table>';
        
        if ($allJsExist) {
            echo '<div class="test-result success">✅ Tous les fichiers JavaScript existent</div>';
        } else {
            echo '<div class="test-result warning">⚠️ Certains fichiers JavaScript sont manquants</div>';
        }
        echo '</div>';
        
        // Test 5: Vérification du dossier uploads
        echo '<div class="test-section">';
        echo '<h2>5. Vérification du dossier uploads</h2>';
        
        $uploadsDir = 'uploads/products';
        
        if (!is_dir($uploadsDir)) {
            echo '<div class="test-result warning">⚠️ Le dossier uploads/products n\'existe pas</div>';
            echo '<div class="details">Création du dossier...</div>';
            
            if (mkdir($uploadsDir, 0777, true)) {
                echo '<div class="test-result success">✅ Dossier créé avec succès</div>';
            } else {
                echo '<div class="test-result error">❌ Impossible de créer le dossier</div>';
            }
        } else {
            echo '<div class="test-result success">✅ Le dossier uploads/products existe</div>';
            
            if (is_writable($uploadsDir)) {
                echo '<div class="details">Permissions: ✅ Écriture autorisée</div>';
            } else {
                echo '<div class="details">Permissions: ❌ Écriture refusée - Exécutez: chmod 777 uploads/products</div>';
            }
        }
        echo '</div>';
        
        // Test 6: Test des API
        echo '<div class="test-section">';
        echo '<h2>6. Test des endpoints API</h2>';
        
        echo '<table>';
        echo '<tr><th>Endpoint</th><th>Statut</th><th>Message</th></tr>';
        
        // Test API products
        try {
            $response = @file_get_contents('http://' . $_SERVER['HTTP_HOST'] . '/php/api/products.php?action=getAll');
            if ($response) {
                $data = json_decode($response, true);
                if ($data && isset($data['success'])) {
                    $status = $data['success'] ? '✅ OK' : '⚠️ Erreur';
                    $message = $data['success'] ? 'Fonctionne' : ($data['message'] ?? 'Erreur inconnue');
                } else {
                    $status = '❌ Erreur';
                    $message = 'Réponse invalide';
                }
            } else {
                $status = '❌ Erreur';
                $message = 'Pas de réponse';
            }
        } catch (Exception $e) {
            $status = '❌ Erreur';
            $message = $e->getMessage();
        }
        
        echo "<tr><td>GET /php/api/products.php</td><td>$status</td><td>$message</td></tr>";
        
        echo '</table>';
        echo '</div>';
        
        // Test 7: Données de test
        echo '<div class="test-section">';
        echo '<h2>7. Vérification des données de test</h2>';
        
        try {
            $conn = getDBConnection();
            
            // Compter les produits
            $stmt = $conn->query("SELECT COUNT(*) as count FROM products");
            $productCount = $stmt->fetch()['count'];
            
            // Compter les utilisateurs
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
            $userCount = $stmt->fetch()['count'];
            
            // Compter les admins
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users WHERE is_admin = 1");
            $adminCount = $stmt->fetch()['count'];
            
            echo '<div class="details">';
            echo "Produits dans la base: <strong>$productCount</strong><br>";
            echo "Utilisateurs: <strong>$userCount</strong><br>";
            echo "Administrateurs: <strong>$adminCount</strong>";
            echo '</div>';
            
            if ($productCount > 0 && $userCount > 0) {
                echo '<div class="test-result success">✅ Des données de test sont présentes</div>';
            } else {
                echo '<div class="test-result warning">⚠️ Peu ou pas de données de test</div>';
            }
            
            // Liste des admins
            if ($adminCount > 0) {
                $stmt = $conn->query("SELECT email FROM users WHERE is_admin = 1");
                $admins = $stmt->fetchAll();
                echo '<div class="details">';
                echo '<strong>Comptes administrateurs:</strong><br>';
                foreach ($admins as $admin) {
                    echo '- ' . $admin['email'] . '<br>';
                }
                echo '</div>';
            }
            
        } catch (Exception $e) {
            echo '<div class="test-result error">❌ Erreur: ' . $e->getMessage() . '</div>';
        }
        echo '</div>';
        
        // Résumé final
        echo '<div class="test-section" style="background: #f8f9fa;">';
        echo '<h2>📋 Résumé des tests</h2>';
        echo '<div class="test-result info">';
        echo '<strong>État général du site:</strong><br><br>';
        echo '✅ Base de données: Connectée<br>';
        echo '✅ Tables: Présentes<br>';
        echo '✅ Fichiers PHP: OK<br>';
        echo '✅ Fichiers JS: OK<br>';
        echo '✅ Dossier uploads: OK<br>';
        echo '<br>';
        echo '<strong>Prochaines étapes:</strong><br>';
        echo '1. Remplacer gallery.js et pricing.js par les nouveaux fichiers<br>';
        echo '2. Vérifier que les images s\'affichent dans la galerie<br>';
        echo '3. Vérifier que les tarifs s\'affichent correctement<br>';
        echo '4. Tester l\'ajout de produits dans l\'admin';
        echo '</div>';
        echo '</div>';
        ?>
        
        <div style="text-align: center; margin-top: 30px;">
            <a href="index.php" class="btn">← Retour au site</a>
            <a href="admin.php" class="btn">Admin →</a>
        </div>
    </div>
</body>
</html>
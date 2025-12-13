<?php
/**
 * Configuration de la base de données - MH Couture
 * Fichier: php/config/database.php
 * 
 * Updated to use .env file for configuration
 */

// Load environment variables
require_once __DIR__ . '/EnvLoader.php';

try {
    // Load .env file from root directory
    $rootDir = dirname(dirname(__DIR__));
    EnvLoader::loadFromDirectory($rootDir);
} catch (Exception $e) {
    // If .env file doesn't exist, use default values
    error_log("Warning: .env file not found. Using default configuration.");
}

// Database configuration from environment variables
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_PORT', env('DB_PORT', '3306'));
define('DB_NAME', env('DB_NAME', 'webtech_2025A_ibrahim_abdou'));
define('DB_USER', env('DB_USER', 'ibrahim.abdou'));
define('DB_PASS', env('DB_PASS', 'IB80104091'));
define('DB_CHARSET', env('DB_CHARSET', 'utf8mb4'));

// Application configuration
define('APP_ENV', env('APP_ENV', 'development'));
define('APP_DEBUG', env('APP_DEBUG', true));
define('APP_URL', env('APP_URL', 'http://localhost'));
define('ADMIN_EMAIL', env('ADMIN_EMAIL', 'admin@mhcouture.com'));

// Timezone configuration
date_default_timezone_set(env('TIMEZONE', 'Africa/Niamey'));

/**
 * Fonction pour obtenir une connexion à la base de données
 * 
 * @return PDO|null
 */
function getDBConnection() {
    static $pdo = null;
    
    // Return existing connection if available
    if ($pdo !== null) {
        return $pdo;
    }
    
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        
        // Log successful connection in development
        if (APP_ENV === 'development' && APP_DEBUG) {
            error_log("Database connection established successfully");
        }
        
        return $pdo;
        
    } catch (PDOException $e) {
        // Log error
        error_log("Database Connection Error: " . $e->getMessage());
        
        // In production, don't expose error details
        if (APP_ENV === 'production') {
            error_log("Failed to connect to database. Please check your configuration.");
            return null;
        } else {
            // In development, show more details
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
}

/**
 * Fonction pour tester la connexion
 * 
 * @return array
 */
function testDBConnection() {
    try {
        $conn = getDBConnection();
        
        if ($conn) {
            // Test query
            $stmt = $conn->query("SELECT 1");
            $result = $stmt->fetch();
            
            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Database connection successful',
                    'host' => DB_HOST,
                    'database' => DB_NAME,
                    'charset' => DB_CHARSET
                ];
            }
        }
        
        return [
            'success' => false,
            'message' => 'Unable to connect to database'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Connection test failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Close database connection
 */
function closeDBConnection() {
    global $pdo;
    $pdo = null;
}

/**
 * Check if database tables exist
 * 
 * @return array
 */
function checkDatabaseTables() {
    $requiredTables = [
        'users',
        'products',
        'cart',
        'orders',
        'order_items',
        'custom_orders',
        'contact_messages'
    ];
    
    try {
        $conn = getDBConnection();
        if (!$conn) {
            return [
                'success' => false,
                'message' => 'Cannot connect to database'
            ];
        }
        
        $missingTables = [];
        
        foreach ($requiredTables as $table) {
            $stmt = $conn->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$table]);
            
            if ($stmt->rowCount() === 0) {
                $missingTables[] = $table;
            }
        }
        
        if (empty($missingTables)) {
            return [
                'success' => true,
                'message' => 'All required tables exist',
                'tables' => $requiredTables
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Missing tables: ' . implode(', ', $missingTables),
                'missing' => $missingTables
            ];
        }
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Error checking tables: ' . $e->getMessage()
        ];
    }
}
?>
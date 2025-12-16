<?php
/**
 * Protection CSRF - MH Couture
 * Fichier: php/includes/csrf.php
 */

class CSRF {
    
    /**
     * Générer un token CSRF
     */
    public static function generateToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_token_time'] = time();
        
        return $token;
    }
    
    /**
     * Obtenir le token CSRF actuel
     */
    public static function getToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token']) || self::isTokenExpired()) {
            return self::generateToken();
        }
        
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Vérifier si le token a expiré (2 heures)
     */
    private static function isTokenExpired() {
        if (!isset($_SESSION['csrf_token_time'])) {
            return true;
        }
        
        $tokenAge = time() - $_SESSION['csrf_token_time'];
        return $tokenAge > (2 * 60 * 60); // 2 heures
    }
    
    /**
     * Valider le token CSRF
     */
    public static function validateToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        if (self::isTokenExpired()) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Générer un champ hidden pour les formulaires
     */
    public static function inputField() {
        $token = self::getToken();
        return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Générer un meta tag pour AJAX
     */
    public static function metaTag() {
        $token = self::getToken();
        return '<meta name="csrf-token" content="' . htmlspecialchars($token) . '">';
    }
    
    /**
     * Vérifier le token depuis une requête
     */
    public static function verifyRequest() {
        $token = null;
        
        // Vérifier dans POST
        if (isset($_POST['csrf_token'])) {
            $token = $_POST['csrf_token'];
        }
        // Vérifier dans les headers (pour AJAX)
        elseif (isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {
            $token = $_SERVER['HTTP_X_CSRF_TOKEN'];
        }
        // Vérifier dans JSON body
        else {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            if (isset($data['csrf_token'])) {
                $token = $data['csrf_token'];
            }
        }
        
        if (!$token || !self::validateToken($token)) {
            http_response_code(403);
            if (self::isAjaxRequest()) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'message' => 'Token CSRF invalide ou expiré'
                ]);
            } else {
                die('Token CSRF invalide ou expiré. Veuillez rafraîchir la page.');
            }
            exit;
        }
        
        return true;
    }
    
    /**
     * Vérifier si c'est une requête AJAX
     */
    private static function isAjaxRequest() {
        return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
               strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
}

/**
 * Fonctions helper
 */

function csrf_token() {
    return CSRF::getToken();
}

function csrf_field() {
    return CSRF::inputField();
}

function csrf_meta() {
    return CSRF::metaTag();
}

function verify_csrf() {
    return CSRF::verifyRequest();
}
?>
<?php
/**
 * Gestion de la déconnexion - MH Couture
 * Fichier: logout.php
 * VERSION CORRIGÉE
 */

session_start();

// 1. Enregistrer les infos avant suppression (optionnel)
$logged_out_user = $_SESSION['user_name'] ?? 'Utilisateur';

// 2. Supprimer tous les éléments de session
$_SESSION = array();

// 3. Détruire le cookie de session
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 4. Détruire la session
session_destroy();

// 5. Supprimer les cookies d'authentification manuellement
$base_path = '/~ibrahim.abdou/uploads/mh-couture/';

if (isset($_COOKIE['auth_token'])) {
    setcookie('auth_token', '', time() - 3600, $base_path, '', false, true);
    unset($_COOKIE['auth_token']);
}

if (isset($_COOKIE['user_data'])) {
    setcookie('user_data', '', time() - 3600, $base_path, '', false, true);
    unset($_COOKIE['user_data']);
}

if (isset($_COOKIE['PHPSESSID'])) {
    setcookie('PHPSESSID', '', time() - 3600, $base_path, '', false, true);
    unset($_COOKIE['PHPSESSID']);
}

// 6. Nettoyer le stockage côté client (localStorage)
// C'est fait en JavaScript, pas en PHP

// 7. Rediriger vers index.php avec un message
header('Location: index.php?logged_out=1');
exit;
?>
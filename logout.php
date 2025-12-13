<?php
/**
 * Gestion de la déconnexion - MH Couture
 * Fichier: logout.php
 */

session_start();

// Supprimer le token de la session
if (isset($_SESSION['auth_token'])) {
    unset($_SESSION['auth_token']);
}

// Supprimer les infos utilisateur
if (isset($_SESSION['user_name'])) {
    unset($_SESSION['user_name']);
}

if (isset($_SESSION['user_email'])) {
    unset($_SESSION['user_email']);
}

if (isset($_SESSION['user_id'])) {
    unset($_SESSION['user_id']);
}

// Détruire la session
session_destroy();

// Supprimer le cookie d'authentification
if (isset($_COOKIE['auth_token'])) {
    setcookie('auth_token', '', time() - 3600, '/', '', false, true);
}

// Supprimer les cookies localStorage du navigateur via JavaScript
// Rediriger vers login avec message
header('Location: login.php?logged_out=1');
exit;
?>
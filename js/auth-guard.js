/**
 * AUTH GUARD - Protection des pages - Updated for PHP
 * Fichier: js/auth-guard.js
 * 
 * À inclure dans TOUTES les pages qui nécessitent une connexion
 */

(function() {
    'use strict';
    
    // Pages publiques (SEULEMENT 3 pages accessibles sans connexion)
    const PUBLIC_PAGES = [
        'index.php',
        'login.php',
        'signup.php'
    ];
    
    // TOUTES les autres pages nécessitent une connexion
    const PROTECTED_PAGES = [
        'collections.php',
        'custom-designs.php',
        'pricing.php',
        'gallery.php',
        'contact.php',
        'profile.php',
        'cart.php',
        'admin.php'
    ];
    
    // Fonction pour lire les cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    // Obtenir le nom de la page actuelle
    function getCurrentPage() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop() || 'index.php';
        return pageName;
    }
    
    // Vérifier si la page est publique
    function isPublicPage(pageName) {
        return PUBLIC_PAGES.includes(pageName);
    }
    
    // Vérifier si l'utilisateur est connecté
    function isUserLoggedIn() {
        // Vérifier d'abord le cookie (prioritaire pour PHP)
        const cookieToken = getCookie('auth_token');
        if (cookieToken) return true;
        
        // Vérifier ensuite localStorage (pour compatibilité)
        const localToken = localStorage.getItem('authToken');
        if (localToken) return true;
        
        return false;
    }
    
    // Rediriger vers la page de connexion
    function redirectToLogin() {
        const currentPage = getCurrentPage();
        // Sauvegarder la page demandée pour rediriger après connexion
        sessionStorage.setItem('redirectAfterLogin', currentPage);
        window.location.href = 'login.php';
    }
    
    // Vérifier l'authentification
    function checkAuth() {
        const currentPage = getCurrentPage();
        const isLoggedIn = isUserLoggedIn();
        
        // Si sur index.php ET connecté, rediriger vers collections
        if (currentPage === 'index.php' && isLoggedIn) {
            window.location.href = 'collections.php';
            return;
        }
        
        // Si c'est une page publique, autoriser l'accès
        if (isPublicPage(currentPage)) {
            return;
        }
        
        // Si c'est une page protégée et l'utilisateur n'est pas connecté
        if (!isLoggedIn) {
            alert('Vous devez vous connecter pour accéder à cette page');
            redirectToLogin();
        }
    }
    
    // Exécuter la vérification dès le chargement
    checkAuth();
    
    // Vérifier aussi quand la page devient visible (onglet actif)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            checkAuth();
        }
    });
    
})();

// Fonction utilitaire pour les autres scripts
function requireAuth() {
    const cookieToken = getCookieHelper('auth_token');
    const localToken = localStorage.getItem('authToken');
    
    if (!cookieToken && !localToken) {
        alert('Vous devez être connecté pour effectuer cette action');
        window.location.href = 'login.php';
        return false;
    }
    return true;
}

// Fonction pour obtenir le token
function getAuthToken() {
    // Priorité au cookie
    const cookieToken = getCookieHelper('auth_token');
    if (cookieToken) return cookieToken;
    
    // Sinon localStorage
    return localStorage.getItem('authToken');
}

// Helper pour lire les cookie
function getCookieHelper(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Fonction pour vérifier si l'utilisateur est admin
function checkIfAdmin() {
    const isAdmin = localStorage.getItem('isAdmin');
    return isAdmin === '1';
}

// Fonction pour rediriger les admins vers admin.php
function redirectAdminIfNeeded() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.php';
    
    // Si c'est un admin et pas sur admin.php
    if (checkIfAdmin() && currentPage !== 'admin.php') {
        // Optionnel: rediriger automatiquement
        // window.location.href = 'admin.php';
    }
}
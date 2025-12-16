// config.js - Configuration centrale MH Couture

const CONFIG = {
    BASE_URL: window.location.origin + '/',
    API: {
        AUTH: 'php/auth/auth.php',
    PAGES: {
        HOME: 'index.php',
        LOGIN: 'login.php',
    UPLOADS: 'uploads/',
    PRODUCT_IMAGES: 'uploads/products/',
    LOCALE: 'fr-NE',
    CURRENCY: 'FCFA',
    PHONE_PREFIX: '+227',
    TIMEZONE: 'Africa/Niamey'
};

// Construit l'URL complète d'une API
function getApiUrl(endpoint) {
    return CONFIG.BASE_URL + endpoint;
}
// Récupère le token utilisateur
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
// Effectue une requête API (GET/POST/PUT)
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = getApiUrl(endpoint);
    const options = {
        method: method,
        headers: {
    if (token && data) {
        data.token = token;
    }
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        return {
            success: false,
            message: 'Erreur de connexion au serveur'
        };
    }
}
// Formate un prix en FCFA
function formatPrice(price) {
    return parseInt(price).toLocaleString('fr-FR') + ' FCFA';
// Formate un numéro de téléphone Niger (+227...)
function formatPhoneNiger(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+227')) {
        cleaned = '+227' + cleaned.replace(/^\+/, '');
    }
    return cleaned;
}

// Export Node.js (pour tests éventuels)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl, getAuthToken, apiRequest, formatPrice, formatPhoneNiger };
}
// config.js - Configuration des chemins pour MH Couture

// Configuration de base
const CONFIG = {
    // URL de base de votre site
    BASE_URL: window.location.origin + '/',
    
    // Chemins des fichiers PHP API (NOUVELLE STRUCTURE)
    API: {
        AUTH: 'php/auth/auth.php',
        PRODUCTS: 'php/api/products.php',
        CART: 'php/api/cart.php',
        CONTACT: 'php/api/contact.php',
        CUSTOM_ORDERS: 'php/api/custom-orders.php'
    },
    
    // Chemins des pages
    PAGES: {
        HOME: 'index.php',
        LOGIN: 'login.php',
        SIGNUP: 'signup.php',
        COLLECTIONS: 'collections.php',
        CUSTOM_DESIGNS: 'custom-designs.php',
        PRICING: 'pricing.php',
        GALLERY: 'gallery.php',
        CONTACT: 'contact.php',
        ADMIN: 'admin.php'
    },
    
    // Dossier des uploads
    UPLOADS: 'uploads/',
    PRODUCT_IMAGES: 'uploads/products/',
    
    // Configuration locale (Niger)
    LOCALE: 'fr-NE',
    CURRENCY: 'FCFA',
    PHONE_PREFIX: '+227',
    TIMEZONE: 'Africa/Niamey'
};

// Fonction helper pour construire l'URL complÃ¨te de l'API
function getApiUrl(endpoint) {
    return CONFIG.BASE_URL + endpoint;
}

// Fonction pour rÃ©cupÃ©rer le token utilisateur
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Fonction pour faire des requÃªtes API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = getApiUrl(endpoint);
    const token = getAuthToken();
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // Ajouter le token si disponible
    if (token && data) {
        data.token = token;
    }
    
    // Ajouter le body pour POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        return {
            success: false,
            message: 'Erreur de connexion au serveur'
        };
    }
}

// Fonction pour formater les prix en FCFA
function formatPrice(price) {
    return parseInt(price).toLocaleString('fr-FR') + ' FCFA';
}

// Fonction pour formater les numÃ©ros de tÃ©lÃ©phone Niger
function formatPhoneNiger(phone) {
    // Enlever tous les caractÃ¨res non numÃ©riques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si commence pas par +227, l'ajouter
    if (!cleaned.startsWith('+227')) {
        cleaned = '+227' + cleaned.replace(/^\+/, '');
    }
    
    return cleaned;
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl, getAuthToken, apiRequest, formatPrice, formatPhoneNiger };
}
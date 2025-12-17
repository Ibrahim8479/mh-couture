// login.js - Updated with Admin Redirect - CORRIGÉ
// Fichier: js/login.js

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const token = getCookie('auth_token');
    if (token) {
        window.location.href = 'collections.php';
        return;
    }

    setupLoginForm();
    setupSocialLogin();
});

// Fonction pour lire les cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Fonction pour créer un cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
}

// Configuration du formulaire de connexion
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // RÉinitialiser les messages d'erreur
        clearErrors();
        
        // RÉcupérer les valeurs
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;
        
        // Validation basique
        if (!email || !password) {
            showError('email', 'Veuillez remplir tous les champs');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('email', 'Email invalide');
            return;
        }
        
        // DÉsactiver le bouton pendant la soumission
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion en cours...';
        
        try {
            const response = await fetch('php/auth/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important pour les cookies
                body: JSON.stringify({
                    action: 'login',
                    email: email,
                    password: password,
                    remember: remember
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Sauvegarder le token
                const cookieDays = remember ? 30 : 1;
                setCookie('auth_token', data.token, cookieDays);
                
                // Aussi sauvegarder dans localStorage pour compatibilité
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('isAdmin', data.isAdmin ? '1' : '0');
                
                // Afficher un message de succès
                showSuccessMessage('✅ Connexion réussie! Redirection...');
                
                // ✅ REDIRECTION CORRIGÉE - Utiliser l'URL fournie par le serveur
                setTimeout(() => {
                    const redirectUrl = data.redirectUrl || 'collections.php';
                    console.log('🔄 Redirection vers:', redirectUrl);
                    window.location.href = redirectUrl;
                }, 1500);
                
            } else {
                // Afficher l'erreur
                if (data.field) {
                    showError(data.field, data.message);
                } else {
                    showError('email', data.message);
                }
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            showError('email', 'Erreur de connexion au serveur');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Configuration de la connexion sociale
function setupSocialLogin() {
    // Bouton Google
    document.querySelector('.btn-google')?.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('ℹ️ La connexion avec Google sera bientôt disponible');
    });
    
    // Bouton Facebook
    document.querySelector('.btn-facebook')?.addEventListener('click', function(e) {
        e.preventDefault();
        showNotification('ℹ️ La connexion avec Facebook sera bientôt disponible');
    });
}

// Validation de l'email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Afficher une erreur
function showError(field, message) {
    const errorElement = document.getElementById(field + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    const inputElement = document.getElementById(field);
    if (inputElement) {
        inputElement.style.borderColor = '#e74c3c';
    }
}

// Effacer les erreurs
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    document.querySelectorAll('input[type="email"], input[type="password"]').forEach(input => {
        input.style.borderColor = '#e0e0e0';
    });
}

// Afficher un message de succès
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    successDiv.innerHTML = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// Afficher une notification simple
function showNotification(message) {
    const notifDiv = document.createElement('div');
    notifDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notifDiv.textContent = message;
    
    document.body.appendChild(notifDiv);
    
    setTimeout(() => {
        notifDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notifDiv.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ login.js chargé avec succès');
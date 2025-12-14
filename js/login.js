// login.js - CORRIGÉ - Gestion de la connexion avec support des cookies
// Fichier: js/login.js

document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const token = getCookie('auth_token');
    if (token) {
        window.location.href = 'collections.php';
        return;
    }

    setupLoginForm();
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
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Configuration du formulaire de connexion
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Réinitialiser les messages d'erreur
        clearErrors();
        
        // Récupérer les valeurs
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
        
        // Désactiver le bouton pendant la soumission
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
                body: JSON.stringify({
                    action: 'login',
                    email: email,
                    password: password,
                    remember: remember
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Sauvegarder le token dans un cookie
                const cookieDays = remember ? 30 : 1; // 30 jours si "remember", sinon 1 jour
                setCookie('auth_token', data.token, cookieDays);
                
                // Aussi sauvegarder dans localStorage pour compatibilité
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                
                // Afficher un message de succès
                showSuccessMessage('Connexion réussie! Redirection...');
                
                // Rediriger vers collections après connexion
                setTimeout(() => {
                    window.location.href = 'collections.php';
                }, 1000);
                
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
    
    document.querySelectorAll('input').forEach(input => {
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
    successDiv.innerHTML = `✅ ${message}`;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
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
// ===============================
// CUSTOM-DESIGNS.JS - VERSION CORRIGÉE
// Gestion des commandes sur mesure avec token
// Fichier: js/custom-designs.js
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Page Créations sur Mesure chargée');
    
    const form = document.getElementById('customOrderForm');
    
    if (form) {
        form.addEventListener('submit', handleCustomOrderSubmit);
    }
    
    // Mettre à jour le compteur du panier
    updateCartCount();
});

// ✅ FONCTION CORRIGÉE - Envoie le token
async function handleCustomOrderSubmit(e) {
    e.preventDefault();
    
    // ✅ RÉCUPÉRER LE TOKEN CORRECTEMENT
    const token = window.authToken || 
                 localStorage.getItem('authToken') || 
                 sessionStorage.getItem('authToken') ||
                 getCookie('auth_token');
    
    if (!token) {
        showError('❌ Vous devez être connecté pour passer une commande');
        setTimeout(() => {
            window.location.href = 'login.php';
        }, 2000);
        return;
    }
    
    // Récupérer les valeurs du formulaire
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const garmentType = document.getElementById('garmentType').value;
    const category = document.getElementById('category').value;
    const occasion = document.getElementById('occasion').value.trim();
    const budget = document.getElementById('budget').value;
    const description = document.getElementById('description').value.trim();
    const deadline = document.getElementById('deadline').value;
    
    // Radio buttons pour les mesures
    const hasMeasurementsRadio = document.querySelector('input[name="hasMeasurements"]:checked');
    const hasMeasurements = hasMeasurementsRadio ? hasMeasurementsRadio.value : 'no';
    
    // Validation
    if (!fullName || !email || !phone || !garmentType || !category || !description) {
        showError('⚠️ Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('⚠️ Email invalide');
        return;
    }
    
    // Préparer les données
    const orderData = {
        action: 'createCustomOrder',
        token: token, // ✅ AJOUTER LE TOKEN!
        fullName: fullName,
        email: email,
        phone: phone,
        garmentType: garmentType,
        category: category,
        occasion: occasion,
        budget: parseFloat(budget) || 0,
        description: description,
        hasMeasurements: hasMeasurements,
        deadline: deadline || null,
        images: []
    };
    
    console.log('📤 Envoi commande sur mesure:', orderData);
    
    // Désactiver le bouton
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Envoi en cours...';
    
    try {
        const response = await fetch('php/api/custom-orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(orderData)
        });
        
        console.log('📡 Réponse status:', response.status);
        
        const data = await response.json();
        console.log('✅ Réponse data:', data);
        
        if (data.success) {
            showSuccess('✅ Commande envoyée avec succès! Numéro: ' + data.order_number);
            
            // Réinitialiser le formulaire
            e.target.reset();
            
            // Rediriger après 3 secondes
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 3000);
        } else {
            showError('❌ Erreur: ' + (data.message || 'Erreur inconnue'));
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        showError('❌ Erreur de connexion: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const token = window.authToken || 
                 localStorage.getItem('authToken') || 
                 sessionStorage.getItem('authToken') ||
                 getCookie('auth_token');
    
    if (!token) return;
    
    fetch('php/api/cart.php?action=count&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    cartCount.textContent = data.count || 0;
                }
            }
        })
        .catch(error => console.error('❌ Erreur compteur panier:', error));
}

// Helper pour les cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Afficher un message de succès
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Afficher un message d'erreur
function showError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('✅ custom-designs.js chargé avec succès');
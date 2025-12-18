// ===============================
// CUSTOM-DESIGNS.JS - VERSION FINALE
// MH Couture - Créations sur Mesure
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    setupCustomOrderForm();
    updateCartCount();
});

function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (userIcon) {
        if (token) {
            userIcon.href = 'profile.php';
            userIcon.title = 'Mon profil';
        } else {
            userIcon.href = 'login.php';
            userIcon.title = 'Se connecter';
        }
    }
}

function setupCustomOrderForm() {
    const form = document.getElementById('customOrderForm');
    
    if (!form) {
        console.error('❌ Formulaire de commande personnalisée non trouvé');
        return;
    }
    
    // Gestion de l'upload d'images
    const imageInput = document.getElementById('images');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 5) {
                showNotification('❌ Maximum 5 images autorisées', 'error');
                e.target.value = '';
                return;
            }
            
            // Vérifier la taille de chaque fichier (max 5MB par image)
            for (let file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('❌ Chaque image doit faire moins de 5MB', 'error');
                    e.target.value = '';
                    return;
                }
            }
            
            console.log(`✅ ${files.length} image(s) sélectionnée(s)`);
        });
    }
    
    form.addEventListener('submit', handleCustomOrderSubmit);
}

async function handleCustomOrderSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Récupérer les données du formulaire
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        garmentType: document.getElementById('garmentType').value,
        category: document.getElementById('category').value,
        occasion: document.getElementById('occasion').value.trim(),
        budget: parseFloat(document.getElementById('budget').value) || 0,
        description: document.getElementById('description').value.trim(),
        hasMeasurements: document.querySelector('input[name="hasMeasurements"]:checked').value,
        deadline: document.getElementById('deadline').value
    };
    
    // Validation
    if (!formData.fullName || formData.fullName.length < 3) {
        showNotification('❌ Le nom complet doit contenir au moins 3 caractères', 'error');
        return;
    }
    
    if (!formData.email || !validateEmail(formData.email)) {
        showNotification('❌ Email invalide', 'error');
        return;
    }
    
    if (!formData.phone || formData.phone.length < 8) {
        showNotification('❌ Numéro de téléphone invalide', 'error');
        return;
    }
    
    if (!formData.garmentType) {
        showNotification('❌ Veuillez sélectionner un type de vêtement', 'error');
        return;
    }
    
    if (!formData.category) {
        showNotification('❌ Veuillez sélectionner une catégorie', 'error');
        return;
    }
    
    if (!formData.description || formData.description.length < 10) {
        showNotification('❌ La description doit contenir au moins 10 caractères', 'error');
        return;
    }
    
    // Désactiver le bouton
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Envoi en cours...';
    
    try {
        // Gérer les images de référence
        const imageFiles = document.getElementById('images').files;
        const images = [];
        
        if (imageFiles.length > 0) {
            showNotification('📤 Téléchargement des images...', 'info');
            
            for (let file of imageFiles) {
                try {
                    const base64 = await fileToBase64(file);
                    images.push({
                        name: file.name,
                        data: base64,
                        type: file.type
                    });
                } catch (err) {
                    console.error('Erreur conversion image:', err);
                }
            }
        }
        
        formData.images = images;
        
        // Envoyer la requête
        const response = await fetch('php/api/custom-orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createCustomOrder',
                ...formData
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(
                `✅ ${data.message || 'Votre demande a été envoyée avec succès!'}\n\n` +
                `Numéro de commande: ${data.order_number || 'N/A'}\n` +
                `Nous vous contacterons sous 24h.`,
                'success'
            );
            
            // Réinitialiser le formulaire
            form.reset();
            
            // Rediriger vers la page de profil après 3 secondes
            setTimeout(() => {
                window.location.href = 'profile.php?tab=custom-orders';
            }, 3000);
        } else {
            showNotification('❌ ' + (data.message || 'Erreur lors de l\'envoi'), 'error');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        showNotification('❌ Erreur de connexion. Veuillez réessayer.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Convertir un fichier en base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Valider l'email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Afficher une notification
function showNotification(message, type = 'success') {
    // Supprimer les notifications existantes
    const existingNotifs = document.querySelectorAll('.custom-notification');
    existingNotifs.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    
    let bgColor, icon;
    switch(type) {
        case 'success':
            bgColor = '#27ae60';
            icon = '✅';
            break;
        case 'error':
            bgColor = '#e74c3c';
            icon = '❌';
            break;
        case 'info':
            bgColor = '#3498db';
            icon = 'ℹ️';
            break;
        default:
            bgColor = '#95a5a6';
            icon = '📢';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 450px;
        animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        display: flex;
        align-items: flex-start;
        gap: 15px;
        font-size: 15px;
        line-height: 1.6;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 28px; flex-shrink: 0;">${icon}</span>
        <div style="flex: 1;">
            <div style="white-space: pre-line;">${message}</div>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            flex-shrink: 0;
            transition: all 0.2s;
            font-weight: bold;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='rotate(90deg)'" 
           onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='rotate(0)'">×</button>
    `;
    
    // Ajouter les styles d'animation
    if (!document.querySelector('style[data-notification-styles]')) {
        const style = document.createElement('style');
        style.setAttribute('data-notification-styles', 'true');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(120%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateX(120%) scale(0.8);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-fermeture après 6 secondes
    const duration = type === 'success' ? 6000 : 8000;
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        setTimeout(() => notification.remove(), 400);
    }, duration);
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (!cartCount) return;
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return;
    
    fetch('php/api/cart.php?action=getCart&token=' + encodeURIComponent(token))
        .then(r => r.json())
        .then(data => {
            if (data.success && data.cart) {
                const count = data.cart.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
                cartCount.textContent = count;
                cartCount.style.display = count > 0 ? 'flex' : 'none';
            }
        })
        .catch(err => console.error('Erreur panier:', err));
}

console.log('✅ custom-designs.js chargé avec succès');
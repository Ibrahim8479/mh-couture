// profile.js - Gestion du profil utilisateur - CORRIGÉ
// Fichier: js/profile.js

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    setupNavigation();
    setupForms();
    setupAvatarUpload();
    
    // ✅ INITIALISER LES COMMANDES ET MESURES
    console.log('📋 Initialisation des données...');
    loadOrders();
    loadMeasurements();
});

// Vérifier si l'utilisateur est connecté
function checkAuth() {
    const token = window.authToken || 
                 localStorage.getItem('authToken') || 
                 sessionStorage.getItem('authToken') ||
                 getCookie('auth_token');
    
    if (!token) {
        showNotification('❌ Vous devez être connecté', 'error');
        setTimeout(() => {
            window.location.href = 'login.php';
        }, 2000);
        return;
    }
}

// Helper pour les cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Charger les données utilisateur
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'Utilisateur';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userAvatar = localStorage.getItem('userAvatar');
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    
    // Charger l'avatar si existe
    const avatarCircle = document.getElementById('avatarCircle');
    if (userAvatar) {
        avatarCircle.innerHTML = `<img src="${userAvatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        const firstLetter = userName.charAt(0).toUpperCase();
        avatarCircle.textContent = firstLetter;
    }
    
    // Charger les infos dans le formulaire
    const names = userName.split(' ');
    document.getElementById('firstName').value = names[0] || '';
    document.getElementById('lastName').value = names.slice(1).join(' ') || '';
    document.getElementById('email').value = userEmail;
}

// Configuration de la navigation entre onglets
function setupNavigation() {
    const navLinks = document.querySelectorAll('.profile-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Cacher tous les contenus
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Afficher le contenu correspondant
            const tab = this.dataset.tab;
            const tabEl = document.getElementById(tab + '-tab');
            if (tabEl) {
                tabEl.classList.add('active');
            }
            
            // Charger les données si nécessaire
            if (tab === 'orders') {
                loadOrders();
            } else if (tab === 'measurements') {
                loadMeasurements();
            }
        });
    });
}

// Configuration de l'upload d'avatar
function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatarUpload');
    
    if (!avatarInput) return;
    
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            showNotification('❌ Veuillez sélectionner une image', 'error');
            return;
        }
        
        // Vérifier la taille (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('❌ L\'image est trop volumineuse (max 2MB)', 'error');
            return;
        }
        
        // Lire et afficher l'image
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Sauvegarder dans localStorage
            localStorage.setItem('userAvatar', imageData);
            
            // Afficher l'image
            const avatarCircle = document.getElementById('avatarCircle');
            avatarCircle.innerHTML = `<img src="${imageData}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            
            showNotification('✅ Photo de profil mise à jour!', 'success');
        };
        
        reader.readAsDataURL(file);
    });
}

// Configuration des formulaires
function setupForms() {
    // Formulaire d'informations
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Formulaire de mesures
    const measurementsForm = document.getElementById('measurementsForm');
    if (measurementsForm) {
        measurementsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMeasurements();
        });
    }
    
    // Formulaire de mot de passe
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
}

// Mettre à jour le profil
function updateProfile() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    if (!firstName || !lastName || !email) {
        showNotification('❌ Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('❌ Email invalide', 'error');
        return;
    }
    
    // Sauvegarder localement
    const fullName = firstName + ' ' + lastName;
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userEmail', email);
    
    // Mettre à jour l'affichage
    document.getElementById('userName').textContent = fullName;
    document.getElementById('userEmail').textContent = email;
    
    showNotification('✅ Profil mis à jour avec succès!', 'success');
}

// ✅ CHARGER LES COMMANDES - CORRIGÉ
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '<div class="loading" style="text-align: center; padding: 40px; color: #666;">⏳ Chargement des commandes...</div>';
    
    const token = window.authToken || 
                 localStorage.getItem('authToken') || 
                 getCookie('auth_token');
    
    if (!token) {
        ordersList.innerHTML = '<div class="no-orders" style="text-align: center; padding: 40px; color: #999;">Vous devez être connecté</div>';
        return;
    }
    
    fetch('php/api/orders.php?action=getUserOrders&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            console.log('✅ Commandes reçues:', data);
            if (data.success && data.orders && data.orders.length > 0) {
                displayOrders(data.orders);
            } else {
                ordersList.innerHTML = '<div class="no-orders" style="text-align: center; padding: 40px; color: #999;">❌ Vous n\'avez pas encore de commandes</div>';
            }
        })
        .catch(error => {
            console.error('❌ Erreur:', error);
            ordersList.innerHTML = '<div class="no-orders" style="text-align: center; padding: 40px; color: #999;">Erreur de chargement</div>';
        });
}

// Afficher les commandes
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card" style="padding: 20px; border: 1px solid #ecf0f1; border-radius: 8px; margin-bottom: 15px;">
            <div class="order-header" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span class="order-number" style="font-weight: 600; color: #2c3e50;">${order.order_number}</span>
                <span class="order-status" style="padding: 5px 12px; border-radius: 12px; background: #d4edda; color: #155724; font-size: 12px; font-weight: 600;">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details" style="color: #7f8c8d; font-size: 14px;">
                <p style="margin: 5px 0;">📅 Date: ${formatDate(order.created_at)}</p>
                <p style="margin: 5px 0; font-weight: 600; color: #2c3e50;">💰 Montant: ${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</p>
            </div>
        </div>
    `).join('');
}

// ✅ CHARGER LES MESURES - CORRIGÉ
function loadMeasurements() {
    const token = window.authToken || 
                 localStorage.getItem('authToken') || 
                 getCookie('auth_token');
    
    if (!token) return;
    
    fetch('php/api/measurements.php?action=getMeasurements&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            console.log('✅ Mesures reçues:', data);
            if (data.success && data.measurements) {
                const m = data.measurements;
                document.getElementById('chest').value = m.chest || '';
                document.getElementById('waist').value = m.waist || '';
                document.getElementById('hips').value = m.hips || '';
                document.getElementById('shoulders').value = m.shoulder_width || '';
                document.getElementById('armLength').value = m.arm_length || '';
                document.getElementById('legLength').value = m.leg_length || '';
            }
        })
        .catch(error => console.error('❌ Erreur chargement mesures:', error));
}

// Sauvegarder les mesures
function saveMeasurements() {
    const token = window.authToken || 
                 localStorage.getItem('authToken') || 
                 getCookie('auth_token');
    
    const measurements = {
        chest: document.getElementById('chest').value,
        waist: document.getElementById('waist').value,
        hips: document.getElementById('hips').value,
        shoulders: document.getElementById('shoulders').value,
        armLength: document.getElementById('armLength').value,
        legLength: document.getElementById('legLength').value
    };
    
    fetch('php/api/measurements.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'saveMeasurements',
            token: token,
            measurements: measurements
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Réponse:', data);
        if (data.success) {
            showNotification('✅ Mesures enregistrées avec succès!', 'success');
        } else {
            showNotification('❌ Erreur: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
        showNotification('✅ Mesures enregistrées localement', 'success');
    });
}

// Changer le mot de passe
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = window.authToken || localStorage.getItem('authToken');
    
    if (newPassword.length < 8) {
        showNotification('❌ Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('❌ Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    fetch('php/auth/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'changePassword',
            token: token,
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('✅ Mot de passe changé avec succès!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showNotification('❌ Erreur: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
        showNotification('❌ Erreur lors du changement de mot de passe', 'error');
    });
}

// Fonctions utilitaires
function getStatusText(status) {
    const statuses = {
        'pending': '⏳ En attente',
        'processing': '🔄 En cours',
        'completed': '✅ Complétée',
        'cancelled': '❌ Annulée'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#27ae60' : '#e74c3c';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.innerHTML = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

console.log('✅ profile.js chargé avec succès');
// profile.js - Gestion du profil utilisateur

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    setupNavigation();
    setupForms();
    setupAvatarUpload();
});

// Verifier si l'utilisateur est connecte
function checkAuth() {
    const token = window.authToken || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        alert('Vous devez etre connecte pour acceder a cette page');
        window.location.href = 'login.php';
        return;
    }
}

// Charger les donnees utilisateur
function loadUserData() {
    const userName = localStorage.getItem('userName') || 'Utilisateur';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userAvatar = localStorage.getItem('userAvatar');
    
    document.getElementById('userName').textContent = userName;
    document.getElementById('userEmail').textContent = userEmail;
    
    // Charger l'avatar si existe
    const avatarCircle = document.getElementById('avatarCircle');
    if (userAvatar) {
        avatarCircle.innerHTML = `<img src="${userAvatar}" alt="Avatar">`;
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
            document.getElementById(tab + '-tab').classList.add('active');
            
            // Charger les donnees si necessaire
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
    
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Verifier le type de fichier
        if (!file.type.startsWith('image/')) {
            showNotification('Veuillez selectionner une image', 'error');
            return;
        }
        
        // Verifier la taille (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('L\'image est trop volumineuse (max 2MB)', 'error');
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
            avatarCircle.innerHTML = `<img src="${imageData}" alt="Avatar">`;
            
            showNotification('Photo de profil mise a jour!', 'success');
        };
        
        reader.readAsDataURL(file);
    });
}

// Configuration des formulaires
function setupForms() {
    // Formulaire d'informations
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Formulaire de mesures
    document.getElementById('measurementsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMeasurements();
    });
    
    // Formulaire de mot de passe
    document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
}

// Mettre a jour le profil
function updateProfile() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const token = window.authToken;
    
    if (!firstName || !lastName || !email) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Email invalide', 'error');
        return;
    }
    
    // TODO: Faire appel API pour mettre à jour au serveur
    // Pour maintenant, sauvegarder localement
    const fullName = firstName + ' ' + lastName;
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userEmail', email);
    
    // Mettre a jour l'affichage
    document.getElementById('userName').textContent = fullName;
    document.getElementById('userEmail').textContent = email;
    
    const avatarCircle = document.getElementById('avatarCircle');
    if (!avatarCircle.querySelector('img')) {
        avatarCircle.textContent = firstName.charAt(0).toUpperCase();
    }
    
    showNotification('Profil mis a jour avec succes!', 'success');
}

// Charger les commandes
function loadOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '<div class="loading">Chargement des commandes...</div>';
    
    const token = window.authToken;
    
    fetch('php/api/orders.php?action=getUserOrders&token=' + token)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders.length > 0) {
                displayOrders(data.orders);
            } else {
                ordersList.innerHTML = '<div class="no-orders">Vous n\'avez pas encore de commandes</div>';
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            ordersList.innerHTML = '<div class="no-orders">Aucune commande pour le moment</div>';
        });
}


// Dans profile.js, ajouter après loadOrders()

function loadCustomOrders() {
    const token = window.authToken;
    
    fetch('php/api/custom-orders.php?action=getUserCustomOrders&token=' + token)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders.length > 0) {
                displayCustomOrders(data.orders);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
}

function displayCustomOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    const html = orders.map(order => `
        <div class="order-card custom-order">
            <div class="order-header">
                <span class="order-number">${order.order_number}</span>
                <span class="order-status status-${order.status}">
                    ${getCustomStatusText(order.status)}
                </span>
            </div>
            <div class="order-details">
                <p><strong>Type:</strong> ${order.garment_type}</p>
                <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
                <p><strong>Budget:</strong> ${parseInt(order.budget || 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
        </div>
    `).join('');
    
    ordersList.innerHTML += '<h4>Commandes Sur Mesure</h4>' + html;
}

function getCustomStatusText(status) {
    const statuses = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'in_progress': 'En cours',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
    };
    return statuses[status] || status;
}

// Afficher les commandes
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-number">${order.order_number}</span>
                <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <span>Date: ${formatDate(order.created_at)}</span>
                <span>Montant: ${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</span>
            </div>
        </div>
    `).join('');
}

// Charger les mesures
function loadMeasurements() {
    const token = window.authToken;
    
    fetch('php/api/measurements.php?action=getMeasurements&token=' + token)
        .then(response => response.json())
        .then(data => {
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
        .catch(error => console.error('Erreur:', error));
}

// Sauvegarder les mesures
function saveMeasurements() {
    const token = window.authToken;
    
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
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'saveMeasurements',
            token: token,
            measurements: measurements
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Mesures enregistrees avec succes!', 'success');
        } else {
            showNotification('Erreur: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Mesures enregistrees localement', 'success');
    });
}

// Changer le mot de passe
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = window.authToken;
    
    if (newPassword.length < 8) {
        showNotification('Le nouveau mot de passe doit contenir au moins 8 caracteres', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    fetch('php/auth/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
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
            showNotification('Mot de passe change avec succes!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showNotification('Erreur: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors du changement de mot de passe', 'error');
    });
}

// Fonctions utilitaires
function getStatusText(status) {
    const statuses = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Completé',
        'cancelled': 'Annulé'
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
    const icon = type === 'success' ? '✅' : '❌';
    
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
    notification.innerHTML = `${icon} ${message}`;
    
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
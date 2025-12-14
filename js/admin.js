// admin.js - Implémentation complète du dashboard admin - CORRIGÉE
// Fichier: js/admin.js

let currentSection = 'dashboard';
let allProducts = [];
let allOrders = [];
let allUsers = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
});

// INITIALISATION
function initializeAdmin() {
    checkAdminAuth();
    setupNavigation();
    loadDashboardData();
    setupProductModal();
    setupProductForm();
    setupEventListeners();
}

// VERIFIER L'AUTHENTIFICATION ADMIN
function checkAdminAuth() {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = 'login.php';
        return;
    }
}

// OBTENIR LE TOKEN
function getAuthToken() {
    const cookieToken = getCookie('auth_token');
    if (cookieToken) return cookieToken;
    return localStorage.getItem('authToken');
}

// LIRE LES COOKIES
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// CONFIGURATION DE LA NAVIGATION
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

// AFFICHER UNE SECTION
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    const titles = {
        'dashboard': 'Tableau de bord',
        'products': 'Gestion des Produits',
        'orders': 'Gestion des Commandes',
        'users': 'Gestion des Utilisateurs',
        'settings': 'Paramètres'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || section;
    currentSection = section;
    
    // Charger les données selon la section
    if (section === 'products') {
        loadProducts();
    } else if (section === 'orders') {
        loadOrders();
    } else if (section === 'users') {
        loadUsers();
    }
}

// CHARGER LES DONNEES DU TABLEAU DE BORD
function loadDashboardData() {
    const token = getAuthToken();
    
    fetch('php/api/admin.php?action=getDashboardStats&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.stats.products || 0;
                document.getElementById('totalOrders').textContent = data.stats.orders || 0;
                document.getElementById('totalUsers').textContent = data.stats.users || 0;
                document.getElementById('totalRevenue').textContent = (data.stats.revenue || '0') + ' FCFA';
                
                loadRecentOrders();
            } else {
                console.log('Pas de données tableau de bord');
            }
        })
        .catch(error => {
            console.error('Erreur tableau de bord:', error);
            // Afficher au moins 0 partout
            document.getElementById('totalProducts').textContent = '0';
            document.getElementById('totalOrders').textContent = '0';
            document.getElementById('totalUsers').textContent = '0';
            document.getElementById('totalRevenue').textContent = '0 FCFA';
        });
}

// CHARGER LES COMMANDES RECENTES
function loadRecentOrders() {
    const token = getAuthToken();
    
    fetch('php/api/admin.php?action=getRecentOrders&limit=5&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders && data.orders.length > 0) {
                const tbody = document.querySelector('#recentOrdersTable tbody');
                tbody.innerHTML = data.orders.map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.customer_name || 'Client'}</td>
                        <td>${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</td>
                        <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                        <td>${formatDate(order.created_at)}</td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => console.error('Erreur commandes récentes:', error));
}

// CHARGER LES PRODUITS
function loadProducts() {
    console.log('Chargement des produits...');
    
    fetch('php/api/products.php?action=getAll')
        .then(response => {
            if (!response.ok) throw new Error('Erreur réseau');
            return response.json();
        })
        .then(data => {
            console.log('Données reçues:', data);
            if (data.success) {
                allProducts = data.products || [];
                displayProducts(allProducts);
            } else {
                console.error('Erreur API:', data.message);
                showError('Erreur: ' + (data.message || 'Impossible de charger les produits'));
            }
        })
        .catch(error => {
            console.error('Erreur détaillée:', error);
            showError('Erreur de connexion au serveur');
        });
}

// AFFICHER LES PRODUITS DANS LE TABLEAU
function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    
    if (!tbody) {
        console.error('Tableau des produits non trouvé');
        return;
    }
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image_url || 'https://via.placeholder.com/50'}" 
                     alt="${product.name}" 
                     class="product-img"
                     onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${parseInt(product.price).toLocaleString('fr-FR')} FCFA</td>
            <td>${product.stock}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Modifier</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// CHARGER LES COMMANDES
function loadOrders() {
    const token = getAuthToken();
    
    fetch('php/api/admin.php?action=getAllOrders&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allOrders = data.orders || [];
                displayOrders(allOrders);
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// AFFICHER LES COMMANDES
function displayOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number}</td>
            <td>${order.customer_name || 'Client'}</td>
            <td>${order.items_count || 0}</td>
            <td>${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewOrder(${order.id})">Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// CHARGER LES UTILISATEURS
function loadUsers() {
    const token = getAuthToken();
    
    fetch('php/api/admin.php?action=getAllUsers&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allUsers = data.users || [];
                displayUsers(allUsers);
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// AFFICHER LES UTILISATEURS
function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucun utilisateur</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <span class="status-badge ${user.is_admin ? 'status-completed' : 'status-pending'}">
                    ${user.is_admin ? 'Admin' : 'Utilisateur'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="toggleUserAdmin(${user.id}, ${!user.is_admin})">
                        ${user.is_admin ? 'Retirer' : 'Faire'} Admin
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// CONFIGURATION DU MODAL PRODUIT
function setupProductModal() {
    const modal = document.getElementById('productModal');
    if (!modal) {
        console.error('Modal non trouvé');
        return;
    }
    
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeProductModal();
        }
    });
}

// OUVRIR LE MODAL PRODUIT
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    const form = document.getElementById('productForm');
    if (form) form.reset();
    
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    
    if (productId) {
        editingProductId = productId;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Modifier le produit';
        
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category.toLowerCase();
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
            
            if (product.image_url && preview) {
                preview.innerHTML = `<img src="${product.image_url}" alt="${product.name}">`;
            }
        }
    } else {
        editingProductId = null;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Ajouter un produit';
    }
    
    modal.classList.add('active');
}

// FERMER LE MODAL
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
    }
    editingProductId = null;
}

// CONFIGURATION DU FORMULAIRE PRODUIT
function setupProductForm() {
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
}

// GESTION DES EVENEMENTS
function setupEventListeners() {
    // Éventuels autres écouteurs d'événements
}

// SOUMETTRE LE FORMULAIRE PRODUIT
function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', editingProductId ? 'update' : 'create');
    formData.append('token', getAuthToken());
    
    if (editingProductId) {
        formData.append('id', editingProductId);
    }
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('is_custom', document.getElementById('isCustom').checked ? 1 : 0);
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    fetch('php/api/products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(editingProductId ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
            closeProductModal();
            loadProducts();
        } else {
            showError('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showError('Une erreur est survenue');
    });
}

// MODIFIER UN PRODUIT
function editProduct(id) {
    openProductModal(id);
}

// SUPPRIMER UN PRODUIT
function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        return;
    }
    
    fetch('php/api/products.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'delete',
            id: id,
            token: getAuthToken()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess('Produit supprimé avec succès!');
            loadProducts();
        } else {
            showError('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showError('Une erreur est survenue');
    });
}

// VOIR LES DETAILS D'UNE COMMANDE
function viewOrder(orderId) {
    alert('Détails de la commande ' + orderId + ' (à implémenter)');
}

// BASCULER LE STATUT ADMIN D'UN UTILISATEUR
function toggleUserAdmin(userId, makeAdmin) {
    if (!confirm(`Êtes-vous sûr de ${makeAdmin ? 'rendre cet utilisateur admin' : 'retirer les droits admin'}?`)) {
        return;
    }
    
    alert('Fonctionnalité en cours de développement');
}

// UTILITAIRES
function getCategoryName(category) {
    const categories = {
        'homme': 'Homme',
        'femme': 'Femme',
        'enfant': 'Enfant'
    };
    return categories[category.toLowerCase()] || category;
}

function getStatusText(status) {
    const statuses = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Complété',
        'cancelled': 'Annulé'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// NOTIFICATIONS
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
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
    notification.innerHTML = `✅ ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.innerHTML = `❌ ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// AJOUTER LES ANIMATIONS CSS
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
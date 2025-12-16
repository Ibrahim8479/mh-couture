
/**
 * Script Administration - MH Couture
 * Fichier: js/admin.js
 */

// Variables globales
const API_BASE = 'php/api/';
let currentSection = 'dashboard';
let allProducts = [];
let allOrders = [];
let allUsers = [];
let allCustomOrders = [];

// ========================================
// INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin JS chargé');
    
    // Vérifier le token
    if (!window.authToken) {
        window.location.href = 'login.php';
        return;
    }
    
    // Navigation
    initNavigation();
    
    // Charger le dashboard
    loadDashboard();
    
    // Event listeners pour les modals
    initModalEvents();
    
    // Event listeners pour les filtres
    initFilterEvents();
});

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Ajouter active au lien cliqué
            this.classList.add('active');
            
            // Obtenir la section
            const section = this.dataset.section;
            currentSection = section;
            
            // Cacher toutes les sections
            document.querySelectorAll('.content-section').forEach(s => {
                s.classList.remove('active');
            });
            
            // Afficher la section demandée
            const targetSection = document.getElementById(`${section}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Charger les données de la section
            loadSectionData(section);
            
            // Mettre à jour le titre
            updatePageTitle(section);
        });
    });
}

function updatePageTitle(section) {
    const titles = {
        'dashboard': 'Tableau de bord',
        'products': 'Gestion des Produits',
        'orders': 'Gestion des Commandes',
        'users': 'Gestion des Utilisateurs',
        'custom-orders': 'Commandes sur mesure',
        'messages': 'Messages de contact',
        'settings': 'Paramètres'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Administration';
}

function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'custom-orders':
            loadCustomOrders();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// ========================================
// DASHBOARD
// ========================================
async function loadDashboard() {
    try {
        // Charger les statistiques
        const response = await fetch(`${API_BASE}admin.php?action=getDashboardStats&token=${window.authToken}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalProducts').textContent = data.stats.products;
            document.getElementById('totalOrders').textContent = data.stats.orders;
            document.getElementById('totalUsers').textContent = data.stats.users;
            document.getElementById('totalRevenue').textContent = data.stats.revenue + ' FCFA';
        }
        
        // Charger les commandes récentes
        loadRecentOrders();
        
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        showNotification('Erreur de chargement', 'error');
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_BASE}admin.php?action=getRecentOrders&token=${window.authToken}&limit=10`);
        const data = await response.json();
        
        const tbody = document.querySelector('#recentOrdersTable tbody');
        
        if (data.success && data.orders.length > 0) {
            tbody.innerHTML = data.orders.map(order => `
                <tr>
                    <td>#${order.order_number || order.id}</td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>${formatPrice(order.total_amount)}</td>
                    <td><span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></td>
                    <td>${formatDate(order.created_at)}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-view" onclick="viewOrder(${order.id})">Voir</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucune commande</td></tr>';
        }
        
    } catch (error) {
        console.error('Erreur chargement commandes récentes:', error);
    }
}

// ========================================
// PRODUITS
// ========================================
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}products.php?action=getAll&token=${window.authToken}`);
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            displayProducts(allProducts);
        }
        
    } catch (error) {
        console.error('Erreur chargement produits:', error);
        showNotification('Erreur de chargement des produits', 'error');
    }
}

function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image_url || 'images/placeholder.jpg'}" 
                     alt="${product.name}" 
                     class="product-img"
                     onerror="this.src='images/placeholder.jpg'">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${formatPrice(product.price)}</td>
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

// ========================================
// COMMANDES
// ========================================
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}admin.php?action=getAllOrders&token=${window.authToken}`);
        const data = await response.json();
        
        if (data.success) {
            allOrders = data.orders;
            displayOrders(allOrders);
        }
        
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        showNotification('Erreur de chargement des commandes', 'error');
    }
}

function displayOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucune commande trouvée</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.order_number || order.id}</td>
            <td>${order.customer_name || 'N/A'}</td>
            <td>${order.items_count || 0} article(s)</td>
            <td>${formatPrice(order.total_amount)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewOrder(${order.id})">Détails</button>
                    <button class="btn-edit" onclick="changeOrderStatus(${order.id})">Statut</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ========================================
// UTILISATEURS
// ========================================
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}admin.php?action=getAllUsers&token=${window.authToken}`);
        const data = await response.json();
        
        if (data.success) {
            allUsers = data.users;
            displayUsers(allUsers);
        }
        
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        showNotification('Erreur de chargement des utilisateurs', 'error');
    }
}

function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucun utilisateur trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>${user.is_admin == 1 ? '✓' : '-'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewUser(${user.id})">Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ========================================
// COMMANDES SUR MESURE
// ========================================
async function loadCustomOrders() {
    try {
        const response = await fetch(`${API_BASE}custom-orders.php?action=getAllCustomOrders&token=${window.authToken}`);
        const data = await response.json();
        
        if (data.success) {
            allCustomOrders = data.orders;
            displayCustomOrders(allCustomOrders);
        }
        
    } catch (error) {
        console.error('Erreur chargement commandes sur mesure:', error);
        showNotification('Erreur de chargement', 'error');
    }
}

function displayCustomOrders(orders) {
    const tbody = document.querySelector('#customOrdersTable tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Aucune commande sur mesure</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.order_number}</td>
            <td>${order.full_name}</td>
            <td>${order.garment_type}</td>
            <td>${order.category}</td>
            <td>${formatPrice(order.budget)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewCustomOrder(${order.id})">Détails</button>
                    <button class="btn-edit" onclick="changeCustomOrderStatus(${order.id})">Statut</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ========================================
// MESSAGES
// ========================================
async function loadMessages() {
    const tbody = document.querySelector('#messagesTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Fonctionnalité en développement</td></tr>';
}

// ========================================
// MODAL PRODUIT
// ========================================
function initModalEvents() {
    // Preview image
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('imagePreview').innerHTML = 
                        `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Submit formulaire produit
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (productId) {
        // Mode édition
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            document.getElementById('modalTitle').textContent = 'Modifier le produit';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
            
            if (product.image_url) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${product.image_url}" alt="Preview">`;
            }
        }
    } else {
        // Mode création
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('token', window.authToken);
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
    
    try {
        const response = await fetch(`${API_BASE}products.php`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Produit enregistré avec succès', 'success');
            closeProductModal();
            loadProducts();
        } else {
            showNotification(data.message || 'Erreur', 'error');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}products.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete',
                token: window.authToken,
                id: productId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Produit supprimé', 'success');
            loadProducts();
        } else {
            showNotification(data.message || 'Erreur', 'error');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

function editProduct(productId) {
    openProductModal(productId);
}

// ========================================
// FILTRES
// ========================================
function initFilterEvents() {
    // Filtre produits
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (productSearch) {
        productSearch.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    displayProducts(filtered);
}

// ========================================
// UTILITAIRES
// ========================================
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Terminée',
        'cancelled': 'Annulée',
        'confirmed': 'Confirmée'
    };
    return labels[status] || status;
}

function showNotification(message, type = 'info') {
    alert(message);
}

function viewOrder(orderId) {
    alert('Détails de la commande #' + orderId);
}

function changeOrderStatus(orderId) {
    const newStatus = prompt('Nouveau statut (pending/processing/completed/cancelled):');
    if (newStatus) {
        updateOrderStatus(orderId, newStatus);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}admin.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'updateOrderStatus',
                token: window.authToken,
                order_id: orderId,
                status: status
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Statut mis à jour', 'success');
            loadOrders();
        } else {
            showNotification(data.message || 'Erreur', 'error');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur', 'error');
    }
}

function viewUser(userId) {
    alert('Détails de l\'utilisateur #' + userId);
}

function viewCustomOrder(orderId) {
    alert('Détails de la commande sur mesure #' + orderId);
}

function changeCustomOrderStatus(orderId) {
    const newStatus = prompt('Nouveau statut (pending/processing/completed/cancelled):');
    if (newStatus) {
        updateCustomOrderStatus(orderId, newStatus);
    }
}

async function updateCustomOrderStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE}custom-orders.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'updateOrderStatus',
                token: window.authToken,
                order_id: orderId,
                status: status
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Statut mis à jour', 'success');
            loadCustomOrders();
        } else {
            showNotification(data.message || 'Erreur', 'error');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur', 'error');
    }
}





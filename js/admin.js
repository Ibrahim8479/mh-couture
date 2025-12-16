/**
 * Script Administration - MH Couture
 * Fichier: js/admin.js
 * VERSION COMPLÈTE
 */

// Variables globales
let allProducts = [];
let allOrders = [];
let allUsers = [];
let allCustomOrders = [];
let allMessages = [];

// ==============================================
// INITIALISATION
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initialized');
    console.log('Auth token:', window.authToken);
    
    // Configurer la navigation
    setupNavigation();
    
    // Charger les données du dashboard
    loadDashboardStats();
    loadRecentOrders();
    
    // Configurer les événements
    setupEventListeners();
    
    // Charger les produits par défaut
    loadAllProducts();
});

// ==============================================
// NAVIGATION
// ==============================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Ajouter active au lien cliqué
            this.classList.add('active');
            
            // Cacher toutes les sections
            sections.forEach(s => s.classList.remove('active'));
            
            // Afficher la section correspondante
            const sectionId = this.dataset.section + '-section';
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
                
                // Mettre à jour le titre
                const titles = {
                    'dashboard': 'Tableau de bord',
                    'products': 'Gestion des Produits',
                    'orders': 'Gestion des Commandes',
                    'users': 'Gestion des Utilisateurs',
                    'custom-orders': 'Commandes sur mesure',
                    'messages': 'Messages de contact',
                    'settings': 'Paramètres'
                };
                document.getElementById('pageTitle').textContent = titles[this.dataset.section];
                
                // Charger les données de la section
                loadSectionData(this.dataset.section);
            }
        });
    });
}

function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentOrders();
            break;
        case 'products':
            loadAllProducts();
            break;
        case 'orders':
            loadAllOrders();
            break;
        case 'users':
            loadAllUsers();
            break;
        case 'custom-orders':
            loadCustomOrders();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// ==============================================
// DASHBOARD STATS
// ==============================================
function loadDashboardStats() {
    fetch(`php/api/admin.php?action=getDashboardStats&token=${window.authToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.stats.products;
                document.getElementById('totalOrders').textContent = data.stats.orders;
                document.getElementById('totalUsers').textContent = data.stats.users;
                document.getElementById('totalRevenue').textContent = data.stats.revenue + ' FCFA';
            }
        })
        .catch(error => {
            console.error('Erreur stats:', error);
        });
}

function loadRecentOrders() {
    fetch(`php/api/admin.php?action=getRecentOrders&token=${window.authToken}&limit=5`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRecentOrders(data.orders);
            }
        })
        .catch(error => {
            console.error('Erreur commandes récentes:', error);
        });
}

function displayRecentOrders(orders) {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number}</td>
            <td>${order.customer_name || 'N/A'}</td>
            <td>${formatPrice(order.total_amount)}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewOrderDetails(${order.id})">Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==============================================
// PRODUITS
// ==============================================
function loadAllProducts() {
    console.log('Loading products...');
    
    fetch(`php/api/products.php?action=getAll`)
        .then(response => response.json())
        .then(data => {
            console.log('Products response:', data);
            if (data.success) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                console.error('Error loading products:', data.message);
                showNotification('Erreur lors du chargement des produits', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur produits:', error);
            showNotification('Erreur de connexion', 'error');
        });
}

function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name}" class="product-img">` : 
                    '<div class="product-img" style="background:#ddd;"></div>'}
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

// ==============================================
// COMMANDES
// ==============================================
function loadAllOrders() {
    fetch(`php/api/admin.php?action=getAllOrders&token=${window.authToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allOrders = data.orders;
                displayOrders(allOrders);
            }
        })
        .catch(error => {
            console.error('Erreur commandes:', error);
        });
}

function displayOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number}</td>
            <td>${order.customer_name || 'N/A'}</td>
            <td>${order.items_count || 0}</td>
            <td>${formatPrice(order.total_amount)}</td>
            <td>
                <select class="status-select" onchange="updateOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En cours</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminée</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
                </select>
            </td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewOrderDetails(${order.id})">Détails</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    fetch('php/api/admin.php?action=updateOrderStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: window.authToken,
            order_id: orderId,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Statut mis à jour', 'success');
        } else {
            showNotification('Erreur lors de la mise à jour', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    });
}

function viewOrderDetails(orderId) {
    fetch(`php/api/admin.php?action=getOrderDetails&token=${window.authToken}&order_id=${orderId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showOrderDetailsModal(data.order);
            }
        })
        .catch(error => {
            console.error('Erreur détails commande:', error);
        });
}

function showOrderDetailsModal(order) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Détails de la commande ${order.order_number}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div style="padding: 30px;">
                <h3>Informations client</h3>
                <p><strong>Nom:</strong> ${order.first_name} ${order.last_name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Téléphone:</strong> ${order.phone}</p>
                <p><strong>Adresse:</strong> ${order.delivery_address || 'N/A'}</p>
                
                <h3 style="margin-top: 20px;">Articles commandés</h3>
                <table style="width: 100%; margin-top: 10px;">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Quantité</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>${formatPrice(item.price * item.quantity)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <p style="margin-top: 20px; font-size: 18px;"><strong>Total: ${formatPrice(order.total_amount)}</strong></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==============================================
// UTILISATEURS
// ==============================================
function loadAllUsers() {
    fetch(`php/api/admin.php?action=getAllUsers&token=${window.authToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allUsers = data.users;
                displayUsers(allUsers);
            }
        })
        .catch(error => {
            console.error('Erreur utilisateurs:', error);
        });
}

function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucun utilisateur</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.first_name} ${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>${user.is_admin == 1 ? '✓' : '✗'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewUser(${user.id})">Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==============================================
// COMMANDES SUR MESURE
// ==============================================
function loadCustomOrders() {
    fetch(`php/api/custom-orders.php?action=getAllCustomOrders&token=${window.authToken}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allCustomOrders = data.orders;
                displayCustomOrders(allCustomOrders);
            }
        })
        .catch(error => {
            console.error('Erreur commandes sur mesure:', error);
        });
}

function displayCustomOrders(orders) {
    const tbody = document.querySelector('#customOrdersTable tbody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Aucune commande sur mesure</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number}</td>
            <td>${order.full_name}</td>
            <td>${order.garment_type}</td>
            <td>${order.category}</td>
            <td>${formatPrice(order.budget)}</td>
            <td>
                <select class="status-select" onchange="updateCustomOrderStatus(${order.id}, this.value)">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                    <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>En cours</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminée</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
                </select>
            </td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewCustomOrder(${order.id})">Détails</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateCustomOrderStatus(orderId, newStatus) {
    fetch('php/api/custom-orders.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'updateOrderStatus',
            token: window.authToken,
            order_id: orderId,
            status: newStatus
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Statut mis à jour', 'success');
        } else {
            showNotification('Erreur lors de la mise à jour', 'error');
        }
    });
}

function viewCustomOrder(orderId) {
    const order = allCustomOrders.find(o => o.id == orderId);
    if (!order) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Commande ${order.order_number}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div style="padding: 30px;">
                <h3>Informations client</h3>
                <p><strong>Nom:</strong> ${order.full_name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Téléphone:</strong> ${order.phone}</p>
                
                <h3 style="margin-top: 20px;">Détails de la commande</h3>
                <p><strong>Type:</strong> ${order.garment_type}</p>
                <p><strong>Catégorie:</strong> ${order.category}</p>
                <p><strong>Occasion:</strong> ${order.occasion || 'N/A'}</p>
                <p><strong>Budget:</strong> ${formatPrice(order.budget)}</p>
                <p><strong>A des mesures:</strong> ${order.has_measurements === 'yes' ? 'Oui' : 'Non'}</p>
                <p><strong>Date limite:</strong> ${order.deadline ? formatDate(order.deadline) : 'N/A'}</p>
                
                <h3 style="margin-top: 20px;">Description</h3>
                <p>${order.description}</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ==============================================
// MESSAGES
// ==============================================
function loadMessages() {
    const tbody = document.querySelector('#messagesTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Fonctionnalité à venir</td></tr>';
}

// ==============================================
// GESTION PRODUITS (MODAL)
// ==============================================
function setupEventListeners() {
    // Recherche produits
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm)
            );
            displayProducts(filtered);
        });
    }
    
    // Filtre catégorie
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            if (this.value === 'all') {
                displayProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category === this.value);
                displayProducts(filtered);
            }
        });
    }
    
    // Preview image
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.addEventListener('change', function() {
            const preview = document.getElementById('imagePreview');
            const file = this.files[0];
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

function openProductModal() {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) return;
    
    document.getElementById('productModal').classList.add('active');
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
            `<img src="${product.image_url}" alt="${product.name}">`;
    }
}

function handleProductSubmit(e) {
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
    
    fetch('php/api/products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Produit enregistré avec succès', 'success');
            closeProductModal();
            loadAllProducts();
        } else {
            showNotification(data.message || 'Erreur lors de l\'enregistrement', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    });
}

function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    fetch('php/api/products.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'delete',
            token: window.authToken,
            id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Produit supprimé', 'success');
            loadAllProducts();
        } else {
            showNotification('Erreur lors de la suppression', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    });
}

// ==============================================
// UTILITAIRES
// ==============================================
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 0
    }).format(price) + ' FCFA';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statuses = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Terminée',
        'cancelled': 'Annulée',
        'in_progress': 'En cours'
    };
    return statuses[status] || status;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .status-select {
        padding: 5px 10px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
    }
`;
document.head.appendChild(style);
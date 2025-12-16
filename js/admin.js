// admin.js - VERSION COMPLÈTE ET CORRIGÉE
// Fichier: js/admin.js

let currentSection = 'dashboard';
let allProducts = [];
let allOrders = [];
let allUsers = [];

// INITIALISATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');
    setupNavigation();
    loadDashboardData();
    setupProductModal();
    setupFormHandlers();
});

// NAVIGATION
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
    console.log('Showing section:', section);
    
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    const sectionId = section + '-section';
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    const titles = {
        'dashboard': 'Tableau de bord',
        'products': 'Gestion des Produits',
        'orders': 'Gestion des Commandes',
        'users': 'Gestion des Utilisateurs',
        'custom-orders': 'Commandes sur mesure',
        'messages': 'Messages de contact',
        'settings': 'Paramètres'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || section;
    currentSection = section;
    
    // Charger les données
    setTimeout(() => {
        if (section === 'products') {
            loadProducts();
            setupProductFilters();
        } else if (section === 'orders') {
            loadOrders();
        } else if (section === 'users') {
            loadUsers();
        } else if (section === 'custom-orders') {
            loadCustomOrders();
        } else if (section === 'messages') {
            loadMessages();
        }
    }, 100);
}

// CHARGER DASHBOARD
function loadDashboardData() {
    const token = getAuthToken();
    
    fetch(`php/api/admin.php?action=getDashboardStats&token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.stats.products || 0;
                document.getElementById('totalOrders').textContent = data.stats.orders || 0;
                document.getElementById('totalUsers').textContent = data.stats.users || 0;
                document.getElementById('totalRevenue').textContent = (data.stats.revenue || '0') + ' FCFA';
            }
        })
        .catch(error => console.error('Erreur dashboard:', error));
    
    // Charger commandes récentes
    loadRecentOrders();
}

// CHARGER COMMANDES RÉCENTES
function loadRecentOrders() {
    const token = getAuthToken();
    
    fetch(`php/api/admin.php?action=getRecentOrders&token=${encodeURIComponent(token)}&limit=5`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders) {
                displayRecentOrders(data.orders);
            }
        })
        .catch(error => console.error('Erreur orders:', error));
}

// AFFICHER COMMANDES RÉCENTES
function displayRecentOrders(orders) {
    const tbody = document.querySelector('#recentOrdersTable tbody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucune commande récente</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.order_number}</strong></td>
            <td>${order.customer_name || 'Client inconnu'}</td>
            <td>${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <button class="btn-view" onclick="viewOrderDetails(${order.id})">Voir</button>
            </td>
        </tr>
    `).join('');
}

// CHARGER PRODUITS
function loadProducts() {
    console.log('Chargement des produits...');
    
    fetch('php/api/products.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            console.log('Données produits:', data);
            
            if (data.success && data.products) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                document.querySelector('#productsTable tbody').innerHTML = 
                    '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
            }
        })
        .catch(error => {
            console.error('Erreur produits:', error);
            document.querySelector('#productsTable tbody').innerHTML = 
                '<tr><td colspan="6" class="no-data">Erreur de chargement</td></tr>';
        });
}

// AFFICHER PRODUITS
function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    
    if (!tbody) {
        console.error('tbody non trouvé!');
        return;
    }
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryName(product.category)}</td>
            <td>${parseInt(product.price).toLocaleString('fr-FR')} FCFA</td>
            <td>${product.stock}</td>
            <td>
                <div class="action-btns" style="display: flex; gap: 8px;">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Modifier</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// CHARGER COMMANDES
function loadOrders() {
    const token = getAuthToken();
    
    fetch(`php/api/admin.php?action=getAllOrders&token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders) {
                allOrders = data.orders;
                displayOrders(allOrders);
            }
        })
        .catch(error => console.error('Erreur orders:', error));
}

// AFFICHER COMMANDES
function displayOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.order_number}</strong></td>
            <td>${order.customer_name || 'Client inconnu'}</td>
            <td>${order.items_count || 0}</td>
            <td>${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <button class="btn-view" onclick="viewOrderDetails(${order.id})">Voir</button>
            </td>
        </tr>
    `).join('');
}

// CHARGER UTILISATEURS
function loadUsers() {
    const token = getAuthToken();
    
    fetch(`php/api/admin.php?action=getAllUsers&token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.users) {
                allUsers = data.users;
                displayUsers(allUsers);
            }
        })
        .catch(error => console.error('Erreur users:', error));
}

// AFFICHER UTILISATEURS
function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucun utilisateur</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><strong>${user.first_name} ${user.last_name}</strong></td>
            <td>${user.email}</td>
            <td>${user.phone || '-'}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>${user.is_admin == 1 ? '✅ Oui' : '❌ Non'}</td>
            <td>
                <button class="btn-view" onclick="viewUserDetails(${user.id})">Voir</button>
            </td>
        </tr>
    `).join('');
}

// CHARGER COMMANDES SUR MESURE
function loadCustomOrders() {
    const token = getAuthToken();
    
    fetch(`php/api/custom-orders.php?action=getAllCustomOrders&token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders) {
                displayCustomOrders(data.orders);
            }
        })
        .catch(error => console.error('Erreur custom orders:', error));
}

// AFFICHER COMMANDES SUR MESURE
function displayCustomOrders(orders) {
    const tbody = document.querySelector('#customOrdersTable tbody');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Aucune commande sur mesure</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.order_number}</strong></td>
            <td>${order.full_name}</td>
            <td>${order.garment_type}</td>
            <td>${getCategoryName(order.category)}</td>
            <td>${order.budget ? parseInt(order.budget).toLocaleString('fr-FR') + ' FCFA' : '-'}</td>
            <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <button class="btn-view" onclick="viewCustomOrderDetails(${order.id})">Voir</button>
            </td>
        </tr>
    `).join('');
}

// CHARGER MESSAGES
function loadMessages() {
    const token = getAuthToken();
    
    fetch(`php/api/contact.php?action=getAllMessages&token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.messages) {
                displayMessages(data.messages);
            }
        })
        .catch(error => console.error('Erreur messages:', error));
}

// AFFICHER MESSAGES
function displayMessages(messages) {
    const tbody = document.querySelector('#messagesTable tbody');
    
    if (!messages || messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun message</td></tr>';
        return;
    }
    
    tbody.innerHTML = messages.map(msg => `
        <tr style="${msg.status === 'unread' ? 'background: #fffacd;' : ''}">
            <td><strong>${msg.first_name} ${msg.last_name}</strong></td>
            <td>${msg.email}</td>
            <td>${msg.subject}</td>
            <td><span class="status-badge status-${msg.status}">${msg.status === 'unread' ? 'Non lu' : 'Lu'}</span></td>
            <td>${formatDate(msg.created_at)}</td>
            <td>
                <button class="btn-view" onclick="viewMessage(${msg.id})">Lire</button>
            </td>
        </tr>
    `).join('');
}

// MODAL PRODUIT
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (form) form.reset();
    
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    
    if (productId) {
        document.getElementById('modalTitle').textContent = 'Modifier le produit';
        const product = allProducts.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
            
            if (product.image_url) {
                preview.innerHTML = `<img src="${product.image_url}" style="max-width: 200px; border-radius: 8px;">`;
            }
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    }
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    modal.style.display = 'none';
}

// SETUP MODAL
function setupProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeProductModal();
        }
    });
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: 8px;">`;
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

// SOUMETTRE PRODUIT
function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const token = getAuthToken();
    
    const formData = new FormData();
    formData.append('action', productId ? 'update' : 'create');
    formData.append('token', token);
    
    if (productId) {
        formData.append('id', productId);
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
            showSuccess(productId ? 'Produit modifié!' : 'Produit ajouté!');
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

// ÉDITER PRODUIT
function editProduct(id) {
    openProductModal(id);
}

// SUPPRIMER PRODUIT
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
            showSuccess('Produit supprimé!');
            loadProducts();
        } else {
            showError('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showError('Erreur');
    });
}

// SETUP FILTRES
function setupProductFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('productSearch');
    
    if (!categoryFilter || !searchInput) return;
    
    categoryFilter.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);
}

function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchInput = document.getElementById('productSearch').value.toLowerCase();
    
    let filtered = allProducts;
    
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    
    if (searchInput) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchInput));
    }
    
    displayProducts(filtered);
}

// SETUP FORMULAIRES
function setupFormHandlers() {
    const siteForm = document.getElementById('siteSettingsForm');
    if (siteForm) {
        siteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showSuccess('Paramètres enregistrés!');
        });
    }
    
    const emailForm = document.getElementById('emailSettingsForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showSuccess('Configuration email enregistrée!');
        });
    }
    
    const paymentForm = document.getElementById('paymentSettingsForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showSuccess('Paramètres de paiement enregistrés!');
        });
    }
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
        'completed': 'Terminé',
        'cancelled': 'Annulé',
        'confirmed': 'Confirmé',
        'in_progress': 'En cours',
        'unread': 'Non lu',
        'read': 'Lu',
        'replied': 'Répondu'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getAuthToken() {
    return window.authToken || getCookie('auth_token') || localStorage.getItem('authToken');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
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
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = '✅ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
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
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = '❌ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// VIEW FUNCTIONS (à implémenter)
function viewOrderDetails(orderId) {
    alert('Détails commande ' + orderId);
}

function viewUserDetails(userId) {
    alert('Détails utilisateur ' + userId);
}

function viewCustomOrderDetails(orderId) {
    alert('Détails commande sur mesure ' + orderId);
}

function viewMessage(messageId) {
    alert('Message ' + messageId);
}

// CSS ANIMATIONS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);



























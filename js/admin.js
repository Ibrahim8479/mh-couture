/**
 * ADMIN.JS - Panneau d'administration MH Couture
 * Version corrigée et complète
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin panel loaded');
    
    // Vérifier l'authentification admin
    checkAdminAuth();
    
    // Initialiser le tableau de bord
    initDashboard();
    
    // Configurer la navigation
    setupNavigation();
    
    // Configurer les modales
    setupModals();
    
    // Charger les données initiales
    loadInitialData();
});

// ===============================
// AUTHENTIFICATION ADMIN
// ===============================
async function checkAdminAuth() {
    const token = window.authToken || localStorage.getItem('authToken');
    
    if (!token) {
        alert('Vous devez être connecté en tant qu\'administrateur');
        window.location.href = 'login.php';
        return false;
    }
    
    try {
        const response = await fetch('php/auth/auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'checkAdmin',
                token: token
            })
        });
        
        const data = await response.json();
        
        if (!data.success || !data.isAdmin) {
            alert('Accès réservé aux administrateurs');
            window.location.href = 'index.php';
            return false;
        }
        
        console.log('✅ Admin authenticated');
        return true;
        
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        alert('Erreur de vérification des permissions');
        window.location.href = 'login.php';
        return false;
    }
}

// ===============================
// INITIALISATION DU TABLEAU DE BORD
// ===============================
function initDashboard() {
    // Configurer la navigation entre sections
    const navLinks = document.querySelectorAll('.admin-nav .nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Récupérer la section depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const activeSection = urlParams.get('section') || 'dashboard';
    
    // Activer la section correspondante
    showSection(activeSection);
    
    // Configurer les événements de navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            
            // Mettre à jour l'URL sans recharger la page
            history.pushState(null, '', `admin.php?section=${section}`);
        });
    });
}

function showSection(section) {
    // Mettre à jour les liens de navigation
    document.querySelectorAll('.admin-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    // Mettre à jour le titre
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        'dashboard': 'Tableau de bord',
        'products': 'Gestion des produits',
        'orders': 'Gestion des commandes',
        'users': 'Gestion des utilisateurs',
        'custom_orders': 'Commandes sur mesure',
        'messages': 'Messages de contact',
        'gallery': 'Galerie',
        'settings': 'Paramètres'
    };
    
    if (pageTitle && titles[section]) {
        pageTitle.textContent = titles[section];
    }
    
    // Afficher/masquer les sections
    document.querySelectorAll('.content-section').forEach(sectionEl => {
        sectionEl.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Charger les données de la section si nécessaire
        loadSectionData(section);
    }
}

// ===============================
// CHARGEMENT DES DONNÉES
// ===============================
async function loadInitialData() {
    if (!await checkAdminAuth()) return;
    
    // Charger les statistiques
    await loadDashboardStats();
    
    // Charger les commandes récentes
    await loadRecentOrders();
}

async function loadDashboardStats() {
    try {
        const token = window.authToken;
        const response = await fetch(`php/api/admin.php?action=getDashboardStats&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalProducts').textContent = data.stats.products;
            document.getElementById('totalOrders').textContent = data.stats.orders;
            document.getElementById('totalUsers').textContent = data.stats.users;
            document.getElementById('totalRevenue').textContent = data.stats.revenue;
        }
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        showNotification('Erreur lors du chargement des statistiques', 'error');
    }
}

async function loadRecentOrders() {
    try {
        const token = window.authToken;
        const response = await fetch(`php/api/admin.php?action=getAllOrders&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success && data.orders.length > 0) {
            const table = document.getElementById('recentOrdersTable');
            if (table) {
                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';
                
                // Prendre les 5 premières commandes
                data.orders.slice(0, 5).forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.order_number}</td>
                        <td>${order.customer_name || 'N/A'}</td>
                        <td>${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</td>
                        <td><span class="order-status status-${order.status}">${getOrderStatusText(order.status)}</span></td>
                        <td>${formatDate(order.created_at)}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error loading recent orders:', error);
    }
}

function loadSectionData(section) {
    switch(section) {
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'custom_orders':
            loadCustomOrders();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'gallery':
            loadGalleryAdmin();
            break;
    }
}

// ===============================
// GESTION DES PRODUITS
// ===============================
async function loadProducts() {
    try {
        const table = document.getElementById('productsTable');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Chargement des produits...</td></tr>';
        
        const response = await fetch('php/api/products.php?action=getAll');
        const data = await response.json();
        
        if (data.success && data.products.length > 0) {
            tbody.innerHTML = '';
            
            data.products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;" 
                                 onerror="this.src='https://via.placeholder.com/60'">` 
                            : '📷'}
                    </td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${parseInt(product.price).toLocaleString('fr-FR')} FCFA</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editProduct(${product.id})">✏️</button>
                        <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit trouvé</td></tr>';
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Erreur lors du chargement</td></tr>';
    }
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productId) {
        title.textContent = 'Modifier le produit';
        loadProductData(productId);
    } else {
        title.textContent = 'Ajouter un produit';
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

async function loadProductData(productId) {
    try {
        const response = await fetch(`php/api/products.php?action=getById&id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
            
            // Afficher l'image actuelle
            if (product.image_url) {
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${product.image_url}" alt="Image actuelle" style="max-width: 200px; border-radius: 8px;">
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">Image actuelle</p>
                `;
            }
        }
    } catch (error) {
        console.error('❌ Error loading product data:', error);
        showNotification('Erreur lors du chargement du produit', 'error');
    }
}

async function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const token = window.authToken;
        const response = await fetch('php/api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                token: token,
                id: productId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Produit supprimé avec succès');
            loadProducts(); // Recharger la liste
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// ===============================
// GESTION DES COMMANDES
// ===============================
async function loadOrders() {
    try {
        const token = window.authToken;
        const response = await fetch(`php/api/admin.php?action=getAllOrders&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success) {
            const table = document.getElementById('ordersTable');
            if (table) {
                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';
                
                data.orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.order_number}</td>
                        <td>${order.customer_name || 'N/A'}</td>
                        <td>${order.items_count || 0}</td>
                        <td>${parseInt(order.total_amount).toLocaleString('fr-FR')} FCFA</td>
                        <td>
                            <select class="status-select" data-order-id="${order.id}" onchange="updateOrderStatus(${order.id}, this.value)">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En cours</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminé</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
                            </select>
                        </td>
                        <td>${formatDate(order.created_at)}</td>
                        <td>
                            <button class="btn-action btn-view" onclick="viewOrderDetails(${order.id})">👁️</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const token = window.authToken;
        const response = await fetch('php/api/admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateOrderStatus',
                token: token,
                order_id: orderId,
                status: status
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Statut mis à jour');
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('❌ Error updating order:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// ===============================
// GESTION DES UTILISATEURS
// ===============================
async function loadUsers() {
    try {
        const token = window.authToken;
        const response = await fetch(`php/api/admin.php?action=getAllUsers&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success) {
            const table = document.getElementById('usersTable');
            if (table) {
                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';
                
                data.users.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                            <span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">
                                ${user.is_admin ? 'Admin' : 'Utilisateur'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-action btn-toggle" onclick="toggleUserStatus(${user.id}, ${user.is_active ? 0 : 1})">
                                ${user.is_active ? '❌ Désactiver' : '✅ Activer'}
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error loading users:', error);
    }
}

// ===============================
// COMMANDES SUR MESURE
// ===============================
async function loadCustomOrders() {
    try {
        const token = window.authToken;
        const response = await fetch(`php/api/admin.php?action=getAllCustomOrders&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success) {
            const table = document.getElementById('customOrdersTable');
            if (table) {
                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';
                
                data.orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.order_number}</td>
                        <td>${order.customer_name || order.full_name}</td>
                        <td>${order.type || order.garment_type}</td>
                        <td>${order.category}</td>
                        <td>${order.budget ? parseInt(order.budget).toLocaleString('fr-FR') + ' FCFA' : 'Non spécifié'}</td>
                        <td>
                            <select class="status-select" onchange="updateCustomOrderStatus(${order.id}, this.value)">
                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
                                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmé</option>
                                <option value="in_progress" ${order.status === 'in_progress' ? 'selected' : ''}>En cours</option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Terminé</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
                            </select>
                        </td>
                        <td>${formatDate(order.created_at)}</td>
                        <td>
                            <button class="btn-action btn-view" onclick="viewCustomOrder(${order.id})">👁️</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error loading custom orders:', error);
    }
}

// ===============================
// MESSAGES DE CONTACT
// ===============================
async function loadMessages() {
    try {
        const token = window.authToken;
        const response = await fetch(`php/api/admin.php?action=getAllMessages&token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (data.success) {
            const table = document.getElementById('messagesTable');
            if (table) {
                const tbody = table.querySelector('tbody');
                tbody.innerHTML = '';
                
                data.messages.forEach(msg => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${msg.first_name} ${msg.last_name}</td>
                        <td>${msg.email}</td>
                        <td>${msg.subject}</td>
                        <td>
                            <span class="badge ${msg.status === 'read' ? 'badge-read' : 'badge-unread'}">
                                ${msg.status === 'read' ? 'Lu' : 'Non lu'}
                            </span>
                        </td>
                        <td>${formatDate(msg.created_at)}</td>
                        <td>
                            <button class="btn-action btn-view" onclick="viewMessage(${msg.id})">👁️</button>
                            <button class="btn-action btn-delete" onclick="deleteMessage(${msg.id})">🗑️</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error loading messages:', error);
    }
}

// ===============================
// GALERIE (ADMIN)
// ===============================
async function loadGalleryAdmin() {
    try {
        const grid = document.getElementById('galleryGridAdmin');
        if (!grid) return;
        
        grid.innerHTML = '<div class="loading">Chargement de la galerie...</div>';
        
        const response = await fetch('php/api/gallery.php?action=getAll');
        const data = await response.json();
        
        if (data.success && data.gallery.length > 0) {
            grid.innerHTML = data.gallery.map(item => `
                <div class="gallery-item-admin">
                    <div class="gallery-image">
                        <img src="${item.image_url || 'https://via.placeholder.com/200'}" 
                             alt="${item.title}"
                             onerror="this.src='https://via.placeholder.com/200'">
                    </div>
                    <div class="gallery-info">
                        <h4>${item.title}</h4>
                        <p>${item.category} • ${item.is_featured ? '⭐ À la une' : ''}</p>
                    </div>
                    <div class="gallery-actions">
                        <button class="btn-action btn-edit" onclick="editGalleryItem(${item.id})">✏️</button>
                        <button class="btn-action btn-delete" onclick="deleteGalleryItem(${item.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<div class="no-data">Aucune image dans la galerie</div>';
        }
    } catch (error) {
        console.error('❌ Error loading gallery:', error);
        grid.innerHTML = '<div class="no-data">Erreur lors du chargement</div>';
    }
}

function openGalleryModal(itemId = null) {
    const modal = document.getElementById('galleryModal');
    const title = document.getElementById('galleryModalTitle');
    const form = document.getElementById('galleryForm');
    
    if (itemId) {
        title.textContent = 'Modifier l\'image';
        loadGalleryItemData(itemId);
    } else {
        title.textContent = 'Ajouter à la galerie';
        form.reset();
        document.getElementById('galleryId').value = '';
        document.getElementById('galleryImagePreview').innerHTML = '';
    }
    
    modal.style.display = 'block';
}

function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
}

// ===============================
// UTILITAIRES
// ===============================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Terminé',
        'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="notification-text">${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===============================
// CONFIGURATION DES MODALES
// ===============================
function setupModals() {
    // Fermer modales avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
            closeGalleryModal();
        }
    });
    
    // Fermer modales en cliquant dehors
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Configuration du formulaire produit
    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct();
    });
    
    // Configuration du formulaire galerie
    document.getElementById('galleryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveGalleryItem();
    });
}

// ===============================
// NAVIGATION
// ===============================
function setupNavigation() {
    // Historique du navigateur
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section') || 'dashboard';
        showSection(section);
    });
}

// ===============================
// ÉVÉNEMENTS GLOBAUX
// ===============================
window.updateOrderStatus = updateOrderStatus;
window.updateCustomOrderStatus = async function(orderId, status) {
    try {
        const token = window.authToken;
        const response = await fetch('php/api/admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updateCustomOrderStatus',
                token: token,
                order_id: orderId,
                status: status
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Statut mis à jour');
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('❌ Error updating custom order:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    }
};

window.toggleUserStatus = async function(userId, status) {
    try {
        const token = window.authToken;
        const response = await fetch('php/api/admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'toggleUserStatus',
                token: token,
                user_id: userId,
                status: status
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`✅ Utilisateur ${status ? 'activé' : 'désactivé'}`);
            loadUsers(); // Recharger la liste
        } else {
            showNotification('❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('❌ Error toggling user status:', error);
        showNotification('Erreur lors de la modification', 'error');
    }
};

// ===============================
// STYLES INLINE POUR LES NOTIFICATIONS
// ===============================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
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
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading {
        text-align: center;
        padding: 40px;
        color: #666;
        font-style: italic;
    }
    
    .no-data {
        text-align: center;
        padding: 40px;
        color: #999;
    }
    
    .btn-action {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        margin: 2px;
        transition: all 0.2s;
    }
    
    .btn-edit {
        background: #3498db;
        color: white;
    }
    
    .btn-delete {
        background: #e74c3c;
        color: white;
    }
    
    .btn-view {
        background: #2ecc71;
        color: white;
    }
    
    .btn-toggle {
        background: #f39c12;
        color: white;
    }
    
    .btn-action:hover {
        transform: translateY(-2px);
        opacity: 0.9;
    }
    
    .badge {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
    }
    
    .badge-admin {
        background: #9b59b6;
        color: white;
    }
    
    .badge-user {
        background: #3498db;
        color: white;
    }
    
    .badge-read {
        background: #2ecc71;
        color: white;
    }
    
    .badge-unread {
        background: #e74c3c;
        color: white;
    }
    
    .status-select {
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid #ddd;
        font-size: 14px;
        cursor: pointer;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .image-preview {
        margin-top: 10px;
    }
    
    .image-preview img {
        max-width: 200px;
        border-radius: 8px;
        border: 2px solid #eee;
    }
    
    .gallery-grid-admin {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .gallery-item-admin {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .gallery-image {
        height: 200px;
        overflow: hidden;
    }
    
    .gallery-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .gallery-info {
        padding: 15px;
    }
    
    .gallery-actions {
        padding: 15px;
        display: flex;
        gap: 10px;
    }
`;

document.head.appendChild(style);

console.log('✅ Admin.js initialisé avec succès');
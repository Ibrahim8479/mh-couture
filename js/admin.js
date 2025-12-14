// admin.js - CORRIGÉ avec tous les bons chemins
let currentSection = 'dashboard';
let allProducts = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupNavigation();
    loadDashboardData();
    loadProducts();
});

function checkAdminAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        alert('Accès non autorisé');
        window.location.href = 'login.php';
        return;
    }
    
    // CHEMIN CORRIGÉ
    fetch('php/auth/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'checkAdmin',
            token: token
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success || !data.isAdmin) {
            alert('Vous n\'avez pas les droits d\'administrateur');
            window.location.href = 'index.php';
        } else {
            document.getElementById('adminName').textContent = data.user.name;
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        window.location.href = 'login.php';
    });
}

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

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    document.getElementById(section + '-section').classList.add('active');
    
    const titles = {
        'dashboard': 'Tableau de bord',
        'products': 'Gestion des Produits',
        'orders': 'Gestion des Commandes',
        'users': 'Gestion des Utilisateurs',
        'settings': 'Paramètres'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    currentSection = section;
    
    if (section === 'products') loadProducts();
    if (section === 'orders') loadOrders();
    if (section === 'users') loadUsers();
}

function loadDashboardData() {
    // CHEMIN CORRIGÉ
    fetch('php/api/admin.php?action=getDashboardStats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.stats.products;
                document.getElementById('totalOrders').textContent = data.stats.orders;
                document.getElementById('totalUsers').textContent = data.stats.users;
                document.getElementById('totalRevenue').textContent = data.stats.revenue + ' FCFA';
                
                loadRecentOrders();
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function loadRecentOrders() {
    // CHEMIN CORRIGÉ
    fetch('php/api/admin.php?action=getRecentOrders&limit=5')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders.length > 0) {
                const tbody = document.querySelector('#recentOrdersTable tbody');
                tbody.innerHTML = data.orders.map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.customer_name}</td>
                        <td>${order.total_amount} FCFA</td>
                        <td><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></td>
                        <td>${formatDate(order.created_at)}</td>
                    </tr>
                `).join('');
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function loadProducts() {
    // CHEMIN CORRIGÉ
    fetch('php/api/products.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allProducts = data.products;
                displayProducts(allProducts);
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image_url || 'placeholder-product.jpg'}" alt="${product.name}" class="product-img"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price} FCFA</td>
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

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    form.reset();
    document.getElementById('imagePreview').innerHTML = '';
    
    if (productId) {
        editingProductId = productId;
        document.getElementById('modalTitle').textContent = 'Modifier le produit';
        
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category.toLowerCase();
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
            
            if (product.image_url) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${product.image_url}" alt="${product.name}">`;
            }
        }
    } else {
        editingProductId = null;
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    editingProductId = null;
}

document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('action', editingProductId ? 'update' : 'create');
    if (editingProductId) formData.append('id', editingProductId);
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
    
    // CHEMIN CORRIGÉ
    fetch('php/api/products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(editingProductId ? 'Produit modifié avec succès!' : 'Produit ajouté avec succès!');
            closeProductModal();
            loadProducts();
        } else {
            alert('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    });
});

document.getElementById('productImage').addEventListener('change', function(e) {
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

function editProduct(id) {
    openProductModal(id);
}

function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        return;
    }
    
    // CHEMIN CORRIGÉ
    fetch('php/api/products.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'delete',
            id: id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Produit supprimé avec succès!');
            loadProducts();
        } else {
            alert('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue');
    });
}

function loadOrders() {
    // CHEMIN CORRIGÉ
    fetch('php/api/admin.php?action=getAllOrders')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayOrders(data.orders);
            }
        })
        .catch(error => console.error('Erreur:', error));
}

function displayOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number}</td>
            <td>${order.customer_name}</td>
            <td>${order.items_count} produit(s)</td>
            <td>${order.total_amount} FCFA</td>
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

function loadUsers() {
    console.log('Chargement des utilisateurs...');
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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function viewOrderDetails(id) {
    console.log('Voir commande:', id);
}

function logout() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    // CHEMIN CORRIGÉ
    fetch('php/auth/auth.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'logout',
            token: token
        })
    })
    .then(() => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = 'index.php';
    })
    .catch(error => {
        console.error('Erreur:', error);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = 'index.php';
    });
}
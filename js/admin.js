// admin.js — VERSION CORRIGÉE ET STABLE
// Compatible avec products.php (sans WHERE stock > 0)

let currentSection = 'dashboard';
let allProducts = [];

// ===============================
// INITIALISATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadDashboardData();
    setupProductModal();
});

// ===============================
// NAVIGATION
// ===============================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showSection(link.dataset.section);
        });
    });
}

function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(section + '-section');
    if (el) el.classList.add('active');

    const titles = {
        dashboard: 'Tableau de bord',
        products: 'Gestion des Produits',
        orders: 'Gestion des Commandes',
        users: 'Gestion des Utilisateurs',
        settings: 'Paramètres'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[section] || section;

    currentSection = section;

    if (section === 'products') {
        setTimeout(() => {
            loadProducts();
            setupProductFilters();
        }, 50);
    }
}

// ===============================
// DASHBOARD
// ===============================
function loadDashboardData() {
    const token = getAuthToken();
    if (!token) return;

    fetch('php/api/admin.php?action=getDashboardStats&token=' + encodeURIComponent(token))
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            document.getElementById('totalProducts').textContent = data.stats.products || 0;
            document.getElementById('totalOrders').textContent = data.stats.orders || 0;
            document.getElementById('totalUsers').textContent = data.stats.users || 0;
            document.getElementById('totalRevenue').textContent = (data.stats.revenue || 0) + ' FCFA';
        })
        .catch(() => {});
}

// ===============================
// PRODUITS — CHARGEMENT
// ===============================
function loadProducts() {
    fetch('php/api/products.php?action=getAll')
        .then(r => r.json())
        .then(data => {
            if (data.success && Array.isArray(data.products)) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                showProductsError(data.message || 'Impossible de charger');
            }
        })
        .catch(() => showProductsError('Erreur de connexion'));
}

// ===============================
// PRODUITS — AFFICHAGE
// ===============================
function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        const img = p.image_url ? '/' + p.image_url : 'https://via.placeholder.com/50';
        const price = Number(p.price || 0).toLocaleString('fr-FR');
        const category = getCategoryName(p.category);

        return `
        <tr>
            <td><img src="${img}" class="product-img" alt="${p.name || ''}"></td>
            <td>${p.name || ''}</td>
            <td>${category}</td>
            <td>${price} FCFA</td>
            <td>${p.stock ?? 0}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${p.id})">Modifier</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">Supprimer</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function showProductsError(message) {
    const tbody = document.querySelector('#productsTable tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="no-data">${message}</td></tr>`;
}

// ===============================
// MODAL PRODUIT
// ===============================
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    if (!modal || !form) return;

    form.reset();
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';

    if (productId) {
        document.getElementById('modalTitle').textContent = 'Modifier le produit';
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productPrice').value = product.price || 0;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    }

    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
}

function setupProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    if (!modal || !form) return;

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

    window.addEventListener('click', e => { if (e.target === modal) closeProductModal(); });

    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                const preview = document.getElementById('imagePreview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}">`;
            };
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', handleProductSubmit);
}

// ===============================
// SUBMIT PRODUIT
// ===============================
function handleProductSubmit(e) {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) return showError('Non authentifié');

    const productId = document.getElementById('productId').value;
    const formData = new FormData();

    formData.append('action', productId ? 'update' : 'create');
    formData.append('token', token);
    if (productId) formData.append('id', productId);

    formData.append('name', document.getElementById('productName').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('is_custom', document.getElementById('isCustom').checked ? 1 : 0);

    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) formData.append('image', imageFile);

    fetch('php/api/products.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showSuccess(productId ? 'Produit modifié !' : 'Produit ajouté !');
                closeProductModal();
                loadProducts();
            } else showError(data.message || 'Erreur');
        })
        .catch(() => showError('Erreur serveur'));
}

// ===============================
// ACTIONS
// ===============================
function editProduct(id) { openProductModal(id); }

function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;

    fetch('php/api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id, token: getAuthToken() })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showSuccess('Produit supprimé');
            loadProducts();
        } else showError(data.message || 'Erreur');
    })
    .catch(() => showError('Erreur serveur'));
}

// ===============================
// FILTRES
// ===============================
function setupProductFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('productSearch');
    if (!categoryFilter || !searchInput) return;

    categoryFilter.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);
}

function filterProducts() {
    const cat = document.getElementById('categoryFilter').value;
    const q = document.getElementById('productSearch').value.toLowerCase();

    let filtered = allProducts;
    if (cat !== 'all') filtered = filtered.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
    if (q) filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(q));

    displayProducts(filtered);
}

// ===============================
// UTILITAIRES
// ===============================
function getCategoryName(category) {
    if (!category) return '—';
    const map = { homme: 'Homme', femme: 'Femme', enfant: 'Enfant' };
    return map[category.toLowerCase()] || category;
}

function getAuthToken() {
    return getCookie('auth_token') || localStorage.getItem('authToken');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function showSuccess(message) {
    notify('✅ ' + message, '#27ae60');
}

function showError(message) {
    notify('❌ ' + message, '#e74c3c');
}

function notify(text, bg) {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;background:${bg};color:#fff;padding:16px 24px;border-radius:8px;z-index:10000;font-weight:600`;
    n.textContent = text;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}


function openAddProductModal() {
    document.getElementById('addProductModal').classList.add('show');
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('show');
}



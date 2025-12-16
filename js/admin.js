// =======================================
// admin.js — VERSION STABLE & CORRIGÉE
// =======================================

let currentSection = 'dashboard';
let allProducts = [];

// =======================================
// INITIALISATION
// =======================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Admin JS chargé');

    setupNavigation();
    setupProductModal();

    // ✅ FIX: forcer l’affichage initial
    showSection('dashboard');
    loadDashboardData();
});

// =======================================
// NAVIGATION
// =======================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const section = link.dataset.section;
            showSection(section);
        });
    });
}

function showSection(section) {
    console.log('➡️ Section:', section);

    // ✅ FIX: cacher toutes les sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });

    const target = document.getElementById(section + '-section');
    if (target) {
        target.classList.add('active');
    }

    // Titre
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

    // Chargement dynamique
    if (section === 'products') {
        setTimeout(() => {
            loadProducts();
            setupProductFilters();
        }, 100);
    }
}

// =======================================
// DASHBOARD
// =======================================
function loadDashboardData() {
    const token = getAuthToken();
    if (!token) return;

    fetch(`php/api/admin.php?action=getDashboardStats&token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;

            document.getElementById('totalProducts').textContent = data.stats.products || 0;
            document.getElementById('totalOrders').textContent = data.stats.orders || 0;
            document.getElementById('totalUsers').textContent = data.stats.users || 0;
            document.getElementById('totalRevenue').textContent = (data.stats.revenue || 0) + ' FCFA';
        })
        .catch(err => console.error('❌ Dashboard:', err));
}

// =======================================
// PRODUITS — CHARGEMENT
// =======================================
function loadProducts() {
    console.log('📦 Chargement produits…');

    fetch('php/api/products.php?action=getAll')
        .then(r => r.json())
        .then(data => {
            console.log('📦 Réponse produits:', data);

            if (data.success && Array.isArray(data.products)) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                showProductsError('Aucun produit trouvé');
            }
        })
        .catch(err => {
            console.error('❌ Produits:', err);
            showProductsError('Erreur de chargement');
        });
}

// =======================================
// PRODUITS — AFFICHAGE
// =======================================
function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');

    // ✅ FIX: sécurité si tbody absent
    if (!tbody) {
        console.error('❌ tbody produits introuvable');
        return;
    }

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        // ✅ FIX: image_url peut être null
        const img = p.image_url ? '/' + p.image_url : 'https://via.placeholder.com/50';

        return `
        <tr>
            <td>
                <img src="${img}" class="product-img" alt="${p.name || ''}">
            </td>
            <td><strong>${p.name || ''}</strong></td>
            <td>${getCategoryName(p.category)}</td>
            <td>${Number(p.price || 0).toLocaleString('fr-FR')} FCFA</td>
            <td>${p.stock ?? 0}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${p.id})">Modifier</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">Supprimer</button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function showProductsError(message) {
    const tbody = document.querySelector('#productsTable tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">${message}</td></tr>`;
    }
}

// =======================================
// FILTRES PRODUITS
// =======================================
function setupProductFilters() {
    const search = document.getElementById('productSearch');
    const category = document.getElementById('categoryFilter');

    if (!search || !category) return;

    search.addEventListener('input', filterProducts);
    category.addEventListener('change', filterProducts);
}

function filterProducts() {
    const q = document.getElementById('productSearch').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;

    let filtered = allProducts;

    if (cat !== 'all') {
        filtered = filtered.filter(p => p.category?.toLowerCase() === cat);
    }

    if (q) {
        filtered = filtered.filter(p => p.name?.toLowerCase().includes(q));
    }

    displayProducts(filtered);
}

// =======================================
// MODAL PRODUIT
// =======================================
function setupProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');

    if (!modal || !form) return;

    modal.querySelector('.close-btn')?.addEventListener('click', closeProductModal);

    window.addEventListener('click', e => {
        if (e.target === modal) closeProductModal();
    });

    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = ev => {
                document.getElementById('imagePreview').innerHTML =
                    `<img src="${ev.target.result}">`;
            };
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', handleProductSubmit);
}

function openProductModal(id = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    form.reset();

    document.getElementById('imagePreview').innerHTML = '';

    if (id) {
        const p = allProducts.find(x => x.id === id);
        if (p) {
            document.getElementById('modalTitle').textContent = 'Modifier le produit';
            document.getElementById('productId').value = p.id;
            document.getElementById('productName').value = p.name;
            document.getElementById('productCategory').value = p.category;
            document.getElementById('productPrice').value = p.price;
            document.getElementById('productStock').value = p.stock;
            document.getElementById('productDescription').value = p.description || '';
            document.getElementById('isCustom').checked = p.is_custom == 1;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    }

    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

// =======================================
// SUBMIT PRODUIT
// =======================================
function handleProductSubmit(e) {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) return showError('Non authentifié');

    const formData = new FormData();
    const id = document.getElementById('productId').value;

    formData.append('action', id ? 'update' : 'create');
    formData.append('token', token);
    if (id) formData.append('id', id);

    ['productName','productCategory','productPrice','productStock','productDescription']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) formData.append(el.id.replace('product','').toLowerCase(), el.value);
        });

    formData.append('is_custom', document.getElementById('isCustom').checked ? 1 : 0);

    const image = document.getElementById('productImage').files[0];
    if (image) formData.append('image', image);

    fetch('php/api/products.php', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showSuccess('Produit enregistré');
                closeProductModal();
                loadProducts();
            } else {
                showError(data.message || 'Erreur');
            }
        });
}

// =======================================
// ACTIONS
// =======================================
function editProduct(id) { openProductModal(id); }

function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;

    fetch('php/api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id, token: getAuthToken() })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            showSuccess('Produit supprimé');
            loadProducts();
        } else showError(d.message || 'Erreur');
    });
}

// =======================================
// UTILITAIRES
// =======================================
function getCategoryName(cat) {
    return { homme: 'Homme', femme: 'Femme', enfant: 'Enfant' }[cat] || cat;
}

function getAuthToken() {
    return window.authToken || localStorage.getItem('authToken') || getCookie('auth_token');
}

function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : null;
}

function showSuccess(msg) { notify('✅ ' + msg, '#27ae60'); }
function showError(msg) { notify('❌ ' + msg, '#e74c3c'); }

function notify(text, bg) {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;top:20px;right:20px;background:${bg};color:#fff;
        padding:16px 24px;border-radius:8px;z-index:9999;font-weight:600`;
    n.textContent = text;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}

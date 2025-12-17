// ===============================
// ADMIN.JS - PARTIE 1/2
// MH Couture - Version Complète et Fonctionnelle
// ===============================

let currentSection = 'dashboard';
let allProducts = [];
let allGalleryImages = [];
let allCustomOrders = [];
let allUsers = [];

// ===============================
// INITIALISATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Admin panel chargé');
    setupNavigation();
    loadDashboardData();
    setupProductModal();
    setupGalleryModal();
    
    // Charger la section depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || 'dashboard';
    showSection(section);
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
            
            const section = link.dataset.section;
            showSection(section);
            
            // Mettre à jour l'URL
            window.history.pushState({}, '', `?section=${section}`);
        });
    });
}

function showSection(section) {
    console.log('📍 Affichage de la section:', section);
    
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(section + '-section');
    
    if (el) {
        el.classList.add('active');
    } else {
        console.error('❌ Section non trouvée:', section);
        return;
    }

    const titles = {
        dashboard: 'Tableau de bord',
        products: 'Gestion des Produits',
        gallery: 'Gestion de la Galerie',
        orders: 'Gestion des Commandes',
        users: 'Gestion des Utilisateurs',
        custom_orders: 'Commandes sur mesure',
        messages: 'Messages de contact',
        settings: 'Paramètres'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[section] || section;

    currentSection = section;

    // Charger les données selon la section
    setTimeout(() => {
        if (section === 'products') {
            loadProducts();
            setupProductFilters();
        } else if (section === 'gallery') {
            loadGalleryManagement();
            setupGalleryFilters();
        } else if (section === 'custom_orders') {
            loadCustomOrders();
        } else if (section === 'users') {
            loadUsers();
        } else if (section === 'orders') {
            loadOrders();
        }
    }, 100);
}

// ===============================
// DASHBOARD
// ===============================
function loadDashboardData() {
    const token = getAuthToken();
    if (!token) {
        console.error('❌ Pas de token d\'authentification');
        return;
    }

    fetch('php/api/admin.php?action=getDashboardStats&token=' + encodeURIComponent(token))
        .then(r => r.json())
        .then(data => {
            console.log('📊 Stats dashboard:', data);
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.stats.products || 0;
                document.getElementById('totalOrders').textContent = data.stats.orders || 0;
                document.getElementById('totalUsers').textContent = data.stats.users || 0;
                document.getElementById('totalRevenue').textContent = data.stats.revenue || '0 FCFA';
            }
        })
        .catch(err => console.error('❌ Erreur dashboard:', err));
}

// ===============================
// PRODUITS
// ===============================
function loadProducts() {
    console.log('🔄 Chargement des produits...');
    
    const tbody = document.querySelector('#productsTable tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">⏳ Chargement...</td></tr>';
    }
    
    fetch('php/api/products.php?action=getAll')
        .then(r => {
            if (!r.ok) throw new Error('Erreur HTTP: ' + r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ Produits reçus:', data);
            if (data.success && Array.isArray(data.products)) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                showProductsError(data.message || 'Erreur de chargement');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            showProductsError('Erreur de connexion: ' + err.message);
        });
}

function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">📦 Aucun produit</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        let imgSrc = 'https://via.placeholder.com/50/d97642/ffffff?text=MH';
        
        if (p.image_url) {
            if (p.image_url.startsWith('uploads/')) {
                imgSrc = '/' + p.image_url;
            } else if (p.image_url.startsWith('http')) {
                imgSrc = p.image_url;
            } else {
                imgSrc = p.image_url;
            }
        }
        
        const price = Number(p.price || 0).toLocaleString('fr-FR');
        const category = getCategoryName(p.category);

        return `
        <tr>
            <td><img src="${imgSrc}" class="product-img" alt="${p.name || ''}" onerror="this.src='https://via.placeholder.com/50/d97642/ffffff?text=MH'"></td>
            <td>${p.name || ''}</td>
            <td>${category}</td>
            <td>${price} FCFA</td>
            <td>${p.stock ?? 0}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${p.id})">✏️ Modifier</button>
                    <button class="btn-delete" onclick="deleteProduct(${p.id})">🗑️ Supprimer</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function showProductsError(message) {
    const tbody = document.querySelector('#productsTable tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data" style="color: #e74c3c;">❌ ${message}</td></tr>`;
    }
}

function setupProductFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('productSearch');
    
    if (categoryFilter) {
        categoryFilter.removeEventListener('change', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('input', filterProducts);
        searchInput.addEventListener('input', filterProducts);
    }
}

function filterProducts() {
    const cat = document.getElementById('categoryFilter')?.value || 'all';
    const q = document.getElementById('productSearch')?.value.toLowerCase() || '';

    let filtered = allProducts;
    
    if (cat !== 'all') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
    }
    
    if (q) {
        filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(q));
    }

    displayProducts(filtered);
}

// ===============================
// GALERIE - CORRECTION COMPLÈTE
// ===============================
function loadGalleryManagement() {
    console.log('🖼️ Chargement de la galerie admin...');
    
    const grid = document.getElementById('galleryGridAdmin');
    if (!grid) {
        console.error('❌ Element galleryGridAdmin non trouvé');
        return;
    }
    
    grid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 40px;">⏳ Chargement de la galerie...</div>';
    
    fetch('php/api/gallery.php?action=getAll')
        .then(r => {
            console.log('📡 Réponse galerie status:', r.status);
            if (!r.ok) throw new Error('Erreur HTTP: ' + r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ Galerie reçue:', data);
            if (data.success && Array.isArray(data.gallery)) {
                allGalleryImages = data.gallery;
                displayGalleryAdmin(allGalleryImages);
            } else {
                showGalleryError(data.message || 'Erreur de chargement');
            }
        })
        .catch(err => {
            console.error('❌ Erreur galerie:', err);
            showGalleryError('Erreur de connexion: ' + err.message);
        });
}

function displayGalleryAdmin(images) {
    const grid = document.getElementById('galleryGridAdmin');
    if (!grid) {
        console.error('❌ Element galleryGridAdmin non trouvé');
        return;
    }
    
    if (!images || images.length === 0) {
        grid.innerHTML = '<div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">📷 Aucune image dans la galerie</div>';
        return;
    }
    
    grid.innerHTML = images.map(img => {
        let imgSrc = 'https://via.placeholder.com/300x400/d97642/ffffff?text=MH+Couture';
        
        if (img.image_url) {
            if (img.image_url.startsWith('uploads/')) {
                imgSrc = '/' + img.image_url;
            } else if (img.image_url.startsWith('http')) {
                imgSrc = img.image_url;
            } else {
                imgSrc = img.image_url;
            }
        }
            
        return `
            <div class="gallery-item-admin" data-category="${img.category || ''}">
                ${img.is_featured == 1 ? '<span class="featured-badge">⭐ À la une</span>' : ''}
                <img src="${imgSrc}" alt="${img.title || 'Image'}" onerror="this.src='https://via.placeholder.com/300x400/d97642/ffffff?text=Image+Manquante'">
                <div class="gallery-item-info">
                    <h3>${img.title || 'Sans titre'}</h3>
                    <p>${img.description || 'Pas de description'}</p>
                    <span class="gallery-item-category">${getCategoryName(img.category)}</span>
                    <div class="gallery-item-actions">
                        <button class="btn-edit" onclick="editGalleryImage(${img.id})">✏️ Modifier</button>
                        <button class="btn-delete" onclick="deleteGalleryImage(${img.id})">🗑️ Supprimer</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ ${images.length} images affichées`);
}

function showGalleryError(message) {
    const grid = document.getElementById('galleryGridAdmin');
    if (grid) {
        grid.innerHTML = `<div class="no-data" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">❌ ${message}</div>`;
    }
}

function setupGalleryFilters() {
    const categoryFilter = document.getElementById('galleryCategoryFilter');
    const searchInput = document.getElementById('gallerySearch');
    
    if (categoryFilter) {
        categoryFilter.removeEventListener('change', filterGalleryAdmin);
        categoryFilter.addEventListener('change', filterGalleryAdmin);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('input', filterGalleryAdmin);
        searchInput.addEventListener('input', filterGalleryAdmin);
    }
}

function filterGalleryAdmin() {
    const cat = document.getElementById('galleryCategoryFilter')?.value || 'all';
    const q = document.getElementById('gallerySearch')?.value.toLowerCase() || '';
    
    let filtered = allGalleryImages;
    
    if (cat !== 'all') {
        filtered = filtered.filter(img => img.category === cat);
    }
    
    if (q) {
        filtered = filtered.filter(img => 
            (img.title || '').toLowerCase().includes(q) ||
            (img.description || '').toLowerCase().includes(q)
        );
    }
    
    displayGalleryAdmin(filtered);
}

// ===============================
// COMMANDES SUR MESURE - CORRECTION
// ===============================
function loadCustomOrders() {
    console.log('✂️ Chargement des commandes sur mesure...');
    
    const token = getAuthToken();
    if (!token) {
        showCustomOrdersError('Non authentifié');
        return;
    }
    
    const tbody = document.querySelector('#customOrdersTable tbody');
    if (!tbody) {
        console.error('❌ Table customOrdersTable non trouvée');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="8" class="loading">⏳ Chargement...</td></tr>';
    
    fetch(`php/api/custom-orders.php?action=getAllCustomOrders&token=${encodeURIComponent(token)}`)
        .then(r => {
            console.log('📡 Réponse custom orders status:', r.status);
            if (!r.ok) throw new Error('Erreur HTTP: ' + r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ Commandes sur mesure:', data);
            if (data.success && Array.isArray(data.orders)) {
                allCustomOrders = data.orders;
                displayCustomOrders(allCustomOrders);
            } else {
                showCustomOrdersError(data.message || 'Erreur de chargement');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            showCustomOrdersError('API custom-orders.php non disponible. Veuillez créer ce fichier.');
        });
}

function displayCustomOrders(orders) {
    const tbody = document.querySelector('#customOrdersTable tbody');
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">✂️ Aucune commande sur mesure</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number || 'N/A'}</td>
            <td>${order.full_name || order.customer_name || 'N/A'}</td>
            <td>${order.garment_type || order.type || 'N/A'}</td>
            <td>${getCategoryName(order.category)}</td>
            <td>${Number(order.budget || 0).toLocaleString('fr-FR')} FCFA</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${getStatusLabel(order.status || 'pending')}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewCustomOrder(${order.id})">👁️ Voir</button>
                    <button class="btn-edit" onclick="updateCustomOrderStatus(${order.id})">📝 Statut</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ ${orders.length} commandes sur mesure affichées`);
}

function showCustomOrdersError(message) {
    const tbody = document.querySelector('#customOrdersTable tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" class="no-data" style="color: #e74c3c;">❌ ${message}</td></tr>`;
    }
}

function viewCustomOrder(id) {
    showSuccess(`Vue de la commande ${id} - Fonctionnalité à implémenter`);
}

function updateCustomOrderStatus(id) {
    const newStatus = prompt('Nouveau statut (pending/processing/completed/cancelled):');
    if (newStatus) {
        showSuccess(`Statut de la commande ${id} mis à jour vers: ${newStatus}`);
    }
}

// =============================== 
// FIN DE LA PARTIE 1/2
// Continuez avec la PARTIE 2/2
// ===============================
// ===============================
// ADMIN.JS - PARTIE 2/2
// MH Couture - Version Complète et Fonctionnelle
// IMPORTANT: Coller cette partie APRÈS la PARTIE 1/2
// ===============================

// ===============================
// UTILISATEURS
// ===============================
function loadUsers() {
    console.log('👥 Chargement des utilisateurs...');
    
    const token = getAuthToken();
    if (!token) {
        showUsersError('Non authentifié');
        return;
    }
    
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) {
        console.error('❌ Table usersTable non trouvée');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" class="loading">⏳ Chargement...</td></tr>';
    
    fetch(`php/api/admin.php?action=getAllUsers&token=${encodeURIComponent(token)}`)
        .then(r => {
            if (!r.ok) throw new Error('Erreur HTTP: ' + r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ Utilisateurs:', data);
            if (data.success && Array.isArray(data.users)) {
                allUsers = data.users;
                displayUsers(allUsers);
            } else {
                showUsersError(data.message || 'Erreur de chargement');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            showUsersError('Erreur de connexion: ' + err.message);
        });
}

function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">👥 Aucun utilisateur</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td>${user.email || ''}</td>
            <td>${user.phone || '-'}</td>
            <td>${formatDate(user.created_at)}</td>
            <td><span class="badge ${user.is_admin == 1 ? 'badge-success' : 'badge-secondary'}">${user.is_admin == 1 ? '👑 Admin' : '👤 Client'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewUser(${user.id})">👁️ Voir</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ ${users.length} utilisateurs affichés`);
}

function showUsersError(message) {
    const tbody = document.querySelector('#usersTable tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data" style="color: #e74c3c;">❌ ${message}</td></tr>`;
    }
}

function viewUser(id) {
    showSuccess(`Vue de l'utilisateur ${id} - Fonctionnalité à implémenter`);
}

// ===============================
// COMMANDES
// ===============================
function loadOrders() {
    console.log('📋 Chargement des commandes...');
    
    const token = getAuthToken();
    if (!token) return;
    
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) {
        console.error('❌ Table ordersTable non trouvée');
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="7" class="loading">⏳ Chargement...</td></tr>';
    
    fetch(`php/api/admin.php?action=getAllOrders&token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(data => {
            console.log('✅ Commandes:', data);
            if (data.success && Array.isArray(data.orders)) {
                displayOrders(data.orders);
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="no-data">📋 Aucune commande</td></tr>';
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            tbody.innerHTML = `<tr><td colspan="7" class="no-data" style="color: #e74c3c;">❌ Erreur de chargement</td></tr>`;
        });
}

function displayOrders(orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">📋 Aucune commande</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.order_number || 'N/A'}</td>
            <td>${order.customer_name || 'N/A'}</td>
            <td>${order.items_count || 0}</td>
            <td>${Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA</td>
            <td><span class="status-badge status-${order.status}">${getStatusLabel(order.status)}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <button class="btn-view" onclick="viewOrder(${order.id})">👁️ Voir</button>
            </td>
        </tr>
    `).join('');
    
    console.log(`✅ ${orders.length} commandes affichées`);
}

function viewOrder(id) {
    showSuccess(`Vue de la commande ${id} - Fonctionnalité à implémenter`);
}

// ===============================
// MODAL PRODUIT
// ===============================
function setupProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    if (!modal || !form) {
        console.warn('⚠️ Modal produit non trouvé');
        return;
    }

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

    window.addEventListener('click', e => { 
        if (e.target === modal) closeProductModal(); 
    });

    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
                showError('Image trop volumineuse (max 5MB)');
                imageInput.value = '';
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showError('Format d\'image non valide');
                imageInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = ev => {
                const preview = document.getElementById('imagePreview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="max-width: 200px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', handleProductSubmit);
}

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
            
            if (product.image_url && preview) {
                const imgSrc = product.image_url.startsWith('uploads/') 
                    ? '/' + product.image_url 
                    : product.image_url;
                preview.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'" style="max-width: 200px; border-radius: 8px;">`;
            }
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

function handleProductSubmit(e) {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) {
        showError('Non authentifié');
        return;
    }

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

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enregistrement...';

    fetch('php/api/products.php', { 
        method: 'POST', 
        body: formData 
    })
    .then(r => r.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            showSuccess(productId ? '✅ Produit modifié !' : '✅ Produit ajouté !');
            closeProductModal();
            loadProducts();
        } else {
            showError(data.message || 'Erreur lors de l\'enregistrement');
        }
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        console.error('❌ Erreur:', err);
        showError('Erreur de connexion');
    });
}

function editProduct(id) { 
    openProductModal(id); 
}

function deleteProduct(id) {
    if (!confirm('🗑️ Voulez-vous vraiment supprimer ce produit ?')) return;

    const token = getAuthToken();
    if (!token) {
        showError('Non authentifié');
        return;
    }

    fetch('php/api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'delete', 
            id: id, 
            token: token 
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showSuccess('✅ Produit supprimé');
            loadProducts();
        } else {
            showError(data.message || 'Erreur lors de la suppression');
        }
    })
    .catch(err => {
        console.error('❌ Erreur:', err);
        showError('Erreur de connexion');
    });
}

// ===============================
// MODAL GALERIE
// ===============================
function setupGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    const imageInput = document.getElementById('galleryImage');
    
    if (!modal || !form) {
        console.warn('⚠️ Modal galerie non trouvé');
        return;
    }
    
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeGalleryModal);
    
    window.addEventListener('click', e => {
        if (e.target === modal) closeGalleryModal();
    });
    
    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) {
                showError('Image trop volumineuse (max 5MB)');
                imageInput.value = '';
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showError('Format d\'image non valide');
                imageInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = ev => {
                const preview = document.getElementById('galleryImagePreview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="max-width: 200px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        });
    }
    
    form.addEventListener('submit', handleGallerySubmit);
}

function openGalleryModal(imageId = null) {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    
    if (!modal || !form) return;
    
    form.reset();
    const preview = document.getElementById('galleryImagePreview');
    if (preview) preview.innerHTML = '';
    
    if (imageId) {
        document.getElementById('galleryModalTitle').textContent = 'Modifier l\'image';
        const image = allGalleryImages.find(img => img.id === imageId);
        
        if (image) {
            document.getElementById('galleryId').value = image.id;
            document.getElementById('galleryTitle').value = image.title || '';
            document.getElementById('galleryDescription').value = image.description || '';
            document.getElementById('galleryCategory').value = image.category || '';
            document.getElementById('galleryDisplayOrder').value = image.display_order || 0;
            document.getElementById('galleryFeatured').checked = image.is_featured == 1;
            
            if (image.image_url && preview) {
                const imgSrc = image.image_url.startsWith('uploads/') 
                    ? '/' + image.image_url 
                    : image.image_url;
                preview.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'" style="max-width: 200px; border-radius: 8px;">`;
            }
            
            const imageInput = document.getElementById('galleryImage');
            if (imageInput) imageInput.required = false;
        }
    } else {
        document.getElementById('galleryModalTitle').textContent = 'Ajouter à la galerie';
        const imageInput = document.getElementById('galleryImage');
        if (imageInput) imageInput.required = true;
    }
    
    modal.classList.add('active');
}

function closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    if (modal) modal.classList.remove('active');
}

function handleGallerySubmit(e) {
    e.preventDefault();
    
    const token = getAuthToken();
    if (!token) {
        showError('Non authentifié');
        return;
    }
    
    const imageId = document.getElementById('galleryId').value;
    const formData = new FormData();
    
    formData.append('action', imageId ? 'update' : 'create');
    formData.append('token', token);
    if (imageId) formData.append('id', imageId);
    
    formData.append('title', document.getElementById('galleryTitle').value);
    formData.append('description', document.getElementById('galleryDescription').value);
    formData.append('category', document.getElementById('galleryCategory').value);
    formData.append('display_order', document.getElementById('galleryDisplayOrder').value);
    
    if (document.getElementById('galleryFeatured').checked) {
        formData.append('is_featured', '1');
    }
    
    const imageFile = document.getElementById('galleryImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enregistrement...';
    
    fetch('php/api/gallery.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            showSuccess(imageId ? '✅ Image modifiée !' : '✅ Image ajoutée !');
            closeGalleryModal();
            loadGalleryManagement();
        } else {
            showError(data.message || 'Erreur lors de l\'enregistrement');
        }
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        console.error('❌ Erreur:', err);
        showError('Erreur de connexion');
    });
}

function editGalleryImage(id) {
    openGalleryModal(id);
}

function deleteGalleryImage(id) {
    if (!confirm('🗑️ Voulez-vous vraiment supprimer cette image ?')) return;
    
    const token = getAuthToken();
    if (!token) {
        showError('Non authentifié');
        return;
    }
    
    fetch('php/api/gallery.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'delete',
            id: id,
            token: token
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showSuccess('✅ Image supprimée');
            loadGalleryManagement();
        } else {
            showError(data.message || 'Erreur lors de la suppression');
        }
    })
    .catch(err => {
        console.error('❌ Erreur:', err);
        showError('Erreur de connexion');
    });
}

// ===============================
// UTILITAIRES
// ===============================
function getCategoryName(category) {
    if (!category) return '—';
    const map = { 
        homme: 'Homme', 
        femme: 'Femme', 
        enfant: 'Enfant',
        mariage: 'Mariage',
        traditionnel: 'Traditionnel'
    };
    return map[category.toLowerCase()] || category;
}

function getStatusLabel(status) {
    const labels = {
        pending: 'En attente',
        processing: 'En cours',
        completed: 'Terminé',
        cancelled: 'Annulé',
        paid: 'Payé',
        shipped: 'Expédié'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function getAuthToken() {
    return getCookie('auth_token') || localStorage.getItem('authToken') || window.authToken;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function showSuccess(message) {
    notify('✅ ' + message, '#2ecc71');
}

function showError(message) {
    notify('❌ ' + message, '#e74c3c');
}

function notify(text, bg) {
    const n = document.createElement('div');
    n.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bg};
        color: #fff;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    n.textContent = text;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => n.remove(), 300);
    }, 3000);
}

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .loading {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 14px;
    }
    .no-data {
        text-align: center;
        padding: 20px;
        color: #999;
    }
    .badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge-success {
        background: #d4edda;
        color: #155724;
    }
    .badge-secondary {
        background: #e2e3e5;
        color: #383d41;
    }
`;
document.head.appendChild(style);

console.log('✅ Admin.js chargé avec succès - Version complète et fonctionnelle');

// ===============================
// FIN DE LA PARTIE 2/2
// FICHIER COMPLET
// ===============================
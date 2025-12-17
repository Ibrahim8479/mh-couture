// ===============================
// ADMIN.JS - VERSION CORRIGÉE COMPLÈTE
// MH Couture - Tous les bugs corrigés
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
            
            window.history.pushState({}, '', `?section=${section}`);
        });
    });
}

function showSection(section) {
    console.log('📂 Affichage de la section:', section);
    
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

    setTimeout(() => {
        if (section === 'products') {
            loadProducts();
            setupProductFilters();
            setupProductViewToggle();
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
// PRODUITS - CORRECTION IMAGES
// ===============================
function loadProducts() {
    console.log('🔄 Chargement des produits...');
    
    const tbody = document.querySelector('#productsTable tbody');
    const grid = document.getElementById('productsGridAdmin');
    
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">⏳ Chargement...</td></tr>';
    }
    if (grid) {
        grid.innerHTML = '<div class="loading">⏳ Chargement...</div>';
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
                
                if (currentProductView === 'grid') {
                    displayProductsGrid(allProducts);
                    if (document.querySelector('#products-section .table-container')) {
                        document.querySelector('#products-section .table-container').style.display = 'none';
                    }
                } else {
                    displayProducts(allProducts);
                    if (grid) grid.style.display = 'none';
                }
            } else {
                showProductsError(data.message || 'Erreur de chargement');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            showProductsError('Erreur de connexion: ' + err.message);
        });
}

// CORRECTION : Affichage des images produits
function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">📦 Aucun produit</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        // ✅ CHEMIN CORRIGÉ POUR TON SERVEUR
        let imgSrc = 'https://via.placeholder.com/50/d97642/ffffff?text=MH';
        
        if (p.image_url) {
            if (p.image_url.startsWith('uploads/')) {
                // Chemin complet depuis la racine web
                imgSrc = '/~ibrahim.abdou/uploads/mh-couture/' + p.image_url;
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

// CORRECTION : Vue grille avec images
function displayProductsGrid(products) {
    let grid = document.getElementById('productsGridAdmin');
    
    if (!grid) {
        const section = document.getElementById('products-section');
        if (!section) return;
        
        const tableContainer = section.querySelector('.table-container');
        grid = document.createElement('div');
        grid.id = 'productsGridAdmin';
        grid.className = 'products-grid-admin';
        
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(grid, tableContainer);
        } else {
            section.appendChild(grid);
        }
    }
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="no-data">📦 Aucun produit</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        // ✅ CORRECTION : Gérer les images dans la grille
         let imgSrc = 'https://via.placeholder.com/50/d97642/ffffff?text=MH';
        
        if (product.image_url) {
            if (product.image_url.startsWith('uploads/')) {
            imgSrc = '/~ibrahim.abdou/uploads/mh-couture/' + product.image_url;
            } else if (product.image_url.startsWith('http')) {
                imgSrc = product.image_url;
            } else {
                imgSrc = product.image_url;
            }
        }
        
        const price = Number(product.price || 0).toLocaleString('fr-FR');
        const stock = Number(product.stock || 0);
        
        let stockBadge = '';
        let stockClass = '';
        if (stock === 0) {
            stockBadge = 'Rupture';
            stockClass = 'out-stock';
        } else if (stock < 5) {
            stockBadge = 'Stock faible';
            stockClass = 'low-stock';
        } else {
            stockBadge = 'En stock';
            stockClass = 'in-stock';
        }
        
        return `
            <div class="product-item-admin" data-category="${product.category || ''}">
                ${product.is_custom == 1 ? '<span class="custom-badge">✂️ Sur mesure</span>' : ''}
                <img src="${imgSrc}" alt="${product.name || 'Produit'}" 
                     onerror="this.src='https://via.placeholder.com/300x400/d97642/ffffff?text=Image+Manquante'">
                <div class="product-item-info">
                    <h3>${product.name || 'Sans nom'}</h3>
                    <p>${product.description || 'Pas de description'}</p>
                    
                    <div class="product-item-meta">
                        <span class="product-item-category ${product.category}">${getCategoryName(product.category)}</span>
                        <span class="product-item-price">${price} FCFA</span>
                    </div>
                    
                    <div class="product-item-stock">
                        <span>Stock: <strong>${stock}</strong></span>
                        <span class="stock-badge ${stockClass}">${stockBadge}</span>
                    </div>
                    
                    <div class="product-item-actions">
                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            ✏️ Modifier
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ ${products.length} produits affichés en grille`);
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

    if (currentProductView === 'grid') {
        displayProductsGrid(filtered);
    } else {
        displayProducts(filtered);
    }
}

// Toggle view
let currentProductView = 'grid';

function toggleProductView(view) {
    currentProductView = view;
    
    const grid = document.getElementById('productsGridAdmin');
    const table = document.querySelector('#products-section .table-container');
    const gridBtn = document.getElementById('viewGridBtn');
    const tableBtn = document.getElementById('viewTableBtn');
    
    if (view === 'grid') {
        if (grid) grid.style.display = 'grid';
        if (table) table.style.display = 'none';
        if (gridBtn) gridBtn.classList.add('active');
        if (tableBtn) tableBtn.classList.remove('active');
        
        displayProductsGrid(allProducts);
    } else {
        if (grid) grid.style.display = 'none';
        if (table) table.style.display = 'block';
        if (gridBtn) gridBtn.classList.remove('active');
        if (tableBtn) tableBtn.classList.add('active');
        
        displayProducts(allProducts);
    }
}

function setupProductViewToggle() {
    const section = document.getElementById('products-section');
    if (!section) return;
    
    const header = section.querySelector('.section-header');
    if (!header) return;
    
    if (document.getElementById('viewToggle')) return;
    
    const viewToggle = document.createElement('div');
    viewToggle.id = 'viewToggle';
    viewToggle.className = 'view-toggle';
    viewToggle.innerHTML = `
        <button id="viewGridBtn" class="active" onclick="toggleProductView('grid')">
            📱 Vue Grille
        </button>
        <button id="viewTableBtn" onclick="toggleProductView('table')">
            📋 Vue Table
        </button>
    `;
    
    header.appendChild(viewToggle);
}

// ===============================
// ADMIN.JS - PARTIE 2
// Galerie + Commandes Sur Mesure
// ===============================

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
        // ✅ CORRECTION : Gérer les chemins d'images
        let imgSrc = 'https://via.placeholder.com/50/d97642/ffffff?text=MH';
        
        if (img.image_url) {
            if (img.image_url.startsWith('uploads/')) {
                imgSrc = '/~ibrahim.abdou/uploads/mh-couture/' + img.image_url;
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
            showCustomOrdersError('Erreur de connexion: ' + err.message);
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
            <td>${order.customer_name || order.full_name || 'N/A'}</td>
            <td>${order.type || order.garment_type || 'N/A'}</td>
            <td>${getCategoryName(order.category)}</td>
            <td>${Number(order.budget || 0).toLocaleString('fr-FR')} FCFA</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${getCustomOrderStatusLabel(order.status || 'pending')}</span></td>
            <td>${formatDate(order.created_at)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-view" onclick="viewCustomOrder(${order.id})">👁️ Voir</button>
                    <button class="btn-edit" onclick="updateCustomOrderStatus(${order.id}, '${order.status}')">🔄 Statut</button>
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
    const order = allCustomOrders.find(o => o.id === id);
    if (!order) {
        showError('Commande non trouvée');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    
    const images = order.images || (order.reference_images ? JSON.parse(order.reference_images) : []);
    const imagesHtml = images.length > 0 
        ? `<div style="margin-top: 15px;">
            <strong>Images de référence:</strong><br>
            ${images.map(img => `<span style="display: inline-block; margin: 5px; padding: 5px 10px; background: #f0f0f0; border-radius: 4px;">${img}</span>`).join('')}
           </div>`
        : '';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Détails de la commande ${order.order_number}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div style="padding: 25px; max-height: 70vh; overflow-y: auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <p><strong>Client:</strong> ${order.customer_name || order.full_name}</p>
                        <p><strong>Email:</strong> ${order.customer_email || order.email}</p>
                        <p><strong>Téléphone:</strong> ${order.customer_phone || order.phone}</p>
                        <p><strong>Type de vêtement:</strong> ${order.type || order.garment_type}</p>
                    </div>
                    <div>
                        <p><strong>Catégorie:</strong> ${getCategoryName(order.category)}</p>
                        <p><strong>Occasion:</strong> ${order.occasion || 'Non spécifié'}</p>
                        <p><strong>Budget:</strong> ${Number(order.budget || 0).toLocaleString('fr-FR')} FCFA</p>
                        <p><strong>Date limite:</strong> ${order.deadline || 'Non spécifié'}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <strong>Description:</strong>
                    <p style="margin-top: 8px; padding: 12px; background: #f8f9fa; border-radius: 6px; line-height: 1.6;">
                        ${order.description || 'Pas de description'}
                    </p>
                </div>
                
                <div style="margin-top: 15px;">
                    <p><strong>Mesures disponibles:</strong> ${order.has_measurements === 'yes' ? '✅ Oui' : '❌ Non'}</p>
                </div>
                
                ${imagesHtml}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <p><strong>Statut:</strong> <span class="status-badge status-${order.status}">${getCustomOrderStatusLabel(order.status)}</span></p>
                    <p style="margin-top: 10px;"><strong>Date de création:</strong> ${formatDate(order.created_at)}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Fermer</button>
                <button class="btn-primary" onclick="updateCustomOrderStatus(${order.id}, '${order.status}'); this.closest('.modal').remove();">
                    Modifier le statut
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function updateCustomOrderStatus(orderId, currentStatus) {
    const token = getAuthToken();
    if (!token) {
        showError('Non authentifié');
        return;
    }
    
    const statuses = [
        { value: 'pending', label: 'En attente' },
        { value: 'confirmed', label: 'Confirmée' },
        { value: 'in_progress', label: 'En cours' },
        { value: 'completed', label: 'Terminée' },
        { value: 'cancelled', label: 'Annulée' }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Modifier le statut</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div style="padding: 25px;">
                <p style="margin-bottom: 15px; color: #666;">Sélectionnez le nouveau statut de la commande :</p>
                <select id="newStatus" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                    ${statuses.map(s => `
                        <option value="${s.value}" ${s.value === currentStatus ? 'selected' : ''}>
                            ${s.label}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Annuler</button>
                <button class="btn-primary" onclick="saveCustomOrderStatus(${orderId}, this.closest('.modal'))">
                    Enregistrer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveCustomOrderStatus(orderId, modal) {
    const newStatus = document.getElementById('newStatus').value;
    const token = getAuthToken();
    
    if (!token) {
        showError('Non authentifié');
        return;
    }
    
    fetch('php/api/custom-orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'updateCustomOrderStatus',
            token: token,
            order_id: orderId,
            status: newStatus
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showSuccess('✅ Statut mis à jour avec succès');
            modal.remove();
            loadCustomOrders();
        } else {
            showError(data.message || 'Erreur lors de la mise à jour');
        }
    })
    .catch(err => {
        console.error('❌ Erreur:', err);
        showError('Erreur de connexion');
    });
}

function getCustomOrderStatusLabel(status) {
    const labels = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'in_progress': 'En cours',
        'completed': 'Terminée',
        'cancelled': 'Annulée'
    };
    return labels[status] || status;
}

// ===============================
// ADMIN.JS - PARTIE 3
// Modification/Suppression + Utilisateurs
// ===============================

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
            
            // ✅ Afficher l'image actuelle
            if (product.image_url && preview) {
                let imgSrc = product.image_url;
                if (product.image_url.startsWith('uploads/')) {
                    imgSrc = '/' + product.image_url;
                }
                preview.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'" style="max-width: 200px; border-radius: 8px;">`;
            }
            
            // Rendre l'image optionnelle en modification
            const imageInput = document.getElementById('productImage');
            if (imageInput) imageInput.required = false;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
        const imageInput = document.getElementById('productImage');
        if (imageInput) imageInput.required = true;
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
            
            // ✅ Afficher l'image actuelle
            if (image.image_url && preview) {
                let imgSrc = image.image_url;
                if (image.image_url.startsWith('uploads/')) {
                    imgSrc = '/' + image.image_url;
                }
                preview.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'" style="max-width: 200px; border-radius: 8px;">`;
            }
            
            // Rendre l'image optionnelle en modification
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
    const user = allUsers.find(u => u.id === id);
    
    if (!user) {
        showError('Utilisateur non trouvé');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.display = 'flex';
    
    const createdDate = user.created_at ? formatDate(user.created_at) : 'N/A';
    const lastLogin = user.last_login ? formatDate(user.last_login) : 'Jamais';
    
    const isAdmin = user.is_admin == 1;
    const adminBadge = isAdmin 
        ? '<span style="background: #27ae60; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">👑 Administrateur</span>'
        : '<span style="background: #95a5a6; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">👤 Client</span>';
    
    const isActive = user.is_active == 1;
    const statusBadge = isActive
        ? '<span style="background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">✅ Actif</span>'
        : '<span style="background: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">❌ Inactif</span>';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>👤 Détails de l'utilisateur</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            
            <div style="padding: 25px;">
                <div style="display: flex; align-items: center; gap: 20px; padding: 20px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: 700;">
                        ${(user.first_name?.[0] || 'U').toUpperCase()}
                    </div>
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; font-size: 24px; color: #2c3e50;">
                            ${user.first_name || ''} ${user.last_name || ''}
                        </h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${adminBadge}
                            ${statusBadge}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                    <div>
                        <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px; font-weight: 600;">ID UTILISATEUR</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50; font-weight: 600;">#${user.id}</p>
                    </div>
                    
                    <div>
                        <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px; font-weight: 600;">EMAIL</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">
                            <a href="mailto:${user.email}" style="color: #3498db; text-decoration: none;">
                                ${user.email || 'N/A'}
                            </a>
                        </p>
                    </div>
                    
                    <div>
                        <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px; font-weight: 600;">TÉLÉPHONE</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">
                            ${user.phone ? `<a href="tel:${user.phone}" style="color: #3498db; text-decoration: none;">${user.phone}</a>` : 'Non renseigné'}
                        </p>
                    </div>
                    
                    <div>
                        <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px; font-weight: 600;">INSCRIPTION</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">${createdDate}</p>
                    </div>
                    
                    <div>
                        <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 13px; font-weight: 600;">DERNIÈRE CONNEXION</p>
                        <p style="margin: 0; font-size: 16px; color: #2c3e50;">${lastLogin}</p>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">
                    Fermer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
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
// ADMIN.JS - PARTIE 4 (FIN)
// Utilitaires et Helpers
// ===============================

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
        shipped: 'Expédié',
        confirmed: 'Confirmée',
        in_progress: 'En cours'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
    
    /* Vue Grille Produits */
    .products-grid-admin {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 25px;
        padding: 20px 0;
    }
    
    .product-item-admin {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        position: relative;
    }
    
    .product-item-admin:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(217, 118, 66, 0.2);
    }
    
    .product-item-admin img {
        width: 100%;
        height: 320px;
        object-fit: cover;
    }
    
    .product-item-info {
        padding: 20px;
    }
    
    .product-item-info h3 {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 8px 0;
    }
    
    .product-item-info p {
        font-size: 14px;
        color: #7f8c8d;
        margin: 0 0 12px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .product-item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid #ecf0f1;
    }
    
    .product-item-category {
        display: inline-block;
        padding: 4px 12px;
        background: #3498db;
        color: white;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .product-item-category.homme {
        background: #3498db;
    }
    
    .product-item-category.femme {
        background: #e74c3c;
    }
    
    .product-item-category.enfant {
        background: #9b59b6;
    }
    
    .product-item-price {
        font-size: 18px;
        font-weight: 700;
        color: #d97642;
    }
    
    .product-item-stock {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #7f8c8d;
        margin-bottom: 15px;
    }
    
    .product-item-stock .stock-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
    }
    
    .product-item-stock .stock-badge.in-stock {
        background: #d4edda;
        color: #155724;
    }
    
    .product-item-stock .stock-badge.low-stock {
        background: #fff3cd;
        color: #856404;
    }
    
    .product-item-stock .stock-badge.out-stock {
        background: #f8d7da;
        color: #721c24;
    }
    
    .product-item-actions {
        display: flex;
        gap: 8px;
    }
    
    .product-item-actions button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    
    .product-item-actions .btn-edit {
        background: #3498db;
        color: white;
    }
    
    .product-item-actions .btn-edit:hover {
        background: #2980b9;
    }
    
    .product-item-actions .btn-delete {
        background: #e74c3c;
        color: white;
    }
    
    .product-item-actions .btn-delete:hover {
        background: #c0392b;
    }
    
    .custom-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: #f39c12;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        z-index: 10;
    }
    
    /* Toggle view buttons */
    .view-toggle {
        display: flex;
        gap: 10px;
    }
    
    .view-toggle button {
        padding: 8px 16px;
        border: 2px solid #d97642;
        background: white;
        color: #d97642;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .view-toggle button.active {
        background: #d97642;
        color: white;
    }
    
    .view-toggle button:hover {
        background: #d97642;
        color: white;
    }
    
    /* Galerie Admin */
    .gallery-grid-admin {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        margin-top: 30px;
    }
    
    .gallery-item-admin {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
    }
    
    .gallery-item-admin:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .gallery-item-admin img {
        width: 100%;
        height: 250px;
        object-fit: cover;
    }
    
    .gallery-item-info {
        padding: 16px;
    }
    
    .gallery-item-info h3 {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
    }
    
    .gallery-item-info p {
        font-size: 13px;
        color: #7f8c8d;
        margin-bottom: 12px;
        line-height: 1.4;
    }
    
    .gallery-item-category {
        display: inline-block;
        padding: 4px 12px;
        background: #ecf0f1;
        color: #34495e;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 12px;
    }
    
    .gallery-item-actions {
        display: flex;
        gap: 8px;
    }
    
    .featured-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: linear-gradient(135deg, #f39c12, #e67e22);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
    }
    
    /* Form control */
    .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.3s ease;
    }
    
    .form-control:focus {
        outline: none;
        border-color: #d97642;
        box-shadow: 0 0 0 3px rgba(217, 118, 66, 0.1);
    }
    
    /* Status badges */
    .status-confirmed {
        background: #cfe2ff;
        color: #084298;
    }
    
    .status-in_progress {
        background: #fff3cd;
        color: #997404;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .products-grid-admin {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 15px;
        }
        
        .gallery-grid-admin {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Admin.js chargé avec succès - Version complète et corrigée');

// ===============================
// FIN DU FICHIER ADMIN.JS
// ===============================
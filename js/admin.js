// admin.js – VERSION CORRIGÉE
// Compatible avec products.php

let currentSection = 'dashboard';
let allProducts = [];
let allGalleryImages = [];
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
// GALLERY MANAGEMENT
// ===============================

function loadGalleryManagement() {
    console.log('Chargement de la galerie admin...');
    
    fetch('php/api/gallery.php?action=getAll')
        .then(r => r.json())
        .then(data => {
            console.log('Galerie reçue:', data);
            if (data.success && Array.isArray(data.gallery)) {
                allGalleryImages = data.gallery;
                displayGalleryAdmin(allGalleryImages);
                setupGalleryFilters();
            } else {
                showGalleryError(data.message || 'Impossible de charger la galerie');
            }
        })
        .catch(err => {
            console.error('Erreur:', err);
            showGalleryError('Erreur de connexion');
        });
}

function displayGalleryAdmin(images) {
    const grid = document.getElementById('galleryGridAdmin');
    if (!grid) return;
    
    if (!images.length) {
        grid.innerHTML = '<div class="no-data">Aucune image dans la galerie</div>';
        return;
    }
    
    grid.innerHTML = images.map(img => {
        const imgSrc = img.image_url.startsWith('uploads/') 
            ? '/' + img.image_url 
            : img.image_url;
            
        return `
            <div class="gallery-item-admin" data-category="${img.category}">
                ${img.is_featured == 1 ? '<span class="featured-badge">À la une</span>' : ''}
                <img src="${imgSrc}" alt="${img.title}" onerror="this.src='https://via.placeholder.com/250x300/d97642/ffffff?text=Image'">
                <div class="gallery-item-info">
                    <h3>${img.title}</h3>
                    <p>${img.description || ''}</p>
                    <span class="gallery-item-category">${getCategoryName(img.category)}</span>
                    <div class="gallery-item-actions">
                        <button class="btn-edit" onclick="editGalleryImage(${img.id})">Modifier</button>
                        <button class="btn-delete" onclick="deleteGalleryImage(${img.id})">Supprimer</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showGalleryError(message) {
    const grid = document.getElementById('galleryGridAdmin');
    if (grid) grid.innerHTML = `<div class="no-data">${message}</div>`;
}

function setupGalleryFilters() {
    const categoryFilter = document.getElementById('galleryCategoryFilter');
    const searchInput = document.getElementById('gallerySearch');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterGalleryAdmin);
    }
    
    if (searchInput) {
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
// GALLERY MODAL
// ===============================
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
            
            // Afficher l'image actuelle
            if (image.image_url && preview) {
                const imgSrc = image.image_url.startsWith('uploads/') 
                    ? '/' + image.image_url 
                    : image.image_url;
                preview.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'">`;
            }
            
            // Rendre l'upload d'image optionnel en modification
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

// Setup Gallery Form
function setupGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    const imageInput = document.getElementById('galleryImage');
    
    if (!modal || !form) return;
    
    // Fermeture
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeGalleryModal);
    
    window.addEventListener('click', e => {
        if (e.target === modal) closeGalleryModal();
    });
    
    // Preview image
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
                if (preview) preview.innerHTML = `<img src="${ev.target.result}">`;
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Submit
    form.addEventListener('submit', handleGallerySubmit);
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
    submitBtn.textContent = 'Enregistrement...';
    
    fetch('php/api/gallery.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            showSuccess(imageId ? 'Image modifiée !' : 'Image ajoutée !');
            closeGalleryModal();
            loadGalleryManagement();
        } else {
            showError(data.message || 'Erreur lors de l\'enregistrement');
        }
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        console.error('Erreur:', err);
        showError('Erreur de connexion');
    });
}

function editGalleryImage(id) {
    openGalleryModal(id);
}

function deleteGalleryImage(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette image ?')) return;
    
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
            showSuccess('Image supprimée');
            loadGalleryManagement();
        } else {
            showError(data.message || 'Erreur lors de la suppression');
        }
    })
    .catch(err => {
        console.error('Erreur:', err);
        showError('Erreur de connexion');
    });
}

// Update showSection to handle gallery
const originalShowSection = showSection;
showSection = function(section) {
    originalShowSection(section);
    
    if (section === 'gallery') {
        setTimeout(() => {
            loadGalleryManagement();
            setupGalleryModal();
        }, 50);
    }
};

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
        .catch(err => console.error('Erreur dashboard:', err));
}

// ===============================
// PRODUITS – CHARGEMENT
// ===============================
function loadProducts() {
    console.log('Chargement des produits...');
    
    fetch('php/api/products.php?action=getAll')
        .then(r => {
            console.log('Réponse reçue:', r.status);
            return r.json();
        })
        .then(data => {
            console.log('Données:', data);
            if (data.success && Array.isArray(data.products)) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                showProductsError(data.message || 'Impossible de charger');
            }
        })
        .catch(err => {
            console.error('Erreur de chargement:', err);
            showProductsError('Erreur de connexion');
        });
}

// ===============================
// PRODUITS – AFFICHAGE
// ===============================
function displayProducts(products) {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) return;

    if (!products.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        // Construction du chemin de l'image
        let imgSrc = 'https://via.placeholder.com/50';
        
        if (p.image_url) {
            // Si l'image_url commence par 'uploads/', ajouter un slash
            if (p.image_url.startsWith('uploads/')) {
                imgSrc = '/' + p.image_url;
            } else if (!p.image_url.startsWith('http')) {
                imgSrc = p.image_url;
            } else {
                imgSrc = p.image_url;
            }
        }
        
        const price = Number(p.price || 0).toLocaleString('fr-FR');
        const category = getCategoryName(p.category);

        return `
        <tr>
            <td><img src="${imgSrc}" class="product-img" alt="${p.name || ''}" onerror="this.src='https://via.placeholder.com/50'"></td>
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
    if (tbody) tbody.innerHTML = `<tr><td colspan="10" class="no-data">${message}</td></tr>`;
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
            
            // Afficher l'image existante
            if (product.image_url && preview) {
                const imgSrc = product.image_url.startsWith('uploads/') 
                    ? '/' + product.image_url 
                    : product.image_url;
                preview.innerHTML = `<img src="${imgSrc}" onerror="this.style.display='none'">`;
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

function setupProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    if (!modal || !form) return;

    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

    window.addEventListener('click', e => { 
        if (e.target === modal) closeProductModal(); 
    });

    if (imageInput) {
        imageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Vérifier la taille du fichier (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('Image trop volumineuse (max 5MB)');
                imageInput.value = '';
                return;
            }
            
            // Vérifier le type de fichier
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showError('Format d\'image non valide');
                imageInput.value = '';
                return;
            }
            
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

    // Afficher un indicateur de chargement
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enregistrement...';

    fetch('php/api/products.php', { 
        method: 'POST', 
        body: formData 
    })
    .then(r => r.json())
    .then(data => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
        if (data.success) {
            showSuccess(productId ? 'Produit modifié !' : 'Produit ajouté !');
            closeProductModal();
            loadProducts();
        } else {
            showError(data.message || 'Erreur lors de l\'enregistrement');
        }
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        console.error('Erreur:', err);
        showError('Erreur de connexion');
    });
}

// ===============================
// ACTIONS
// ===============================
function editProduct(id) { 
    openProductModal(id); 
}

function deleteProduct(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

    const token = getAuthToken();
    if (!token) {
        showError('Non authentifié');
        return;
    }

    // Log pour déboguer
    console.log('Suppression du produit:', id);
    console.log('Token:', token);

    fetch('php/api/products.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            action: 'delete', 
            id: id, 
            token: token 
        })
    })
    .then(r => {
        console.log('Réponse status:', r.status);
        return r.json();
    })
    .then(data => {
        console.log('Réponse data:', data);
        if (data.success) {
            showSuccess('Produit supprimé');
            loadProducts();
        } else {
            showError(data.message || 'Erreur lors de la suppression');
        }
    })
    .catch(err => {
        console.error('Erreur complète:', err);
        showError('Erreur de connexion');
    });
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
    const map = { 
        homme: 'Homme', 
        femme: 'Femme', 
        enfant: 'Enfant' 
    };
    return map[category.toLowerCase()] || category;
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

// Ajouter les animations CSS
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
`;
document.head.appendChild(style);
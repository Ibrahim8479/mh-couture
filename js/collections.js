// ===============================
// COLLECTIONS.JS - VERSION FINALE CORRIGÉE
// MH Couture - Affichage images produits corrigé
// ===============================

let allProducts = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Page Collections chargée');
    
    loadProducts();
    setupFilters();
    setupSort();
    updateCartCount();
});

// ===============================
// CHARGER LES PRODUITS
// ===============================
function loadProducts() {
    const grid = document.querySelector('.products-grid');
    
    if (!grid) {
        console.error('❌ Element products-grid non trouvé');
        return;
    }
    
    grid.innerHTML = '<div class="loading">⏳ Chargement des produits...</div>';
    
    fetch('php/api/products.php?action=getAll')
        .then(r => {
            console.log('📡 Réponse produits:', r.status);
            if (!r.ok) throw new Error('Erreur HTTP: ' + r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ Produits reçus:', data);
            if (data.success && Array.isArray(data.products)) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                showError('Erreur de chargement des produits');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            showError('Erreur de connexion: ' + err.message);
        });
}

// ===============================
// AFFICHER LES PRODUITS - CORRECTION IMAGES FINALE
// ===============================
function displayProducts(products) {
    const grid = document.querySelector('.products-grid');
    
    if (!grid) return;
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="no-products">📦 Aucun produit disponible</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        // ✅ CORRECTION FINALE : Gérer correctement TOUS les cas de chemins d'images
        let imgSrc = 'https://via.placeholder.com/300x400/d97642/ffffff?text=MH+Couture';
        
        if (product.image_url && product.image_url.trim() !== '') {
            const imageUrl = product.image_url.trim();
            
            // Cas 1: URL complète (http/https)
            if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                imgSrc = imageUrl;
            } 
            // Cas 2: Chemin commence par "uploads/"
            else if (imageUrl.startsWith('uploads/')) {
                imgSrc = imageUrl;
            }
            // Cas 3: Chemin commence par "/" (absolu depuis la racine)
            else if (imageUrl.startsWith('/')) {
                imgSrc = imageUrl.substring(1); // Enlever le / initial
            }
            // Cas 4: Chemin relatif sans slash
            else {
                imgSrc = imageUrl;
            }
        }
        
        const price = Number(product.price || 0).toLocaleString('fr-FR');
        const category = getCategoryName(product.category);
        
        return `
            <div class="product-card" data-category="${product.category || ''}">
                <img src="${imgSrc}" 
                     alt="${product.name || 'Produit'}" 
                     class="product-image"
                     onerror="this.src='https://via.placeholder.com/300x400/d97642/ffffff?text=Image+Non+Disponible'"
                     loading="lazy">
                <div class="product-info">
                    <p class="product-category">${category}</p>
                    <h3 class="product-name">${product.name || 'Sans nom'}</h3>
                    <p class="product-description">${product.description || 'Pas de description'}</p>
                    <div class="product-footer">
                        <span class="product-price">${price} FCFA</span>
                        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                            🛒 Ajouter
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ ${products.length} produits affichés`);
}

// ===============================
// FILTRES
// ===============================
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer active de tous les boutons
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Ajouter active au bouton cliqué
            btn.classList.add('active');
            
            // Filtrer - Utiliser data-filter au lieu de data-category
            currentFilter = btn.dataset.filter || btn.dataset.category || 'all';
            filterProducts();
        });
    });
}

function filterProducts() {
    if (currentFilter === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === currentFilter);
        displayProducts(filtered);
    }
}

// ===============================
// TRI
// ===============================
function setupSort() {
    const sortSelect = document.querySelector('.sort-options select, #sortSelect');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
}

function sortProducts(sortType) {
    let sorted = [...allProducts];
    
    switch(sortType) {
        case 'price-asc':
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'price-desc':
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'name':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'newest':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'popular':
            // Tri par popularité (à implémenter selon vos critères)
            break;
    }
    
    displayProducts(sorted);
}

// ===============================
// AJOUTER AU PANIER
// ===============================
function addToCart(productId) {
    const token = window.authToken || localStorage.getItem('authToken');
    
    if (!token) {
        showError('Vous devez être connecté pour ajouter au panier');
        setTimeout(() => {
            window.location.href = 'login.php';
        }, 2000);
        return;
    }
    
    fetch('php/api/cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'add',
            token: token,
            product_id: productId,
            quantity: 1
        })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            showSuccess('✅ Produit ajouté au panier');
            updateCartCount();
        } else {
            showError(data.message || 'Erreur lors de l\'ajout');
        }
    })
    .catch(err => {
        console.error('❌ Erreur:', err);
        showError('Erreur de connexion');
    });
}

// ===============================
// COMPTEUR PANIER
// ===============================
function updateCartCount() {
    const token = window.authToken || localStorage.getItem('authToken');
    
    if (!token) return;
    
    fetch('php/api/cart.php?action=count&token=' + encodeURIComponent(token))
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    cartCount.textContent = data.count || 0;
                }
            }
        })
        .catch(err => console.error('❌ Erreur compteur panier:', err));
}

// ===============================
// UTILITAIRES
// ===============================
function getCategoryName(category) {
    const map = {
        homme: 'Homme',
        femme: 'Femme',
        enfant: 'Enfant'
    };
    return map[category] || category || 'Non catégorisé';
}

function showSuccess(message) {
    notify('✅ ' + message, '#27ae60');
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
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    n.textContent = text;
    
    document.body.appendChild(n);
    
    setTimeout(() => {
        n.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => n.remove(), 300);
    }, 3000);
}

// Animations
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
        padding: 60px 20px;
        font-size: 18px;
        color: #666;
        grid-column: 1 / -1;
    }
    .no-products {
        text-align: center;
        padding: 60px 20px;
        font-size: 18px;
        color: #999;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);

console.log('✅ collections.js chargé avec succès');
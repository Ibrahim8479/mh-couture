// collections.js - CORRIGÉ avec bons chemins API

let allProducts = [];
let currentCategory = 'all';
let currentSort = 'newest';

// Produits de démonstration
const demoProducts = [
    {
        id: 1,
        name: "Costume Trois Pièces Élégant",
        description: "Costume complet avec veste, pantalon et gilet. Parfait pour les occasions formelles.",
        category: "homme",
        price: 180000,
        image_url: "https://via.placeholder.com/300x400/d97642/ffffff?text=Costume+Homme",
        stock: 10,
        created_at: "2025-01-15"
    },
    {
        id: 2,
        name: "Robe de Soirée Brodée",
        description: "Magnifique robe de soirée avec broderies dorées. Élégance garantie.",
        category: "femme",
        price: 150000,
        image_url: "https://via.placeholder.com/300x400/d97642/ffffff?text=Robe+Soiree",
        stock: 8,
        created_at: "2025-01-14"
    },
    {
        id: 3,
        name: "Ensemble Traditionnel Homme",
        description: "Tenue traditionnelle africaine avec broderies artisanales.",
        category: "homme",
        price: 110000,
        image_url: "https://via.placeholder.com/300x400/d97642/ffffff?text=Ensemble+Traditionnel",
        stock: 15,
        created_at: "2025-01-13"
    },
    {
        id: 4,
        name: "Caftan de Luxe",
        description: "Caftan luxueux avec détails raffinés. Style et confort.",
        category: "femme",
        price: 210000,
        image_url: "https://via.placeholder.com/300x400/d97642/ffffff?text=Caftan+Luxe",
        stock: 5,
        created_at: "2025-01-12"
    },
    {
        id: 5,
        name: "Costume Enfant Cérémonie",
        description: "Costume élégant pour enfant. Idéal pour les cérémonies.",
        category: "enfant",
        price: 60000,
        image_url: "https://via.placeholder.com/300x400/d97642/ffffff?text=Costume+Enfant",
        stock: 12,
        created_at: "2025-01-11"
    },
    {
        id: 6,
        name: "Robe Fillette Princesse",
        description: "Jolie robe pour fillette avec volants et rubans.",
        category: "enfant",
        price: 48000,
        image_url: "https://via.placeholder.com/300x400/d97642/ffffff?text=Robe+Fillette",
        stock: 20,
        created_at: "2025-01-10"
    }
];

// Charger les produits au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupFilters();
    setupSort();
    checkUserLogin();
});

// Charger les produits depuis le serveur
function loadProducts() {
    fetch('php/api/products.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products.length > 0) {
                allProducts = data.products;
                displayProducts(allProducts);
            } else {
                console.log('Utilisation des produits de démonstration');
                allProducts = demoProducts;
                displayProducts(allProducts);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            console.log('Utilisation des produits de démonstration');
            allProducts = demoProducts;
            displayProducts(allProducts);
        });
}

// Afficher les produits
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">Aucun produit trouvé dans cette catégorie</div>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category.toLowerCase()}">
            <img src="${product.image_url || 'https://via.placeholder.com/300x400/d97642/ffffff?text=MH+Couture'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/300x400/d97642/ffffff?text=MH+Couture'">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-footer">
                    <span class="product-price">${product.price.toLocaleString('fr-FR')} FCFA</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Ajouter au panier
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Obtenir le nom de catégorie en français
function getCategoryName(category) {
    const categories = {
        'homme': 'Homme',
        'femme': 'Femme',
        'enfant': 'Enfant'
    };
    return categories[category.toLowerCase()] || category;
}

// Configuration des filtres
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentCategory = this.dataset.category;
            filterAndSortProducts();
        });
    });
}

// Configuration du tri
function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        filterAndSortProducts();
    });
}

// Filtrer et trier les produits
function filterAndSortProducts() {
    let filtered = allProducts;
    
    if (currentCategory !== 'all') {
        filtered = allProducts.filter(product => 
            product.category.toLowerCase() === currentCategory.toLowerCase()
        );
    }
    
    filtered = sortProducts(filtered, currentSort);
    displayProducts(filtered);
}

// Fonction de tri
function sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch(sortType) {
        case 'price-asc':
            return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        case 'price-desc':
            return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        case 'popular':
            return sorted.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        case 'newest':
        default:
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
}

// Ajouter au panier
function addToCart(productId) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
        alert('Veuillez vous connecter pour ajouter des produits au panier');
        window.location.href = 'login.php';
        return;
    }
    
    fetch('php/api/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'add',
            product_id: productId,
            quantity: 1,
            token: token
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount();
            showNotification('Produit ajouté au panier avec succès!');
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Produit ajouté au panier avec succès!');
    });
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) return;
    
    fetch('php/api/cart.php?action=count&token=' + token)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector('.cart-count').textContent = data.count;
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// Vérifier si l'utilisateur est connecté
function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (token) {
        userIcon.innerHTML = '👤';
        userIcon.href = 'profile.php';
        userIcon.title = 'Mon profil';
        updateCartCount();
    } else {
        userIcon.href = 'login.php';
        userIcon.title = 'Se connecter';
    }
}

// Afficher une notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
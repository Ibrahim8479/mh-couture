// gallery.js - VERSION FINALE avec API Gallery
let currentLightboxIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    updateCartCount();
    loadGalleryFromAPI();
    setupFilters();
    setupLightbox();
});

function checkUserLogin() {
    const token = getCookie('auth_token') || localStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (token && userIcon) {
        userIcon.href = 'profile.php';
        userIcon.title = 'Mon profil';
    } else if (userIcon) {
        userIcon.href = 'login.php';
        userIcon.title = 'Se connecter';
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

// Charger depuis l'API Gallery
function loadGalleryFromAPI() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!galleryGrid) {
        console.error('galleryGrid non trouvé');
        return;
    }
    
    galleryGrid.innerHTML = '<div class="loading">Chargement de la galerie...</div>';
    
    fetch('php/api/gallery.php?action=getAll')
        .then(response => {
            if (!response.ok) throw new Error('Erreur de chargement');
            return response.json();
        })
        .then(data => {
            if (data.success && data.gallery && data.gallery.length > 0) {
                displayGallery(data.gallery);
            } else {
                // Fallback aux produits si la galerie est vide
                loadFromProducts();
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            loadFromProducts();
        });
}

// Fallback: charger depuis les produits
function loadFromProducts() {
    fetch('php/api/products.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products && data.products.length > 0) {
                const galleryData = data.products.map(p => ({
                    title: p.name,
                    description: p.description || '',
                    category: p.category,
                    image_url: p.image_url,
                    is_featured: 0
                }));
                displayGallery(galleryData);
            } else {
                displayDefaultGallery();
            }
        })
        .catch(() => displayDefaultGallery());
}

// Afficher la galerie
function displayGallery(images) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryImages = [];
    
    galleryGrid.innerHTML = images.map((item, index) => {
        // Déterminer l'URL de l'image
        let imageUrl = item.image_url;
        if (!imageUrl || imageUrl === 'NULL' || imageUrl === '') {
            imageUrl = `https://via.placeholder.com/400x500/d97642/ffffff?text=${encodeURIComponent(item.title || 'MH Couture')}`;
        } else if (imageUrl.startsWith('uploads/')) {
            imageUrl = '/' + imageUrl;
        }
        
        // Ajouter aux images du lightbox
        galleryImages.push({
            src: imageUrl,
            alt: item.title || 'Image',
            title: item.title || 'Sans titre',
            description: item.description || '',
            category: item.category
        });
        
        return `
            <div class="gallery-item" data-category="${item.category}">
                <div class="image-container" onclick="openLightbox(${index})">
                    <img src="${imageUrl}" 
                         alt="${item.title || ''}" 
                         onerror="this.src='https://via.placeholder.com/400x500/d97642/ffffff?text=MH+Couture'">
                    <div class="overlay">
                        <h3>${item.title || 'Sans titre'}</h3>
                        <p>${item.description || getCategoryName(item.category)}</p>
                        <button class="btn-view">Voir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Galerie par défaut
function displayDefaultGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryImages = [];
    
    const defaultImages = [
        {
            title: 'Costume Trois Pièces Élégant',
            description: 'Costume complet brodé raffiné',
            category: 'homme',
            src: 'https://via.placeholder.com/400x500/2c3e50/ffffff?text=Costume+Homme'
        },
        {
            title: 'Robe de Soirée Brodée',
            description: 'Robe élégante avec détails raffinés',
            category: 'femme',
            src: 'https://via.placeholder.com/400x500/e74c3c/ffffff?text=Robe+Femme'
        },
        {
            title: 'Ensemble Traditionnel',
            description: 'Tenue traditionnelle africaine',
            category: 'traditionnel',
            src: 'https://via.placeholder.com/400x500/f39c12/ffffff?text=Traditionnel'
        },
        {
            title: 'Caftan de Luxe',
            description: 'Caftan luxueux fait main',
            category: 'femme',
            src: 'https://via.placeholder.com/400x500/9b59b6/ffffff?text=Caftan'
        },
        {
            title: 'Costume Mariage',
            description: 'Costume élégant pour mariage',
            category: 'mariage',
            src: 'https://via.placeholder.com/400x500/16a085/ffffff?text=Mariage'
        },
        {
            title: 'Robe Traditionnelle',
            description: 'Robe avec motifs traditionnels',
            category: 'traditionnel',
            src: 'https://via.placeholder.com/400x500/d35400/ffffff?text=Traditionnel'
        },
        {
            title: 'Ensemble Enfant',
            description: 'Tenue élégante pour enfant',
            category: 'enfant',
            src: 'https://via.placeholder.com/400x500/27ae60/ffffff?text=Enfant'
        },
        {
            title: 'Costume Sur Mesure',
            description: 'Costume personnalisé haute couture',
            category: 'homme',
            src: 'https://via.placeholder.com/400x500/3498db/ffffff?text=Sur+Mesure'
        }
    ];
    
    galleryImages = defaultImages;
    
    galleryGrid.innerHTML = defaultImages.map((item, index) => `
        <div class="gallery-item" data-category="${item.category}">
            <div class="image-container" onclick="openLightbox(${index})">
                <img src="${item.src}" alt="${item.title}">
                <div class="overlay">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <button class="btn-view">Voir</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filtres
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            filterGallery(filter);
        });
    });
}

function filterGallery(filter) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s ease';
        } else if (item.dataset.category === filter) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

// Lightbox
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
            changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
            changeLightboxImage(1);
        }
    });
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) closeLightbox();
    });
}

function openLightbox(index) {
    if (index < 0 || index >= galleryImages.length) return;
    
    currentLightboxIndex = index;
    const image = galleryImages[index];
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || image.title;
    lightboxCaption.innerHTML = `
        <strong>${image.title}</strong><br>
        ${image.description}
    `;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
    
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = galleryImages.length - 1;
    } else if (currentLightboxIndex >= galleryImages.length) {
        currentLightboxIndex = 0;
    }
    
    openLightbox(currentLightboxIndex);
}

// Utilitaires
function getCategoryName(category) {
    if (!category) return 'Création';
    
    const categories = {
        'homme': 'Homme',
        'femme': 'Femme',
        'enfant': 'Enfant',
        'mariage': 'Mariage',
        'traditionnel': 'Traditionnel'
    };
    return categories[category.toLowerCase()] || category;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loading {
        text-align: center;
        padding: 60px 20px;
        font-size: 18px;
        color: #666;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style);
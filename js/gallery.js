// gallery.js - CORRIGÉ avec données réelles
let currentLightboxIndex = 0;
let galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    loadGalleryImages();
    setupFilters();
    setupLightbox();
});

function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (token && userIcon) {
        userIcon.href = 'profile.php';
        userIcon.title = 'Mon profil';
    } else if (userIcon) {
        userIcon.href = 'login.php';
        userIcon.title = 'Se connecter';
    }
}

// Charger les images de la galerie depuis les produits
function loadGalleryImages() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!galleryGrid) {
        console.error('galleryGrid non trouvé');
        return;
    }
    
    galleryGrid.innerHTML = '<div class="loading">Chargement de la galerie...</div>';
    
    // Charger depuis l'API produits
    fetch('php/api/products.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.products && data.products.length > 0) {
                displayGalleryFromProducts(data.products);
            } else {
                // Afficher la galerie par défaut si pas de produits
                displayDefaultGallery();
            }
        })
        .catch(error => {
            console.error('Erreur chargement galerie:', error);
            displayDefaultGallery();
        });
}

// Afficher la galerie depuis les produits
function displayGalleryFromProducts(products) {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryImages = [];
    
    // Limiter à 12 produits pour la galerie
    const galleryProducts = products.slice(0, 12);
    
    galleryGrid.innerHTML = galleryProducts.map((product, index) => {
        // Déterminer l'URL de l'image
        let imageUrl = product.image_url;
        if (!imageUrl || imageUrl === 'NULL') {
            imageUrl = `https://via.placeholder.com/400x500/d97642/ffffff?text=${encodeURIComponent(product.name)}`;
        } else if (imageUrl.startsWith('uploads/')) {
            imageUrl = '/' + imageUrl;
        }
        
        // Ajouter à la liste des images pour le lightbox
        galleryImages.push({
            src: imageUrl,
            alt: product.name,
            title: product.name,
            description: product.description || '',
            category: product.category
        });
        
        return `
            <div class="gallery-item" data-category="${product.category}">
                <div class="image-container" onclick="openLightbox(${index})">
                    <img src="${imageUrl}" 
                         alt="${product.name}" 
                         onerror="this.src='https://via.placeholder.com/400x500/d97642/ffffff?text=MH+Couture'">
                    <div class="overlay">
                        <h3>${product.name}</h3>
                        <p>${getCategoryName(product.category)}</p>
                        <button class="btn-view">Voir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Galerie par défaut si pas de produits
function displayDefaultGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryImages = [];
    
    const defaultImages = [
        {
            title: 'Costume Trois Pièces Élégant',
            description: 'Costume complet pour homme avec broderies',
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
            category: 'homme',
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
            category: 'homme',
            src: 'https://via.placeholder.com/400x500/16a085/ffffff?text=Mariage'
        },
        {
            title: 'Robe Traditionnelle',
            description: 'Robe avec motifs traditionnels',
            category: 'femme',
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

// Configuration des filtres
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

// Filtrer la galerie
function filterGallery(filter) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        if (filter === 'all') {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s';
        } else if (item.dataset.category === filter) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.5s';
        } else {
            item.style.display = 'none';
        }
    });
}

// Configuration du lightbox
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (!lightbox) return;
    
    // Fermer avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
            changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
            changeLightboxImage(1);
        }
    });
    
    // Fermer en cliquant sur le fond
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Ouvrir le lightbox
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

// Fermer le lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Changer d'image dans le lightbox
function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
    
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = galleryImages.length - 1;
    } else if (currentLightboxIndex >= galleryImages.length) {
        currentLightboxIndex = 0;
    }
    
    openLightbox(currentLightboxIndex);
}

// Obtenir le nom de la catégorie
function getCategoryName(category) {
    const categories = {
        'homme': 'Homme',
        'femme': 'Femme',
        'enfant': 'Enfant'
    };
    return categories[category.toLowerCase()] || category;
}

// Ajouter les animations CSS
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

// ===============================
// GALLERY.JS - VERSION CORRIGÉE
// MH Couture - Affichage images corrigé
// ===============================

let allGalleryImages = [];
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Page Galerie chargée');
    
    loadGallery();
    setupFilters();
    updateCartCount();
});

// ===============================
// CHARGER LA GALERIE
// ===============================
function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    
    if (!grid) {
        console.error('❌ Element galleryGrid non trouvé');
        return;
    }
    
    grid.innerHTML = '<div class="loading">⏳ Chargement de la galerie...</div>';
    
    fetch('php/api/gallery.php?action=getAll')
        .then(r => {
            console.log('📡 Réponse galerie:', r.status);
            if (!r.ok) throw new Error('Erreur HTTP: ' + r.status);
            return r.json();
        })
        .then(data => {
            console.log('✅ Données reçues:', data);
            if (data.success && Array.isArray(data.gallery)) {
                allGalleryImages = data.gallery;
                displayGallery(allGalleryImages);
            } else {
                showError('Erreur de chargement de la galerie');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err);
            showError('Erreur de connexion: ' + err.message);
        });
}

// ===============================
// AFFICHER LA GALERIE - CORRECTION IMAGES
// ===============================
function displayGallery(images) {
    const grid = document.getElementById('galleryGrid');
    
    if (!grid) return;
    
    if (!images || images.length === 0) {
        grid.innerHTML = '<div class="no-data">📷 Aucune image dans la galerie</div>';
        return;
    }
    
    grid.innerHTML = images.map((img, index) => {
        // ✅ CORRECTION : Gérer correctement les chemins d'images
        let imgSrc = 'https://via.placeholder.com/350x450/d97642/ffffff?text=MH+Couture';
        
        if (img.image_url) {
            // Si l'URL commence par uploads/, ajouter le slash
            if (img.image_url.startsWith('uploads/')) {
                imgSrc = img.image_url;
            } 
            // Si c'est une URL complète (http/https)
            else if (img.image_url.startsWith('http')) {
                imgSrc = img.image_url;
            } 
            // Sinon, utiliser tel quel
            else {
                imgSrc = img.image_url;
            }
        }
        
        return `
            <div class="gallery-item" data-category="${img.category || ''}" data-index="${index}">
                <div class="image-container">
                    <img src="${imgSrc}" 
                         alt="${img.title || 'Image'}" 
                         onerror="this.src='https://via.placeholder.com/350x450/d97642/ffffff?text=Image+Non+Disponible'"
                         loading="lazy">
                    <div class="overlay">
                        <h3>${img.title || 'Sans titre'}</h3>
                        <p>${img.description || 'Pas de description'}</p>
                        <button class="btn-view" onclick="openLightbox(${index})">
                            👁️ Voir en grand
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ ${images.length} images affichées`);
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
            
            // Filtrer
            const filter = btn.dataset.filter;
            filterGallery(filter);
        });
    });
}

function filterGallery(category) {
    if (category === 'all') {
        displayGallery(allGalleryImages);
    } else {
        const filtered = allGalleryImages.filter(img => img.category === category);
        displayGallery(filtered);
    }
}

// ===============================
// LIGHTBOX
// ===============================
function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    if (!lightbox || !lightboxImage) {
        console.error('❌ Lightbox non trouvé');
        return;
    }
    
    const img = allGalleryImages[index];
    
    // ✅ CORRECTION : Gérer le chemin de l'image dans la lightbox
    let imgSrc = 'https://via.placeholder.com/800x600/d97642/ffffff?text=MH+Couture';
    
    if (img.image_url) {
        if (img.image_url.startsWith('uploads/')) {
            imgSrc = img.image_url;
        } else if (img.image_url.startsWith('http')) {
            imgSrc = img.image_url;
        } else {
            imgSrc = img.image_url;
        }
    }
    
    lightboxImage.src = imgSrc;
    
    if (lightboxCaption) {
        lightboxCaption.textContent = img.title || 'Image';
    }
    
    lightbox.classList.add('active');
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
    }
    
    // Réactiver le scroll
    document.body.style.overflow = 'auto';
}

function changeLightboxImage(direction) {
    currentImageIndex += direction;
    
    // Boucler
    if (currentImageIndex < 0) {
        currentImageIndex = allGalleryImages.length - 1;
    } else if (currentImageIndex >= allGalleryImages.length) {
        currentImageIndex = 0;
    }
    
    openLightbox(currentImageIndex);
}

// Fermer lightbox avec Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        changeLightboxImage(-1);
    } else if (e.key === 'ArrowRight') {
        changeLightboxImage(1);
    }
});

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
// NOTIFICATIONS
// ===============================
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
    }
    .no-data {
        text-align: center;
        padding: 60px 20px;
        font-size: 18px;
        color: #999;
    }
`;
document.head.appendChild(style);

console.log('✅ gallery.js chargé avec succès');
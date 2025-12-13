// gallery.js - CORRIGÉ
let currentLightboxIndex = 0;
const galleryImages = [];

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    setupFilters();
    loadGalleryImages();
});

function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (token) {
        userIcon.href = 'profile.html';
        userIcon.title = 'Mon profil';
    } else {
        userIcon.href = 'login.html';
        userIcon.title = 'Se connecter';
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            galleryItems.forEach(item => {
                const categories = item.dataset.category.split(' ');
                
                if (filter === 'all') {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s';
                } else if (categories.includes(filter)) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

function loadGalleryImages() {
    const items = document.querySelectorAll('.gallery-item');
    galleryImages.length = 0;
    
    items.forEach((item, index) => {
        const img = item.querySelector('img');
        const title = item.querySelector('.overlay h3').textContent;
        const description = item.querySelector('.overlay p').textContent;
        
        galleryImages.push({
            src: img.src,
            alt: img.alt,
            title: title,
            description: description
        });
    });
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    
    if (galleryImages[index]) {
        lightboxImage.src = galleryImages[index].src;
        lightboxImage.alt = galleryImages[index].alt;
        lightboxCaption.innerHTML = `
            <strong>${galleryImages[index].title}</strong><br>
            ${galleryImages[index].description}
        `;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
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

document.addEventListener('keydown', function(e) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            changeLightboxImage(-1);
        } else if (e.key === 'ArrowRight') {
            changeLightboxImage(1);
        }
    }
});

document.getElementById('lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
        closeLightbox();
    }
});

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
`;
document.head.appendChild(style);
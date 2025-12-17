// pricing.js - VERSION CORRIGÉE ET FONCTIONNELLE
document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Page tarifs chargée');
    checkUserLogin();
    loadPricingData();
    setupCategoryFilters();
});

function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || getCookie('auth_token');
    const userIcon = document.getElementById('userIcon');
    
    if (token && userIcon) {
        userIcon.href = 'profile.php';
        userIcon.title = 'Mon profil';
    } else if (userIcon) {
        userIcon.href = 'login.php';
        userIcon.title = 'Se connecter';
    }
}

// Charger les données de tarifs
function loadPricingData() {
    const pricingGrid = document.getElementById('pricingGrid');
    
    if (!pricingGrid) {
        console.error('❌ pricingGrid non trouvé');
        return;
    }
    
    pricingGrid.innerHTML = '<div class="loading" style="grid-column: 1/-1; text-align: center; padding: 60px;">⏳ Chargement des tarifs...</div>';
    
    console.log('📡 Chargement tarifs depuis API...');
    
    // Essayer de charger depuis l'API
    fetch('php/api/products.php?action=getAll')
        .then(response => {
            console.log('📡 Réponse status:', response.status);
            if (!response.ok) throw new Error('Erreur HTTP: ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Données reçues:', data);
            if (data.success && data.products && data.products.length > 0) {
                console.log(`✅ ${data.products.length} produits chargés`);
                displayPricingFromProducts(data.products);
            } else {
                console.log('⚠️ Aucun produit, affichage tarifs par défaut');
                displayDefaultPricing();
            }
        })
        .catch(error => {
            console.error('❌ Erreur chargement tarifs:', error);
            displayDefaultPricing();
        });
}

// Afficher les tarifs depuis les produits
function displayPricingFromProducts(products) {
    const pricingGrid = document.getElementById('pricingGrid');
    
    if (!pricingGrid) {
        console.error('❌ pricingGrid non trouvé');
        return;
    }
    
    // Regrouper par catégorie et prendre des exemples
    const groupedProducts = {
        homme: products.filter(p => p.category === 'homme').slice(0, 4),
        femme: products.filter(p => p.category === 'femme').slice(0, 4),
        enfant: products.filter(p => p.category === 'enfant').slice(0, 4)
    };
    
    let html = '';
    let totalCards = 0;
    
    for (const [category, items] of Object.entries(groupedProducts)) {
        items.forEach(product => {
            const price = parseInt(product.price || 0);
            const isFeatured = price > 150000;
            
            html += `
                <div class="pricing-card ${isFeatured ? 'featured' : ''}" data-category="${category}">
                    ${isFeatured ? '<span class="badge">⭐ Populaire</span>' : ''}
                    <div class="card-header">
                        <h3>${product.name}</h3>
                        <div class="price">
                            <span class="amount">${formatPrice(price)}</span>
                            <span class="currency">FCFA</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <ul class="features">
                            <li>✓ Consultation gratuite</li>
                            <li>✓ Prise de mesures incluse</li>
                            <li>✓ Tissus premium</li>
                            <li>✓ ${product.is_custom == 1 ? 'Design personnalisé' : 'Design classique'}</li>
                            <li>✓ Retouches gratuites (30j)</li>
                            <li>✓ Livraison offerte</li>
                        </ul>
                        <a href="custom-designs.php" class="btn-order">Commander</a>
                    </div>
                </div>
            `;
            totalCards++;
        });
    }
    
    if (html === '' || totalCards === 0) {
        console.log('⚠️ Aucune carte générée, affichage tarifs par défaut');
        displayDefaultPricing();
    } else {
        pricingGrid.innerHTML = html;
        console.log(`✅ ${totalCards} cartes de tarifs affichées`);
    }
}

// Tarifs par défaut si pas de produits
function displayDefaultPricing() {
    const pricingGrid = document.getElementById('pricingGrid');
    
    if (!pricingGrid) {
        console.error('❌ pricingGrid non trouvé');
        return;
    }
    
    console.log('🎨 Affichage tarifs par défaut');
    
    const defaultPricing = [
        // HOMME
        {
            name: 'Costume Classique',
            category: 'homme',
            price: 180000,
            features: [
                'Consultation gratuite',
                'Prise de mesures incluse',
                'Tissus premium qualité',
                'Design classique élégant',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Costume Premium',
            category: 'homme',
            price: 280000,
            features: [
                'Consultation approfondie',
                'Prise de mesures détaillée',
                'Tissus luxe importés',
                'Design sur mesure complet',
                'Retouches illimitées (60j)',
                'Livraison express offerte',
                'Étui de rangement inclus'
            ],
            featured: true
        },
        {
            name: 'Chemise Sur Mesure',
            category: 'homme',
            price: 85000,
            features: [
                'Consultation gratuite',
                'Mesures précises',
                'Tissus coton premium',
                'Choix des détails',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Ensemble Traditionnel',
            category: 'homme',
            price: 150000,
            features: [
                'Consultation gratuite',
                'Prise de mesures incluse',
                'Tissus traditionnels',
                'Broderies artisanales',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        
        // FEMME
        {
            name: 'Robe Élégante',
            category: 'femme',
            price: 150000,
            features: [
                'Consultation gratuite',
                'Prise de mesures incluse',
                'Tissus élégants',
                'Design raffiné',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Caftan de Luxe',
            category: 'femme',
            price: 250000,
            features: [
                'Consultation personnalisée',
                'Mesures détaillées',
                'Tissus luxueux importés',
                'Broderies sur mesure',
                'Retouches illimitées (60j)',
                'Livraison express offerte',
                'Housse de protection'
            ],
            featured: true
        },
        {
            name: 'Robe de Soirée',
            category: 'femme',
            price: 200000,
            features: [
                'Consultation gratuite',
                'Prise de mesures incluse',
                'Tissus soirée premium',
                'Design exclusif',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Ensemble Traditionnel',
            category: 'femme',
            price: 180000,
            features: [
                'Consultation gratuite',
                'Prise de mesures incluse',
                'Tissus traditionnels',
                'Broderies artisanales',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        
        // ENFANT
        {
            name: 'Costume Enfant',
            category: 'enfant',
            price: 60000,
            features: [
                'Consultation gratuite',
                'Mesures adaptées enfant',
                'Tissus confortables',
                'Design élégant',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Robe Fillette',
            category: 'enfant',
            price: 48000,
            features: [
                'Consultation gratuite',
                'Mesures adaptées',
                'Tissus doux et confortables',
                'Design adapté',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Ensemble Cérémonie',
            category: 'enfant',
            price: 75000,
            features: [
                'Consultation gratuite',
                'Prise de mesures incluse',
                'Tissus premium',
                'Design élégant',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        },
        {
            name: 'Tenue Traditionnelle',
            category: 'enfant',
            price: 55000,
            features: [
                'Consultation gratuite',
                'Mesures adaptées',
                'Tissus traditionnels',
                'Design adapté',
                'Retouches gratuites (30j)',
                'Livraison offerte'
            ],
            featured: false
        }
    ];
    
    pricingGrid.innerHTML = defaultPricing.map(item => `
        <div class="pricing-card ${item.featured ? 'featured' : ''}" data-category="${item.category}">
            ${item.featured ? '<span class="badge">⭐ Populaire</span>' : ''}
            <div class="card-header">
                <h3>${item.name}</h3>
                <div class="price">
                    <span class="amount">${formatPrice(item.price)}</span>
                    <span class="currency">FCFA</span>
                </div>
            </div>
            <div class="card-body">
                <ul class="features">
                    ${item.features.map(f => `<li>✓ ${f}</li>`).join('')}
                </ul>
                <a href="custom-designs.php" class="btn-order">Commander</a>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ ${defaultPricing.length} cartes de tarifs par défaut affichées`);
}

// Configuration des filtres de catégorie
function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.category-btn');
    
    if (!filterButtons.length) {
        console.warn('⚠️ Aucun bouton de filtre trouvé');
        return;
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterPricing(category);
        });
    });
    
    console.log('✅ Filtres de catégorie configurés');
}

// Filtrer les tarifs par catégorie
function filterPricing(category) {
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    console.log(`🔍 Filtrage par catégorie: ${category}`);
    
    let visibleCount = 0;
    
    pricingCards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s';
            visibleCount++;
        } else if (card.dataset.category === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`✅ ${visibleCount} cartes visibles après filtrage`);
}

// Formater le prix
function formatPrice(price) {
    return parseInt(price).toLocaleString('fr-FR');
}

// Fonction getCookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
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
    
    .pricing-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .pricing-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
`;
document.head.appendChild(style);

console.log('✅ Pricing.js chargé avec succès');
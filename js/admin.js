// admin.js - Version simplifiée et fonctionnelle
// Fichier: js/admin.js

let currentSection = 'dashboard';
let allProducts = [];

// INITIALISATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');
    setupNavigation();
    loadDashboardData();
    setupProductModal();
});

// CONFIGURATION DE LA NAVIGATION
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.dataset.section;
            showSection(section);
        });
    });
}

// AFFICHER UNE SECTION
function showSection(section) {
    console.log('Showing section:', section);
    
    // Cacher toutes les sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    const sectionId = section + '-section';
    const sectionElement = document.getElementById(sectionId);
    
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Mettre à jour le titre
    const titles = {
        'dashboard': 'Tableau de bord',
        'products': 'Gestion des Produits',
        'orders': 'Gestion des Commandes',
        'users': 'Gestion des Utilisateurs',
        'settings': 'Paramètres'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || section;
    currentSection = section;
    
    // Charger les données si nécessaire
    if (section === 'products') {
        loadProducts();
    }
}

// CHARGER LES DONNEES DU TABLEAU DE BORD
function loadDashboardData() {
    const token = getAuthToken();
    
    fetch('php/api/admin.php?action=getDashboardStats&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalProducts').textContent = data.stats.products || 0;
                document.getElementById('totalOrders').textContent = data.stats.orders || 0;
                document.getElementById('totalUsers').textContent = data.stats.users || 0;
                document.getElementById('totalRevenue').textContent = (data.stats.revenue || '0') + ' FCFA';
            }
        })
        .catch(error => console.error('Erreur tableau de bord:', error));
}

// CHARGER LES PRODUITS
function loadProducts() {
    console.log('Chargement des produits...');
    
    fetch('php/api/products.php?action=getAll')
        .then(response => {
            console.log('Response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Données produits:', data);
            
            if (data.success && data.products) {
                allProducts = data.products;
                console.log('Produits reçus:', allProducts.length);
                displayProducts(allProducts);
            } else {
                console.error('Erreur produits:', data.message);
                document.querySelector('#productsTable tbody').innerHTML = 
                    '<tr><td colspan="6" class="no-data">Erreur: ' + (data.message || 'Impossible de charger') + '</td></tr>';
            }
        })
        .catch(error => {
            console.error('Erreur fetch produits:', error);
            document.querySelector('#productsTable tbody').innerHTML = 
                '<tr><td colspan="6" class="no-data">Erreur de connexion</td></tr>';
        });
}

// AFFICHER LES PRODUITS DANS LE TABLEAU
function displayProducts(products) {
    console.log('Affichage des produits:', products.length);
    
    const tbody = document.querySelector('#productsTable tbody');
    
    if (!tbody) {
        console.error('tbody non trouvé!');
        return;
    }
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Aucun produit</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}" class="product-img"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${parseInt(product.price).toLocaleString('fr-FR')} FCFA</td>
            <td>${product.stock}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Modifier</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Supprimer</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    console.log('Tableau mis à jour');
}

// OUVRIR LE MODAL PRODUIT
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (form) form.reset();
    
    const preview = document.getElementById('imagePreview');
    if (preview) preview.innerHTML = '';
    
    if (productId) {
        document.getElementById('modalTitle').textContent = 'Modifier le produit';
        const product = allProducts.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('isCustom').checked = product.is_custom == 1;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Ajouter un produit';
    }
    
    modal.classList.add('active');
}

// FERMER LE MODAL
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
}

// CONFIGURATION DU MODAL
function setupProductModal() {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('productImage');
    
    // Fermer en cliquant sur X
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    // Fermer en cliquant en dehors
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeProductModal();
        }
    });
    
    // Preview image
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.innerHTML = '<img src="' + e.target.result + '" alt="Preview">';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Soumettre le formulaire
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
}

// SOUMETTRE LE FORMULAIRE PRODUIT
function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const formData = new FormData();
    
    formData.append('action', productId ? 'update' : 'create');
    formData.append('token', getAuthToken());
    
    if (productId) {
        formData.append('id', productId);
    }
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('is_custom', document.getElementById('isCustom').checked ? 1 : 0);
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    fetch('php/api/products.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(productId ? 'Produit modifié!' : 'Produit ajouté!');
            closeProductModal();
            loadProducts();
        } else {
            showError('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showError('Une erreur est survenue');
    });
}

// MODIFIER UN PRODUIT
function editProduct(id) {
    console.log('Modification du produit:', id);
    openProductModal(id);
}

// SUPPRIMER UN PRODUIT
function deleteProduct(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        return;
    }
    
    fetch('php/api/products.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'delete',
            id: id,
            token: getAuthToken()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess('Produit supprimé!');
            loadProducts();
        } else {
            showError('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showError('Erreur');
    });
}

// UTILITAIRES
function getCategoryName(category) {
    const categories = {
        'homme': 'Homme',
        'femme': 'Femme',
        'enfant': 'Enfant'
    };
    return categories[category.toLowerCase()] || category;
}

function getAuthToken() {
    const cookieToken = getCookie('auth_token');
    if (cookieToken) return cookieToken;
    return localStorage.getItem('authToken');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// NOTIFICATIONS
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
    `;
    notification.innerHTML = '✅ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
    `;
    notification.innerHTML = '❌ ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}
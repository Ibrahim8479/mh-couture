// cart.js - Gestion du panier - CORRIGÉ
// Fichier: js/cart.js

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
});

// Charger le panier
function loadCart() {
    const token = window.authToken || localStorage.getItem('authToken') || getCookie('auth_token');
    const cartList = document.getElementById('cartItemsList');
    
    if (!cartList) {
        console.error('❌ Element cartItemsList non trouvé');
        return;
    }
    
    if (!token) {
        cartList.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
        return;
    }
    
    fetch('php/api/cart.php?action=getAll&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success && data.items.length > 0) {
                displayCartItems(data.items);
                updateSummary(data.total);
            } else {
                cartList.innerHTML = `
                    <div class="empty-cart">
                        <p>🛒 Votre panier est vide</p>
                        <a href="collections.php" class="btn-shop" style="display: inline-block; padding: 10px 20px; background: #d97642; color: white; text-decoration: none; border-radius: 6px;">Découvrir nos collections</a>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            cartList.innerHTML = '<div class="empty-cart">Erreur lors du chargement du panier</div>';
        });
}

// Afficher les articles du panier
function displayCartItems(items) {
    const cartList = document.getElementById('cartItemsList');
    
    if (!cartList) return;
    
    cartList.innerHTML = items.map(item => {
        let imgSrc = item.image_url || 'https://via.placeholder.com/100';
        if (imgSrc.startsWith('uploads/')) {
            imgSrc = imgSrc; // Chemin relatif
        } else if (!imgSrc.startsWith('http')) {
            imgSrc = 'https://via.placeholder.com/100';
        }
        
        return `
        <div class="cart-item" data-cart-id="${item.cart_id}" style="display: flex; gap: 20px; padding: 20px; border: 1px solid #ecf0f1; border-radius: 8px; margin-bottom: 15px;">
            <img src="${imgSrc}" 
                 alt="${item.name}" 
                 class="item-image"
                 style="width: 100px; height: 100px; object-fit: cover; border-radius: 6px;"
                 onerror="this.src='https://via.placeholder.com/100'">
            
            <div class="item-details" style="flex: 1;">
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${item.name}</h3>
                <p style="margin: 0 0 5px 0; color: #7f8c8d;">${item.description || ''}</p>
                <p class="item-price" style="margin: 0; font-size: 16px; font-weight: 700; color: #d97642;">${parseInt(item.price).toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            <div class="item-quantity" style="display: flex; align-items: center; gap: 10px;">
                <button onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})" style="width: 35px; height: 35px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">-</button>
                <input type="number" value="${item.quantity}" 
                       onchange="updateQuantity(${item.cart_id}, this.value)" 
                       min="1" style="width: 50px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                <button onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})" style="width: 35px; height: 35px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">+</button>
            </div>
            
            <div class="item-total" style="text-align: right; min-width: 120px;">
                <div style="font-size: 16px; font-weight: 700; color: #2c3e50;">
                    ${parseInt(item.subtotal).toLocaleString('fr-FR')} FCFA
                </div>
            </div>
            
            <button class="btn-remove" onclick="removeItem(${item.cart_id})" title="Retirer" style="background: #e74c3c; color: white; border: none; border-radius: 4px; width: 40px; height: 40px; cursor: pointer; font-size: 18px;">
                ✕
            </button>
        </div>
    `}).join('');
}

// Mettre à jour le résumé
function updateSummary(total) {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) {
        subtotalEl.textContent = parseInt(total).toLocaleString('fr-FR') + ' FCFA';
    }
    if (totalEl) {
        totalEl.textContent = parseInt(total).toLocaleString('fr-FR') + ' FCFA';
    }
}

// Mettre à jour la quantité
function updateQuantity(cartId, newQuantity) {
    const token = window.authToken || localStorage.getItem('authToken') || getCookie('auth_token');
    newQuantity = parseInt(newQuantity);
    
    if (newQuantity < 1) {
        removeItem(cartId);
        return;
    }
    
    fetch('php/api/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'updateQuantity',
            token: token,
            cart_id: cartId,
            quantity: newQuantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCart();
            updateCartCount();
        } else {
            showNotification('❌ Erreur: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la mise à jour', 'error');
    });
}

// Retirer un article
function removeItem(cartId) {
    if (!confirm('Voulez-vous vraiment retirer cet article du panier?')) {
        return;
    }
    
    const token = window.authToken || localStorage.getItem('authToken') || getCookie('auth_token');
    
    fetch('php/api/cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'remove',
            token: token,
            cart_id: cartId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('✅ Article retiré du panier', 'success');
            loadCart();
            updateCartCount();
        } else {
            showNotification('❌ Erreur: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la suppression', 'error');
    });
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const token = window.authToken || localStorage.getItem('authToken') || getCookie('auth_token');
    
    if (!token) return;
    
    fetch('php/api/cart.php?action=count&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const cartCount = document.querySelector('.cart-count');
                if (cartCount) {
                    cartCount.textContent = data.count || 0;
                }
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// ProcÉder au paiement
function proceedToCheckout() {
    const token = window.authToken || localStorage.getItem('authToken') || getCookie('auth_token');
    
    if (!token) {
        showNotification('⚠️ Vous devez être connecté', 'error');
        setTimeout(() => {
            window.location.href = 'login.php';
        }, 2000);
        return;
    }
    
    // Récupérer les articles du panier
    fetch('php/api/cart.php?action=getAll&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (!data.success || data.items.length === 0) {
                showNotification('⚠️ Votre panier est vide', 'error');
                return;
            }
            
            // Créer la commande
            const shippingAddress = prompt('Adresse de livraison:');
            if (!shippingAddress) return;
            
            fetch('php/api/orders.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'createOrder',
                    token: token,
                    items: data.items,
                    shippingAddress: shippingAddress
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('✅ Commande créée: ' + data.order_number, 'success');
                    setTimeout(() => {
                        window.location.href = 'profile.php';
                    }, 2000);
                } else {
                    showNotification('❌ Erreur: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                // ✅ Message d'erreur plus utile
                showNotification('ℹ️ Contactez notre équipe pour finaliser votre commande: +227 91717508 ou info@mhcouture.com', 'error');
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('❌ Erreur lors du chargement du panier', 'error');
        });
}

// Helper pour les cookies
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#27ae60' : '#e74c3c';
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notification.innerHTML = `<span style="font-size: 20px;">${icon}</span><span>${message}</span>`;
    
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

console.log('✅ cart.js chargé avec succès');
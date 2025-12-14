// cart.js - Gestion du panier

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
});

// Charger le panier
function loadCart() {
    const token = window.authToken || localStorage.getItem('authToken');
    const cartList = document.getElementById('cartItemsList');
    
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
                        <p>🛍 Votre panier est vide</p>
                        <a href="collections.php" class="btn-shop">Découvrir nos collections</a>
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
    
    cartList.innerHTML = items.map(item => `
        <div class="cart-item" data-cart-id="${item.cart_id}">
            <img src="${item.image_url || 'https://via.placeholder.com/100'}" 
                 alt="${item.name}" 
                 class="item-image"
                 onerror="this.src='https://via.placeholder.com/100'">
            
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <p class="item-price">${parseInt(item.price).toLocaleString('fr-FR')} FCFA</p>
            </div>
            
            <div class="item-quantity">
                <button onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" 
                       onchange="updateQuantity(${item.cart_id}, this.value)" 
                       min="1">
                <button onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})">+</button>
            </div>
            
            <div class="item-total">
                ${parseInt(item.subtotal).toLocaleString('fr-FR')} FCFA
            </div>
            
            <button class="btn-remove" onclick="removeItem(${item.cart_id})" title="Retirer">
                ✕
            </button>
        </div>
    `).join('');
}

// Mettre à jour le résumé
function updateSummary(total) {
    document.getElementById('subtotal').textContent = parseInt(total).toLocaleString('fr-FR') + ' FCFA';
    document.getElementById('total').textContent = parseInt(total).toLocaleString('fr-FR') + ' FCFA';
}

// Mettre à jour la quantité
function updateQuantity(cartId, newQuantity) {
    const token = window.authToken || localStorage.getItem('authToken');
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
            alert('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la mise à jour', 'error');
    });
}

// Retirer un article
function removeItem(cartId) {
    if (!confirm('Voulez-vous vraiment retirer cet article du panier?')) {
        return;
    }
    
    const token = window.authToken || localStorage.getItem('authToken');
    
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
            showNotification('Article retiré du panier', 'success');
            loadCart();
            updateCartCount();
        } else {
            alert('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
    });
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const token = window.authToken || localStorage.getItem('authToken');
    
    if (!token) return;
    
    fetch('php/api/cart.php?action=count&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector('.cart-count').textContent = data.count;
            }
        })
        .catch(error => console.error('Erreur:', error));
}

// Procéder au paiement
function proceedToCheckout() {
    const token = window.authToken || localStorage.getItem('authToken');
    
    if (!token) {
        alert('Vous devez être connecté');
        window.location.href = 'login.php';
        return;
    }
    
    // Récupérer les articles du panier
    fetch('php/api/cart.php?action=getAll&token=' + encodeURIComponent(token))
        .then(response => response.json())
        .then(data => {
            if (!data.success || data.items.length === 0) {
                alert('Votre panier est vide');
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
                    showNotification('Commande créée avec succès: ' + data.order_number, 'success');
                    setTimeout(() => {
                        window.location.href = 'profile.php';
                    }, 2000);
                } else {
                    alert('Erreur: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Fonctionnalité de paiement en cours de développement.\n\nVeuillez contacter notre équipe pour finaliser votre commande:\n📞 +227 91717508\n📧 info@mhcouture.com');
            });
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert('Erreur lors du chargement du panier');
        });
}

// Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#27ae60' : '#e74c3c';
    const icon = type === 'success' ? '✅' : '❌';
    
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
    `;
    notification.innerHTML = `${icon} ${message}`;
    
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
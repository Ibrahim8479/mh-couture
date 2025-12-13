<?php
/**
 * Page Panier - MH Couture
 * Fichier: cart.php
 */

session_start();

// Vérifier l'authentification
$token = $_SESSION['auth_token'] ?? $_COOKIE['auth_token'] ?? null;

if (!$token) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Panier - MH Couture</title>
    <link rel="stylesheet" href="css/cart.css">
</head>
<body>
    <header>
        <div class="logo">
            <div class="logo-icon">
                <div class="logo-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="logo-text">
                <h1>MH COUTURE</h1>
                <p>MAISON DE MODE & STYLE</p>
            </div>
        </div>
        <nav>
            <ul>
                <li><a href="index.php">ACCUEIL</a></li>
                <li><a href="collections.php">COLLECTIONS</a></li>
                <li><a href="custom-designs.php">CRÉATIONS SUR MESURE</a></li>
                <li><a href="pricing.php">TARIFS</a></li>
                <li><a href="gallery.php">GALERIE</a></li>
                <li><a href="contact.php">CONTACT</a></li>
            </ul>
        </nav>
        <div class="header-actions">
            <a href="profile.php" class="user-icon" id="userIcon" title="Mon compte">👤</a>
            <a href="cart.php" class="cart-icon active" title="Mon panier">🛍 <span class="cart-count">0</span></a>
            <a href="logout.php" class="btn-logout" style="padding: 8px 15px; background: #d97642; color: white; border-radius: 4px; text-decoration: none; font-size: 14px;">Déconnexion</a>
        </div>
    </header>

    <main>
        <section class="cart-section">
            <div class="container">
                <h1>Mon Panier</h1>
                
                <div class="cart-grid">
                    <div class="cart-items">
                        <div id="cartItemsList">
                            <div class="loading">Chargement du panier...</div>
                        </div>
                    </div>

                    <div class="cart-summary">
                        <h2>Résumé de la commande</h2>
                        
                        <div class="summary-row">
                            <span>Sous-total</span>
                            <span id="subtotal">0 FCFA</span>
                        </div>
                        
                        <div class="summary-row">
                            <span>Livraison</span>
                            <span id="shipping">Gratuit</span>
                        </div>
                        
                        <div class="summary-divider"></div>
                        
                        <div class="summary-row total">
                            <span>Total</span>
                            <span id="total">0 FCFA</span>
                        </div>
                        
                        <button class="btn-checkout" onclick="proceedToCheckout()">
                            Procéder au paiement
                        </button>
                        
                        <a href="collections.php" class="btn-continue">
                            Continuer mes achats
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-col">
                    <h3>MH Couture</h3>
                    <p>Votre destination pour la mode sur mesure et l'élégance intemporelle.</p>
                </div>
                <div class="footer-col">
                    <h4>Liens Rapides</h4>
                    <ul>
                        <li><a href="index.php">Accueil</a></li>
                        <li><a href="collections.php">Collections</a></li>
                        <li><a href="contact.php">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Contact</h4>
                    <p>📧 Email: info@mhcouture.com</p>
                    <p>📱 Tél: +227 91717508</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 MH Couture. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <!-- Passer le token au JavaScript -->
    <script>
        window.authToken = '<?= htmlspecialchars($token) ?>';
    </script>
    <script src="js/cart.js"></script>
</body>
</html>
<?php
/**
 * Page Collections - MH Couture
 * Fichier: collections.php
 */

session_start();

// Vérifier l'authentificatio
$token = $_SESSION['auth_token'] ?? $_COOKIE['auth_token'] ?? null;

if (!$token) {
    header('Location: login.php');
    exit;
}

// Récupérer les infos utilisateur depuis session ou localStorage (via JS)
$userName = $_SESSION['user_name'] ?? 'Utilisateur';
$userEmail = $_SESSION['user_email'] ?? '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collections - MH Couture</title>
    <link rel="stylesheet" href="css/collections.css">
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
                <li><a href="collections.php" class="active">COLLECTIONS</a></li>
                <li><a href="custom-designs.php">CRÉATIONS SUR MESURE</a></li>
                <li><a href="pricing.php">TARIFS</a></li>
                <li><a href="gallery.php">GALERIE</a></li>
                <li><a href="contact.php">CONTACT</a></li>
            </ul>
        </nav>
        <div class="header-actions">
            <a href="profile.php" class="user-icon" id="userIcon" title="Mon compte">👤</a>
            <a href="cart.php" class="cart-icon" title="Mon panier">🛍 <span class="cart-count">0</span></a>
            <a href="logout.php" class="btn-logout" style="padding: 8px 15px; background: #d97642; color: white; border-radius: 4px; text-decoration: none; font-size: 14px;">Déconnexion</a>
        </div>
    </header>

    <main>
        <section class="hero-section">
            <h1>Nos Collections</h1>
            <p>Découvrez nos créations exclusives pour toute la famille</p>
        </section>

        <section class="filter-section">
            <div class="container">
                <div class="filters">
                    <button class="filter-btn active" data-category="all">Tous</button>
                    <button class="filter-btn" data-category="homme">Homme</button>
                    <button class="filter-btn" data-category="femme">Femme</button>
                    <button class="filter-btn" data-category="enfant">Enfant</button>
                </div>
                
                <div class="sort-options">
                    <select id="sortSelect">
                        <option value="newest">Plus récent</option>
                        <option value="price-asc">Prix croissant</option>
                        <option value="price-desc">Prix décroissant</option>
                        <option value="popular">Populaire</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="products-section">
            <div class="container">
                <div class="products-grid" id="productsGrid">
                    <div class="loading">Chargement des produits...</div>
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
                    <h4>Liens rapides</h4>
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
        window.userName = '<?= htmlspecialchars($userName) ?>';
        window.userEmail = '<?= htmlspecialchars($userEmail) ?>';
    </script>
    <script src="js/collections.js"></script>
</body>
</html>
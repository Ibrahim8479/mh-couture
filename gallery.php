<?php
/**
 * Page Galerie - MH Couture
 * Fichier: gallery.php
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
    <title>Galerie - MH Couture</title>
    <link rel="stylesheet" href="css/gallery.css">
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
                <li><a href="gallery.php" class="active">GALERIE</a></li>
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
            <h1>Notre Galerie</h1>
            <p>Découvrez nos plus belles créations</p>
        </section>

        <section class="filter-section">
            <div class="container">
                <div class="filters">
                    <button class="filter-btn active" data-filter="all">Tous</button>
                    <button class="filter-btn" data-filter="homme">Homme</button>
                    <button class="filter-btn" data-filter="femme">Femme</button>
                    <button class="filter-btn" data-filter="enfant">Enfant</button>
                    <button class="filter-btn" data-filter="mariage">Mariage</button>
                    <button class="filter-btn" data-filter="traditionnel">Traditionnel</button>
                </div>
            </div>
        </section>

        <section class="gallery-section">
            <div class="container">
                <div class="gallery-grid" id="galleryGrid">
                    <!-- Gallery items will be populated here -->
                </div>
            </div>
        </section>

        <section class="testimonials-section">
            <div class="container">
                <h2>Ce que disent nos clients</h2>
                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <div class="stars">⭐⭐⭐⭐⭐</div>
                        <p>"Un travail exceptionnel! Mon tenu  était parfaitement ajusté et la qualité est irréprochable."</p>
                        <div class="author">
                            <strong>Aisha Abdou.</strong>
                            <span>Habit sur mesure</span>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <div class="stars">⭐⭐⭐⭐⭐</div>
                        <p>"Ma robe de mariée était magnifique! L'équipe a su capturer exactement ce que je voulais."</p>
                        <div class="author">
                            <strong>Zeinabou Abdoul</strong>
                            <span>Robe de mariée</span>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <div class="stars">⭐⭐⭐⭐⭐</div>
                        <p>"Service professionnel et création unique. Je recommande vivement MH Couture!"</p>
                        <div class="author">
                            <strong>Idrissa Ali</strong>
                            <span>Ensemble traditionnel</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container">
                <h2>Inspiré par nos créations?</h2>
                <p>Créez votre propre tenue unique</p>
                <a href="custom-designs.php" class="btn-cta">Commander sur Mesure</a>
            </div>
        </section>
    </main>

    <div id="lightbox" class="lightbox">
        <span class="close-lightbox" onclick="closeLightbox()">&times;</span>
        <button class="lightbox-nav prev" onclick="changeLightboxImage(-1)">⟨</button>
        <img class="lightbox-content" id="lightboxImage">
        <button class="lightbox-nav next" onclick="changeLightboxImage(1)">⟩</button>
        <div class="lightbox-caption" id="lightboxCaption"></div>
    </div>

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
                        <li><a href="gallery.php">Galerie</a></li>
                        <li><a href="contact.php">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Contact</h4>
                    <p>📧 Email: info@mhcouture.com</p>
                    <p>📱 Téléphone: +227 91717508</p>
                    <p>📍 Adresse: Niamey, Niger</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 MH Couture. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <script>
        window.authToken = '<?= htmlspecialchars($token) ?>';
    </script>
    <script src="js/gallery.js"></script>
</body>
</html>
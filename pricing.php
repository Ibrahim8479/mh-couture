<?php
/**
 * Page Tarifs - MH Couture
 * Fichier: pricing.php
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
    <title>Tarifs - MH Couture</title>
    <link rel="stylesheet" href="css/pricing.css">
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
                <li><a href="pricing.php" class="active">TARIFS</a></li>
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
            <h1>Nos Tarifs</h1>
            <p>Des prix transparents pour une qualité exceptionnelle</p>
        </section>

        <section class="pricing-intro">
            <div class="container">
                <h2>Trouvez l'option qui vous convient</h2>
                <p>Chez MH Couture, nous offrons des solutions pour tous les budgets sans compromis sur la qualité. Nos tarifs incluent la consultation, les tissus premium et la main-d'œuvre experte.</p>
            </div>
        </section>

        <section class="filter-section">
            <div class="container">
                <div class="category-filters">
                    <button class="category-btn active" data-category="all">Tous</button>
                    <button class="category-btn" data-category="homme">Homme</button>
                    <button class="category-btn" data-category="femme">Femme</button>
                    <button class="category-btn" data-category="enfant">Enfant</button>
                </div>
            </div>
        </section>

        <section class="pricing-section">
            <div class="container">
                <div class="pricing-grid" id="pricingGrid">
                    <!-- Pricing cards will be populated here -->
                </div>
            </div>
        </section>

        <section class="services-section">
            <div class="container">
                <h2>Services Additionnels</h2>
                <div class="services-grid">
                    <div class="service-card">
                        <div class="service-icon">📐</div>
                        <h3>Prise de Mesures</h3>
                        <p class="service-price">Gratuit</p>
                        <p>Avec toute commande sur mesure</p>
                    </div>
                    <div class="service-card">
                        <div class="service-icon">✂️</div>
                        <h3>Retouches</h3>
                        <p class="service-price">8 000 - 20 000 FCFA</p>
                        <p>Ajustements après livraison</p>
                    </div>
                    <div class="service-card">
                        <div class="service-icon">🎨</div>
                        <h3>Consultation Design</h3>
                        <p class="service-price">Gratuit</p>
                        <p>Conseils personnalisés inclus</p>
                    </div>
                    <div class="service-card">
                        <div class="service-icon">🚚</div>
                        <h3>Livraison</h3>
                        <p class="service-price">Gratuit</p>
                        <p>À Niamey (commandes +80 000 FCFA)</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="faq-section">
            <div class="container">
                <h2>Questions Fréquentes</h2>
                <div class="faq-grid">
                    <div class="faq-item">
                        <h3>💰 Modes de paiement acceptés?</h3>
                        <p>Nous acceptons: Mobile Money, cartes bancaires, espèces et virements bancaires.</p>
                    </div>
                    <div class="faq-item">
                        <h3>⏱️ Délai de confection?</h3>
                        <p>Comptez 2-4 semaines selon la complexité. Service express disponible (+30%).</p>
                    </div>
                    <div class="faq-item">
                        <h3>📦 Politique d'annulation?</h3>
                        <p>Annulation gratuite sous 24h après commande. Après coupe: 50% du montant.</p>
                    </div>
                    <div class="faq-item">
                        <h3>📄 Garantie?</h3>
                        <p>Retouches gratuites pendant 30 jours. Satisfaction garantie ou remboursement.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container">
                <h2>Prêt à commander votre tenue?</h2>
                <p>Contactez-nous pour un devis personnalisé</p>
                <div class="cta-buttons">
                    <a href="custom-designs.php" class="btn-primary">Commander sur Mesure</a>
                    <a href="contact.php" class="btn-secondary">Demander un Devis</a>
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
                        <li><a href="pricing.php">Tarifs</a></li>
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
    <script src="js/pricing.js"></script>
</body>
</html>
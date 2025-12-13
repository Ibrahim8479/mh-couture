<?php
/**
 * Page Contact - MH Couture
 * Fichier: contact.php
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
    <title>Contact - MH Couture</title>
    <link rel="stylesheet" href="css/contact.css">
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
                <li><a href="contact.php" class="active">CONTACT</a></li>
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
            <h1>Contactez-nous</h1>
            <p>Nous sommes là pour répondre à toutes vos questions</p>
        </section>

        <section class="contact-section">
            <div class="container">
                <div class="contact-grid">
                    <div class="contact-info">
                        <h2>Nos Coordonnées</h2>
                        <p class="intro-text">N'hésitez pas à nous contacter pour toute question ou demande de devis. Notre équipe vous répondra dans les plus brefs délais.</p>
                        
                        <div class="info-cards">
                            <div class="info-card">
                                <div class="icon">📍</div>
                                <div class="details">
                                    <h3>Adresse</h3>
                                    <p>Niamey, Niger</p>
                                    <p>Quartier Cité de Progrès</p>
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="icon">📞</div>
                                <div class="details">
                                    <h3>Téléphone</h3>
                                    <p>+227 91717508</p>
                                    <p>Lun - Sam: 9h - 18h</p>
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="icon">📧</div>
                                <div class="details">
                                    <h3>Email</h3>
                                    <p>info@mhcouture.com</p>
                                    <p>commandes@mhcouture.com</p>
                                </div>
                            </div>

                            <div class="info-card">
                                <div class="icon">⏰</div>
                                <div class="details">
                                    <h3>Horaires</h3>
                                    <p>Lun - Ven: 9h00 - 18h00</p>
                                    <p>Sam: 10h00 - 16h00</p>
                                    <p>Dim: Fermé</p>
                                </div>
                            </div>
                        </div>

                        <div class="social-section">
                            <h3>Suivez-nous</h3>
                            <div class="social-links">
                                <a href="#" class="social-btn facebook" title="Facebook">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Facebook
                                </a>
                                <a href="#" class="social-btn instagram" title="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03z"/>
                                    </svg>
                                    Instagram
                                </a>
                                <a href="#" class="social-btn whatsapp" title="WhatsApp">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="contact-form-wrapper">
                        <h2>Envoyez-nous un message</h2>
                        <form id="contactForm" class="contact-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="firstName">Prénom *</label>
                                    <input type="text" id="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label for="lastName">Nom *</label>
                                    <input type="text" id="lastName" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="email">Email *</label>
                                <input type="email" id="email" required>
                            </div>

                            <div class="form-group">
                                <label for="phone">Téléphone</label>
                                <input type="tel" id="phone">
                            </div>

                            <div class="form-group">
                                <label for="subject">Sujet *</label>
                                <select id="subject" required>
                                    <option value="">Sélectionner...</option>
                                    <option value="commande">Commande sur mesure</option>
                                    <option value="devis">Demande de devis</option>
                                    <option value="info">Informations générales</option>
                                    <option value="sav">Service après-vente</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="message">Message *</label>
                                <textarea id="message" rows="6" required placeholder="Votre message..."></textarea>
                            </div>

                            <button type="submit" class="btn-submit">Envoyer le message</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>

        <section class="map-section">
            <div class="container">
                <h2>Notre Emplacement</h2>
                <div class="map-placeholder">
                    <p>🗺️ Carte Google Maps</p>
                    <p class="map-note">(Intégrez ici votre carte Google Maps avec votre adresse)</p>
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
    <script src="js/contact.js"></script>
</body>
</html>
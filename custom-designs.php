<?php
/**
 * Page Créations sur Mesure - MH Couture
 * Fichier: custom-designs.php
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
    <title>Créations sur Mesure - MH Couture</title>
    <link rel="stylesheet" href="css/custom-designs.css">
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
                <li><a href="custom-designs.php" class="active">CRÉATIONS SUR MESURE</a></li>
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
            <h1>Créations sur Mesure</h1>
            <p>Votre style unique, nos créations exceptionnelles</p>
        </section>

        <section class="intro-section">
            <div class="container">
                <div class="intro-content">
                    <h2>Exprimez votre style personnel</h2>
                    <p>Chez MH Couture, nous créons des vêtements qui vous ressemblent. Chaque pièce est conçue selon vos mesures, vos goûts et votre personnalité. De la consultation initiale à la livraison finale, nous vous accompagnons à chaque étape pour créer la tenue parfaite.</p>
                </div>
            </div>
        </section>

        <section class="process-section">
            <div class="container">
                <h2>Notre Processus de Création</h2>
                <div class="process-grid">
                    <div class="process-card">
                        <div class="process-icon">📋</div>
                        <h3>1. Consultation</h3>
                        <p>Discutez de vos idées, style et préférences avec notre équipe d'experts</p>
                    </div>
                    <div class="process-card">
                        <div class="process-icon">📐</div>
                        <h3>2. Prise de Mesures</h3>
                        <p>Prise de mesures précises pour garantir un ajustement parfait</p>
                    </div>
                    <div class="process-card">
                        <div class="process-icon">✂️</div>
                        <h3>3. Sélection des Tissus</h3>
                        <p>Choisissez parmi notre large gamme de tissus de qualité premium</p>
                    </div>
                    <div class="process-card">
                        <div class="process-icon">🎨</div>
                        <h3>4. Design</h3>
                        <p>Création d'un design unique adapté à votre morphologie et style</p>
                    </div>
                    <div class="process-card">
                        <div class="process-icon">✨</div>
                        <h3>5. Confection</h3>
                        <p>Nos artisans expérimentés donnent vie à votre création</p>
                    </div>
                    <div class="process-card">
                        <div class="process-icon">🎁</div>
                        <h3>6. Livraison</h3>
                        <p>Essayage final et ajustements si nécessaire avant la livraison</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="custom-form-section">
            <div class="container">
                <h2>Demander une Création sur Mesure</h2>
                <p class="form-subtitle">Remplissez ce formulaire et nous vous contactons sous 24h</p>
                
                <form id="customOrderForm" class="custom-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="fullName">Nom complet *</label>
                            <input type="text" id="fullName" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="phone">Téléphone *</label>
                            <input type="tel" id="phone" required>
                        </div>
                        <div class="form-group">
                            <label for="garmentType">Type de vêtement *</label>
                            <select id="garmentType" required>
                                <option value="">Sélectionner...</option>
                                <option value="costume">Costume</option>
                                <option value="robe">Robe</option>
                                <option value="chemise">Chemise</option>
                                <option value="pantalon">Pantalon</option>
                                <option value="caftan">Caftan</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="category">Catégorie *</label>
                            <select id="category" required>
                                <option value="">Sélectionner...</option>
                                <option value="homme">Homme</option>
                                <option value="femme">Femme</option>
                                <option value="enfant">Enfant</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="occasion">Occasion</label>
                            <input type="text" id="occasion" placeholder="Mariage, soirée, quotidien...">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="budget">Budget estimé (Fcfa)</label>
                        <input type="number" id="budget" placeholder="Votre budget">
                    </div>

                    <div class="form-group">
                        <label for="description">Description de votre projet *</label>
                        <textarea id="description" rows="5" placeholder="Décrivez votre idée, style souhaité, couleurs préférées..." required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="images">Images de référence (optionnel)</label>
                        <input type="file" id="images" multiple accept="image/*">
                        <small>Vous pouvez ajouter plusieurs images</small>
                    </div>

                    <div class="form-group">
                        <label>Avez-vous déjà vos mesures?</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="hasMeasurements" value="yes">
                                <span>Oui</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="hasMeasurements" value="no" checked>
                                <span>Non, je souhaite une prise de mesure</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="deadline">Date souhaitée de livraison</label>
                        <input type="date" id="deadline">
                    </div>

                    <button type="submit" class="btn-submit">Envoyer ma demande</button>
                </form>
            </div>
        </section>

        <section class="cta-section">
            <div class="container">
                <h2>Besoin de conseils?</h2>
                <p>Notre équipe est disponible pour vous guider dans votre projet</p>
                <a href="contact.php" class="btn-cta">Contactez-nous</a>
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
                        <li><a href="custom-designs.php">Créations sur mesure</a></li>
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
    <script src="js/custom-designs.js"></script>
</body>
</html>
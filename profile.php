<?php
/**
 * Page Profil utilisateur - MH Couture
 * Fichier: profile.php
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
    <title>Mon Profil - MH Couture</title>
    <link rel="stylesheet" href="css/profile.css">
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
            <a href="profile.php" class="user-icon active" id="userIcon" title="Mon profil">👤</a>
            <a href="cart.php" class="cart-icon" title="Mon panier">🛍 <span class="cart-count">0</span></a>
            <a href="logout.php" class="btn-logout" style="padding: 8px 15px; background: #d97642; color: white; border-radius: 4px; text-decoration: none; font-size: 14px;">Déconnexion</a>
        </div>
    </header>

    <main>
        <section class="profile-section">
            <div class="container">
                <h1>Mon Profil</h1>
                
                <div class="profile-grid">
                    <div class="profile-sidebar">
                        <div class="profile-avatar">
                            <div class="avatar-circle" id="avatarCircle">U</div>
                            <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                            <button class="btn-change-avatar" onclick="document.getElementById('avatarUpload').click()">
                                📷 Changer la photo
                            </button>
                            <h2 id="userName">Chargement...</h2>
                            <p id="userEmail">email@example.com</p>
                        </div>
                        
                        <nav class="profile-nav">
                            <a href="#" class="nav-link active" data-tab="info">
                                📋 Mes Informations
                            </a>
                            <a href="#" class="nav-link" data-tab="orders">
                                🛍️ Mes Commandes
                            </a>
                            <a href="#" class="nav-link" data-tab="measurements">
                                📏 Mes Mesures
                            </a>
                            <a href="#" class="nav-link" data-tab="security">
                                🔒 Sécurité
                            </a>
                        </nav>
                        
                        <a href="logout.php" class="btn-logout" style="width: 100%; text-align: center; padding: 10px; background: #e74c3c; color: white; border-radius: 4px; text-decoration: none; display: block; margin-top: 20px;">
                            Déconnexion
                        </a>
                    </div>

                    <div class="profile-content">
                        <!-- Mes Informations -->
                        <div class="tab-content active" id="info-tab">
                            <h3>Mes Informations Personnelles</h3>
                            <form id="profileForm" class="profile-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Prénom</label>
                                        <input type="text" id="firstName" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Nom</label>
                                        <input type="text" id="lastName" required>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="email" required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Téléphone</label>
                                    <input type="tel" id="phone" required>
                                </div>
                                
                                <button type="submit" class="btn-primary">Mettre à jour</button>
                            </form>
                        </div>

                        <!-- Mes Commandes -->
                        <div class="tab-content" id="orders-tab">
                            <h3>Mes Commandes</h3>
                            <div id="ordersList" class="orders-list">
                                <div class="loading">Chargement des commandes...</div>
                            </div>
                        </div>

                        <!-- Mes Mesures -->
                        <div class="tab-content" id="measurements-tab">
                            <h3>Mes Mesures</h3>
                            <p class="info-text">Enregistrez vos mesures pour faciliter vos commandes sur mesure</p>
                            <form id="measurementsForm" class="measurements-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tour de poitrine (cm)</label>
                                        <input type="number" step="0.1" id="chest">
                                    </div>
                                    <div class="form-group">
                                        <label>Tour de taille (cm)</label>
                                        <input type="number" step="0.1" id="waist">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tour de hanches (cm)</label>
                                        <input type="number" step="0.1" id="hips">
                                    </div>
                                    <div class="form-group">
                                        <label>Largeur épaules (cm)</label>
                                        <input type="number" step="0.1" id="shoulders">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Longueur bras (cm)</label>
                                        <input type="number" step="0.1" id="armLength">
                                    </div>
                                    <div class="form-group">
                                        <label>Longueur jambe (cm)</label>
                                        <input type="number" step="0.1" id="legLength">
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn-primary">Enregistrer les mesures</button>
                            </form>
                        </div>

                        <!-- Sécurité -->
                        <div class="tab-content" id="security-tab">
                            <h3>Changer le mot de passe</h3>
                            <form id="passwordForm" class="password-form">
                                <div class="form-group">
                                    <label>Mot de passe actuel</label>
                                    <input type="password" id="currentPassword" required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Nouveau mot de passe</label>
                                    <input type="password" id="newPassword" required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Confirmer le nouveau mot de passe</label>
                                    <input type="password" id="confirmPassword" required>
                                </div>
                                
                                <button type="submit" class="btn-primary">Changer le mot de passe</button>
                            </form>
                        </div>
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
    <script src="js/profile.js"></script>
</body>
</html>
<?php
/**
 * Page d'inscription - MH Couture
 * Fichier: signup.php
 * VERSION CORRIGÉE - Encodage UTF-8 + Sécurité CSRF
 */

session_start();
session_regenerate_id(true); // Sécurité supplémentaire

// Redirection si utilisateur connecté
if (isset($_SESSION['auth_token']) || isset($_COOKIE['auth_token'])) {
    header('Location: collections.php');
    exit;
}

// Générer token CSRF
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription - MH Couture</title>
    <link rel="stylesheet" href="css/signup.css">
</head>
<body>
    <div class="container">
        <div class="form-box">
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

            <div class="form-content">
                <h2>Créer un compte</h2>
                <p class="subtitle">Rejoignez notre communauté de style</p>

                <form id="signupForm">
                    <!-- Token CSRF sécurisé -->
                    <input type="hidden" name="csrf_token" id="csrfToken" value="<?php echo htmlspecialchars($csrf_token); ?>">

                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">Prénom</label>
                            <input type="text" id="firstName" name="firstName" placeholder="Votre prénom" required maxlength="50">
                            <span class="error-message" id="firstNameError"></span>
                        </div>

                        <div class="form-group">
                            <label for="lastName">Nom</label>
                            <input type="text" id="lastName" name="lastName" placeholder="Votre nom" required maxlength="50">
                            <span class="error-message" id="lastNameError"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="votre@email.com" required maxlength="100">
                        <span class="error-message" id="emailError"></span>
                    </div>

                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input type="tel" id="phone" name="phone" placeholder="+227 XX XXX XXXX" required maxlength="20">
                        <span class="error-message" id="phoneError"></span>
                    </div>

                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required maxlength="128">
                        <span class="error-message" id="passwordError"></span>
                        <div class="password-strength">
                            <div class="strength-bar">
                                <div class="strength-fill" id="strengthFill"></div>
                            </div>
                            <span class="strength-text" id="strengthText"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirmer le mot de passe</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required maxlength="128">
                        <span class="error-message" id="confirmPasswordError"></span>
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="terms" id="terms" required>
                            <span>J'accepte les <a href="#">conditions d'utilisation</a> et la <a href="#">politique de confidentialité</a></span>
                        </label>
                        <span class="error-message" id="termsError"></span>
                    </div>

                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="newsletter" id="newsletter">
                            <span>Je souhaite recevoir les actualités et offres exclusives</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-submit">S'inscrire</button>

                    <div class="divider">
                        <span>OU</span>
                    </div>

                    <div class="social-login">
                        <button type="button" class="btn-social btn-google">
                            <svg width="18" height="18" viewBox="0 0 18 18">
                                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                                <path fill="#EA4335" d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z"/>
                            </svg>
                            S'inscrire avec Google
                        </button>
                        <button type="button" class="btn-social btn-facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            S'inscrire avec Facebook
                        </button>
                    </div>

                    <p class="login-link">
                        Vous avez déjà un compte? <a href="login.php">Connectez-vous ici</a>
                    </p>
                </form>
            </div>
        </div>
    </div>

    <script src="js/signup.js"></script>
</body>
</html>
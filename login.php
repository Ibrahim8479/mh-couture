<?php
/**
 * Page de connexion - MH Couture
 * Fichier: login.php
 */

session_start();

// Redirection si utilisateur connecté
if (isset($_SESSION['auth_token']) || isset($_COOKIE['auth_token'])) {
    header('Location: collections.php');
    exit;
}

$error = '';
$success = isset($_GET['signup']) ? 'Inscription réussie! Connectez-vous maintenant.' : '';
$logged_out = isset($_GET['logged_out']) ? 'Vous avez été déconnecté avec succès.' : '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - MH Couture</title>
    <link rel="stylesheet" href="css/login.css">
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
                <h2>Connexion</h2>
                <p class="subtitle">Accédez à votre compte MH Couture</p>

                <?php if ($success): ?>
                    <div class="success-message" style="color: #27ae60; padding: 10px; background: #e8f8f5; border-radius: 4px; margin-bottom: 20px;">
                        ✅ <?= htmlspecialchars($success) ?>
                    </div>
                <?php endif; ?>

                <?php if ($logged_out): ?>
                    <div class="info-message" style="color: #3498db; padding: 10px; background: #ebf5fb; border-radius: 4px; margin-bottom: 20px;">
                        ℹ️ <?= htmlspecialchars($logged_out) ?>
                    </div>
                <?php endif; ?>

                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="votre@email.com" required>
                        <span class="error-message" id="emailError"></span>
                    </div>

                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                        <span class="error-message" id="passwordError"></span>
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" name="remember">
                            <span>Se souvenir de moi</span>
                        </label>
                        <a href="#" class="forgot-password">Mot de passe oublié?</a>
                    </div>

                    <button type="submit" class="btn-submit">Se Connecter</button>

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
                            Continuer avec Google
                        </button>
                        <button type="button" class="btn-social btn-facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Continuer avec Facebook
                        </button>
                    </div>

                    <p class="signup-link">
                        Vous n'avez pas de compte? <a href="signup.php">Inscrivez-vous ici</a>
                    </p>
                </form>
            </div>
        </div>
    </div>

    <script src="js/login.js"></script>
</body>
</html>
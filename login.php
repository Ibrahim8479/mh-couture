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
                        <a href="forgot-password.php" class="forgot-password">Mot de passe oublié?</a>
                    </div>

                    <button type="submit" class="btn-submit">Se Connecter</button>
                </form>

                <!-- ✅ CORRECTION : Lien avec onclick pour forcer la navigation -->
                <p class="signup-link">
                    Vous n'avez pas de compte? <a href="javascript:void(0);" onclick="window.location.href='signup.php';">Inscrivez-vous ici</a>
                </p>
            </div>
        </div>
    </div>

    <script src="js/login.js"></script>
</body>
</html>
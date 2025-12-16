<?php
/**
 * Page Reset Password - MH Couture
 * Fichier: reset-password.php
 */
session_start();

// Vérifier le token
$token = $_GET['token'] ?? '';

if (empty($token)) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau mot de passe - MH Couture</title>
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
                <h2>Nouveau mot de passe</h2>
                <p class="subtitle">Créez votre nouveau mot de passe</p>

                <form id="resetPasswordForm">
                    <input type="hidden" id="token" value="<?= htmlspecialchars($token) ?>">
                    
                    <div class="form-group">
                        <label for="newPassword">Nouveau mot de passe</label>
                        <input type="password" id="newPassword" placeholder="••••••••" required>
                        <span class="error-message" id="newPasswordError"></span>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirmer le mot de passe</label>
                        <input type="password" id="confirmPassword" placeholder="••••••••" required>
                        <span class="error-message" id="confirmPasswordError"></span>
                    </div>

                    <button type="submit" class="btn-submit">Réinitialiser le mot de passe</button>
                </form>
            </div>
        </div>
    </div>

    <script src="js/reset-password.js"></script>
</body>
</html>
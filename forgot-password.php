<?php
/**
 * Page Mot de passe oublié - MH Couture
 * Fichier: forgot-password.php
 */
session_start();

// Redirection si déjà connecté
if (isset($_SESSION['auth_token']) || isset($_COOKIE['auth_token'])) {
    header('Location: collections.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mot de passe oublié - MH Couture</title>
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
                <h2>Mot de passe oublié ?</h2>
                <p class="subtitle">Entrez votre email pour recevoir un lien de réinitialisation</p>

                <form id="forgotPasswordForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="votre@email.com" required>
                        <span class="error-message" id="emailError"></span>
                    </div>

                    <button type="submit" class="btn-submit">Envoyer le lien</button>

                    <p class="signup-link">
                        Vous vous souvenez ? <a href="login.php">Connectez-vous ici</a>
                    </p>
                </form>
            </div>
        </div>
    </div>

    <script src="js/forgot-password.js"></script>
</body>
</html>
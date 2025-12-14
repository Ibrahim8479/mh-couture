<?php
/**
 * Page d'inscription - MH Couture
 * Fichier: signup.php
 */

session_start();

// Redirection si utilisateur connecté
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
                    <div class="form-row">
                        <div class="form-group">
                            <label for="firstName">Prénom</label>
                            <input type="text" id="firstName" name="firstName" placeholder="Votre prénom" required>
                            <span class="error-message" id="firstNameError"></span>
                        </div>

                        <div class="form-group">
                            <label for="lastName">Nom</label>
                            <input type="text" id="lastName" name="lastName" placeholder="Votre nom" required>
                            <span class="error-message" id="lastNameError"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="votre@email.com" required>
                        <span class="error-message" id="emailError"></span>
                    </div>

                    <div class="form-group">
                        <label for="phone">Téléphone</label>
                        <input type="tel" id="phone" name="phone" placeholder="+227 XX XXX XXXX" required>
                        <span class="error-message" id="phoneError"></span>
                    </div>

                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
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
                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="••••••••" required>
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
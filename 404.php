<?php
/**
 * Page 404 - MH Couture
 * Fichier: 404.php
 */
http_response_code(404);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page non trouvée - MH Couture</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #e8edf2 0%, #dce4ec 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .error-container {
            max-width: 600px;
            text-align: center;
            background: white;
            padding: 60px 40px;
            border-radius: 20px;
            box-shadow: 0 10px 50px rgba(0,0,0,0.1);
        }

        .error-code {
            font-size: 120px;
            font-weight: 700;
            color: #d97642;
            line-height: 1;
            margin-bottom: 20px;
        }

        .error-title {
            font-size: 32px;
            color: #333;
            margin-bottom: 15px;
        }

        .error-message {
            font-size: 18px;
            color: #666;
            margin-bottom: 40px;
            line-height: 1.6;
        }

        .error-icon {
            font-size: 80px;
            margin-bottom: 30px;
        }

        .btn-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 14px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s;
            display: inline-block;
        }

        .btn-primary {
            background: #d97642;
            color: white;
        }

        .btn-primary:hover {
            background: #c86635;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(217, 118, 66, 0.3);
        }

        .btn-secondary {
            background: white;
            color: #333;
            border: 2px solid #e0e0e0;
        }

        .btn-secondary:hover {
            border-color: #d97642;
            color: #d97642;
        }

        .suggestions {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 2px solid #f0f0f0;
        }

        .suggestions h3 {
            font-size: 20px;
            color: #333;
            margin-bottom: 20px;
        }

        .links {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }

        .links a {
            color: #d97642;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
        }

        .links a:hover {
            color: #c86635;
            text-decoration: underline;
        }

        @media (max-width: 480px) {
            .error-code {
                font-size: 80px;
            }

            .error-title {
                font-size: 24px;
            }

            .error-message {
                font-size: 16px;
            }

            .btn-group {
                flex-direction: column;
            }

            .btn {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">🧵</div>
        <div class="error-code">404</div>
        <h1 class="error-title">Page non trouvée</h1>
        <p class="error-message">
            Désolé, la page que vous recherchez semble avoir été déplacée, 
            supprimée ou n'existe pas. Comme une couture manquante, 
            nous ne pouvons pas la trouver !
        </p>

        <div class="btn-group">
            <a href="index.php" class="btn btn-primary">🏠 Retour à l'accueil</a>
            <a href="javascript:history.back()" class="btn btn-secondary">← Page précédente</a>
        </div>

        <div class="suggestions">
            <h3>Pages populaires :</h3>
            <div class="links">
                <a href="collections.php">📦 Nos Collections</a>
                <a href="custom-designs.php">✂️ Créations sur Mesure</a>
                <a href="pricing.php">💰 Nos Tarifs</a>
                <a href="gallery.php">🖼️ Galerie</a>
                <a href="contact.php">📧 Nous Contacter</a>
            </div>
        </div>
    </div>
</body>
</html>
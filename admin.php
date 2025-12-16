<?php
/**
 * Page Administration - MH Couture
 * Fichier: admin.php
 * CORRIGÉ pour Ibrahim@gmail.com
 */

session_start();

// Vérifier l'authentification
$token = $_SESSION['auth_token'] ?? $_COOKIE['auth_token'] ?? null;

if (!$token) {
    header('Location: login.php');
    exit;
}

// Vérifier si admin (utiliser le champ is_admin de la BD)
require_once 'php/config/database.php';
require_once 'php/includes/functions.php';

$user = getUserIdFromToken($token);

if (!$user || $user['is_admin'] != 1) {
    header('Location: index.php');
    exit;
}

$adminName = $_SESSION['user_name'] ?? $user['first_name'] . ' ' . $user['last_name'] ?? 'Admin';
$adminEmail = $_SESSION['user_email'] ?? $user['email'] ?? '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration - MH Couture</title>
    <link rel="stylesheet" href="css/admin.css">
</head>
<body>
    <div class="admin-container">
        <aside class="sidebar">
            <div class="logo">
                <h2>MH Couture</h2>
                <p>Administration</p>
            </div>
            <nav class="admin-nav">
                <a href="admin.php" class="nav-link active" data-section="dashboard">
                    📊 Tableau de bord
                </a>
                <a href="admin.php?section=products" class="nav-link" data-section="products">
                    📦 Produits
                </a>
                <a href="admin.php?section=orders" class="nav-link" data-section="orders">
                    📋 Commandes
                </a>
                <a href="admin.php?section=users" class="nav-link" data-section="users">
                    👥 Utilisateurs
                </a>
                <a href="admin.php?section=settings" class="nav-link" data-section="settings">
                    ⚙️ Paramètres
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="index.php" class="btn-back">← Retour au site</a>
                <a href="logout.php" class="btn-logout">Déconnexion</a>
            </div>
        </aside>

        <main class="main-content">
            <header class="admin-header">
                <h1 id="pageTitle">Tableau de bord</h1>
                <div class="admin-user">
                    <span id="adminName"><?= htmlspecialchars($adminName) ?></span>
                    <span class="admin-email"><?= htmlspecialchars($adminEmail) ?></span>
                    <div class="avatar"><?= strtoupper($adminName[0] ?? 'A') ?></div>
                </div>
            </header>

            <!-- Dashboard Section -->
            <section id="dashboard-section" class="content-section active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-info">
                            <h3 id="totalProducts">0</h3>
                            <p>Produits</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📋</div>
                        <div class="stat-info">
                            <h3 id="totalOrders">0</h3>
                            <p>Commandes</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <h3 id="totalUsers">0</h3>
                            <p>Utilisateurs</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h3 id="totalRevenue">0 FCFA</h3>
                            <p>Revenus</p>
                        </div>
                    </div>
                </div>

                <div class="recent-orders">
                    <h2>Commandes récentes</h2>
                    <div class="table-container">
                        <table id="recentOrdersTable">
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Montant</th>
                                    <th>Statut</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="5" class="no-data">Aucune commande récente</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Products Section -->
            <section id="products-section" class="content-section">
                <div class="section-header">
                    <h2>Gestion des Produits</h2>
                    <button class="btn-primary" onclick="openProductModal()">+ Ajouter un produit</button>
                </div>
                
                <div class="filters-bar">
                    <input type="text" placeholder="Rechercher un produit..." id="productSearch">
                    <select id="categoryFilter">
                        <option value="all">Toutes les catégories</option>
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="enfant">Enfant</option>
                    </select>
                </div>

                <div class="table-container">
                    <table id="productsTable">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Prix</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="6" class="no-data">Chargement des produits...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Orders Section -->
            <section id="orders-section" class="content-section">
                <div class="section-header">
                    <h2>Gestion des Commandes</h2>
                </div>
                <div class="table-container">
                    <table id="ordersTable">
                        <thead>
                            <tr>
                                <th>N° Commande</th>
                                <th>Client</th>
                                <th>Articles</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="7" class="no-data">Aucune commande</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Users Section -->
            <section id="users-section" class="content-section">
                <div class="section-header">
                    <h2>Gestion des Utilisateurs</h2>
                </div>
                <div class="table-container">
                    <table id="usersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Date d'inscription</th>
                                <th>Statut Admin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colspan="7" class="no-data">Aucun utilisateur</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- Settings Section -->
            <section id="settings-section" class="content-section">
                <h2>Paramètres</h2>
                <div class="settings-container">
                    <div class="settings-card">
                        <h3>Informations du site</h3>
                        <form id="siteSettingsForm">
                            <div class="form-group">
                                <label>Nom du site</label>
                                <input type="text" value="MH Couture">
                            </div>
                            <div class="form-group">
                                <label>Email de contact</label>
                                <input type="email" value="info@mhcouture.com">
                            </div>
                            <div class="form-group">
                                <label>Téléphone</label>
                                <input type="tel" value="+227 91717508">
                            </div>
                            <button type="submit" class="btn-primary">Enregistrer</button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- MODAL AJOUT PRODUIT -->
<div class="modal" id="addProductModal">

    <div class="modal-content">

        <!-- Bouton fermer -->
        <button class="modal-close" onclick="closeAddProductModal()">×</button>

        <h2>Ajouter un produit</h2>

        <form method="POST" enctype="multipart/form-data">

            <div class="form-group">
                <label>Nom du produit *</label>
                <input type="text" name="nom" required>
            </div>

            <div class="form-group">
                <label>Catégorie *</label>
                <select name="categorie" required>
                    <option value="">Sélectionner...</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Enfant">Enfant</option>
                </select>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Prix (FCFA) *</label>
                    <input type="number" name="prix" required>
                </div>

                <div class="form-group">
                    <label>Stock *</label>
                    <input type="number" name="stock" required>
                </div>
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea name="description"></textarea>
            </div>

            <div class="form-group">
                <label>Image du produit</label>
                <input type="file" name="image">
            </div>

            <div class="checkbox-group">
                <input type="checkbox" name="sur_mesure" id="sur_mesure">
                <label for="sur_mesure">Produit sur mesure</label>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick="closeAddProductModal()">Annuler</button>
                <button type="submit" class="btn-save">Enregistrer</button>
            </div>

        </form>
    </div>
</div>

    <!-- Scripts -->
    <script>
        window.authToken = '<?= htmlspecialchars($token) ?>';
        window.isAdmin = true;
    </script>
    <script src="js/admin.js"></script>
</body>
</html>
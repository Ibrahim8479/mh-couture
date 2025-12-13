/**
 * Système de traduction FR/EN - MH Couture
 * Fichier: js/translations.js
 */

// Langue par défaut
let currentLanguage = localStorage.getItem('language') || 'fr';

// Toutes les traductions
const translations = {
    fr: {
        // Navigation
        nav_home: "ACCUEIL",
        nav_collections: "COLLECTIONS",
        nav_custom: "CRÉATIONS SUR MESURE",
        nav_pricing: "TARIFS",
        nav_gallery: "GALERIE",
        nav_contact: "CONTACT",
        
        // Page d'accueil
        home_welcome: "Bienvenue chez",
        home_tagline: "Maison de Mode Premium | Couture Sur Mesure & Créations Personnalisées",
        home_description: "Votre destination pour des vêtements sur mesure exquis et une élégance intemporelle.<br>Découvrez nos collections exclusives, parcourez les designs selon votre budget et créez votre tenue parfaite.<br>Vivez l'expérience d'une couture de luxe confectionnée juste pour vous.",
        home_login: "Se Connecter",
        home_signup: "S'inscrire",
        home_already_account: "Vous avez déjà un compte?",
        home_click_login: "Cliquez ici pour vous connecter",
        
        // Login
        login_title: "Connexion",
        login_subtitle: "Accédez à votre compte MH Couture",
        login_email: "Email",
        login_password: "Mot de passe",
        login_remember: "Se souvenir de moi",
        login_forgot: "Mot de passe oublié?",
        login_button: "Se Connecter",
        login_or: "OU",
        login_google: "Continuer avec Google",
        login_facebook: "Continuer avec Facebook",
        login_no_account: "Vous n'avez pas de compte?",
        login_signup_link: "Inscrivez-vous ici",
        
        // Signup
        signup_title: "Créer un compte",
        signup_subtitle: "Rejoignez notre communauté de style",
        signup_firstname: "Prénom",
        signup_lastname: "Nom",
        signup_email: "Email",
        signup_phone: "Téléphone",
        signup_password: "Mot de passe",
        signup_confirm: "Confirmer le mot de passe",
        signup_terms: "J'accepte les",
        signup_terms_link: "conditions d'utilisation",
        signup_and: "et la",
        signup_privacy: "politique de confidentialité",
        signup_newsletter: "Je souhaite recevoir les actualités et offres exclusives",
        signup_button: "S'inscrire",
        signup_google: "S'inscrire avec Google",
        signup_facebook: "S'inscrire avec Facebook",
        signup_have_account: "Vous avez déjà un compte?",
        signup_login_link: "Connectez-vous ici",
        
        // Collections
        collections_title: "Nos Collections",
        collections_subtitle: "Découvrez nos créations exclusives pour toute la famille",
        collections_all: "Tous",
        collections_men: "Homme",
        collections_women: "Femme",
        collections_children: "Enfant",
        collections_sort: "Trier par",
        collections_newest: "Plus récent",
        collections_price_asc: "Prix croissant",
        collections_price_desc: "Prix décroissant",
        collections_popular: "Populaire",
        collections_add_cart: "Ajouter au panier",
        collections_loading: "Chargement des produits...",
        collections_no_products: "Aucun produit trouvé dans cette catégorie",
        
        // Custom Designs
        custom_title: "Créations sur Mesure",
        custom_subtitle: "Votre style unique, nos créations exceptionnelles",
        custom_intro_title: "Exprimez votre style personnel",
        custom_intro_text: "Chez MH Couture, nous créons des vêtements qui vous ressemblent. Chaque pièce est conçue selon vos mesures, vos goûts et votre personnalité. De la consultation initiale à la livraison finale, nous vous accompagnons à chaque étape pour créer la tenue parfaite.",
        custom_process_title: "Notre Processus de Création",
        custom_step1: "1. Consultation",
        custom_step1_desc: "Discutez de vos idées, style et préférences avec notre équipe d'experts",
        custom_step2: "2. Prise de Mesures",
        custom_step2_desc: "Prise de mesures précises pour garantir un ajustement parfait",
        custom_step3: "3. Sélection des Tissus",
        custom_step3_desc: "Choisissez parmi notre large gamme de tissus de qualité premium",
        custom_step4: "4. Design",
        custom_step4_desc: "Création d'un design unique adapté à votre morphologie et style",
        custom_step5: "5. Confection",
        custom_step5_desc: "Nos artisans expérimentés donnent vie à votre création",
        custom_step6: "6. Livraison",
        custom_step6_desc: "Essayage final et ajustements si nécessaire avant la livraison",
        custom_form_title: "Demander une Création sur Mesure",
        custom_form_subtitle: "Remplissez ce formulaire et nous vous contactons sous 24h",
        custom_fullname: "Nom complet",
        custom_email: "Email",
        custom_phone: "Téléphone",
        custom_garment_type: "Type de vêtement",
        custom_category: "Catégorie",
        custom_occasion: "Occasion",
        custom_budget: "Budget estimé (Fcfa)",
        custom_description: "Description de votre projet",
        custom_images: "Images de référence (optionnel)",
        custom_measurements: "Avez-vous déjà vos mesures?",
        custom_measurements_yes: "Oui",
        custom_measurements_no: "Non, je souhaite une prise de mesure",
        custom_deadline: "Date souhaitée de livraison",
        custom_submit: "Envoyer ma demande",
        custom_cta_title: "Besoin de conseils?",
        custom_cta_text: "Notre équipe est disponible pour vous guider dans votre projet",
        custom_cta_button: "Contactez-nous",
        
        // Pricing
        pricing_title: "Nos Tarifs",
        pricing_subtitle: "Des prix transparents pour une qualité exceptionnelle",
        pricing_intro_title: "Trouvez l'option qui vous convient",
        pricing_intro_text: "Chez MH Couture, nous offrons des solutions pour tous les budgets sans compromis sur la qualité. Nos tarifs incluent la consultation, les tissus premium et la main-d'œuvre experte.",
        pricing_all: "Tous",
        pricing_order: "Commander",
        pricing_services_title: "Services Additionnels",
        pricing_service1: "Prise de Mesures",
        pricing_service1_price: "Gratuit",
        pricing_service1_desc: "Avec toute commande sur mesure",
        pricing_service2: "Retouches",
        pricing_service2_desc: "Ajustements après livraison",
        pricing_service3: "Consultation Design",
        pricing_service3_price: "Gratuit",
        pricing_service3_desc: "Conseils personnalisés inclus",
        pricing_service4: "Livraison",
        pricing_service4_price: "Gratuit",
        pricing_service4_desc: "À Niamey (commandes +80 000 FCFA)",
        pricing_faq_title: "Questions Fréquentes",
        pricing_cta_title: "Prêt à commander votre tenue?",
        pricing_cta_text: "Contactez-nous pour un devis personnalisé",
        pricing_cta_custom: "Commander sur Mesure",
        pricing_cta_quote: "Demander un Devis",
        
        // Gallery
        gallery_title: "Notre Galerie",
        gallery_subtitle: "Découvrez nos plus belles créations",
        gallery_all: "Tous",
        gallery_men: "Homme",
        gallery_women: "Femme",
        gallery_children: "Enfant",
        gallery_wedding: "Mariage",
        gallery_traditional: "Traditionnel",
        gallery_view: "Voir",
        gallery_testimonials_title: "Ce que disent nos clients",
        gallery_cta_title: "Inspiré par nos créations?",
        gallery_cta_text: "Créez votre propre tenue unique",
        gallery_cta_button: "Commander sur Mesure",
        
        // Contact
        contact_title: "Contactez-nous",
        contact_subtitle: "Nous sommes là pour répondre à toutes vos questions",
        contact_info_title: "Nos Coordonnées",
        contact_info_text: "N'hésitez pas à nous contacter pour toute question ou demande de devis. Notre équipe vous répondra dans les plus brefs délais.",
        contact_address: "Adresse",
        contact_phone_label: "Téléphone",
        contact_email_label: "Email",
        contact_hours: "Horaires",
        contact_hours_weekdays: "Lun - Ven: 9h00 - 18h00",
        contact_hours_saturday: "Sam: 10h00 - 16h00",
        contact_hours_sunday: "Dim: Fermé",
        contact_follow: "Suivez-nous",
        contact_form_title: "Envoyez-nous un message",
        contact_firstname: "Prénom",
        contact_lastname: "Nom",
        contact_email: "Email",
        contact_phone: "Téléphone",
        contact_subject: "Sujet",
        contact_message: "Message",
        contact_submit: "Envoyer le message",
        contact_map_title: "Notre Emplacement",
        
        // Admin
        admin_dashboard: "Tableau de bord",
        admin_products: "Produits",
        admin_orders: "Commandes",
        admin_users: "Utilisateurs",
        admin_settings: "Paramètres",
        admin_back_site: "Retour au site",
        admin_logout: "Déconnexion",
        admin_total_products: "Produits",
        admin_total_orders: "Commandes",
        admin_total_users: "Utilisateurs",
        admin_total_revenue: "Revenus",
        admin_recent_orders: "Commandes récentes",
        
        // Footer
        footer_about: "MH Couture",
        footer_about_text: "Votre destination pour la mode sur mesure et l'élégance intemporelle.",
        footer_quick_links: "Liens Rapides",
        footer_contact: "Contact",
        footer_rights: "Tous droits réservés.",
        
        // Messages
        msg_login_success: "Connexion réussie!",
        msg_signup_success: "Inscription réussie!",
        msg_add_cart_success: "Produit ajouté au panier avec succès!",
        msg_contact_success: "Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.",
        msg_custom_success: "Votre demande a été envoyée avec succès! Nous vous contacterons sous 24h.",
        msg_error: "Une erreur est survenue",
        msg_login_required: "Veuillez vous connecter pour ajouter des produits au panier",
        
        // Misc
        currency: "FCFA",
        select_option: "Sélectionner...",
        required_fields: "Champs obligatoires",
    },
    
    en: {
        // Navigation
        nav_home: "HOME",
        nav_collections: "COLLECTIONS",
        nav_custom: "CUSTOM DESIGNS",
        nav_pricing: "PRICING",
        nav_gallery: "GALLERY",
        nav_contact: "CONTACT",
        
        // Homepage
        home_welcome: "Welcome to",
        home_tagline: "Premium Fashion House | Custom Tailoring & Personalized Creations",
        home_description: "Your destination for exquisite custom-made garments and timeless elegance.<br>Discover our exclusive collections, browse designs within your budget, and create your perfect outfit.<br>Experience luxury tailoring crafted just for you.",
        home_login: "Login",
        home_signup: "Sign Up",
        home_already_account: "Already have an account?",
        home_click_login: "Click here to login",
        
        // Login
        login_title: "Login",
        login_subtitle: "Access your MH Couture account",
        login_email: "Email",
        login_password: "Password",
        login_remember: "Remember me",
        login_forgot: "Forgot password?",
        login_button: "Login",
        login_or: "OR",
        login_google: "Continue with Google",
        login_facebook: "Continue with Facebook",
        login_no_account: "Don't have an account?",
        login_signup_link: "Sign up here",
        
        // Signup
        signup_title: "Create Account",
        signup_subtitle: "Join our style community",
        signup_firstname: "First Name",
        signup_lastname: "Last Name",
        signup_email: "Email",
        signup_phone: "Phone",
        signup_password: "Password",
        signup_confirm: "Confirm Password",
        signup_terms: "I accept the",
        signup_terms_link: "terms of use",
        signup_and: "and the",
        signup_privacy: "privacy policy",
        signup_newsletter: "I want to receive news and exclusive offers",
        signup_button: "Sign Up",
        signup_google: "Sign up with Google",
        signup_facebook: "Sign up with Facebook",
        signup_have_account: "Already have an account?",
        signup_login_link: "Login here",
        
        // Collections
        collections_title: "Our Collections",
        collections_subtitle: "Discover our exclusive creations for the whole family",
        collections_all: "All",
        collections_men: "Men",
        collections_women: "Women",
        collections_children: "Children",
        collections_sort: "Sort by",
        collections_newest: "Newest",
        collections_price_asc: "Price: Low to High",
        collections_price_desc: "Price: High to Low",
        collections_popular: "Popular",
        collections_add_cart: "Add to Cart",
        collections_loading: "Loading products...",
        collections_no_products: "No products found in this category",
        
        // Custom Designs
        custom_title: "Custom Designs",
        custom_subtitle: "Your unique style, our exceptional creations",
        custom_intro_title: "Express your personal style",
        custom_intro_text: "At MH Couture, we create garments that reflect you. Each piece is designed according to your measurements, tastes, and personality. From initial consultation to final delivery, we accompany you every step of the way to create the perfect outfit.",
        custom_process_title: "Our Creation Process",
        custom_step1: "1. Consultation",
        custom_step1_desc: "Discuss your ideas, style and preferences with our team of experts",
        custom_step2: "2. Measurements",
        custom_step2_desc: "Precise measurements to ensure a perfect fit",
        custom_step3: "3. Fabric Selection",
        custom_step3_desc: "Choose from our wide range of premium quality fabrics",
        custom_step4: "4. Design",
        custom_step4_desc: "Creating a unique design adapted to your body shape and style",
        custom_step5: "5. Tailoring",
        custom_step5_desc: "Our experienced artisans bring your creation to life",
        custom_step6: "6. Delivery",
        custom_step6_desc: "Final fitting and adjustments if needed before delivery",
        custom_form_title: "Request a Custom Creation",
        custom_form_subtitle: "Fill out this form and we'll contact you within 24 hours",
        custom_fullname: "Full Name",
        custom_email: "Email",
        custom_phone: "Phone",
        custom_garment_type: "Garment Type",
        custom_category: "Category",
        custom_occasion: "Occasion",
        custom_budget: "Estimated Budget (Fcfa)",
        custom_description: "Project Description",
        custom_images: "Reference Images (optional)",
        custom_measurements: "Do you already have your measurements?",
        custom_measurements_yes: "Yes",
        custom_measurements_no: "No, I need measurements taken",
        custom_deadline: "Desired Delivery Date",
        custom_submit: "Send My Request",
        custom_cta_title: "Need advice?",
        custom_cta_text: "Our team is available to guide you in your project",
        custom_cta_button: "Contact Us",
        
        // Pricing
        pricing_title: "Our Pricing",
        pricing_subtitle: "Transparent prices for exceptional quality",
        pricing_intro_title: "Find the option that suits you",
        pricing_intro_text: "At MH Couture, we offer solutions for all budgets without compromising on quality. Our prices include consultation, premium fabrics and expert craftsmanship.",
        pricing_all: "All",
        pricing_order: "Order",
        pricing_services_title: "Additional Services",
        pricing_service1: "Measurements",
        pricing_service1_price: "Free",
        pricing_service1_desc: "With any custom order",
        pricing_service2: "Alterations",
        pricing_service2_desc: "Adjustments after delivery",
        pricing_service3: "Design Consultation",
        pricing_service3_price: "Free",
        pricing_service3_desc: "Personalized advice included",
        pricing_service4: "Delivery",
        pricing_service4_price: "Free",
        pricing_service4_desc: "In Niamey (orders +80,000 FCFA)",
        pricing_faq_title: "Frequently Asked Questions",
        pricing_cta_title: "Ready to order your outfit?",
        pricing_cta_text: "Contact us for a personalized quote",
        pricing_cta_custom: "Custom Order",
        pricing_cta_quote: "Request a Quote",
        
        // Gallery
        gallery_title: "Our Gallery",
        gallery_subtitle: "Discover our finest creations",
        gallery_all: "All",
        gallery_men: "Men",
        gallery_women: "Women",
        gallery_children: "Children",
        gallery_wedding: "Wedding",
        gallery_traditional: "Traditional",
        gallery_view: "View",
        gallery_testimonials_title: "What our clients say",
        gallery_cta_title: "Inspired by our creations?",
        gallery_cta_text: "Create your own unique outfit",
        gallery_cta_button: "Custom Order",
        
        // Contact
        contact_title: "Contact Us",
        contact_subtitle: "We're here to answer all your questions",
        contact_info_title: "Our Contact Information",
        contact_info_text: "Don't hesitate to contact us for any questions or quote requests. Our team will respond as soon as possible.",
        contact_address: "Address",
        contact_phone_label: "Phone",
        contact_email_label: "Email",
        contact_hours: "Hours",
        contact_hours_weekdays: "Mon - Fri: 9:00 AM - 6:00 PM",
        contact_hours_saturday: "Sat: 10:00 AM - 4:00 PM",
        contact_hours_sunday: "Sun: Closed",
        contact_follow: "Follow Us",
        contact_form_title: "Send us a message",
        contact_firstname: "First Name",
        contact_lastname: "Last Name",
        contact_email: "Email",
        contact_phone: "Phone",
        contact_subject: "Subject",
        contact_message: "Message",
        contact_submit: "Send Message",
        contact_map_title: "Our Location",
        
        // Admin
        admin_dashboard: "Dashboard",
        admin_products: "Products",
        admin_orders: "Orders",
        admin_users: "Users",
        admin_settings: "Settings",
        admin_back_site: "Back to Site",
        admin_logout: "Logout",
        admin_total_products: "Products",
        admin_total_orders: "Orders",
        admin_total_users: "Users",
        admin_total_revenue: "Revenue",
        admin_recent_orders: "Recent Orders",
        
        // Footer
        footer_about: "MH Couture",
        footer_about_text: "Your destination for custom fashion and timeless elegance.",
        footer_quick_links: "Quick Links",
        footer_contact: "Contact",
        footer_rights: "All rights reserved.",
        
        // Messages
        msg_login_success: "Login successful!",
        msg_signup_success: "Registration successful!",
        msg_add_cart_success: "Product added to cart successfully!",
        msg_contact_success: "Message sent successfully! We will respond as soon as possible.",
        msg_custom_success: "Your request has been sent successfully! We will contact you within 24 hours.",
        msg_error: "An error occurred",
        msg_login_required: "Please login to add products to cart",
        
        // Misc
        currency: "FCFA",
        select_option: "Select...",
        required_fields: "Required fields",
    }
};

// Fonction pour changer la langue
function changeLanguage(lang) {
    if (!translations[lang]) {
        console.error('Langue non supportée:', lang);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    translatePage();
}

// Fonction pour traduire la page
function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[currentLanguage][key];
        
        if (translation) {
            // Si c'est un input placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.innerHTML = translation;
            }
        }
    });
    
    // Mettre à jour le sélecteur de langue
    updateLanguageSelector();
}

// Fonction pour mettre à jour le sélecteur de langue
function updateLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.value = currentLanguage;
    }
    
    // Mettre à jour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Fonction pour obtenir une traduction
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Charger la langue sauvegardée
    const savedLang = localStorage.getItem('language') || 'fr';
    currentLanguage = savedLang;
    
    // Traduire la page
    translatePage();
    
    // Ajouter les écouteurs d'événements pour le changement de langue
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            changeLanguage(this.value);
        });
    }
    
    // Écouteurs pour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeLanguage(this.dataset.lang);
        });
    });
});

// Exporter pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { changeLanguage, translatePage, t, currentLanguage };
}
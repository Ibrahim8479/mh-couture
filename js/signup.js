// signup.js - Gestion de l'inscription - MH Couture

document.addEventListener('DOMContentLoaded', function() {
    // VÃ©rifier si l'utilisateur est dÃ©jÃ  connectÃ©
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        window.location.href = 'collections.php';
        return;
    }

    setupSignupForm();
    setupPasswordStrength();
    setupSocialLogin();
});

// Configuration du formulaire d'inscription
function setupSignupForm() {
    const form = document.getElementById('signupForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // RÃ©initialiser les erreurs
        clearErrors();
        
        // RÃ©cupÃ©rer les valeurs
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            terms: document.getElementById('terms').checked,
            newsletter: document.getElementById('newsletter').checked
        };
        
        // Validation
        let hasError = false;
        
        if (!formData.firstName) {
            showError('firstName', 'Le prÃ©nom est requis');
            hasError = true;
        }
        
        if (!formData.lastName) {
            showError('lastName', 'Le nom est requis');
            hasError = true;
        }
        
        if (!formData.email) {
            showError('email', 'L\'email est requis');
            hasError = true;
        } else if (!validateEmail(formData.email)) {
            showError('email', 'Email invalide');
            hasError = true;
        }
        
        if (!formData.phone) {
            showError('phone', 'Le tÃ©lÃ©phone est requis');
            hasError = true;
        } else if (!validatePhone(formData.phone)) {
            showError('phone', 'NumÃ©ro de tÃ©lÃ©phone invalide');
            hasError = true;
        }
        
        if (!formData.password) {
            showError('password', 'Le mot de passe est requis');
            hasError = true;
        } else if (formData.password.length < 8) {
            showError('password', 'Le mot de passe doit contenir au moins 8 caractÃ¨res');
            hasError = true;
        }
        
        if (formData.password !== formData.confirmPassword) {
            showError('confirmPassword', 'Les mots de passe ne correspondent pas');
            hasError = true;
        }
        
        if (!formData.terms) {
            showError('terms', 'Vous devez accepter les conditions d\'utilisation');
            hasError = true;
        }
        
        if (hasError) return;
        
        // DÃ©sactiver le bouton
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Inscription en cours...';
        
        try {
            const response = await fetch('php/auth/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'signup',
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    newsletter: formData.newsletter
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Sauvegarder le token
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                
                // Afficher un message de succÃ¨s
                showSuccessMessage('Inscription rÃ©ussie! Bienvenue chez MH Couture!');
                
                // Rediriger aprÃ¨s 2 secondes
                setTimeout(() => {
                    window.location.href = 'collections.php';
                }, 2000);
                
            } else {
                // Afficher l'erreur
                if (data.field) {
                    showError(data.field, data.message);
                } else {
                    showError('email', data.message);
                }
                submitBtn.disabled = false;
                submitBtn.textContent = 'S\'inscrire';
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            showError('email', 'Erreur de connexion au serveur');
            submitBtn.disabled = false;
            submitBtn.textContent = 'S\'inscrire';
        }
    });
}

// Configuration de l'indicateur de force du mot de passe
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Mettre Ã  jour la barre
        strengthFill.className = 'strength-fill';
        strengthText.className = 'strength-text';
        
        if (password.length === 0) {
            strengthFill.style.width = '0%';
            strengthText.textContent = '';
        } else if (strength < 3) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Faible';
        } else if (strength < 5) {
            strengthFill.classList.add('medium');
            strengthText.classList.add('medium');
            strengthText.textContent = 'Moyen';
        } else {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Fort';
        }
    });
}

// Calculer la force du mot de passe
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// Configuration de la connexion sociale
function setupSocialLogin() {
    document.querySelector('.btn-google').addEventListener('click', function(e) {
        e.preventDefault();
        alert('L\'inscription avec Google sera bientÃ´t disponible');
    });
    
    document.querySelector('.btn-facebook').addEventListener('click', function(e) {
        e.preventDefault();
        alert('L\'inscription avec Facebook sera bientÃ´t disponible');
    });
}

// Validation de l'email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validation du tÃ©lÃ©phone (format Niger)
function validatePhone(phone) {
    // Accepter +227 XX XX XX XX ou variations
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.length >= 8;
}

// Afficher une erreur
function showError(field, message) {
    const errorElement = document.getElementById(field + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    const inputElement = document.getElementById(field);
    if (inputElement) {
        inputElement.style.borderColor = '#e74c3c';
    }
}

// Effacer les erreurs
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    document.querySelectorAll('input').forEach(input => {
        if (input.type !== 'checkbox') {
            input.style.borderColor = '#e0e0e0';
        }
    });
}

// Afficher un message de succÃ¨s
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        font-size: 15px;
    `;
    successDiv.innerHTML = `âœ… ${message}`;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
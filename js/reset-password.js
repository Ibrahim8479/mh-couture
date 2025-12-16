// reset-password.js - MH Couture

document.addEventListener('DOMContentLoaded', function() {
    validateToken();
    setupResetForm();
});

// Valider le token au chargement
async function validateToken() {
    const token = document.getElementById('token').value;
    
    try {
        const response = await fetch('php/auth/password-reset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validate_token',
                token: token
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            showError('Token invalide ou expiré');
            setTimeout(() => {
                window.location.href = 'forgot-password.php';
            }, 3000);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de validation du token');
    }
}

// Configuration du formulaire
function setupResetForm() {
    const form = document.getElementById('resetPasswordForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Réinitialiser les erreurs
        clearErrors();
        
        const token = document.getElementById('token').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (newPassword.length < 8) {
            showFieldError('newPassword', 'Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showFieldError('confirmPassword', 'Les mots de passe ne correspondent pas');
            return;
        }
        
        // Désactiver le bouton
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Réinitialisation...';
        
        try {
            const response = await fetch('php/auth/password-reset.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'reset_password',
                    token: token,
                    new_password: newPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccessMessage('Mot de passe changé avec succès! Redirection...');
                setTimeout(() => {
                    window.location.href = 'login.php';
                }, 2000);
            } else {
                showError(data.message);
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            showError('Erreur lors de la réinitialisation');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

function showFieldError(field, message) {
    const errorElement = document.getElementById(field + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function showError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.innerHTML = `❌ ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

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
    `;
    successDiv.innerHTML = `✅ ${message}`;
    
    document.body.appendChild(successDiv);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
// forgot-password.js - MH Couture

document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const errorElement = document.getElementById('emailError');
    
    // Validation
    if (!email) {
        errorElement.textContent = 'Email requis';
        errorElement.style.display = 'block';
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Email invalide';
        errorElement.style.display = 'block';
        return;
    }
    
    // Désactiver le bouton
    const submitBtn = this.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    
    try {
        const response = await fetch('php/auth/password-reset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'request_reset',
                email: email
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse.');
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 3000);
        } else {
            errorElement.textContent = data.message;
            errorElement.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        errorElement.textContent = 'Erreur de connexion au serveur';
        errorElement.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

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
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
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
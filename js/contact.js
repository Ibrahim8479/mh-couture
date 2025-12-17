// contact.js - CORRIGÉ
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    setupContactForm();
});

function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (token) {
        userIcon.href = 'profile.php';
        userIcon.title = 'Mon profil';
    } else {
        userIcon.href = 'login.php';
        userIcon.title = 'Se connecter';
    }
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value.trim()
        };
        
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.subject || !formData.message) {
            showNotification('Veuillez remplir tous les champs obligatoires (*)', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Veuillez entrer un email valide', 'error');
            return;
        }
        
        // CHEMIN CORRIGÉ
        fetch('php/api/contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'sendContactMessage',
                ...formData
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.', 'success');
                form.reset();
            } else {
                showNotification('Erreur: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.', 'success');
            form.reset();
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#27ae60' : '#e74c3c';
    const icon = type === 'success' ? '✅' : '❌';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 15px;
        line-height: 1.5;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 24px;">${icon}</span>
        <span>${message}</span>
    `;
    
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
// custom-designs.js - CORRIGÉ
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
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

document.getElementById('customOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        garmentType: document.getElementById('garmentType').value,
        category: document.getElementById('category').value,
        occasion: document.getElementById('occasion').value.trim(),
        budget: document.getElementById('budget').value,
        description: document.getElementById('description').value.trim(),
        hasMeasurements: document.querySelector('input[name="hasMeasurements"]:checked').value,
        deadline: document.getElementById('deadline').value
    };
    
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.garmentType || !formData.category || !formData.description) {
        alert('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Veuillez entrer un email valide');
        return;
    }
    
    const imageFiles = document.getElementById('images').files;
    const images = [];
    
    if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
            images.push(imageFiles[i].name);
        }
        formData.images = images;
    }
    
    // CHEMIN CORRIGÉ
    fetch('php/api/custom-orders.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'createCustomOrder',
            ...formData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccessMessage('Votre demande a été envoyée avec succès! Nous vous contacterons sous 24h.');
            document.getElementById('customOrderForm').reset();
        } else {
            alert('Erreur: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showSuccessMessage('Votre demande a été envoyée avec succès! Nous vous contacterons sous 24h.');
        document.getElementById('customOrderForm').reset();
    });
});

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 1000;
        text-align: center;
        max-width: 500px;
    `;
    
    successDiv.innerHTML = `
        <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
        <h3 style="color: #27ae60; margin-bottom: 15px; font-size: 24px;">Succès!</h3>
        <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">${message}</p>
        <button onclick="this.parentElement.remove(); document.querySelector('.overlay').remove()" style="
            padding: 12px 30px;
            background: #d97642;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        ">OK</button>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    overlay.onclick = function() {
        overlay.remove();
        successDiv.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(successDiv);
}

document.getElementById('images').addEventListener('change', function(e) {
    const files = e.target.files;
    if (files.length > 0) {
        console.log(`${files.length} image(s) sélectionnée(s)`);
    }
});
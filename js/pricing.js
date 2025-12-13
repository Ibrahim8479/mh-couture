// pricing.js - CORRIGÉ
document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    setupCategoryFilters();
});

function checkUserLogin() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userIcon = document.getElementById('userIcon');
    
    if (token) {
        userIcon.href = 'profile.html';
        userIcon.title = 'Mon profil';
    } else {
        userIcon.href = 'login.html';
        userIcon.title = 'Se connecter';
    }
}

function setupCategoryFilters() {
    const filterButtons = document.querySelectorAll('.category-btn');
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            pricingCards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s';
                } else if (card.dataset.category === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
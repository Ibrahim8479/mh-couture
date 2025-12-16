// search.js - Recherche en temps réel - MH Couture

class ProductSearch {
    constructor() {
        this.searchInput = null;
        this.resultsContainer = null;
        this.debounceTimer = null;
        this.minLength = 2;
        this.init();
    }

    init() {
        // Créer la barre de recherche
        this.createSearchBar();
        this.setupEventListeners();
    }

    createSearchBar() {
        // Trouver le header
        const header = document.querySelector('header');
        if (!header) return;

        // Créer le conteneur de recherche
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.style.cssText = `
            position: relative;
            margin: 0 20px;
            flex: 1;
            max-width: 500px;
        `;

        searchContainer.innerHTML = `
            <input 
                type="text" 
                id="productSearch" 
                placeholder="🔍 Rechercher un produit..."
                style="
                    width: 100%;
                    padding: 10px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 25px;
                    font-size: 14px;
                    transition: all 0.3s;
                "
            >
            <div id="searchResults" style="
                display: none;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                margin-top: 10px;
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
            "></div>
        `;

        // Insérer après le logo
        const logo = header.querySelector('.logo');
        if (logo && logo.nextSibling) {
            header.insertBefore(searchContainer, logo.nextSibling);
        }

        this.searchInput = document.getElementById('productSearch');
        this.resultsContainer = document.getElementById('searchResults');
    }

    setupEventListeners() {
        if (!this.searchInput) return;

        // Input avec debounce
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            const query = e.target.value.trim();

            if (query.length < this.minLength) {
                this.hideResults();
                return;
            }

            this.debounceTimer = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Focus
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.style.borderColor = '#d97642';
        });

        // Blur
        this.searchInput.addEventListener('blur', () => {
            this.searchInput.style.borderColor = '#e0e0e0';
            // Délai pour permettre le clic sur les résultats
            setTimeout(() => this.hideResults(), 200);
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideResults();
                this.searchInput.blur();
            }
        });
    }

    async performSearch(query) {
        try {
            const response = await fetch(`php/api/search.php?q=${encodeURIComponent(query)}&limit=10`);
            const data = await response.json();

            if (data.success) {
                this.displayResults(data.results, query);
            } else {
                this.showError(data.message);
            }

        } catch (error) {
            console.error('Erreur de recherche:', error);
            this.showError('Erreur lors de la recherche');
        }
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    Aucun résultat pour "${query}"
                </div>
            `;
            this.showResults();
            return;
        }

        this.resultsContainer.innerHTML = results.map(product => `
            <a href="collections.php?product=${product.id}" style="
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                text-decoration: none;
                color: inherit;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.2s;
            " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                <img src="${product.image_url || 'https://via.placeholder.com/60'}" 
                     style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"
                     onerror="this.src='https://via.placeholder.com/60'">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333; margin-bottom: 5px;">
                        ${this.highlightMatch(product.name, query)}
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        ${product.category} • ${parseInt(product.price).toLocaleString('fr-FR')} FCFA
                    </div>
                </div>
            </a>
        `).join('');

        this.showResults();
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span style="background: #fff3cd; font-weight: 700;">$1</span>');
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e74c3c;">
                ❌ ${message}
            </div>
        `;
        this.showResults();
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }
}

// Initialiser la recherche au chargement
document.addEventListener('DOMContentLoaded', () => {
    new ProductSearch();
});
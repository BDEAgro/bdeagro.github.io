// Configuration API
const API_URL = "https://script.google.com/macros/s/AKfycby9TimFWReFLq4xScofyvhDk2zNouQcsCBZF7vjyfKNLCtGF3dVhZ3_LV52Qb8LYa7ibg/exec";

// Stocker les livres localement
let livres = [];

// Toggle du formulaire
function toggleForm() {
    const formSection = document.getElementById('formSection');
    const btn = document.getElementById('toggleFormBtn');

    if (formSection.style.display === 'none') {
        formSection.style.display = 'block';
        btn.textContent = '✕ Fermer le formulaire';
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        formSection.style.display = 'none';
        btn.textContent = '+ Déposer une annonce';
        document.getElementById('bookForm').reset();
    }
}

// Afficher une notification
function afficherNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `
        <div class="alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    setTimeout(() => {
        const alert = notification.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Fonction JSONP pour envoyer les données
function envoyerLivreJSONP(data) {
    return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        let script;
        let timeoutId;

        function cleanup() {
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            if (window[callbackName]) {
                delete window[callbackName];
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }

        window[callbackName] = function(response) {
            cleanup();
            if (response && response.success) {
                resolve(response);
            } else {
                reject(new Error(response?.message || 'Erreur inconnue'));
            }
        };

        const params = new URLSearchParams({
            action: 'ajouterLivre',
            callback: callbackName,
            ...data
        });

        const url = `${API_URL}?${params.toString()}`;

        script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            cleanup();
            reject(new Error('Erreur de réseau'));
        };

        document.head.appendChild(script);

        timeoutId = setTimeout(() => {
            if (window[callbackName]) {
                cleanup();
                reject(new Error('Timeout'));
            }
        }, 10000);
    });
}

// Fonction pour récupérer les livres
function chargerLivres() {
    return new Promise((resolve, reject) => {
        const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        let script;
        let timeoutId;

        function cleanup() {
            if (script && script.parentNode) {
                document.head.removeChild(script);
            }
            if (window[callbackName]) {
                delete window[callbackName];
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }

        window[callbackName] = function(response) {
            cleanup();
            if (response && response.success) {
                resolve(response.data || []);
            } else {
                // Si pas de données, retourner un tableau vide
                resolve([]);
            }
        };

        const params = new URLSearchParams({
            action: 'getLivres',
            callback: callbackName
        });

        const url = `${API_URL}?${params.toString()}`;

        script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            cleanup();
            // En cas d'erreur, retourner un tableau vide
            resolve([]);
        };

        document.head.appendChild(script);

        timeoutId = setTimeout(() => {
            if (window[callbackName]) {
                cleanup();
                resolve([]);
            }
        }, 10000);
    });
}

// Afficher les livres
function afficherLivres(livresAfficher = livres) {
    const booksList = document.getElementById('booksList');

    if (!livresAfficher || livresAfficher.length === 0) {
        booksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <h4>Aucun livre disponible</h4>
                <p>Soyez le premier à déposer une annonce !</p>
            </div>
        `;
        return;
    }

    const stateLabels = {
        neuf: 'Neuf',
        bon: 'Bon état',
        correct: 'État correct',
        usage: 'Usagé'
    };

    booksList.innerHTML = livresAfficher.map(livre => `
        <div class="book-card">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="book-title">${livre.titre}</div>
                    <div class="book-author">par ${livre.auteur}</div>
                </div>
                <span class="badge-state state-${livre.etat}">${stateLabels[livre.etat] || livre.etat}</span>
            </div>

            <div class="book-details">
                <div class="book-detail-item">
                    <strong>📖 Cours :</strong> ${livre.cours}
                </div>
                <div class="book-detail-item">
                    <strong>🎓 Année :</strong> ${livre.annee}
                </div>
                ${livre.edition ? `
                    <div class="book-detail-item">
                        <strong>📕 Édition :</strong> ${livre.edition}
                    </div>
                ` : ''}
                ${livre.isbn ? `
                    <div class="book-detail-item">
                        <strong>🔢 ISBN :</strong> ${livre.isbn}
                    </div>
                ` : ''}
            </div>

            ${livre.description ? `
                <div class="mt-2">
                    <strong>Description :</strong>
                    <p class="mb-0 mt-1">${livre.description}</p>
                </div>
            ` : ''}

            <div class="book-price">${parseFloat(livre.prix).toFixed(2)} €</div>

            <div class="book-contact">
                <strong>📞 Contact :</strong> ${livre.vendeur} - ${livre.contact}
            </div>
        </div>
    `).join('');
}

// Filtrer les livres
function filtrerLivres() {
    const searchTitle = document.getElementById('searchTitle').value.toLowerCase();
    const filterAnnee = document.getElementById('filterAnnee').value;
    const filterEtat = document.getElementById('filterEtat').value;

    const livresFiltres = livres.filter(livre => {
        const matchTitle = !searchTitle ||
            livre.titre.toLowerCase().includes(searchTitle) ||
            livre.auteur.toLowerCase().includes(searchTitle) ||
            livre.cours.toLowerCase().includes(searchTitle);

        const matchAnnee = !filterAnnee || livre.annee === filterAnnee;
        const matchEtat = !filterEtat || livre.etat === filterEtat;

        return matchTitle && matchAnnee && matchEtat;
    });

    afficherLivres(livresFiltres);
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('searchTitle').value = '';
    document.getElementById('filterAnnee').value = '';
    document.getElementById('filterEtat').value = '';
    afficherLivres(livres);
}

// Gestionnaire de soumission du formulaire
document.addEventListener('DOMContentLoaded', function() {
    // Charger les livres au démarrage
    chargerLivres().then(data => {
        livres = data;
        afficherLivres(livres);
    });

    // Événements de filtrage
    document.getElementById('searchTitle').addEventListener('input', filtrerLivres);
    document.getElementById('filterAnnee').addEventListener('change', filtrerLivres);
    document.getElementById('filterEtat').addEventListener('change', filtrerLivres);

    // Soumission du formulaire
    document.getElementById('bookForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const data = {
            titre: document.getElementById('titre').value.trim(),
            auteur: document.getElementById('auteur').value.trim(),
            cours: document.getElementById('cours').value.trim(),
            annee: document.getElementById('annee').value,
            etat: document.getElementById('etat').value,
            prix: document.getElementById('prix').value,
            isbn: document.getElementById('isbn').value.trim(),
            edition: document.getElementById('edition').value.trim(),
            description: document.getElementById('description').value.trim(),
            vendeur: document.getElementById('vendeur').value.trim(),
            contact: document.getElementById('contact').value.trim()
        };

        // Désactiver le bouton pendant l'envoi
        const btnSubmit = document.querySelector('#bookForm button[type="submit"]');
        const textOriginal = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Envoi en cours...';

        try {
            await envoyerLivreJSONP(data);
            afficherNotification('Votre annonce a été publiée avec succès !', 'success');

            // Ajouter le livre à la liste locale
            livres.unshift(data);
            afficherLivres(livres);

            // Réinitialiser et fermer le formulaire
            document.getElementById('bookForm').reset();
            toggleForm();

            // Scroll vers les livres
            document.getElementById('booksList').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Erreur:', error);
            afficherNotification('Erreur lors de la publication. Veuillez réessayer.', 'error');
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textOriginal;
        }
    });
});

// Configuration API
const API_URL = "https://script.google.com/macros/s/AKfycbwZPAkz9kf6OOxaWv0xHBPNBKOcK5S1b0xF5LqZDRSkxCYeBgpiZJ8KtgPZgo5ZMrwj3g/exec";

// Fonction de connexion admin
async function connexionAdmin(motDePasse) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verifierMotDePasse',
                motDePasse: motDePasse
            })
        });

        const result = await response.json();
        
        if (result.success && result.token) {
            // Sauvegarder le token dans le sessionStorage
            sessionStorage.setItem('adminToken', result.token);
            // Rediriger vers le dashboard
            window.location.href = 'dashboard.html';
            return true;
        } else {
            throw new Error(result.message || 'Mot de passe incorrect');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        afficherErreur('Mot de passe incorrect ou erreur de connexion');
        return false;
    }
}

// Fonction pour afficher les erreurs
function afficherErreur(message) {
    const msgDiv = document.getElementById('msg');
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.style.color = 'red';
    }
}

// Fonction pour masquer les erreurs
function masquerErreur() {
    const msgDiv = document.getElementById('msg');
    if (msgDiv) {
        msgDiv.textContent = '';
    }
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si déjà connecté
    const token = sessionStorage.getItem('adminToken');
    if (token) {
        // Vérifier si le token est encore valide
        verifierToken(token).then(valide => {
            if (valide) {
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Gestionnaire du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const motDePasse = document.getElementById('mdp').value.trim();
            
            if (!motDePasse) {
                afficherErreur('Veuillez saisir un mot de passe');
                return;
            }

            // Masquer les erreurs précédentes
            masquerErreur();
            
            // Désactiver le bouton pendant la vérification
            const btnConnexion = document.getElementById('btnConnexion');
            const textOriginal = btnConnexion.textContent;
            btnConnexion.disabled = true;
            btnConnexion.textContent = 'Connexion...';

            try {
                await connexionAdmin(motDePasse);
            } finally {
                // Réactiver le bouton
                btnConnexion.disabled = false;
                btnConnexion.textContent = textOriginal;
            }
        });
    }

    // Gestionnaire pour la touche Entrée dans le champ mot de passe
    const mdpInput = document.getElementById('mdp');
    if (mdpInput) {
        mdpInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('btnConnexion').click();
            }
        });
    }
});

// Fonction pour vérifier si un token est valide
async function verifierToken(token) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verifierToken',
                token: token
            })
        });

        const result = await response.json();
        return result.success && result.valide;
    } catch (error) {
        console.error('Erreur vérification token:', error);
        return false;
    }
}
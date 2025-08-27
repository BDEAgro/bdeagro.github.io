// Configuration API - MÊME URL que pour les commandes
const API_URL = "https://script.google.com/macros/s/AKfycbwSDp_vaj1ZjATBibQHi-50OL380L_Rcz7sEFhyzbiuLUygq_TJm-zADHhvpoPFtPWRuQ/exec";

// Fonction JSONP pour la vérification du mot de passe
function verifierMotDePasseJSONP(motDePasse) {
    return new Promise((resolve, reject) => {
        // Créer un nom de callback unique
        const callbackName = 'loginCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Créer la fonction callback globale
        window[callbackName] = function(response) {
            // Nettoyer
            document.head.removeChild(script);
            delete window[callbackName];
            
            if (response.success) {
                resolve(response);
            } else {
                reject(new Error(response.message || 'Erreur de connexion'));
            }
        };
        
        // Créer l'URL avec les paramètres
        const params = new URLSearchParams({
            action: 'verifierMotDePasse',
            callback: callbackName,
            motDePasse: motDePasse
        });
        
        const url = `${API_URL}?${params.toString()}`;
        console.log('URL de connexion:', url);
        
        // Créer et ajouter le script
        const script = document.createElement('script');
        script.src = url;
        script.onerror = function() {
            document.head.removeChild(script);
            delete window[callbackName];
            reject(new Error('Erreur de réseau'));
        };
        
        document.head.appendChild(script);
        
        // Timeout de sécurité
        setTimeout(() => {
            if (window[callbackName]) {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('Délai d\'attente dépassé'));
            }
        }, 10000);
    });
}

// Fonction pour afficher les messages d'erreur
function afficherMessage(message, type = 'error') {
    const msgDiv = document.getElementById('msg');
    msgDiv.textContent = message;
    msgDiv.className = type === 'error' ? 'error-message' : 'success-message';
}

// Fonction pour sauvegarder le token (dans le sessionStorage du navigateur)
function sauvegarderToken(token) {
    sessionStorage.setItem('adminToken', token);
    sessionStorage.setItem('adminTokenTime', Date.now().toString());
}

// Fonction pour vérifier si l'utilisateur est déjà connecté
function verifierConnexionExistante() {
    const token = sessionStorage.getItem('adminToken');
    const tokenTime = sessionStorage.getItem('adminTokenTime');
    
    if (token && tokenTime) {
        // Vérifier si le token n'est pas trop vieux (1 heure = 3600000ms)
        const maintenant = Date.now();
        const tempsEcoule = maintenant - parseInt(tokenTime);
        
        if (tempsEcoule < 3600000) { // 1 heure
            // Rediriger vers la page admin
            window.location.href = 'admin.html';
            return true;
        } else {
            // Token expiré, le supprimer
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminTokenTime');
        }
    }
    return false;
}

// Gestionnaire de soumission du formulaire
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const motDePasse = document.getElementById('mdp').value.trim();
    const btnConnexion = document.getElementById('btnConnexion');
    const msgDiv = document.getElementById('msg');
    
    // Vérifications
    if (!motDePasse) {
        afficherMessage('Veuillez entrer le mot de passe.');
        return;
    }
    
    // Désactiver le bouton pendant la vérification
    const textOriginal = btnConnexion.textContent;
    btnConnexion.disabled = true;
    btnConnexion.textContent = 'Vérification...';
    msgDiv.textContent = '';
    
    try {
        console.log('Tentative de connexion...');
        const result = await verifierMotDePasseJSONP(motDePasse);
        
        console.log('Connexion réussie:', result);
        
        // Sauvegarder le token
        sauvegarderToken(result.token);
        
        // Afficher le succès brièvement
        afficherMessage('Connexion réussie ! Redirection...', 'success');
        
        // Rediriger après un court délai
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        
        let messageErreur;
        if (error.message.includes('Mot de passe incorrect')) {
            messageErreur = 'Mot de passe incorrect.';
        } else if (error.message.includes('Délai d\'attente')) {
            messageErreur = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
        } else if (error.message.includes('Erreur de réseau')) {
            messageErreur = 'Problème de connexion réseau.';
        } else {
            messageErreur = 'Erreur de connexion. Veuillez réessayer.';
        }
        
        afficherMessage(messageErreur);
        
    } finally {
        // Réactiver le bouton
        btnConnexion.disabled = false;
        btnConnexion.textContent = textOriginal;
    }
});

// Vérifier la connexion existante au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    verifierConnexionExistante();
});

// Style pour les messages de succès
const style = document.createElement('style');
style.textContent = `
    .success-message {
        color: #28a745;
        margin-top: 0.5rem;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);
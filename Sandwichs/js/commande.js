// Configuration API
const API_URL = "https://script.google.com/macros/s/AKfycbwZPAkz9kf6OOxaWv0xHBPNBKOcK5S1b0xF5LqZDRSkxCYeBgpiZJ8KtgPZgo5ZMrwj3g/exec";

// État des commandes
let commandes = {
    berger: 0,
    club: 0,
    meat_free: 0,
    italien: 0,
    norvegien: 0
};

// Fonction pour changer les quantités
function changerQuantite(type, delta) {
    commandes[type] = Math.max(0, commandes[type] + delta);
    document.getElementById(type + '-qty').textContent = commandes[type];
}

// Fonction pour appeler l'API Apps Script
async function envoyerCommande(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'enregistrerCommande',
                ...data
            })
        });

        const result = await response.json();
        
        if (result.success) {
            afficherNotification('Commande enregistrée avec succès!', 'success');
            // Réinitialiser le formulaire
            document.getElementById('commandeForm').reset();
            commandes = { berger: 0, club: 0, meat_free: 0, italien: 0, norvegien: 0 };
            Object.keys(commandes).forEach(type => {
                document.getElementById(type + '-qty').textContent = '0';
            });
        } else {
            throw new Error(result.message || 'Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        afficherNotification('Erreur lors de l\'envoi de la commande. Veuillez réessayer.', 'error');
    }
}

// Fonction pour afficher les notifications
function afficherNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `
        <div class="alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Auto-masquer après 5 secondes
    setTimeout(() => {
        const alert = notification.querySelector('.alert');
        if (alert) {
            alert.remove();
        }
    }, 5000);
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    // Gestionnaire de soumission du formulaire
    document.getElementById('commandeForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const prenom = document.getElementById('prenom').value.trim();
        const commentaire = document.getElementById('commentaire').value.trim();
        
        // Vérifications
        if (!prenom) {
            afficherNotification('Veuillez entrer votre prénom.', 'error');
            return;
        }

        const totalSandwichs = Object.values(commandes).reduce((sum, qty) => sum + qty, 0);
        if (totalSandwichs === 0) {
            afficherNotification('Veuillez sélectionner au moins un sandwich.', 'error');
            return;
        }

        // Désactiver le bouton pendant l'envoi
        const btnEnvoyer = document.getElementById('btnEnvoyer');
        const textOriginal = btnEnvoyer.textContent;
        btnEnvoyer.disabled = true;
        btnEnvoyer.textContent = 'Envoi en cours...';

        try {
            await envoyerCommande({
                prenom,
                berger: commandes.berger,
                club: commandes.club,
                meat_free: commandes.meat_free,
                italien: commandes.italien,
                norvegien: commandes.norvegien,
                commentaire
            });
        } finally {
            // Réactiver le bouton
            btnEnvoyer.disabled = false;
            btnEnvoyer.textContent = textOriginal;
        }
    });
});
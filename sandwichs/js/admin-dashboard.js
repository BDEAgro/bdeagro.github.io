// Configuration API
const API_URL = "https://script.google.com/macros/s/AKfycbwZPAkz9kf6OOxaWv0xHBPNBKOcK5S1b0xF5LqZDRSkxCYeBgpiZJ8KtgPZgo5ZMrwj3g/exec";

// Variables globales
let currentToken = null;
let autoRefreshInterval = null;

// Fonction pour récupérer les commandes du jour
async function getCommandes() {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'getCommandes',
                token: currentToken
            })
        });

        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Erreur lors de la récupération des commandes');
        }
    } catch (error) {
        console.error('Erreur récupération commandes:', error);
        afficherNotification('Erreur lors de la récupération des commandes', 'error');
        return {};
    }
}

// Fonction pour remplir les tableaux avec les données
function remplirTableaux(data) {
    remplirTableauCommandes(data);
    remplirTableauResume(data);
    mettreAJourStatistiques(data);
    mettreAJourDerniereActualisation();
}

// Fonction pour remplir le tableau des commandes par prénom
function remplirTableauCommandes(data) {
    const tbody = document.querySelector('#tableauCommandes tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    for (let prenom in data) {
        const tr = document.createElement('tr');

        // Colonne prénom
        const tdPrenom = document.createElement('td');
        tdPrenom.textContent = prenom;
        tdPrenom.style.fontWeight = 'bold';
        tr.appendChild(tdPrenom);

        // Colonne sandwichs
        const tdSandwichs = document.createElement('td');
        const sandwichs = data[prenom].sandwichs || {};
        const sandwichsText = Object.entries(sandwichs)
            .filter(([type, nb]) => nb > 0)
            .map(([type, nb]) => `${type} (${nb})`)
            .join(", ");
        tdSandwichs.textContent = sandwichsText || 'Aucun sandwich';
        tr.appendChild(tdSandwichs);

        // Colonne commentaires
        const tdCommentaire = document.createElement('td');
        const commentaires = (data[prenom].commentaire || [])
            .filter(comm => comm.trim() !== "")
            .join(" | ");
        tdCommentaire.textContent = commentaires || '-';
        tr.appendChild(tdCommentaire);

        tbody.appendChild(tr);
    }

    // Afficher un message si aucune commande
    if (Object.keys(data).length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = 'Aucune commande pour aujourd\'hui';
        td.style.textAlign = 'center';
        td.style.fontStyle = 'italic';
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

// Fonction pour remplir le tableau de résumé
function remplirTableauResume(data) {
    const resumeBody = document.querySelector('#resumeCommandes tbody');
    if (!resumeBody) return;
    
    resumeBody.innerHTML = '';
    const totaux = {};

    // Calculer les totaux par type de sandwich
    for (let prenom in data) {
        const sandwichs = data[prenom].sandwichs || {};
        for (let type in sandwichs) {
            const nb = Number(sandwichs[type]) || 0;
            totaux[type] = (totaux[type] || 0) + nb;
        }
    }

    // Types de sandwichs avec noms d'affichage
    const typesSandwichs = {
        'berger': 'Berger Apicole',
        'club': 'Club',
        'meat_free': 'Meat Free',
        'italien': 'Italien',
        'norvegien': 'Norvégien'
    };

    // Afficher tous les types même si quantité = 0
    Object.entries(typesSandwichs).forEach(([type, nom]) => {
        const tr = document.createElement('tr');
        
        const tdType = document.createElement('td');
        tdType.textContent = nom;
        tr.appendChild(tdType);

        const tdTotal = document.createElement('td');
        const total = totaux[type] || 0;
        tdTotal.textContent = total;
        tdTotal.style.fontWeight = 'bold';
        
        // Colorer en vert si > 0
        if (total > 0) {
            tdTotal.style.color = '#28a745';
        }
        
        tr.appendChild(tdTotal);
        resumeBody.appendChild(tr);
    });
}

// Fonction pour mettre à jour l'heure de dernière actualisation
function mettreAJourDerniereActualisation() {
    const spanActualisation = document.getElementById('derniereActualisation');
    if (spanActualisation) {
        const maintenant = new Date();
        spanActualisation.textContent = maintenant.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Fonction pour mettre à jour les statistiques
function mettreAJourStatistiques(data) {
    const totalCommandes = Object.keys(data).length;
    let totalSandwichs = 0;
    const totauxParType = {};

    // Calculer les totaux
    for (let prenom in data) {
        const sandwichs = data[prenom].sandwichs || {};
        for (let type in sandwichs) {
            const nb = Number(sandwichs[type]) || 0;
            totalSandwichs += nb;
            totauxParType[type] = (totauxParType[type] || 0) + nb;
        }
    }

    // Trouver le sandwich le plus populaire
    let sandwichPopulaire = '-';
    let maxQuantite = 0;
    const nomsAffichage = {
        'berger': 'Berger',
        'club': 'Club',
        'meat_free': 'Meat Free',
        'italien': 'Italien',
        'norvegien': 'Norvégien'
    };

    for (let type in totauxParType) {
        if (totauxParType[type] > maxQuantite) {
            maxQuantite = totauxParType[type];
            sandwichPopulaire = nomsAffichage[type] || type;
        }
    }

    // Mettre à jour l'affichage
    document.getElementById('totalCommandes').textContent = totalCommandes;
    document.getElementById('totalSandwichs').textContent = totalSandwichs;
    document.getElementById('sandwichPopulaire').textContent = sandwichPopulaire;
}

// Fonction pour actualiser les données
async function actualiserDonnees() {
    const data = await getCommandes();
    remplirTableaux(data);
}

// Fonction de déconnexion
async function deconnexion() {
    try {
        // Invalider le token côté serveur
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'invaliderToken',
                token: currentToken
            })
        });
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }

    // Nettoyer côté client
    sessionStorage.removeItem('adminToken');
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
}

// Fonction pour afficher les notifications
function afficherNotification(message, type) {
    const notification = document.getElementById('notification');
    if (notification) {
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
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async function() {
    // Vérifier l'authentification
    currentToken = sessionStorage.getItem('adminToken');
    
    if (!currentToken) {
        window.location.href = 'login.html';
        return;
    }

    // Vérifier si le token est encore valide
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verifierToken',
                token: currentToken
            })
        });

        const result = await response.json();
        
        if (!result.success || !result.valide) {
            sessionStorage.removeItem('adminToken');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Erreur vérification token:', error);
        window.location.href = 'login.html';
        return;
    }

    // Charger les données initiales
    await actualiserDonnees();

    // Configurer les gestionnaires d'événements
    const btnDeconnexion = document.getElementById('logoutBtn');
    if (btnDeconnexion) {
        btnDeconnexion.addEventListener('click', deconnexion);
    }

    const btnActualiser = document.getElementById('refreshBtn');
    if (btnActualiser) {
        btnActualiser.addEventListener('click', actualiserDonnees);
    }

    // Actualisation automatique toutes les 30 secondes
    autoRefreshInterval = setInterval(actualiserDonnees, 30000);
});

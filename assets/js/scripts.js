// scripts.js - Scripts personnalisés du site BDE Agro

// ==================== HEAD ====================
function loadHead(pageTitle, pageDescription) {
    // Titre par défaut si non spécifié
    const title = pageTitle || "BDE Agro - UCLouvain";
    const description = pageDescription || "Site officiel du BDE Agro de la Faculté des Bioingénieurs de l'UCLouvain.";
    
    // Mise à jour du titre
    document.title = title;
    
    // Création des meta tags s'ils n'existent pas
    const metaTags = [
        { name: 'description', content: description },
        { name: 'keywords', content: 'bioingénieur, uclouvain, discord, bde, agro, cercle, louvain, faculté, club, drive, ucl' },
        { name: 'author', content: 'BDE Agro' }
    ];
    
    metaTags.forEach(tag => {
        let existingMeta = document.querySelector(`meta[name="${tag.name}"]`);
        if (!existingMeta) {
            const meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
        } else {
            existingMeta.content = tag.content;
        }
    });
    
    // Ajout des liens CSS s'ils n'existent pas
    const cssLinks = [
        { rel: 'shortcut icon', href: '/assets/img/favicon.ico', type: 'image/x-icon' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { 
            rel: 'stylesheet', 
            href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
            integrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
            crossorigin: 'anonymous'
        },
        { rel: 'stylesheet', href: '/assets/css/style.css' }
    ];
    
    cssLinks.forEach(linkData => {
        // Vérifier si le lien existe déjà
        const existingLink = document.querySelector(`link[href="${linkData.href}"]`);
        if (!existingLink) {
            const link = document.createElement('link');
            Object.keys(linkData).forEach(attr => {
                link.setAttribute(attr, linkData[attr]);
            });
            document.head.appendChild(link);
        }
    });
}

// ==================== FOOTER ====================
function loadFooter() {
    const footerHTML = `
        <!-- Footer -->
        <footer class="footer mt-5 py-3 bg-body-tertiary">
            <div class="container text-center">
                <span class="text-body-secondary">&copy; 2024 - BDE Agro (Université Catholique de Louvain)</span>
            </div>
        </footer>
        <!-- End Footer -->
    `;
    
    const container = document.getElementById('footer-container');
    if (container) {
        container.innerHTML = footerHTML;
    }
}

// ==================== NAVBAR ====================
function loadNavbar() {
    const navbarHTML = `
        <!-- Navigation -->
        <nav class="navbar navbar-expand-lg" style="background-color: #A8C302;">
            <div class="container">
                <a href="/index.html" class="navbar-brand me-2"><img src="/assets/img/logo.jpg" alt="" width="35"
                        height="35"></a>
                <a href="/index.html" class="navbar-brand link-light">BDE Agro</a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarToggler"
                    aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarToggler">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link link-light" href="/index.html">Accueil</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle link-light" href="#" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                Le BDE
                            </a>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/mission.html">Objectifs & Missions</a></li>
                                <li><a class="dropdown-item" href="/team.html">L'équipe</a></li>
                                <li><a class="dropdown-item" href="/events.html">Nos Events</a></li>
                            </ul>
                        </li>
                       <li class="nav-item dropdown">
                           <a class="nav-link dropdown-toggle link-light" href="#" role="button" data-bs-toggle="dropdown"
                               aria-expanded="false">
                               Le Club
                           </a>
                           <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="/club.html">Présentation</a></li>
                                <li><a class="dropdown-item" href="/sandwichs/commande.html">Commander des sandwichs</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-light" href="/books.html">Books</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-light" href="/drive.html">Le Drive</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-light" href="/links.html">Contact</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-success" href="https://discord.gg/6X54kfAVGX" target="_blank"
                                rel="noopener">Discord</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <!-- End Navigation -->
    `;
    
    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
    }
}

// ==================== FONCTIONS UTILITAIRES ====================

// Fonction pour mettre en évidence le lien actif
function highlightActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Fonction pour smooth scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorer les liens avec juste "#" ou "#" vide
            if (href === '#' || href.length <= 1) {
                return; // Ne pas empêcher le comportement par défaut pour les dropdowns
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Charger le head avec titre et description spécifiques
    const pageConfig = getPageConfig();
    loadHead(pageConfig.title, pageConfig.description);
    
    // Charger la navbar
    loadNavbar();
    
    // Charger le footer
    loadFooter();
    
    // Attendre que Bootstrap soit chargé avant d'initialiser les autres fonctions
    setTimeout(() => {
        highlightActiveNavLink();
        initSmoothScroll();
    }, 100);
});

// ==================== CONFIGURATION DES PAGES ====================
function getPageConfig() {
    const path = window.location.pathname;
    const configs = {
        '/index.html': {
            title: 'Accueil | BDE Agro - UCLouvain',
            description: 'Site officiel du BDE Agro de la Faculté des Bioingénieurs de l\'UCLouvain.'
        },
        '/mission.html': {
            title: 'Nos Objectifs & Missions | BDE Agro - UCLouvain',
            description: 'Découvrez les objectifs et missions du BDE Agro de l\'UCLouvain.'
        },
        '/team.html': {
            title: 'L\'équipe | BDE Agro - UCLouvain',
            description: 'Rencontrez l\'équipe du BDE Agro de l\'UCLouvain.'
        },
        '/events.html': {
            title: 'Nos Events | BDE Agro - UCLouvain',
            description: 'Découvrez tous les événements organisés par le BDE Agro.'
        },
        '/club.html': {
            title: 'Le Club | BDE Agro - UCLouvain',
            description: 'Présentation du Club du BDE Agro de l\'UCLouvain.'
        },
        '/drive.html': {
            title: 'Le Drive | BDE Agro - UCLouvain',
            description: 'Accédez au Drive du BDE Agro avec toutes les ressources.'
        },
        '/links.html': {
            title: 'Contact | BDE Agro - UCLouvain',
            description: 'Contactez le BDE Agro de l\'UCLouvain.'
        },
        '/sandwichs/commande.html': {
            title: 'Commander - Club Agro | BDE Agro - UCLouvain',
            description: 'Commandez vos sandwichs au Club Agro - BDE Agro UCLouvain'
        },
        '/books.html': {
            title: 'Books | BDE Agro - UCLouvain',
            description: 'Achetez et vendez vos livres de cours entre étudiants - BDE Agro UCLouvain'
        }
    };

    return configs[path] || {
        title: 'BDE Agro - UCLouvain',
        description: 'Site officiel du BDE Agro de la Faculté des Bioingénieurs de l\'UCLouvain.'
    };
}

// ==================== AUTRES FONCTIONS ====================
// Vous pouvez ajouter ici d'autres fonctions communes à toutes vos pages
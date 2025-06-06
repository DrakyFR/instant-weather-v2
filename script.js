// Application Météo Instantanée V2
// Toutes les classes sont maintenant en français pour mieux comprendre

// Configuration et état de l'application
const AppMeteo = {
    // Tous les éléments du site qu'on utilise
    elements: {
        formulaire: document.getElementById('weather-form'),
        codePostal: document.getElementById('code-postal'),
        ville: document.getElementById('ville'),
        affichageJours: document.getElementById('days-display'),
        boutonDiminuer: document.getElementById('decrease'),
        boutonAugmenter: document.getElementById('increase'),
        conteneurResultats: document.getElementById('results-container'),
        conteneurCarte: document.getElementById('map-container'),
        infoCarte: document.getElementById('map-info'),
        chargement: document.getElementById('loader'),
        toastErreur: document.getElementById('error-toast'),
        messageErreur: document.getElementById('error-message'),
        boutonTheme: document.getElementById('theme-toggle') // Bouton pour changer le thème
    },
    
    // État actuel de l'application
    etat: {
        joursSelectionnes: 3,
        carteActuelle: null,
        delaiRecherche: null,
        estModeSombre: false // Si on est en mode sombre ou pas
    },
    
    // Paramètres de configuration
    configuration: {
        CLE_API: '55febe6c0af763a8c85a5720fb02e11fa81558ada191c2faee729f4f3d3bfbda', // Votre clé API météo
        DELAI_RECHERCHE: 500, // Temps d'attente avant de chercher
        JOURS_MIN: 1,
        JOURS_MAX: 7,
        CLE_STOCKAGE_THEME: 'themeAppMeteo' // Pour sauvegarder le thème choisi
    }
};

// Quand le site est complètement chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application Météo V2 - Démarrage');
    
    initialiserApplication();
});

// Fonction principale qui démarre tout
function initialiserApplication() {
    // Initialise chaque partie de l'application
    initialiserCompteurJours();
    initialiserRechercheVille();
    initialiserFormulaire();
    initialiserCarte();
    initialiserTheme(); // Configure le thème clair/sombre
    configurerEvenements();
    
    console.log('✅ Application prête à fonctionner');
}

// Gérer le changement de thème (clair/sombre)
function initialiserTheme() {
    // Récupère le thème sauvegardé s'il existe
    const themeSauvegarde = localStorage.getItem(AppMeteo.configuration.CLE_STOCKAGE_THEME);
    
    if (themeSauvegarde) {
        AppMeteo.etat.estModeSombre = (themeSauvegarde === 'sombre');
    } else {
        // Si rien n'est sauvé, utilise la préférence du système
        AppMeteo.etat.estModeSombre = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Applique le thème trouvé
    appliquerTheme();
    
    // Quand on clique sur le bouton de thème
    AppMeteo.elements.boutonTheme.addEventListener('click', basculerTheme);
}

// Applique le thème choisi à tout le site
function appliquerTheme() {
    if (AppMeteo.etat.estModeSombre) {
        document.body.classList.add('mode-sombre');
    } else {
        document.body.classList.remove('mode-sombre');
    }
    // Sauvegarde le choix pour la prochaine fois
    localStorage.setItem(AppMeteo.configuration.CLE_STOCKAGE_THEME, AppMeteo.etat.estModeSombre ? 'sombre' : 'clair');
}

// Change entre thème clair et sombre
function basculerTheme() {
    AppMeteo.etat.estModeSombre = !AppMeteo.etat.estModeSombre;
    appliquerTheme();
}

// Initialise le compteur de jours (+ et - pour choisir combien de jours)
function initialiserCompteurJours() {
    const { boutonDiminuer, boutonAugmenter, affichageJours } = AppMeteo.elements;
    const { JOURS_MIN, JOURS_MAX } = AppMeteo.configuration;
    
    // Quand on clique sur le bouton -
    boutonDiminuer.addEventListener('click', () => {
        if (AppMeteo.etat.joursSelectionnes > JOURS_MIN) {
            AppMeteo.etat.joursSelectionnes--;
            mettreAJourAffichageJours();
        }
    });
    
    // Quand on clique sur le bouton +
    boutonAugmenter.addEventListener('click', () => {
        if (AppMeteo.etat.joursSelectionnes < JOURS_MAX) {
            AppMeteo.etat.joursSelectionnes++;
            mettreAJourAffichageJours();
        }
    });
    
    // Met à jour l'affichage au début
    mettreAJourAffichageJours();
}

// Met à jour le nombre affiché dans le compteur
function mettreAJourAffichageJours() {
    AppMeteo.elements.affichageJours.textContent = AppMeteo.etat.joursSelectionnes;
    
    // Petit effet visuel quand ça change
    AppMeteo.elements.affichageJours.style.transform = 'scale(1.2)';
    setTimeout(() => {
        AppMeteo.elements.affichageJours.style.transform = 'scale(1)';
    }, 150);
}

// Initialise la recherche automatique de villes
function initialiserRechercheVille() {
    AppMeteo.elements.codePostal.addEventListener('input', function() {
        const codePostal = this.value.trim();
        
        // Annule la recherche précédente si elle n'est pas finie
        clearTimeout(AppMeteo.etat.delaiRecherche);
        
        if (codePostal.length === 5 && /^\d{5}$/.test(codePostal)) {
            // Lance la recherche après un petit délai pour éviter trop de requêtes
            AppMeteo.etat.delaiRecherche = setTimeout(() => {
                rechercherVilles(codePostal);
            }, AppMeteo.configuration.DELAI_RECHERCHE);
        } else {
            // Remet la liste des villes à zéro
            reinitialiserSelecteurVille();
        }
    });
}

// Cherche les villes correspondant au code postal
async function rechercherVilles(codePostal) {
    try {
        console.log(`🔍 Recherche des villes pour le code postal ${codePostal}`);
        
        // Appelle l'API du gouvernement français pour les communes
        const reponse = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code&format=json`);
        
        if (!reponse.ok) {
            throw new Error(`Erreur de l'API: ${reponse.status}`);
        }
        
        const villes = await reponse.json();
        
        // Remplit la liste déroulante avec les villes trouvées
        remplirSelecteurVille(villes);
        
    } catch (erreur) {
        console.error('💥 Erreur lors de la recherche des villes:', erreur);
        afficherErreur('Erreur lors de la recherche des villes');
        reinitialiserSelecteurVille();
    }
}

// Remplit la liste déroulante avec les villes trouvées
function remplirSelecteurVille(villes) {
    const selecteur = AppMeteo.elements.ville;
    
    // Vide la liste et remet l'option par défaut
    selecteur.innerHTML = '<option value="">Ville</option>';
    
    if (villes && villes.length > 0) {
        // Ajoute chaque ville trouvée
        villes.forEach(ville => {
            const option = document.createElement('option');
            option.value = ville.code;
            option.textContent = ville.nom;
            selecteur.appendChild(option);
        });
        
        // Effet visuel pour montrer que ça a marché
        AppMeteo.elements.codePostal.style.borderColor = 'var(--succes)';
        setTimeout(() => {
            AppMeteo.elements.codePostal.style.borderColor = '';
        }, 1000);
        
    } else {
        // Aucune ville trouvée
        selecteur.innerHTML = '<option value="">Aucune ville trouvée</option>';
    }
}

// Remet la liste des villes à l'état initial
function reinitialiserSelecteurVille() {
    AppMeteo.elements.ville.innerHTML = '<option value="">Ville</option>';
}

// Initialise le formulaire principal
function initialiserFormulaire() {
    AppMeteo.elements.formulaire.addEventListener('submit', async function(e) {
        e.preventDefault(); // Empêche le rechargement de la page
        
        // Vérifie que tout est bien rempli
        const validation = validerFormulaire();
        if (!validation.valide) {
            afficherErreur(validation.message);
            return;
        }
        
        const codeVille = AppMeteo.elements.ville.value;
        await recupererDonneesMeteo(codeVille);
    });
}

// Vérifie que le formulaire est correctement rempli
function validerFormulaire() {
    const codePostal = AppMeteo.elements.codePostal.value.trim();
    const ville = AppMeteo.elements.ville.value;
    
    if (!codePostal) {
        return { valide: false, message: 'Veuillez saisir un code postal' };
    }
    
    if (codePostal.length !== 5 || !/^\d{5}$/.test(codePostal)) {
        return { valide: false, message: 'Le code postal doit contenir exactement 5 chiffres' };
    }
    
    if (!ville) {
        return { valide: false, message: 'Veuillez sélectionner une ville dans la liste' };
    }
    
    return { valide: true };
}

// Récupère les données météo depuis l'API
async function recupererDonneesMeteo(codeVille) {
    try {
        // Montre l'indicateur de chargement
        afficherChargement();
        masquerErreur();
        
        console.log(`🌤️ Récupération de la météo pour la ville ${codeVille}`);
        
        // Appelle l'API météo
        const reponseMeteo = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=${AppMeteo.configuration.CLE_API}&insee=${codeVille}`);
        
        if (!reponseMeteo.ok) {
            throw new Error(`API météo indisponible: ${reponseMeteo.status}`);
        }
        
        const donneesMeteo = await reponseMeteo.json();
        
        if (!donneesMeteo.forecast || donneesMeteo.forecast.length === 0) {
            throw new Error('Aucune prévision météo disponible');
        }
        
        // Récupère les informations de la ville
        const reponseVille = await fetch(`https://geo.api.gouv.fr/communes/${codeVille}?fields=centre,nom`);
        const donneesVille = await reponseVille.json();
        
        // Affiche les résultats sur la page
        afficherResultatsMeteo(donneesMeteo.forecast.slice(0, AppMeteo.etat.joursSelectionnes), donneesVille);
        
        // Met à jour la carte avec la localisation
        if (donneesVille && donneesVille.centre) {
            mettreAJourCarte(donneesVille);
        }
        
    } catch (erreur) {
        console.error('💥 Erreur lors de la récupération météo:', erreur);
        
        // Détermine le message d'erreur à afficher
        let messageErreur = 'Erreur lors de la récupération des données météo';
        
        if (erreur.message.includes('API météo')) {
            messageErreur = 'Le service météo est temporairement indisponible';
        } else if (erreur.message.includes('Aucune prévision')) {
            messageErreur = 'Aucune prévision météo disponible pour cette ville';
        }
        
        afficherErreur(messageErreur);
        
    } finally {
        // Cache l'indicateur de chargement dans tous les cas
        masquerChargement();
    }
}

// Affiche les résultats météo sur la page
function afficherResultatsMeteo(previsions, donneesVille) {
    const conteneur = AppMeteo.elements.conteneurResultats;
    const optionsSelectionnees = obtenirOptionsSelectionnees();
    
    console.log(`📊 Affichage de ${previsions.length} prévisions météo`);
    
    let html = '';
    
    // Ajoute une carte des coordonnées si demandée
    if ((optionsSelectionnees.latitude || optionsSelectionnees.longitude) && donneesVille && donneesVille.centre) {
        html += creerCarteCoordonnees(donneesVille, optionsSelectionnees);
    }
    
    // Crée une carte pour chaque jour de prévision
    previsions.forEach((prevision, index) => {
        html += creerCarteMeteo(prevision, index, donneesVille?.nom || 'Ville inconnue', optionsSelectionnees);
    });
    
    // Met tout dans le conteneur
    conteneur.innerHTML = html;
}

// Crée une carte météo pour un jour donné
function creerCarteMeteo(prevision, index, nomVille, options) {
    const date = new Date(prevision.datetime);
    const dateFormatee = date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    const temperatureMoyenne = Math.round((prevision.tmin + prevision.tmax) / 2);
    const iconeMeteo = obtenirIconeMeteo(prevision.weather);
    const descriptionMeteo = obtenirDescriptionMeteo(prevision.weather);
    
    // Construit les détails optionnels selon les options choisies
    let htmlDetails = '';
    
    if (options.pluie) {
        htmlDetails += `
            <div class="element-detail">
                <div class="label-detail">Pluie</div>
                <div class="valeur-detail">${prevision.rr10 || 0} mm</div>
            </div>`;
    }
    
    if (options.vent) {
        htmlDetails += `
            <div class="element-detail">
                <div class="label-detail">Vent</div>
                <div class="valeur-detail">${prevision.wind10m || 0} km/h</div>
            </div>`;
    }
    
    if (options.directionVent) {
        htmlDetails += `
            <div class="element-detail">
                <div class="label-detail">Direction</div>
                <div class="valeur-detail">${prevision.dirwind10m || 0}° ${obtenirDirectionVent(prevision.dirwind10m || 0)}</div>
            </div>`;
    }
    
    if (options.humidite) {
        htmlDetails += `
            <div class="element-detail">
                <div class="label-detail">Humidité</div>
                <div class="valeur-detail">${prevision.humidity || 'N/A'}%</div>
            </div>`;
    }
    
    // Retourne le HTML de la carte complète
    return `
        <div class="carte-meteo">
            <div class="en-tete-meteo">
                <div>
                    <div class="date-meteo">Jour ${index + 1}</div>
                    <div style="font-size: 0.9rem; color: var(--gris-500); margin-top: 0.25rem;">${dateFormatee}</div>
                </div>
                <div class="icone-meteo">${iconeMeteo}</div>
                <div class="temperature-meteo">${temperatureMoyenne}°</div>
            </div>
            
            <div class="corps-meteo">
                <div class="info-principale-meteo">
                    <div class="description-meteo">${descriptionMeteo}</div>
                    <div class="plage-temperature">
                        <div class="temp-min">
                            <i class="fas fa-thermometer-empty"></i>
                            <span>${prevision.tmin}°C</span>
                        </div>
                        <div class="temp-max">
                            <i class="fas fa-thermometer-full"></i>
                            <span>${prevision.tmax}°C</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right; color: var(--gris-400); font-size: 0.875rem;">
                    ${nomVille}
                </div>
            </div>
            
            ${htmlDetails ? `<div class="details-meteo">${htmlDetails}</div>` : ''}
        </div>`;
}

// Crée une carte spéciale pour afficher les coordonnées GPS
function creerCarteCoordonnees(donneesVille, options) {
    const latitude = donneesVille.centre.coordinates[1];
    const longitude = donneesVille.centre.coordinates[0];
    
    return `
        <div class="carte-meteo">
            <div class="en-tete-meteo">
                <div>
                    <div class="date-meteo">📍 Position</div>
                    <div style="font-size: 0.9rem; color: var(--gris-500); margin-top: 0.25rem;">Coordonnées GPS</div>
                </div>
                <div class="icone-meteo">🗺️</div>
                <div class="temperature-meteo" style="font-size: 1.5rem;">GPS</div>
            </div>
            
            <div class="corps-meteo">
                <div class="info-principale-meteo">
                    <div class="description-meteo">${donneesVille.nom}</div>
                </div>
            </div>
            
            <div class="details-meteo">
                ${options.latitude ? `
                <div class="element-detail">
                    <div class="label-detail">Latitude</div>
                    <div class="valeur-detail">${latitude.toFixed(6)}°</div>
                </div>` : ''}
                ${options.longitude ? `
                <div class="element-detail">
                    <div class="label-detail">Longitude</div>
                    <div class="valeur-detail">${longitude.toFixed(6)}°</div>
                </div>` : ''}
            </div>
        </div>`;
}

// Initialise la gestion de la carte
function initialiserCarte() {
    // Met à jour la carte quand une ville est sélectionnée
    AppMeteo.elements.ville.addEventListener('change', function() {
        if (this.value) {
            mettreAJourCarteDepuisCodeVille(this.value);
        } else {
            reinitialiserCarte();
        }
    });
}

// Met à jour la carte à partir du code de ville
async function mettreAJourCarteDepuisCodeVille(codeVille) {
    try {
        const reponse = await fetch(`https://geo.api.gouv.fr/communes/${codeVille}?fields=centre,nom`);
        const donneesVille = await reponse.json();
        
        if (donneesVille && donneesVille.centre) {
            mettreAJourCarte(donneesVille);
        }
    } catch (erreur) {
        console.error('💥 Erreur lors de la mise à jour de la carte:', erreur);
    }
}

// Met à jour la carte avec les données de la ville
function mettreAJourCarte(donneesVille) {
    const { centre, nom } = donneesVille;
    const [longitude, latitude] = centre.coordinates;
    
    console.log(`🗺️ Mise à jour de la carte pour ${nom}`);
    
    // Met à jour les informations sous la carte
    AppMeteo.elements.infoCarte.innerHTML = `
        <strong>${nom}</strong> - Lat: ${latitude.toFixed(4)}°, Lon: ${longitude.toFixed(4)}°
    `;
    
    // Crée l'élément pour la carte
    AppMeteo.elements.conteneurCarte.innerHTML = '<div id="map-display"></div>';
    
    // Attend un peu que l'élément soit prêt pour Leaflet
    setTimeout(() => {
        // Supprime l'ancienne carte si elle existe
        if (AppMeteo.etat.carteActuelle) {
            AppMeteo.etat.carteActuelle.remove();
        }
        
        // Crée la nouvelle carte avec Leaflet
        AppMeteo.etat.carteActuelle = L.map('map-display').setView([latitude, longitude], 12);
        
        // Ajoute les tuiles de la carte (le fond de carte)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© Contributeurs OpenStreetMap',
            maxZoom: 18
        }).addTo(AppMeteo.etat.carteActuelle);
        
        // Ajoute un marqueur sur la ville
        const marqueur = L.marker([latitude, longitude]).addTo(AppMeteo.etat.carteActuelle);
        marqueur.bindPopup(`
            <div style="text-align: center; font-family: 'Inter', sans-serif;">
                <strong>${nom}</strong><br>
                <small>${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°</small>
            </div>
        `).openPopup();
        
    }, 150);
}

// Remet la carte à l'état initial
function reinitialiserCarte() {
    if (AppMeteo.etat.carteActuelle) {
        AppMeteo.etat.carteActuelle.remove();
        AppMeteo.etat.carteActuelle = null;
    }
    
    // Remet le placeholder
    AppMeteo.elements.conteneurCarte.innerHTML = `
        <div class="placeholder-carte">
            <div class="contenu-placeholder">
                <i class="fas fa-globe-europe"></i>
                <p>Carte de localisation</p>
            </div>
        </div>
    `;
    
    AppMeteo.elements.infoCarte.innerHTML = '<span>Sélectionnez une ville</span>';
}

// Récupère les options d'affichage sélectionnées par l'utilisateur
function obtenirOptionsSelectionnees() {
    return {
        latitude: document.getElementById('latitude').checked,
        longitude: document.getElementById('longitude').checked,
        pluie: document.getElementById('pluie').checked,
        vent: document.getElementById('vent').checked,
        directionVent: document.getElementById('direction-vent').checked,
        humidite: document.getElementById('humidite').checked
    };
}

// Convertit le code météo en icône emoji
function obtenirIconeMeteo(code) {
    const icones = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 4: '☁️', 5: '☁️', 6: '🌫️', 7: '🌫️',
        10: '🌦️', 11: '🌧️', 12: '🌧️', 13: '🌧️', 14: '🌧️', 15: '🌧️', 16: '🌧️',
        20: '🌨️', 21: '❄️', 22: '❄️', 30: '🌨️', 31: '🌨️', 32: '🌨️',
        40: '🌦️', 41: '🌧️', 42: '⛈️', 43: '🌨️', 44: '❄️', 45: '❄️',
        60: '🌨️', 61: '🌨️', 62: '🌨️', 70: '⛈️', 71: '⛈️', 72: '⛈️',
        73: '⛈️', 74: '⛈️', 75: '⛈️', 100: '⛈️'
    };
    return icones[code] || '🌈';
}

// Convertit le code météo en description lisible
function obtenirDescriptionMeteo(code) {
    const descriptions = {
        0: 'Ensoleillé', 1: 'Peu nuageux', 2: 'Ciel voilé', 3: 'Nuageux', 
        4: 'Très nuageux', 5: 'Couvert', 6: 'Brouillard', 7: 'Brouillard givrant',
        10: 'Pluie faible', 11: 'Pluie modérée', 12: 'Pluie forte', 13: 'Pluie verglaçante faible',
        14: 'Pluie verglaçante modérée', 15: 'Pluie verglaçante forte', 16: 'Bruine',
        20: 'Neige faible', 21: 'Neige modérée', 22: 'Neige forte', 30: 'Pluie et neige faibles',
        31: 'Pluie et neige modérées', 32: 'Pluie et neige fortes', 40: 'Averses faibles',
        41: 'Averses', 42: 'Averses fortes', 43: 'Averses de neige faibles',
        44: 'Averses de neige modérées', 45: 'Averses de neige fortes', 60: 'Averses mixtes faibles',
        61: 'Averses mixtes modérées', 62: 'Averses mixtes fortes', 70: 'Orages faibles',
        71: 'Orages', 72: 'Orages forts', 73: 'Orages faibles avec grêle',
        74: 'Orages avec grêle', 75: 'Orages forts avec grêle', 100: 'Orages'
    };
    return descriptions[code] || 'Temps variable';
}

// Convertit les degrés en direction du vent
function obtenirDirectionVent(degres) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(degres / 22.5) % 16;
    return directions[index];
}

// Montre l'indicateur de chargement
function afficherChargement() {
    AppMeteo.elements.chargement.classList.remove('hidden');
}

// Cache l'indicateur de chargement
function masquerChargement() {
    AppMeteo.elements.chargement.classList.add('hidden');
}

// Affiche un message d'erreur
function afficherErreur(message) {
    AppMeteo.elements.messageErreur.textContent = message;
    AppMeteo.elements.toastErreur.classList.remove('hidden');
    
    // Cache automatiquement l'erreur après 5 secondes
    setTimeout(() => {
        masquerErreur();
    }, 5000);
}

// Cache le message d'erreur
function masquerErreur() {
    AppMeteo.elements.toastErreur.classList.add('hidden');
}

// Configure tous les événements de l'application
function configurerEvenements() {
    // Raccourci clavier : Ctrl+Entrée pour lancer la recherche
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            AppMeteo.elements.formulaire.dispatchEvent(new Event('submit'));
        }
    });
    
    // Clic sur le message d'erreur pour le fermer
    AppMeteo.elements.toastErreur.addEventListener('click', masquerErreur);
    
    // Nettoyage automatique du code postal : garde seulement les chiffres
    AppMeteo.elements.codePostal.addEventListener('input', function() {
        const valeur = this.value;
        
        // Supprime tout ce qui n'est pas un chiffre
        this.value = valeur.replace(/\D/g, '');
        
        // Limite à 5 chiffres maximum
        if (this.value.length > 5) {
            this.value = this.value.slice(0, 5);
        }
    });
}

// Gestion des erreurs JavaScript globales
window.addEventListener('error', function(e) {
    console.error('💥 Erreur JavaScript non gérée:', e.error);
    afficherErreur('Une erreur inattendue s\'est produite');
});

// Gestion des promesses rejetées
window.addEventListener('unhandledrejection', function(e) {
    console.error('💥 Promesse rejetée non gérée:', e.reason);
    afficherErreur('Erreur de communication avec les services');
    e.preventDefault();
});

// Message de console pour le développement
console.log(`
⚡ Instant Météo V2
==================
✅ Classes traduites en français
✅ Thème clair bleu/blanc
✅ Mode sombre fonctionnel
✅ Disposition responsive
✅ Commentaires détaillés

Tout est prêt ! ✨
`);
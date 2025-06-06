// Variables globales
const formulaire = document.getElementById('formulaire-meteo');
const codePostal = document.getElementById('code-postal');
const selecteurVille = document.getElementById('ville');
const resultats = document.getElementById('resultats');
const basculeurTheme = document.getElementById('basculeur-theme');

let joursSelectionnes = 3;
const TOKEN_API = '55febe6c0af763a8c85a5720fb02e11fa81558ada191c2faee729f4f3d3bfbda';

// Gestion du loader initial
window.addEventListener('load', function() {
    // Attendre un délai minimum pour voir l'animation
    setTimeout(() => {
        const loaderInitial = document.getElementById('loader-initial');
        const contenuPrincipal = document.getElementById('contenu-principal');
        
        // Masquer le loader
        loaderInitial.classList.add('hidden');
        
        // Afficher le contenu principal
        setTimeout(() => {
            contenuPrincipal.classList.add('visible');
            // Supprimer complètement le loader du DOM après la transition
            setTimeout(() => {
                loaderInitial.remove();
            }, 500);
        }, 250);
    }, 2000); // 2 secondes minimum d'affichage du loader
});

// Gestion du thème sombre/clair
basculeurTheme.addEventListener('click', function() {
    document.body.classList.toggle('sombre');
    const estSombre = document.body.classList.contains('sombre');
    basculeurTheme.innerHTML = estSombre ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', estSombre ? 'sombre' : 'clair');
});

// Charger le thème sauvegardé au démarrage
const themeSauvegarde = localStorage.getItem('theme');
if (themeSauvegarde === 'sombre') {
    document.body.classList.add('sombre');
    basculeurTheme.innerHTML = '<i class="fas fa-sun"></i>';
}

// Gestion des boutons de sélection de jours
document.querySelectorAll('.bouton-jour').forEach(btn => {
    btn.addEventListener('click', function() {
        // Retirer la classe active de tous les boutons
        document.querySelectorAll('.bouton-jour').forEach(b => b.classList.remove('actif'));
        // Ajouter la classe active au bouton cliqué
        this.classList.add('actif');
        // Mettre à jour le nombre de jours sélectionnés
        joursSelectionnes = parseInt(this.dataset.jours);
    });
});

// Recherche des villes par code postal
codePostal.addEventListener('input', async function() {
    if (this.value.length === 5) {
        try {
            const reponse = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${this.value}&fields=nom,code&format=json`);
            const villes = await reponse.json();

            // Vider et remplir le sélecteur de villes
            selecteurVille.innerHTML = '<option value="">Choisissez une ville</option>';
            
            if (villes && villes.length > 0) {
                villes.forEach(ville => {
                    const option = document.createElement('option');
                    option.value = ville.code;
                    option.textContent = ville.nom;
                    selecteurVille.appendChild(option);
                });
            } else {
                selecteurVille.innerHTML = '<option value="">Aucune ville trouvée</option>';
            }
        } catch (erreur) {
            console.error('Erreur lors de la recherche des villes:', erreur);
            selecteurVille.innerHTML = '<option value="">Erreur de chargement</option>';
        }
    } else {
        // Reset du sélecteur si le code postal est incomplet
        selecteurVille.innerHTML = '<option value="">Choisissez une ville</option>';
    }
});

// Mise à jour de la carte lors de la sélection d'une ville
selecteurVille.addEventListener('change', async function() {
    if (this.value) {
        try {
            const reponse = await fetch(`https://geo.api.gouv.fr/communes/${this.value}?fields=centre,nom`);
            const donneesVille = await reponse.json();

            if (donneesVille && donneesVille.centre) {
                mettreAJourCarteDroite(donneesVille);
            }
        } catch (erreur) {
            console.error('Erreur lors de la récupération des données de la ville:', erreur);
        }
    }
});

// Soumission du formulaire météo
formulaire.addEventListener('submit', async function(e) {
    e.preventDefault();

    const codeVille = selecteurVille.value;
    if (!codeVille) {
        alert('Veuillez sélectionner une ville');
        return;
    }

    // Affichage du loader planète personnalisé
    resultats.innerHTML = `
        <div class="chargement">
            <div class="planet-loader">
                <div style="position: relative;">
                    <div class="planet"></div>
                    <div class="orbit">
                        <div class="satellite"></div>
                    </div>
                </div>
                <p class="loading-text">Chargement de la météo...</p>
            </div>
        </div>
    `;

    try {
        // Récupération des données météo
        const reponseMeteo = await fetch(`https://api.meteo-concept.com/api/forecast/daily?token=${TOKEN_API}&insee=${codeVille}`);
        const donneesMeteo = await reponseMeteo.json();

        if (!donneesMeteo.forecast || donneesMeteo.forecast.length === 0) {
            throw new Error('Aucune donnée météo disponible');
        }

        // Récupération des données de la ville
        const reponseVille = await fetch(`https://geo.api.gouv.fr/communes/${codeVille}?fields=centre,nom`);
        const donneesVille = await reponseVille.json();

        // Affichage des résultats
        afficherMeteo(donneesMeteo.forecast.slice(0, joursSelectionnes), donneesVille);

    } catch (erreur) {
        console.error('Erreur lors du chargement de la météo:', erreur);
        resultats.innerHTML = '<div class="erreur"><i class="fas fa-exclamation-triangle"></i> Erreur lors du chargement de la météo. Veuillez réessayer.</div>';
    }
});

// Fonction pour afficher les prévisions météo avec animation univers
function afficherMeteo(previsions, donneesVille) {
    const options = obtenirOptionsSelectionnees();
    let html = '';

    // Affichage des coordonnées si demandées
    if ((options.latitude || options.longitude) && donneesVille && donneesVille.centre) {
        const lat = donneesVille.centre.coordinates[1];
        const lon = donneesVille.centre.coordinates[0];

        html += `
            <div class="carte-meteo">
                <div class="cardm">
                    <div class="card">
                        <div class="weather">
                            <div class="main"><i class="fas fa-globe"></i> Coordonnées</div>
                            <div class="upper">
                                ${options.latitude ? `<div><strong>Latitude</strong><br>${lat.toFixed(6)}°</div>` : ''}
                                ${options.longitude ? `<div><strong>Longitude</strong><br>${lon.toFixed(6)}°</div>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="card2">
                        <div class="lower">
                            <div><strong>Ville</strong><br>${donneesVille.nom}</div>
                            <div><strong>Région</strong><br>France</div>
                        </div>
                    </div>
                    <div class="card3">
                        <i class="fas fa-map-marker-alt"></i> Localisation confirmée
                    </div>
                </div>
            </div>`;
    }

    // Affichage des prévisions pour chaque jour avec animation univers
    previsions.forEach((jour, index) => {
        const date = new Date(jour.datetime);
        const dateStr = date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });

        const temperature = Math.round((jour.tmin + jour.tmax) / 2);
        const tempColor = temperature > 20 ? '#FF5722' : temperature > 10 ? '#FF9800' : '#2196F3';

        html += `
            <div class="carte-meteo">
                <div class="cardm">
                    <div class="card">
                        <div class="weather">
                            <div class="main">Jour ${index + 1}</div>
                            <div class="upper">
                                <div>
                                    <strong><i class="fas fa-calendar-day"></i> Date</strong><br>
                                    ${dateStr}
                                </div>
                                <div>
                                    <strong><i class="fas fa-thermometer-half"></i> Température</strong><br>
                                    <span style="color: ${tempColor}; font-size: 1.2em; font-weight: bold;">
                                        ${temperature}°C
                                    </span>
                                </div>
                                <div>
                                    <strong><i class="fas fa-cloud"></i> Temps</strong><br>
                                    ${obtenirTexteMeteo(jour.weather)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card2">
                        <div class="lower">
                            <div>
                                <strong><i class="fas fa-temperature-low"></i> Min</strong><br>
                                <span style="color: #4CAF50; font-weight: bold;">${jour.tmin}°C</span>
                            </div>
                            <div>
                                <strong><i class="fas fa-temperature-high"></i> Max</strong><br>
                                <span style="color: #FF5722; font-weight: bold;">${jour.tmax}°C</span>
                            </div>
                            ${options.pluie ? `<div>
                                <strong><i class="fas fa-umbrella"></i> Pluie</strong><br>
                                <span style="color: #2196F3; font-weight: bold;">${jour.rr10 || 0} mm</span>
                            </div>` : ''}
                            ${options.vent ? `<div>
                                <strong><i class="fas fa-wind"></i> Vent</strong><br>
                                <span style="color: #607D8B; font-weight: bold;">${jour.wind10m || 0} km/h</span>
                            </div>` : ''}
                            ${options.directionVent ? `<div>
                                <strong><i class="fas fa-compass"></i> Direction</strong><br>
                                <span style="font-weight: bold;">${jour.dirwind10m || 0}°</span><br>
                                <small>${obtenirDirectionVent(jour.dirwind10m || 0)}</small>
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="card3">
                        <i class="fas fa-info-circle"></i> Survolez pour plus de détails
                    </div>
                </div>
            </div>`;
    });

    resultats.innerHTML = html;
}

// Fonction pour mettre à jour la carte dans le panneau de droite
function mettreAJourCarteDroite(donneesVille) {
    const apercuCarte = document.getElementById('apercu-carte');
    const infoLocalisation = document.getElementById('info-localisation');
    
    if (!donneesVille || !donneesVille.centre) {
        console.error('Données de ville invalides');
        return;
    }

    const lat = donneesVille.centre.coordinates[1];
    const lon = donneesVille.centre.coordinates[0];

    // Mise à jour des informations de localisation
    infoLocalisation.innerHTML = `
        <strong><i class="fas fa-map-marker-alt"></i> ${donneesVille.nom}</strong><br>
        <small>Lat: ${lat.toFixed(4)}° | Lon: ${lon.toFixed(4)}°</small>
    `;
    
    // Création du conteneur pour la carte
    apercuCarte.innerHTML = '<div id="carte-droite"></div>';

    // Initialisation de la carte Leaflet avec un délai pour permettre le rendu
    setTimeout(() => {
        try {
            const carte = L.map('carte-droite').setView([lat, lon], 11);
            
            // Ajout de la couche de tuiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(carte);
            
            // Ajout du marqueur
            const marqueur = L.marker([lat, lon]).addTo(carte);
            marqueur.bindPopup(`
                <div style="text-align: center;">
                    <b><i class="fas fa-map-marker-alt"></i> ${donneesVille.nom}</b><br>
                    <small>Latitude: ${lat.toFixed(4)}°<br>
                    Longitude: ${lon.toFixed(4)}°</small>
                </div>
            `).openPopup();

        } catch (erreur) {
            console.error('Erreur lors de la création de la carte:', erreur);
            apercuCarte.innerHTML = `
                <div class="placeholder-carte">
                    <div class="icone-carte"><i class="fas fa-exclamation-triangle"></i></div>
                    <p>Erreur lors du chargement de la carte</p>
                </div>
            `;
        }
    }, 100);
}

// Fonction pour récupérer les options sélectionnées par l'utilisateur
function obtenirOptionsSelectionnees() {
    return {
        latitude: document.getElementById('latitude').checked,
        longitude: document.getElementById('longitude').checked,
        pluie: document.getElementById('pluie').checked,
        vent: document.getElementById('vent').checked,
        directionVent: document.getElementById('direction-vent').checked
    };
}

// Fonction pour convertir le code météo en texte lisible avec emoji
function obtenirTexteMeteo(code) {
    const meteo = {
        0: '☀️ Soleil',
        1: '🌤️ Peu nuageux',
        2: '⛅ Voilé',
        3: '☁️ Nuageux',
        4: '☁️ Très nuageux',
        5: '☁️ Couvert',
        6: '🌫️ Brouillard',
        10: '🌦️ Pluie faible',
        11: '🌧️ Pluie modérée',
        12: '🌧️ Pluie forte',
        16: '🌦️ Bruine',
        20: '🌨️ Neige faible',
        21: '❄️ Neige modérée',
        22: '❄️ Neige forte',
        40: '🌦️ Averses faibles',
        41: '🌧️ Averses',
        42: '⛈️ Averses fortes',
        100: '⛈️ Orages'
    };
    return meteo[code] || '🌈 Temps variable';
}

// Fonction pour convertir les degrés en direction du vent
function obtenirDirectionVent(degres) {
    const directions = [
        'Nord ⬆️', 'Nord-Nord-Est ↗️', 'Nord-Est ↗️', 'Est-Nord-Est ↗️',
        'Est ➡️', 'Est-Sud-Est ↘️', 'Sud-Est ↘️', 'Sud-Sud-Est ↘️',
        'Sud ⬇️', 'Sud-Sud-Ouest ↙️', 'Sud-Ouest ↙️', 'Ouest-Sud-Ouest ↙️',
        'Ouest ⬅️', 'Ouest-Nord-Ouest ↖️', 'Nord-Ouest ↖️', 'Nord-Nord-Ouest ↖️'
    ];
    const index = Math.round(degres / 22.5) % 16;
    return directions[index];
}

// Fonction pour valider les entrées utilisateur
function validerEntrees() {
    const codePostalValeur = codePostal.value.trim();
    const villeSelectionnee = selecteurVille.value;

    if (!codePostalValeur || codePostalValeur.length !== 5) {
        return { valide: false, message: 'Veuillez saisir un code postal valide (5 chiffres)' };
    }

    if (!villeSelectionnee) {
        return { valide: false, message: 'Veuillez sélectionner une ville' };
    }

    return { valide: true };
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application météo initialisée');
    
    // Vérification de la disponibilité des APIs
    if (!window.fetch) {
        console.error('Fetch API non supportée');
        resultats.innerHTML = '<div class="erreur">Votre navigateur ne supporte pas cette application</div>';
        return;
    }

    // Vérification de Leaflet
    if (typeof L === 'undefined') {
        console.error('Leaflet non chargé');
    }
});
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

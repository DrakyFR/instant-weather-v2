// Variables globales
const formulaire = document.getElementById('formulaire-meteo');
const codePostal = document.getElementById('code-postal');
const selecteurVille = document.getElementById('ville');
const resultats = document.getElementById('resultats');
const basculeurTheme = document.getElementById('basculeur-theme');

let joursSelectionnes = 3;
const TOKEN_API = '55febe6c0af763a8c85a5720fb02e11fa81558ada191c2faee729f4f3d3bfbda';

// loader 
window.addEventListener('load', function() {
    
    setTimeout(() => {
        const loaderInitial = document.getElementById('loader-initial');
        const contenuPrincipal = document.getElementById('contenu-principal');
        
        // Masquer le loader
        loaderInitial.classList.add('hidden');
        
    
        setTimeout(() => {
            contenuPrincipal.classList.add('visible');
        
            setTimeout(() => {
                loaderInitial.remove();
            }, 500);
        }, 250);
    }, 2000); // 2 secondes d'affichage du loader
});

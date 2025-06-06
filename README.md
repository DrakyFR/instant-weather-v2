# Instant Météo V2 

![Instant Météo V2 Screenshot](https://via.placeholder.com/1200x600?text=Ajouter+une+capture+d'écran+ici)
*(N'oubliez pas de remplacer l'image de placeholder ci-dessus par une capture d'écran réelle de votre application !)*

## Aperçu du Projet

**Instant Météo V2** est une application web dynamique et interactive conçue pour fournir des prévisions météorologiques détaillées en temps réel. Elle permet aux utilisateurs de rechercher la météo par code postal ou par ville, d'obtenir des prévisions sur plusieurs jours et de visualiser la localisation sur une carte interactive. Avec un design responsive et des options d'affichage personnalisables, l'application offre une expérience utilisateur fluide et intuitive.

## Démo en direct

Découvrez la version live de l'application ici : [https://drakyfr.github.io/instant-weather-v2/](https://drakyfr.github.io/instant-weather-v2/)

## Fonctionnalités Clés

* **Recherche  :** Obtenez des prévisions météo en saisissant un code postal français ou en sélectionnant une ville.
* **Prévisions Météo :** Visualisez les prévisions météorologiques pour 1 à 7 jours à venir, ajustables via un compteur.
* **Carte de Localisation :** Intégration d'une carte (via Leaflet.js) affichant la localisation de la ville recherchée.
* **Options d'Affichage :** Activez/désactivez l'affichage de détails spécifiques tels que la latitude, la longitude, les précipitations, la vitesse du vent, la direction du vent et l'humidité.
* **Thème Clair/Sombre :** Basculez facilement entre les modes clair et sombre pour une meilleure lisibilité selon l'environnement.
* **Design unique :** L'interface s'adappe élégamment à toutes les tailles d'écran (ordinateurs, tablettes, mobiles).
* **Gestion des Erreurs :** Des messages toast discrets apparaissent pour informer l'utilisateur en cas d'erreurs (par exemple, ville non trouvée, problème de connexion API).
* **Indicateur de Chargement Animé :** Une animation visuelle indique que l'application est en train de récupérer les données météo.

## Technologies Utilisées

* **HTML5** : Structure sémantique du contenu web.
* **CSS3** : Styles modernes et animations, avec utilisation de variables CSS pour la gestion des thèmes.
* **JavaScript (Vanilla JS)** : Logique interactive de l'application, gestion des données et manipulations du DOM.
* **Leaflet.js** : Bibliothèque JavaScript open-source pour les cartes interactives optimisées pour mobile.
* **Font Awesome** : Bibliothèque d'icônes vectorielles.
* **API Météo** : L'application utilise une API externe pour récupérer les données météorologiques. Vous devrez obtenir votre propre clé API.


2.  **Obtenez une Clé API Météo :**
    Cette application nécessite une clé API pour fonctionner. Vous pouvez en obtenir une auprès de services tels que [OpenWeatherMap](https://openweathermap.org/api) ou d'autres fournisseurs de données météo.

3.  **Configurez votre Clé API :**
    Ouvrez le fichier `script.js` et localisez la section `AppMeteo.configuration`. Remplacez le placeholder `CLE_API` par votre clé API réelle :
    ```javascript
    // ...
    configuration: {
        CLE_API: 'VOTRE_CLE_API_ICI', // Remplacez par votre clé API
        MIN_DAYS: 1,
        MAX_DAYS: 7
    }
    // ...
    ```

4.  **Ouvrez l'application :**
    Ouvrez simplement le fichier `index.html` dans votre navigateur web préféré.


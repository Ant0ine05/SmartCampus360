# SmartCampus360 - Frontend Prototype

Projet de supervision intelligente de campus (Bâtiment, Énergie, Réservation).

## 🚀 Lancement

Il suffit d'ouvrir le fichier `index.html` dans votre navigateur web moderne (Chrome, Edge, Firefox).
Aucun serveur n'est nécessaire (architecture "Fake SPA" via JS).

## 📂 Structure

- `index.html` : Coquille vide (Shell) qui charge les modules.
- `js/simulation.js` : Le "Cerveau". Simule l'IoT, l'énergie et les capteurs en temps réel.
- `js/router.js` : Gère la navigation sans rechargement et charge les pages depuis `/pages`.
- `js/map.js` : Gère l'affichage SVG du Digital Twin.
- `pages/` : Contient le code HTML de chaque module.
- `css/style.css` : Styles "SaaS Enterprise" personnalisés sur base Bootstrap 5.

## 🌟 Fonctionnalités Clés

- **Dashboard Live** : Graphiques auto-mis à jour (Chart.js/Apex) et KPIs temps réel.
- **Digital Twin (Map)** : Carte interactive SVG avec modes Thermique et Occupation. Cliquez sur une salle !
- **Simulateur IoT** : Données générées aléatoirement toutes les 3s (voir console JS pour debug).
- **Notifications** : Toasts automatiques pour simuler des alertes.

## 🛠 Stack

- HTML5 / CSS3 (Variables)
- JavaScript ES6+ (Pas de framework)
- Bootstrap 5 (Layout & Components)
- ApexCharts (Data Viz)
- Bootstrap Icons

_Développé par l'IA Architecte Frontend._

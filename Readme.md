# 🏢 SmartCampus360

> **La plateforme de supervision intelligente pour les campus de demain.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg) ![Status](https://img.shields.io/badge/status-active-success.svg)

---

## 📖 À propos

**SmartCampus360** est une solution SaaS complète dédiée à la gestion, la supervision et l'optimisation des infrastructures éducatives et d'entreprise. En combinant **IoT**, **Digital Twin** et **Big Data**, notre plateforme offre une vision à 360° de votre campus en temps réel.

De la gestion énergétique à la maintenance prédictive, en passant par l'expérience occupant (réservation de salles, navigation), SmartCampus360 centralise toutes les opérations critiques dans une interface unifiée, moderne et intuitive.

---

## ✨ Fonctionnalités Clés

### 🕹️ Cockpit de Pilotage (Dashboard)

Une vue d'ensemble macroscopique pour les décideurs et gestionnaires.

- **KPIs Temps Réel** : Suivi des métriques clés (Taux d'occupation, Consommation énergétique, Tickets ouverts).
- **Visualisation de Données** : Graphiques dynamiques et interactifs pour analyser les tendances.
- **Flux d'Activité** : Remontée immédiate des incidents et alertes critiques.

### 🗺️ Digital Twin (Live Map)

Une réplique numérique interactive de vos bâtiments pour une supervision spatiale.

- **Navigation Interactive** : Exploration visuelle des étages, des zones et des salles.
- **Modes de Visualisation** :
  - 🔥 _Mode Thermique_ : Identification visuelle des zones énergivores ou en surchauffe.
  - 👥 _Mode Occupation_ : Visualisation des densités de population et des flux.
- **Actions Contextuelles** : Accès aux détails techniques d'une salle en un simple clic.

### ⚡ Eco-Gestion Énergétique

Réduisez votre empreinte carbone grâce à un monitoring précis.

- **Suivi Live** : Compteurs de consommation (kW/h) mis à jour en temps réel.
- **Détection d'Anomalies** : Identification automatique des pics de consommation anormaux.
- **Optimisation** : Outils d'aide à la décision pour la réduction des coûts énergétiques.

### 📅 Système de Réservation Intelligent

Simplifiez l'accès aux ressources pour tous les occupants.

- **Recherche Avancée** : Filtrage par capacité, équipements (projecteur, visio) et disponibilité.
- **Booking Instantané** : Réservation de salle fluide et rapide.
- **Gestion des Conflits** : Algorithme intelligent pour éviter les doubles réservations.

### 🛠️ Maintenance & Administration

Gérez vos infrastructures sans friction.

- **Ticketing Automatisé** : Création de tickets maintenance déclenchée par les capteurs IoT ou les utilisateurs.
- **Portail Admin** : Interface dédiée pour la gestion des droits, la configuration globale et la supervision technique.

---

## 🏗️ Architecture Technique

SmartCampus360 repose sur une architecture moderne, conçue pour la performance et l'évolutivité.

### Frontend

- **Core** : Architecture SPA (Single Page Application) légère et réactive.
- **UI/UX** : Design System "Enterprise-Grade" basé sur Bootstrap 5, enrichi de composants personnalisés (Glassmorphism, Micro-interactions).
- **Data Viz** : Intégration de la librairie _ApexCharts_ pour des tableaux de bord analytiques performants.
- **Map Engine** : Moteur de rendu vectoriel (SVG) pour le jumeau numérique.

### Backend & Infrastructure

- **Services** : Architecture orientée services prête pour le déploiement Cloud.
- **Base de Données** : MySQL 8.0 (Dockerized) pour la persistance fiable des données critiques.
- **Simulation IoT** : Moteur de simulation intégré capable de générer des scénarios de charges réalistes (télémétrie, capteurs).

---

## 🚀 Guide de Démarrage

Suivez ces instructions pour installer et lancer le projet dans un environnement local.

### Prérequis

- Docker Desktop (pour la base de données)
- Tout serveur Web statique (VS Code Live Server, Apache, Nginx, ou Python SimpleHTTPServer)

### Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/Ant0ine05/SmartCampus360.git
   cd SmartCampus360
   ```

2. **Initialiser la Base de Données**
   Le projet inclut une configuration Docker pour la persistance des données.

   ```bash
   docker-compose up -d
   ```

3. **Lancer l'Application**
   L'application frontend peut être hébergée sur n'importe quel serveur standard.

   _Via Python (exemple) :_

   ```bash
   python -m http.server 8080
   ```

   Accédez ensuite à `http://localhost:8080` dans votre navigateur.

---

## 🔮 Roadmap

- [x] **v1.0** : Dashboard, Map Interactive, Réservation, Maintenance, Socle Technique.
- [ ] **v1.1** : Module d'IA pour la prédiction de consommation énergétique.
- [ ] **v1.2** : Application Mobile Compagnon (PWA).
- [ ] **v2.0** : Connecteurs Plug & Play pour GTC/GTE (Gestion Technique de Bâtiment).

---

<div align="center">

**SmartCampus360** — _L'intelligence au service de vos espaces._

Développé avec passion pour le futur de la Smart City.

</div>

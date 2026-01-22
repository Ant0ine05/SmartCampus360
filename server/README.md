# SmartCampus360 - Guide de Démarrage Backend

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
cd server
npm install
```

### 2. Démarrer Docker (Base de données)
```bash
# Retourner à la racine du projet
cd ..

# Démarrer les conteneurs
docker-compose up -d

# Vérifier que les conteneurs fonctionnent
docker-compose ps
```

### 3. Option A : Démarrage en local (sans Docker pour l'API)
```bash
cd server
npm start
```

### 3. Option B : Démarrage complet avec Docker
```bash
# Déjà fait avec docker-compose up -d
# L'API démarre automatiquement sur le port 3000
```

### 4. Tester l'API
```bash
# Health check
curl http://localhost:3000/api/health

# Récupérer les salles
curl http://localhost:3000/api/rooms
```

### 5. Ouvrir le frontend
Ouvrez `index.html` avec un serveur local (Live Server dans VS Code)

## 📊 Structure de l'API

### Endpoints disponibles :

**Rooms (Salles)**
- `GET /api/rooms` - Liste toutes les salles
- `GET /api/rooms/:id` - Détails d'une salle
- `POST /api/rooms` - Créer une salle
- `PUT /api/rooms/:id` - Mettre à jour une salle

**Bookings (Réservations)**
- `GET /api/bookings` - Liste toutes les réservations
- `GET /api/bookings/room/:roomId` - Réservations d'une salle
- `POST /api/bookings` - Créer une réservation
- `DELETE /api/bookings/:id` - Annuler une réservation

**Tickets (Maintenance)**
- `GET /api/tickets` - Liste tous les tickets
- `POST /api/tickets` - Créer un ticket
- `PUT /api/tickets/:id` - Mettre à jour un ticket

**Measurements (Capteurs)**
- `GET /api/measurements` - Récupérer les mesures
- `POST /api/measurements` - Enregistrer une mesure

**Users (Utilisateurs)**
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur

## 🔧 Configuration

### Variables d'environnement (.env)
```env
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=smartcampus
PORT=3000
```

### Connexion à MySQL
```bash
mysql -h localhost -P 3306 -u admin -p
# Password: admin123
```

## 🐛 Dépannage

### L'API ne démarre pas
```bash
# Vérifier que MySQL est démarré
docker-compose ps

# Voir les logs
docker-compose logs db

# Redémarrer tout
docker-compose down
docker-compose up -d
```

### Erreur de connexion MySQL
```bash
# Vérifier que le port 3306 n'est pas utilisé
netstat -ano | findstr :3306

# Recréer la base de données
docker-compose down -v
docker-compose up -d
```

### Le frontend ne se connecte pas
- Vérifier que l'API tourne sur http://localhost:3000
- Ouvrir la console du navigateur (F12)
- Vérifier les erreurs CORS

## 📝 Notes

- Le backend synchronise automatiquement avec la simulation toutes les 10 secondes
- Les données initiales sont créées automatiquement au premier démarrage
- Mode fallback : si l'API est hors ligne, l'application fonctionne en mode simulation

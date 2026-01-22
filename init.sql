CREATE DATABASE IF NOT EXISTS smartcampus;
USE smartcampus;

-- 1. LES COMPTES (Utilisateur commun et Administrateur)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lastname VARCHAR(50) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('utilisateur', 'admin') DEFAULT 'utilisateur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. LES SALLES (Focus : Capacité et PC)
CREATE TABLE rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT,
    nb_pc INT DEFAULT 0, 
    room_type ENUM('cours', 'labo', 'reunion', 'box') DEFAULT 'cours',
    temperature DECIMAL(4,1) DEFAULT 20.0,
    occupancy INT DEFAULT 0
);

-- 3. RÉSERVATIONS
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50),
    user_id INT, 
    user_name VARCHAR(100),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('confirme', 'annule') DEFAULT 'confirme',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TICKETS DE SUPPORT
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    room_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    priority ENUM('bas', 'moyen', 'urgent') DEFAULT 'moyen',
    status ENUM('nouveau', 'en_cours', 'resolu') DEFAULT 'nouveau',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 5. CAPTEURS & MESURES (IoT)
CREATE TABLE sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50),
    sensor_type ENUM('temp', 'energy', 'occupancy'),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE measurements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    value FLOAT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);

-- ============================================
-- INSERTION DES DONNÉES DE TEST
-- ============================================

-- Insertion des utilisateurs
INSERT INTO users (lastname, firstname, email, password, role) VALUES
('Dubois', 'Marie', 'marie.dubois@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('Martin', 'Thomas', 'thomas.martin@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'utilisateur'),
('Bernard', 'Sophie', 'sophie.bernard@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'utilisateur'),
('Petit', 'Lucas', 'lucas.petit@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'utilisateur'),
('Robert', 'Emma', 'emma.robert@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'utilisateur'),
('Richard', 'Hugo', 'hugo.richard@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'utilisateur'),
('Durand', 'Léa', 'lea.durand@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('Moreau', 'Nathan', 'nathan.moreau@campus.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'utilisateur');

-- Insertion des salles
INSERT INTO rooms (id, name, capacity, nb_pc, room_type, temperature, occupancy) VALUES
('A101', 'Amphithéâtre A', 200, 0, 'cours', 21.5, 45),
('A102', 'Salle TP Info 1', 30, 30, 'labo', 22.0, 28),
('A103', 'Salle TP Info 2', 30, 30, 'labo', 21.8, 15),
('B201', 'Salle de cours B201', 50, 1, 'cours', 20.5, 0),
('B202', 'Salle de cours B202', 50, 1, 'cours', 21.0, 35),
('B203', 'Salle réunion 1', 15, 0, 'reunion', 22.5, 8),
('C301', 'Labo Recherche', 20, 15, 'labo', 21.2, 12),
('C302', 'Box Travail 1', 6, 2, 'box', 20.8, 4),
('C303', 'Box Travail 2', 6, 2, 'box', 21.3, 0),
('D401', 'Amphithéâtre D', 150, 0, 'cours', 22.0, 120),
('D402', 'Salle Projet', 25, 10, 'labo', 21.5, 18),
('E501', 'Salle Visio', 12, 1, 'reunion', 21.0, 5);

-- Insertion des réservations
INSERT INTO bookings (room_id, user_id, user_name, start_time, end_time, status) VALUES
('A101', 2, 'Thomas Martin', '2026-01-22 09:00:00', '2026-01-22 11:00:00', 'confirme'),
('A102', 3, 'Sophie Bernard', '2026-01-22 14:00:00', '2026-01-22 16:00:00', 'confirme'),
('B203', 4, 'Lucas Petit', '2026-01-22 10:00:00', '2026-01-22 11:00:00', 'confirme'),
('C302', 5, 'Emma Robert', '2026-01-22 13:00:00', '2026-01-22 15:00:00', 'confirme'),
('D401', 2, 'Thomas Martin', '2026-01-23 08:00:00', '2026-01-23 10:00:00', 'confirme'),
('A103', 6, 'Hugo Richard', '2026-01-23 14:00:00', '2026-01-23 17:00:00', 'confirme'),
('E501', 8, 'Nathan Moreau', '2026-01-23 11:00:00', '2026-01-23 12:00:00', 'confirme'),
('B201', 3, 'Sophie Bernard', '2026-01-24 09:00:00', '2026-01-24 12:00:00', 'confirme'),
('C301', 4, 'Lucas Petit', '2026-01-24 15:00:00', '2026-01-24 18:00:00', 'annule'),
('D402', 5, 'Emma Robert', '2026-01-25 10:00:00', '2026-01-25 13:00:00', 'confirme');

-- Insertion des tickets de support
INSERT INTO tickets (user_id, room_id, title, subject, description, location, priority, status) VALUES
(2, 'A102', 'Projecteur défectueux', 'Équipement', 'Le projecteur ne s\'allume plus dans la salle TP Info 1', 'Bâtiment A, Salle A102', 'urgent', 'en_cours'),
(3, 'B201', 'Climatisation trop forte', 'Température', 'La climatisation est réglée trop bas, il fait froid', 'Bâtiment B, Salle B201', 'moyen', 'nouveau'),
(4, 'A101', 'Microphone ne fonctionne pas', 'Équipement', 'Le microphone sans fil n\'émet aucun son', 'Amphithéâtre A', 'urgent', 'nouveau'),
(5, NULL, 'WiFi instable', 'Réseau', 'Connexion WiFi qui se déconnecte régulièrement', 'Bâtiment C', 'moyen', 'en_cours'),
(6, 'C301', 'PC bloqué', 'Informatique', 'Un des PC du labo ne démarre plus', 'Labo Recherche C301', 'moyen', 'resolu'),
(8, 'D402', 'Tableau blanc sale', 'Entretien', 'Le tableau blanc n\'a pas été nettoyé', 'Salle Projet D402', 'bas', 'nouveau'),
(2, 'E501', 'Caméra visio défaillante', 'Équipement', 'La caméra de visioconférence ne fonctionne pas', 'Salle Visio E501', 'urgent', 'en_cours'),
(3, 'C303', 'Chaise cassée', 'Mobilier', 'Une chaise a un pied cassé', 'Box Travail 2', 'moyen', 'resolu');

-- Insertion des capteurs
INSERT INTO sensors (room_id, sensor_type) VALUES
('A101', 'temp'),
('A101', 'occupancy'),
('A101', 'energy'),
('A102', 'temp'),
('A102', 'occupancy'),
('A103', 'temp'),
('A103', 'occupancy'),
('B201', 'temp'),
('B201', 'energy'),
('B202', 'temp'),
('B202', 'occupancy'),
('C301', 'temp'),
('C301', 'energy'),
('D401', 'temp'),
('D401', 'occupancy'),
('D401', 'energy');

-- Insertion des mesures (dernières 24h)
INSERT INTO measurements (sensor_id, value, recorded_at) VALUES
-- Température A101
(1, 21.5, '2026-01-22 08:00:00'),
(1, 22.3, '2026-01-22 10:00:00'),
(1, 23.1, '2026-01-22 12:00:00'),
(1, 22.8, '2026-01-22 14:00:00'),
(1, 21.9, '2026-01-22 16:00:00'),
-- Occupation A101
(2, 45, '2026-01-22 09:00:00'),
(2, 120, '2026-01-22 11:00:00'),
(2, 30, '2026-01-22 15:00:00'),
-- Énergie A101 (kWh)
(3, 12.5, '2026-01-22 08:00:00'),
(3, 18.2, '2026-01-22 12:00:00'),
(3, 15.7, '2026-01-22 16:00:00'),
-- Température A102
(4, 22.0, '2026-01-22 08:00:00'),
(4, 23.5, '2026-01-22 14:00:00'),
(4, 22.8, '2026-01-22 16:00:00'),
-- Occupation A102
(5, 28, '2026-01-22 14:00:00'),
(5, 30, '2026-01-22 15:00:00'),
-- Température B201
(8, 20.5, '2026-01-22 08:00:00'),
(8, 19.8, '2026-01-22 10:00:00'),
(8, 20.2, '2026-01-22 14:00:00'),
-- Température D401
(14, 22.0, '2026-01-22 08:00:00'),
(14, 24.5, '2026-01-22 11:00:00'),
(14, 23.2, '2026-01-22 15:00:00'),
-- Occupation D401
(15, 120, '2026-01-22 09:00:00'),
(15, 95, '2026-01-22 11:00:00'),
-- Énergie D401
(16, 22.3, '2026-01-22 08:00:00'),
(16, 28.9, '2026-01-22 12:00:00'),
(16, 25.1, '2026-01-22 16:00:00');
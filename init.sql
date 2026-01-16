CREATE DATABASE IF NOT EXISTS smartcampus;
USE smartcampus;

-- 1. LES COMPTES (Utilisateur commun et Administrateur)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lastname VARCHAR(50) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    -- 'utilisateur' pour les étudiants/enseignants, 'admin' pour la gestion
    role ENUM('utilisateur', 'admin') DEFAULT 'utilisateur',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. LES SALLES (Focus : Capacité et PC)
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT,
    nb_pc INT DEFAULT 0, 
    room_type ENUM('cours', 'labo', 'reunion', 'box') DEFAULT 'cours'
);

-- 3. RÉSERVATIONS
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    user_id INT, 
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('confirme', 'annule') DEFAULT 'confirme',
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. TICKETS DE SUPPORT
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    room_id INT,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('nouveau', 'en_cours', 'resolu') DEFAULT 'nouveau',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- 5. CAPTEURS & MESURES (IoT)
CREATE TABLE sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
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
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
//test
// Middleware
app.use(cors());
app.use(express.json());

// Configuration MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: process.env.DB_NAME || 'smartcampus',
    charset: 'utf8mb4'
};

// Pool de connexions
const pool = mysql.createPool(dbConfig);

// Test de connexion
pool.getConnection()
    .then(connection => {
        console.log('✅ Connecté à MySQL');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Erreur de connexion à MySQL:', err.message);
    });

// === ROUTES API ===

// GET - Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'SmartCampus API est en ligne' });
});

// === ROOMS (SALLES) ===

// GET - Récupérer toutes les salles
app.get('/api/rooms', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM rooms');
        res.json(rows);
    } catch (error) {
        console.error('Erreur getRooms:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Récupérer une salle par ID
app.get('/api/rooms/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM rooms WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Salle non trouvée' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erreur getRoom:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Créer une salle
app.post('/api/rooms', async (req, res) => {
    const { id, name, capacity, nb_pc, room_type, temperature, occupancy } = req.body;
    try {
        await pool.query(
            'INSERT INTO rooms (id, name, capacity, nb_pc, room_type, temperature, occupancy) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, capacity || 0, nb_pc || 0, room_type || 'cours', temperature || 20.0, occupancy || 0]
        );
        res.status(201).json({ message: 'Salle créée avec succès', id });
    } catch (error) {
        console.error('Erreur createRoom:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT - Mettre à jour une salle
app.put('/api/rooms/:id', async (req, res) => {
    const { temperature, occupancy } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE rooms SET temperature = COALESCE(?, temperature), occupancy = COALESCE(?, occupancy) WHERE id = ?',
            [temperature, occupancy, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Salle non trouvée' });
        }
        res.json({ message: 'Salle mise à jour' });
    } catch (error) {
        console.error('Erreur updateRoom:', error);
        res.status(500).json({ error: error.message });
    }
});

// === BOOKINGS (RÉSERVATIONS) ===

// GET - Récupérer toutes les réservations
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, r.name as room_name, u.firstname, u.lastname 
            FROM bookings b 
            LEFT JOIN rooms r ON b.room_id = r.id 
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.status = 'confirme'
            ORDER BY b.start_time DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Erreur getBookings:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Récupérer les réservations d'une salle
app.get('/api/bookings/room/:roomId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM bookings WHERE room_id = ? AND status = "confirme" ORDER BY start_time',
            [req.params.roomId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erreur getBookingsByRoom:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Créer une réservation
app.post('/api/bookings', async (req, res) => {
    const { room_id, user_id, user_name, start_time, end_time } = req.body;
    
    if (!room_id || !start_time || !end_time) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    try {
        // Vérifier les conflits
        const [conflicts] = await pool.query(
            `SELECT * FROM bookings 
             WHERE room_id = ? 
             AND status = 'confirme'
             AND (
                 (start_time BETWEEN ? AND ?) OR
                 (end_time BETWEEN ? AND ?) OR
                 (start_time <= ? AND end_time >= ?)
             )`,
            [room_id, start_time, end_time, start_time, end_time, start_time, end_time]
        );

        if (conflicts.length > 0) {
            return res.status(409).json({ error: 'Conflit de réservation', conflicts });
        }

        const [result] = await pool.query(
            'INSERT INTO bookings (room_id, user_id, user_name, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
            [room_id, user_id, user_name, start_time, end_time]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Réservation créée avec succès' 
        });
    } catch (error) {
        console.error('Erreur createBooking:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Annuler une réservation
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE bookings SET status = "annule" WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }
        res.json({ message: 'Réservation annulée' });
    } catch (error) {
        console.error('Erreur deleteBooking:', error);
        res.status(500).json({ error: error.message });
    }
});

// === TICKETS (MAINTENANCE) ===

// GET - Récupérer tous les tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT t.*, u.firstname, u.lastname, r.name as room_name 
            FROM tickets t 
            LEFT JOIN users u ON t.user_id = u.id 
            LEFT JOIN rooms r ON t.room_id = r.id
        `;
        
        if (status) {
            query += ' WHERE t.status = ?';
            const [rows] = await pool.query(query + ' ORDER BY t.created_at DESC', [status]);
            return res.json(rows);
        }
        
        const [rows] = await pool.query(query + ' ORDER BY t.created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erreur getTickets:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Créer un ticket
app.post('/api/tickets', async (req, res) => {
    const { title, description, location, priority, user_id, room_id } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ error: 'Titre et description requis' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (title, description, location, priority, user_id, room_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, location, priority || 'moyen', user_id, room_id]
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Ticket créé avec succès' 
        });
    } catch (error) {
        console.error('Erreur createTicket:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT - Mettre à jour le statut d'un ticket
app.put('/api/tickets/:id', async (req, res) => {
    const { status } = req.body;
    
    if (!status || !['nouveau', 'en_cours', 'resolu'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE tickets SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket non trouvé' });
        }
        res.json({ message: 'Ticket mis à jour' });
    } catch (error) {
        console.error('Erreur updateTicket:', error);
        res.status(500).json({ error: error.message });
    }
});

// === SENSORS & MEASUREMENTS ===

// POST - Enregistrer une mesure de capteur
app.post('/api/measurements', async (req, res) => {
    const { sensor_id, value } = req.body;
    
    if (!sensor_id || value === undefined) {
        return res.status(400).json({ error: 'sensor_id et value requis' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO measurements (sensor_id, value) VALUES (?, ?)',
            [sensor_id, value]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error('Erreur createMeasurement:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Récupérer les mesures récentes
app.get('/api/measurements', async (req, res) => {
    try {
        const { sensor_id, limit = 100 } = req.query;
        
        let query = `
            SELECT m.*, s.sensor_type, s.room_id 
            FROM measurements m 
            JOIN sensors s ON m.sensor_id = s.id
        `;
        
        if (sensor_id) {
            query += ' WHERE m.sensor_id = ?';
            const [rows] = await pool.query(
                query + ' ORDER BY m.recorded_at DESC LIMIT ?',
                [sensor_id, parseInt(limit)]
            );
            return res.json(rows);
        }
        
        const [rows] = await pool.query(
            query + ' ORDER BY m.recorded_at DESC LIMIT ?',
            [parseInt(limit)]
        );
        res.json(rows);
    } catch (error) {
        console.error('Erreur getMeasurements:', error);
        res.status(500).json({ error: error.message });
    }
});

// === USERS ===

// GET - Récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstname, lastname, email, role, created_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Erreur getUsers:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Créer un utilisateur
app.post('/api/users', async (req, res) => {
    const { firstname, lastname, email, password, role } = req.body;
    
    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [firstname, lastname, email, password, role || 'utilisateur']
        );
        
        res.status(201).json({ 
            id: result.insertId, 
            message: 'Utilisateur créé avec succès' 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Cet email existe déjà' });
        }
        console.error('Erreur createUser:', error);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 SmartCampus API démarrée sur http://localhost:${PORT}`);
    console.log(`📊 Database: ${dbConfig.database} @ ${dbConfig.host}`);
});

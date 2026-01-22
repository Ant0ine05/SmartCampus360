/**
 * SmartCampus360 - API Service
 * Gère toutes les communications avec le backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

const API = {
    // === HEALTH CHECK ===
    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('❌ API non disponible:', error);
            return null;
        }
    },

    // === ROOMS (SALLES) ===
    
    /**
     * Récupérer toutes les salles
     */
    async getRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getRooms:', error);
            return [];
        }
    },

    /**
     * Récupérer une salle par ID
     */
    async getRoom(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/${id}`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getRoom:', error);
            return null;
        }
    },

    /**
     * Créer une nouvelle salle
     */
    async createRoom(roomData) {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
            if (!response.ok) throw new Error('Erreur lors de la création');
            return await response.json();
        } catch (error) {
            console.error('Erreur createRoom:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour une salle (température, occupation)
     */
    async updateRoom(id, updates) {
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour');
            return await response.json();
        } catch (error) {
            console.error('Erreur updateRoom:', error);
            throw error;
        }
    },

    // === BOOKINGS (RÉSERVATIONS) ===

    /**
     * Récupérer toutes les réservations
     */
    async getBookings() {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getBookings:', error);
            return [];
        }
    },

    /**
     * Récupérer les réservations d'une salle
     */
    async getBookingsByRoom(roomId) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/room/${roomId}`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getBookingsByRoom:', error);
            return [];
        }
    },

    /**
     * Créer une réservation
     */
    async createBooking(bookingData) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Gestion des conflits
                if (response.status === 409) {
                    throw new Error('Cette salle est déjà réservée pour cette période');
                }
                throw new Error(data.error || 'Erreur lors de la réservation');
            }
            
            return data;
        } catch (error) {
            console.error('Erreur createBooking:', error);
            throw error;
        }
    },

    /**
     * Annuler une réservation
     */
    async cancelBooking(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Erreur lors de l\'annulation');
            return await response.json();
        } catch (error) {
            console.error('Erreur cancelBooking:', error);
            throw error;
        }
    },

    // === TICKETS (MAINTENANCE) ===

    /**
     * Récupérer tous les tickets
     */
    async getTickets(status = null) {
        try {
            let url = `${API_BASE_URL}/tickets`;
            if (status) url += `?status=${status}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getTickets:', error);
            return [];
        }
    },

    /**
     * Créer un ticket de maintenance
     */
    async createTicket(ticketData) {
        try {
            const response = await fetch(`${API_BASE_URL}/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            });
            if (!response.ok) throw new Error('Erreur lors de la création du ticket');
            return await response.json();
        } catch (error) {
            console.error('Erreur createTicket:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour le statut d'un ticket
     */
    async updateTicket(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Erreur lors de la mise à jour');
            return await response.json();
        } catch (error) {
            console.error('Erreur updateTicket:', error);
            throw error;
        }
    },

    // === MEASUREMENTS (CAPTEURS) ===

    /**
     * Enregistrer une mesure de capteur
     */
    async createMeasurement(measurementData) {
        try {
            const response = await fetch(`${API_BASE_URL}/measurements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(measurementData)
            });
            if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
            return await response.json();
        } catch (error) {
            console.error('Erreur createMeasurement:', error);
            throw error;
        }
    },

    /**
     * Récupérer les mesures récentes
     */
    async getMeasurements(sensorId = null, limit = 100) {
        try {
            let url = `${API_BASE_URL}/measurements?limit=${limit}`;
            if (sensorId) url += `&sensor_id=${sensorId}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getMeasurements:', error);
            return [];
        }
    },

    // === USERS ===

    /**
     * Récupérer tous les utilisateurs
     */
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) throw new Error('Erreur réseau');
            return await response.json();
        } catch (error) {
            console.error('Erreur getUsers:', error);
            return [];
        }
    },

    /**
     * Créer un utilisateur
     */
    async createUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('Cet email existe déjà');
                }
                throw new Error(data.error || 'Erreur lors de la création');
            }
            
            return data;
        } catch (error) {
            console.error('Erreur createUser:', error);
            throw error;
        }
    },

    // === SYNC UTILITIES ===

    /**
     * Synchroniser les salles locales avec le backend
     */
    async syncRooms(localRooms) {
        try {
            const remoteRooms = await this.getRooms();
            
            // Si pas de salles en BDD, les créer
            if (remoteRooms.length === 0) {
                console.log('🔄 Initialisation des salles dans la base de données...');
                for (const room of localRooms) {
                    await this.createRoom({
                        id: room.id,
                        name: room.name,
                        capacity: room.capacity,
                        nb_pc: 0,
                        room_type: room.type === 'Classroom' ? 'cours' : 'labo',
                        temperature: room.temp,
                        occupancy: room.occupancy
                    });
                }
                return localRooms;
            }
            
            return remoteRooms;
        } catch (error) {
            console.error('Erreur syncRooms:', error);
            return localRooms; // Fallback sur les données locales
        }
    },

    /**
     * Envoyer les mises à jour en temps réel
     */
    async pushRoomUpdates(rooms) {
        try {
            const promises = rooms.map(room => 
                this.updateRoom(room.id, {
                    temperature: room.temp,
                    occupancy: room.occupancy
                }).catch(err => console.warn(`Échec mise à jour ${room.id}:`, err))
            );
            await Promise.all(promises);
        } catch (error) {
            console.error('Erreur pushRoomUpdates:', error);
        }
    }
};

// Auto-test de la connexion API au chargement
API.healthCheck().then(result => {
    if (result) {
        console.log('✅ API SmartCampus connectée:', result.message);
    } else {
        console.warn('⚠️ API hors ligne - Mode simulation activé');
    }
});

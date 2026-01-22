/**
 * SmartCampus360 - Data Integration Layer
 * Gère la synchronisation entre l'API backend et l'UI
 */

const AppData = {
    // Cache local
    cache: {
        rooms: [],
        bookings: [],
        tickets: [],
        users: [],
        measurements: []
    },

    // État de connexion API
    apiConnected: false,

    /**
     * Initialisation au chargement de l'app
     */
    async init() {
        console.log('🔄 Initialisation AppData...');
        
        // Test de connexion API
        const health = await API.healthCheck();
        this.apiConnected = !!health;
        
        if (this.apiConnected) {
            console.log('✅ API connectée');
            await this.loadAllData();
            this.startAutoRefresh();
        } else {
            console.warn('⚠️ API hors ligne - Mode dégradé');
        }
    },

    /**
     * Charger toutes les données depuis l'API
     */
    async loadAllData() {
        try {
            const [rooms, bookings, tickets, users] = await Promise.all([
                API.getRooms(),
                API.getBookings(),
                API.getTickets(),
                API.getUsers()
            ]);

            this.cache.rooms = rooms;
            this.cache.bookings = bookings;
            this.cache.tickets = tickets;
            this.cache.users = users;

            console.log('📊 Données chargées:', {
                rooms: rooms.length,
                bookings: bookings.length,
                tickets: tickets.length,
                users: users.length
            });

            // Mettre à jour l'UI si on est sur le dashboard
            this.updateDashboard();
            
            return true;
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            return false;
        }
    },

    /**
     * Actualisation automatique toutes les 30 secondes
     */
    startAutoRefresh() {
        setInterval(async () => {
            if (this.apiConnected) {
                await this.loadAllData();
            }
        }, 30000);
    },

    /**
     * Mettre à jour le dashboard avec les vraies données
     */
    updateDashboard() {
        // Mettre à jour les KPIs
        const rooms = this.cache.rooms;
        if (rooms.length > 0) {
            // Température moyenne
            const avgTemp = (rooms.reduce((sum, r) => sum + (r.temperature || 20), 0) / rooms.length).toFixed(1);
            const tempEl = document.querySelector('#kpi-avg-temp, h2.text-info');
            if (tempEl) {
                tempEl.innerHTML = `${avgTemp} <small class="fs-6 text-muted">°C</small>`;
            }

            // Taux d'occupation moyen
            const avgOccupancy = Math.round(
                rooms.reduce((sum, r) => sum + ((r.occupancy / r.capacity) * 100 || 0), 0) / rooms.length
            );
            const occEl = document.querySelector('h2.text-dark');
            if (occEl && occEl.textContent.includes('%')) {
                occEl.innerHTML = `${avgOccupancy} <small class="fs-6 text-muted">%</small>`;
            }

            // Consommation énergétique (estimation basée sur l'occupation)
            const totalPower = Math.round(
                rooms.reduce((sum, r) => sum + (r.occupancy * 0.15), 0)
            );
            const powerEl = document.querySelector('#kpi-total-power, #sidebar-kwh');
            if (powerEl) {
                powerEl.textContent = totalPower;
            }
        }

        // Tickets actifs (non résolus)
        const activeTickets = this.cache.tickets.filter(t => t.status !== 'resolu').length;
        const ticketsEl = document.querySelector('h2.text-danger');
        if (ticketsEl && !isNaN(parseInt(ticketsEl.textContent))) {
            ticketsEl.textContent = activeTickets;
        }

        // Mettre à jour le compteur de réservations
        const bookingCount = this.cache.bookings.filter(b => b.status === 'confirme').length;
        const resaBadge = document.querySelector('.badge.bg-light.text-dark.border');
        if (resaBadge && resaBadge.textContent.includes('à venir')) {
            resaBadge.textContent = `${bookingCount} à venir`;
        }

        // Afficher le nom de l'utilisateur connecté
        const authData = this.getCurrentUser();
        if (authData) {
            const welcomeEl = document.querySelector('h4.fw-bold.text-dark');
            if (welcomeEl && welcomeEl.textContent.includes('Bonjour')) {
                welcomeEl.textContent = `Bonjour, ${authData.firstname} 👋`;
            }
        }
    },

    /**
     * Récupérer l'utilisateur connecté
     */
    getCurrentUser() {
        const auth = localStorage.getItem('sc360_auth');
        if (!auth) return null;
        try {
            return JSON.parse(auth);
        } catch {
            return null;
        }
    },

    /**
     * Créer une nouvelle réservation
     */
    async createBooking(roomId, startTime, endTime) {
        const user = this.getCurrentUser();
        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        try {
            const booking = await API.createBooking({
                room_id: roomId,
                user_id: user.id,
                user_name: `${user.firstname} ${user.lastname}`,
                start_time: startTime,
                end_time: endTime
            });

            // Recharger les réservations
            this.cache.bookings = await API.getBookings();
            
            return booking;
        } catch (error) {
            console.error('Erreur création réservation:', error);
            throw error;
        }
    },

    /**
     * Annuler une réservation
     */
    async cancelBooking(bookingId) {
        try {
            await API.cancelBooking(bookingId);
            
            // Mettre à jour le cache
            const booking = this.cache.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'annule';
            }
            
            return true;
        } catch (error) {
            console.error('Erreur annulation réservation:', error);
            throw error;
        }
    },

    /**
     * Créer un ticket de maintenance
     */
    async createTicket(ticketData) {
        const user = this.getCurrentUser();
        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        try {
            const ticket = await API.createTicket({
                ...ticketData,
                user_id: user.id
            });

            // Recharger les tickets
            this.cache.tickets = await API.getTickets();
            
            return ticket;
        } catch (error) {
            console.error('Erreur création ticket:', error);
            throw error;
        }
    },

    /**
     * Mettre à jour le statut d'un ticket
     */
    async updateTicketStatus(ticketId, newStatus) {
        try {
            await API.updateTicket(ticketId, newStatus);
            
            // Mettre à jour le cache
            const ticket = this.cache.tickets.find(t => t.id === ticketId);
            if (ticket) {
                ticket.status = newStatus;
            }
            
            return true;
        } catch (error) {
            console.error('Erreur mise à jour ticket:', error);
            throw error;
        }
    },

    /**
     * Récupérer les salles disponibles
     */
    getAvailableRooms(filters = {}) {
        let rooms = [...this.cache.rooms];

        // Filtrer par type
        if (filters.type) {
            const typeMap = {
                'cours': ['cours'],
                'labo': ['labo'],
                'reunion': ['reunion'],
                'box': ['box']
            };
            rooms = rooms.filter(r => typeMap[filters.type]?.includes(r.room_type));
        }

        // Filtrer par capacité minimale
        if (filters.minCapacity) {
            rooms = rooms.filter(r => r.capacity >= filters.minCapacity);
        }

        // Filtrer par disponibilité
        if (filters.onlyAvailable) {
            rooms = rooms.filter(r => (r.occupancy / r.capacity) < 0.5);
        }

        // Filtrer par recherche texte
        if (filters.search) {
            const search = filters.search.toLowerCase();
            rooms = rooms.filter(r => 
                r.name.toLowerCase().includes(search) ||
                r.id.toLowerCase().includes(search)
            );
        }

        return rooms;
    },

    /**
     * Récupérer les réservations d'une salle
     */
    getRoomBookings(roomId) {
        return this.cache.bookings.filter(b => 
            b.room_id === roomId && b.status === 'confirme'
        );
    },

    /**
     * Récupérer les tickets par statut
     */
    getTicketsByStatus(status) {
        if (!status) return this.cache.tickets;
        return this.cache.tickets.filter(t => t.status === status);
    },

    /**
     * Récupérer les statistiques pour le dashboard
     */
    getStats() {
        const rooms = this.cache.rooms;
        const bookings = this.cache.bookings.filter(b => b.status === 'confirme');
        const tickets = this.cache.tickets;

        return {
            totalRooms: rooms.length,
            avgTemperature: (rooms.reduce((sum, r) => sum + (r.temperature || 20), 0) / rooms.length).toFixed(1),
            avgOccupancy: Math.round(
                rooms.reduce((sum, r) => sum + ((r.occupancy / r.capacity) * 100 || 0), 0) / rooms.length
            ),
            totalPower: Math.round(
                rooms.reduce((sum, r) => sum + (r.occupancy * 0.15), 0)
            ),
            activeBookings: bookings.length,
            activeTickets: tickets.filter(t => t.status !== 'resolu').length,
            urgentTickets: tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolu').length
        };
    }
};

// Auto-initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppData.init());
} else {
    AppData.init();
}

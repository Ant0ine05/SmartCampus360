/**
 * SmartCampus360 - Simulation Engine
 * Handles mock data generation, physics simulation, and anomaly testing.
 */

const SmartCampus = {
    // Config
    CONFIG: {
        tickRate: 3000, // ms
        weatherApiUrl: 'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,is_day&timezone=Europe%2FParis',
        baseEnergyLoad: 400, 
        kwhPerPerson: 0.1, 
        roomHeatingRate: 0.15,
        occupancyHeatContribution: 0.03,
    },

    state: {
        external: { temp: 15, isDay: 1, condition: 'Cloudy' },
        energy: { currentConsumption: 650, history: [], byBuilding: { 'A': 0, 'B': 0, 'C': 0 } },
        // Expanded Room List for "Mega Map"
        rooms: [
            // WEST WING - Classrooms
            { id: 'C101', name: 'Amphi A', type: 'Classroom', capacity: 100, temp: 20, targetTemp: 21, occupancy: 0, lights: false, schedule: [], alert: null },
            { id: 'C102', name: 'Amphi B', type: 'Classroom', capacity: 100, temp: 20, targetTemp: 21, occupancy: 0, lights: false, schedule: [], alert: null },
            { id: 'C103', name: 'Salle 103', type: 'Classroom', capacity: 30, temp: 20, targetTemp: 21, occupancy: 0, lights: false, schedule: [], alert: null },
            { id: 'C104', name: 'Salle 104', type: 'Classroom', capacity: 30, temp: 20, targetTemp: 21, occupancy: 0, lights: false, schedule: [], alert: null },
            
            // EAST WING - Labs
            { id: 'L201', name: 'Labo Physique', type: 'Lab', capacity: 20, temp: 19, targetTemp: 20, occupancy: 0, lights: false, schedule: [], alert: null },
            { id: 'L202', name: 'Labo Chimie', type: 'Lab', capacity: 20, temp: 19, targetTemp: 20, occupancy: 0, lights: false, schedule: [], alert: null },
            { id: 'L203', name: 'Serveurs', type: 'Tech', capacity: 0, temp: 18, targetTemp: 18, occupancy: 0, lights: true, schedule: [], alert: null },
            
            // NORTH - Admin
            { id: 'A001', name: 'Administration', type: 'Office', capacity: 15, temp: 22, targetTemp: 22, occupancy: 5, lights: true, schedule: [], alert: null },
            { id: 'A002', name: 'Bibliothèque', type: 'Hall', capacity: 80, temp: 21, targetTemp: 21, occupancy: 0, lights: true, schedule: [], alert: null },
            
            // SOUTH - Common
            { id: 'K001', name: 'Cafétéria', type: 'Hall', capacity: 150, temp: 21, targetTemp: 21, occupancy: 0, lights: true, schedule: [], alert: null },
            
            // CORE
            { id: 'H000', name: 'Main Hall', type: 'Hall', capacity: 200, temp: 18, targetTemp: 19, occupancy: 0, lights: true, schedule: [], alert: null },
        ],
        anomalyActive: false
    },

    // Simplified scheduling for demo
    getOccupancyTarget(room, hour) {
        if(room.type === 'Classroom' && (hour >= 8 && hour <= 17)) return 0.8;
        if(room.type === 'Lab' && (hour >= 9 && hour <= 16)) return 0.6;
        if(room.id === 'K001' && (hour >= 11 && hour <= 14)) return 0.9; // Lunch rush
        return 0.1;
    },

    async init() {
        console.log("SmartCampus Mega Simulation Started");
        this.generateHistory();
        await this.fetchWeather();
        
        // Charger les salles depuis l'API ou utiliser les données locales
        try {
            const remoteRooms = await API.syncRooms(this.state.rooms);
            if (remoteRooms && remoteRooms.length > 0) {
                // Mapper les données de la BDD vers le format de simulation
                this.state.rooms = remoteRooms.map(r => ({
                    id: r.id,
                    name: r.name,
                    type: r.room_type === 'cours' ? 'Classroom' : 'Lab',
                    capacity: r.capacity,
                    temp: r.temperature || 20,
                    targetTemp: 21,
                    occupancy: r.occupancy || 0,
                    lights: false,
                    schedule: [],
                    alert: null
                }));
                console.log('✅ Salles chargées depuis la base de données');
            }
        } catch (error) {
            console.warn('⚠️ Mode simulation locale activé');
        }
        
        setInterval(() => this.tick(), this.CONFIG.tickRate);
        setInterval(() => this.randomEvent(), 30000); // Rare events
        
        // Synchroniser avec le backend toutes les 10 secondes
        setInterval(() => this.syncWithBackend(), 10000);
    },

    async fetchWeather() {
        try {
            const res = await fetch(this.CONFIG.weatherApiUrl);
            const data = await res.json();
            this.state.external.temp = data.current.temperature_2m;
        } catch (e) {
            this.state.external.temp = 20; // fallback
        }
    },

    generateHistory() {
        for (let i = 0; i < 24; i++) {
            this.state.energy.history.push(500 + Math.random() * 200);
        }
    },

    tick() {
        const hour = new Date().getHours();
        let totalPower = 300;

        this.state.rooms.forEach(room => {
            // Occupancy Logic
            const targetRatio = this.getOccupancyTarget(room, hour);
            const targetOcc = room.capacity * targetRatio;
            const fluctuation = (Math.random() - 0.5) * 5;
            room.occupancy = Math.max(0, Math.floor(targetOcc + fluctuation));
            
            // Temp Logic
            const peopleHeat = room.occupancy * 0.05;
            const ambientPull = (this.state.external.temp - room.temp) * 0.05;
            const hvac = (room.targetTemp - room.temp) * 0.2; // HVAC power
            room.temp += peopleHeat + ambientPull + hvac;
            room.temp = Math.round(room.temp * 10) / 10;

            // Power
            totalPower += room.occupancy * 0.1 + (Math.abs(hvac) * 50);
        });

        this.updateEnergyState(totalPower);
        window.dispatchEvent(new CustomEvent('campus-update', { detail: this.state }));
        this.updateSidebar(totalPower);
    },

    updateEnergyState(totalKw) {
        this.state.energy.currentConsumption = Math.floor(totalKw);
        this.state.energy.history.shift();
        this.state.energy.history.push(totalKw);
    },

    updateSidebar(val) {
        const kwhEl = document.getElementById('sidebar-kwh');
        if (kwhEl) kwhEl.innerText = Math.round(val);
    },

    randomEvent() {
        // Randomly assign alert to a room
        if(Math.random() > 0.8) {
            const room = this.state.rooms[Math.floor(Math.random() * this.state.rooms.length)];
            const types = ['maintenance', 'wifi', 'cleaning'];
            room.alert = types[Math.floor(Math.random() * types.length)];
            
            this.showToast('warning', `Incident signalé : ${room.name}`);
            
            setTimeout(() => { room.alert = null; }, 15000);
        }
    },

    showToast(type, msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const id = 'toast-' + Date.now();
        const bg = type === 'warning' ? 'text-bg-warning' : (type === 'danger' ? 'text-bg-danger' : 'text-bg-info');
        container.insertAdjacentHTML('beforeend', `
            <div id="${id}" class="toast align-items-center ${bg} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex"><div class="toast-body">${msg}</div></div>
            </div>
        `);
        const el = document.getElementById(id);
        const t = new bootstrap.Toast(el);
        t.show();
        el.addEventListener('hidden.bs.toast', () => el.remove());
    },

    getRoom(id) {
        return this.state.rooms.find(r => r.id === id);
    },

    triggerTestIncident() {
        const room = this.state.rooms[Math.floor(Math.random() * this.state.rooms.length)];
        this.showToast('danger', `TEST INCIDENT: ${room.name}`);
        room.alert = 'test';
        window.dispatchEvent(new CustomEvent('campus-update', { detail: this.state }));
        
        setTimeout(() => { 
            room.alert = null; 
            window.dispatchEvent(new CustomEvent('campus-update', { detail: this.state }));
        }, 5000);
    },

    triggerTicketSubmit(form) {
        // Simulate Processing
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Envoi...';

        // Extraire les données du formulaire
        const formData = new FormData(form);
        const ticketData = {
            title: formData.get('title') || formData.get('subject') || 'Ticket sans titre',
            description: formData.get('description') || '',
            location: formData.get('location') || '',
            priority: formData.get('priority') || 'moyen',
            user_id: 1 // ID utilisateur par défaut (à adapter)
        };

        // Envoyer au backend
        API.createTicket(ticketData)
            .then(result => {
                btn.innerHTML = '<i class="bi bi-check-lg me-2"></i>Envoyé !';
                btn.classList.replace('btn-primary', 'btn-success');
                
                this.showToast('success', `Ticket créé avec succès (ID: ${result.id})`);
                
                // Refresh the tickets list
                if (typeof UIUpdater !== 'undefined' && UIUpdater.updateMaintenancePage) {
                    UIUpdater.updateMaintenancePage();
                }
                
                // Reset form after delay
                setTimeout(() => {
                    form.reset();
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    btn.classList.replace('btn-success', 'btn-primary');
                    // Switch to active tab (optional, but nice)
                    const activeTab = document.querySelector('#active-tab');
                    if(activeTab) {
                        const tab = new bootstrap.Tab(activeTab);
                        tab.show();
                    }
                }, 1500);
            })
            .catch(error => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                this.showToast('danger', 'Erreur lors de la création du ticket');
            });
    },

    // Synchroniser avec le backend
    async syncWithBackend() {
        try {
            await API.pushRoomUpdates(this.state.rooms);
        } catch (error) {
            console.warn('Synchronisation backend échouée:', error);
        }
    },
};

SmartCampus.init();

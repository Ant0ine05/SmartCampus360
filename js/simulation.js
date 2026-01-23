/**
 * SmartCampus360 - Simulation Engine
 * Handles mock data generation, physics simulation, and anomaly testing.
 */

const SmartCampus = {
    // Config
    CONFIG: {
        tickRate: 3000, // ms - Mise à jour toutes les 3 secondes
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
                this.state.rooms = remoteRooms.map(r => {
                    // Varier la température cible selon le type de salle
                    let targetTemp = 21;
                    if (r.room_type === 'labo') targetTemp = 20; // Labos plus frais
                    else if (r.room_type === 'reunion') targetTemp = 22; // Réunions plus chaud
                    else if (r.room_type === 'box') targetTemp = 21.5; // Box confortables
                    
                    return {
                        id: r.id,
                        name: r.name,
                        type: r.room_type === 'cours' ? 'Classroom' : 'Lab',
                        capacity: r.capacity,
                        temp: r.temperature || 20,
                        targetTemp: targetTemp,
                        occupancy: r.occupancy || 0,
                        lights: false,
                        schedule: [],
                        alert: null
                    };
                });
                console.log('✅ Salles chargées depuis la base de données');
            }
        } catch (error) {
            console.warn('⚠️ Mode simulation locale activé');
        }
        
        setInterval(() => this.tick(), this.CONFIG.tickRate);
        setInterval(() => this.randomEvent(), 30000); // Rare events
        
        // Synchroniser avec le backend toutes les 5 secondes
        setInterval(() => this.syncWithBackend(), 5000);
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
        // Générer 24 heures d'historique avec variation réaliste
        const now = new Date();
        for (let i = 0; i < 24; i++) {
            const hour = (now.getHours() - 24 + i + 24) % 24;
            
            // Consommation plus élevée pendant les heures de bureau
            let baseLoad = 300;
            if (hour >= 8 && hour <= 18) {
                baseLoad = 500 + Math.sin((hour - 8) / 10 * Math.PI) * 100;
            } else if (hour >= 19 && hour <= 22) {
                baseLoad = 400;
            }
            
            // Ajout de variations aléatoires
            const variation = (Math.random() - 0.5) * 50;
            const value = baseLoad + variation;
            
            // S'assurer que la valeur est valide
            if (!isNaN(value) && isFinite(value)) {
                this.state.energy.history.push(value);
            } else {
                this.state.energy.history.push(450); // Valeur par défaut
            }
        }
    },

    tick() {
        const hour = new Date().getHours();
        const minute = new Date().getMinutes();
        let totalPower = 300;

        // Campus de 5000 étudiants - Simulation réaliste pour le total global
        const TOTAL_CAMPUS_CAPACITY = 5000;
        
        // Taux d'occupation selon l'heure (0-1)
        let occupancyRate = 0.6; // Base 60%
        if (hour >= 8 && hour < 9) occupancyRate = 0.4 + (minute / 60) * 0.3;
        else if (hour >= 9 && hour < 12) occupancyRate = 0.7 + Math.random() * 0.15;
        else if (hour >= 12 && hour < 14) occupancyRate = 0.4 + Math.random() * 0.2;
        else if (hour >= 14 && hour < 17) occupancyRate = 0.65 + Math.random() * 0.2;
        else if (hour >= 17 && hour < 19) occupancyRate = 0.3 - (minute / 60) * 0.2;
        else if (hour >= 19 || hour < 8) occupancyRate = 0.05 + Math.random() * 0.1;
        
        const currentOccupancy = Math.round(TOTAL_CAMPUS_CAPACITY * occupancyRate);
        const variation = Math.round((Math.random() - 0.5) * 100);
        const totalOccupancy = Math.max(50, Math.min(TOTAL_CAMPUS_CAPACITY, currentOccupancy + variation));
        
        // Stocker dans l'état global pour accès depuis n'importe où
        this.state.totalOccupancy = totalOccupancy;
        this.state.totalCapacity = TOTAL_CAMPUS_CAPACITY;

        this.state.rooms.forEach(room => {
            // Vérifier que la salle est valide
            if (!room || !room.capacity) return;
            
            // Occupancy Logic - Les salles de la map sont une partie du campus
            const targetRatio = this.getOccupancyTarget(room, hour);
            const targetOcc = room.capacity * targetRatio;
            const fluctuation = (Math.random() - 0.5) * 5;
            room.occupancy = Math.max(0, Math.floor(targetOcc + fluctuation));
            
            // Gestion automatique des lumières
            room.lights = room.occupancy > 0 || (hour >= 7 && hour <= 22);
            
            // Temp Logic - Améliorée avec des variations plus visibles
            // S'assurer que temp est un nombre valide
            if (isNaN(room.temp) || !isFinite(room.temp)) {
                room.temp = room.targetTemp || 21;
            }
            
            const peopleHeat = room.occupancy * 0.08; // Augmenté de 0.05 à 0.08
            const ambientPull = (this.state.external.temp - room.temp) * 0.08; // Augmenté de 0.05 à 0.08
            
            // HVAC avec plus de variations
            const hvac = (room.targetTemp - room.temp) * 0.25; // Augmenté de 0.2 à 0.25
            
            // Ajout de variations aléatoires pour simuler l'ouverture de portes/fenêtres
            const randomVariation = (Math.random() - 0.5) * 0.5; // Augmenté de 0.3 à 0.5
            
            // Variation selon l'heure (chauffage réduit la nuit)
            const timeModifier = (hour >= 22 || hour <= 6) ? 0.5 : 1.0;
            
            room.temp += (peopleHeat + ambientPull + hvac * timeModifier + randomVariation);
            
            // Limiter la température entre 16 et 28°C
            room.temp = Math.max(16, Math.min(28, room.temp));
            room.temp = Math.round(room.temp * 10) / 10;

            // Power - Calcul plus réaliste
            const lightingPower = room.lights ? 5 : 0;
            const hvacPower = Math.abs(hvac) * 50;
            const occupancyPower = room.occupancy * 0.12;
            const basePower = room.capacity * 0.05; // Consommation de base
            
            const roomPower = basePower + lightingPower + hvacPower + occupancyPower;
            
            // Vérifier que roomPower est valide avant de l'ajouter
            if (!isNaN(roomPower) && isFinite(roomPower)) {
                totalPower += roomPower;
            }
        });

        // Ajout de variation aléatoire pour la consommation globale
        const randomConsumption = (Math.random() - 0.5) * 30;
        totalPower += randomConsumption;
        
        // Vérifier que totalPower est valide
        if (isNaN(totalPower) || !isFinite(totalPower)) {
            totalPower = 450; // Valeur par défaut
        }
        
        this.updateEnergyState(totalPower);
        window.dispatchEvent(new CustomEvent('campus-update', { detail: this.state }));
        this.updateSidebar(totalPower);
        this.updateDashboardEnergy(totalPower);
    },

    updateEnergyState(totalKw) {
        // S'assurer que la valeur est valide
        const validValue = (!isNaN(totalKw) && isFinite(totalKw)) ? totalKw : 450;
        
        this.state.energy.currentConsumption = Math.floor(validValue);
        this.state.energy.history.shift();
        this.state.energy.history.push(validValue);
    },

    updateSidebar(val) {
        const kwhEl = document.getElementById('sidebar-kwh');
        if (kwhEl) {
            const oldVal = parseInt(kwhEl.innerText) || 0;
            const newVal = Math.round(val);
            
            // Animation de transition
            if (oldVal !== newVal) {
                kwhEl.style.transition = 'all 0.5s ease';
                kwhEl.style.transform = 'scale(1.1)';
                
                // Couleur selon la consommation
                if (newVal > 600) {
                    kwhEl.style.color = '#ef4444'; // Rouge si consommation élevée
                } else if (newVal > 500) {
                    kwhEl.style.color = '#f59e0b'; // Orange
                } else {
                    kwhEl.style.color = '#ffffff'; // Blanc
                }
                
                setTimeout(() => {
                    kwhEl.innerText = newVal;
                    kwhEl.style.transform = 'scale(1)';
                }, 250);
            }
        }
        
        // Mise à jour du sparkline si présent
        this.updateSparkline();
    },
    
    updateSparkline() {
        const sparklineEl = document.getElementById('sidebar-sparkline');
        if (!sparklineEl || this.state.energy.history.length === 0) return;
        
        // Afficher les 12 dernières valeurs et filtrer les NaN
        const recent = this.state.energy.history.slice(-12).filter(v => !isNaN(v) && isFinite(v));
        
        if (recent.length === 0) return;
        
        const max = Math.max(...recent);
        const min = Math.min(...recent);
        const range = (max - min) || 1;
        
        // Créer un mini graphique SVG
        const width = sparklineEl.offsetWidth || 200;
        const height = 40;
        const pointWidth = width / recent.length;
        
        const points = recent.map((val, i) => {
            const x = i * pointWidth;
            const y = height - ((val - min) / range) * height;
            // Vérifier que x et y sont valides
            if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
                return null;
            }
            return `${x},${y}`;
        }).filter(p => p !== null).join(' ');
        
        if (!points) return;
        
        sparklineEl.innerHTML = `
            <svg width="${width}" height="${height}" style="width: 100%; height: 100%;">
                <polyline 
                    points="${points}" 
                    fill="none" 
                    stroke="#60a5fa" 
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        `;
    },
    
    updateDashboardEnergy(val) {
        const valueEl = document.getElementById('dashboard-energy-value');
        const chartEl = document.getElementById('dashboard-energy-chart');
        const trendEl = document.getElementById('dashboard-energy-trend');
        
        if (valueEl) {
            const oldVal = parseInt(valueEl.innerText) || 0;
            const newVal = Math.round(val);
            
            // Animation de mise à jour
            if (oldVal !== newVal) {
                valueEl.style.transition = 'all 0.5s ease';
                valueEl.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    valueEl.innerText = newVal;
                    valueEl.style.transform = 'scale(1)';
                }, 250);
            }
            
            // Afficher la tendance
            if (trendEl) {
                const diff = newVal - oldVal;
                if (diff > 0) {
                    trendEl.innerHTML = '<i class="bi bi-arrow-up"></i> +' + Math.abs(diff) + ' kW/h';
                    trendEl.style.color = '#fbbf24';
                } else if (diff < 0) {
                    trendEl.innerHTML = '<i class="bi bi-arrow-down"></i> -' + Math.abs(diff) + ' kW/h';
                    trendEl.style.color = '#34d399';
                } else {
                    trendEl.innerHTML = '<i class="bi bi-dash"></i> Stable';
                    trendEl.style.color = '#ffffff';
                }
            }
        }
        
        // Mise à jour du nombre total de personnes détectées sur le campus
        const totalPeopleEl = document.getElementById('dashboard-total-people');
        if (totalPeopleEl && this.state.totalOccupancy !== undefined) {
            const oldPeople = parseInt(totalPeopleEl.innerText) || 0;
            const newPeople = this.state.totalOccupancy;
            
            if (oldPeople !== newPeople) {
                totalPeopleEl.style.transition = 'all 0.5s ease';
                totalPeopleEl.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    totalPeopleEl.innerText = newPeople;
                    totalPeopleEl.style.transform = 'scale(1)';
                }, 250);
            }
        }
        
        // Mise à jour du mini graphique dans le dashboard
        if (chartEl && this.state.energy.history.length > 0) {
            const recent = this.state.energy.history.slice(-12).filter(v => !isNaN(v) && isFinite(v));
            
            if (recent.length === 0) return;
            
            const max = Math.max(...recent);
            const min = Math.min(...recent);
            const range = (max - min) || 1;
            
            const width = chartEl.offsetWidth || 300;
            const height = 40;
            const pointWidth = width / recent.length;
            
            const points = recent.map((val, i) => {
                const x = i * pointWidth;
                const y = height - ((val - min) / range) * height;
                // Vérifier que x et y sont valides
                if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
                    return null;
                }
                return `${x},${y}`;
            }).filter(p => p !== null).join(' ');
            
            if (!points) return;
            
            chartEl.innerHTML = `
                <svg width="${width}" height="${height}" style="width: 100%; height: 100%;">
                    <defs>
                        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <polyline 
                        points="${points}" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.8)" 
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <polyline 
                        points="${points} ${width},${height} 0,${height}" 
                        fill="url(#energyGradient)" 
                        stroke="none"
                    />
                </svg>
            `;
        }
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
            // S'assurer que les données sont au bon format
            if (this.state.rooms && this.state.rooms.length > 0) {
                // Afficher un échantillon pour le debug
                const sample = this.state.rooms[0];
                console.log('🔄 Sync exemple:', {
                    id: sample.id,
                    temp: sample.temp,
                    occupancy: sample.occupancy
                });
                
                await API.pushRoomUpdates(this.state.rooms);
                console.log('✅ Synchronisation réussie:', this.state.rooms.length, 'salles mises à jour');
            }
        } catch (error) {
            console.warn('⚠️ Synchronisation backend échouée:', error);
        }
    },
};

SmartCampus.init();

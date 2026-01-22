const Router = {
    init() {
        window.addEventListener('hashchange', () => this.loadRoute(location.hash));
        
        // Initial load
        const token = localStorage.getItem('sc360_auth');
        if (!token) {
            location.hash = '#login';
        } else if (!location.hash || location.hash === '#login') {
            location.hash = '#dashboard';
        }
        
        this.loadRoute(location.hash);
        this.setupLogout();
    },

    async loadRoute(hash) {
        let routeName = hash.replace('#', '') || 'dashboard';
        const token = localStorage.getItem('sc360_auth');

        // Route Guard
        if (!token && routeName !== 'login') {
            location.hash = '#login';
            return;
        }

        if (token && routeName === 'login') {
            location.hash = '#dashboard';
            return;
        }

        // Toggle UI Containers
        const wrapper = document.getElementById('wrapper');
        const loginContainer = document.getElementById('login-container');
        
        if (routeName === 'login') {
            wrapper.classList.add('d-none');
            loginContainer.classList.remove('d-none');
            
            // Render Login
            if (Templates && Templates['login']) {
                loginContainer.innerHTML = Templates['login'];
            }
        } else {
            wrapper.classList.remove('d-none');
            loginContainer.classList.add('d-none');
            
            // Update Active Link in Sidebar
            document.querySelectorAll('.list-group-item').forEach(el => {
                el.classList.remove('active', 'text-white');
                if (el.getAttribute('href') === `#${routeName}`) {
                     el.classList.add('active', 'text-white');
                }
            });

            // Update Page Title
            const titles = {
                'dashboard': 'Tableau de bord',
                'map': 'Carte Interactive',
                'booking': 'Réservation de Salles',
                'maintenance': 'Gestion Maintenance'
            };
            const titleEl = document.getElementById('page-title');
            if (titleEl) titleEl.innerText = titles[routeName] || 'SmartCampus';

            // Render Content
            const contentDiv = document.getElementById('main-content');
            if (Templates && Templates[routeName]) {
                contentDiv.innerHTML = Templates[routeName];
            } else {
                contentDiv.innerHTML = `<div class="alert alert-danger">Module introuvable: ${routeName}</div>`;
            }

            // Init specific modules
            if (routeName === 'dashboard') this.initDashboard();
            if (routeName === 'map') this.initMap();
            if (routeName === 'booking') this.initBooking();
            if (routeName === 'maintenance') this.initMaintenance();
            if (routeName === 'admin') this.initAdmin();
            if (routeName === 'settings') this.initSettings();
        }
    },

    async login(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value.trim();
        const password = form.querySelector('input[type="password"]').value;

        // Validation des champs
        if (!email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (password.length < 3) {
            alert('Mot de passe trop court');
            return;
        }

        try {
            // Récupérer tous les utilisateurs pour vérifier les credentials
            const users = await API.getUsers();
            const user = users.find(u => u.email === email);
            
            // Vérifier que l'utilisateur existe ET que le mot de passe est correct
            // Pour ce projet, on accepte "password123" pour tous les comptes
            if (user && password === 'password123') {
                localStorage.setItem('sc360_auth', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role
                }));
                location.hash = '#dashboard';
            } else {
                alert('Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Erreur de connexion. Vérifiez que l\'API est démarrée.');
        }
    },

    logout() {
        if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
            localStorage.removeItem('sc360_auth');
            location.hash = '#login';
        }
    },

    setupLogout() {
        const logoutLinks = document.querySelectorAll('.text-danger');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    },

    initDashboard() {
        // Init ApexCharts if library loaded
        if (typeof ApexCharts !== 'undefined') {
            // this.renderChart(); // Removed chart from dash
        }
        // Listen for live updates (Used for Favorites status in future)
        window.addEventListener('campus-update', (e) => {
             // ... logic to update live availability pills if needed ...
        });
    },

    initAdmin() {
        if (typeof ApexCharts !== 'undefined' && document.querySelector("#admin-chart-usage")) {
            const options = {
                series: [{
                    name: 'Fréquentation',
                    data: [120, 450, 4800, 3200, 1500, 800, 200]
                }, {
                    name: 'Réservations',
                    data: [5, 25, 80, 120, 60, 30, 10]
                }],
                chart: {
                    type: 'area',
                    height: 350,
                    fontFamily: 'Outfit, sans-serif',
                    toolbar: { show: false },
                    animations: { enabled: true }
                },
                colors: ['#0d6efd', '#ffc107'],
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3 },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.4,
                        opacityTo: 0.1,
                        stops: [0, 90, 100]
                    }
                },
                xaxis: {
                    categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                    tooltip: { enabled: false }
                },
                grid: {
                    borderColor: '#f1f5f9',
                    strokeDashArray: 4,
                }
            };
            const chart = new ApexCharts(document.querySelector("#admin-chart-usage"), options);
            chart.render();
        }
    },

    cancelBooking(id) {
        if(confirm("Confirmer l'annulation de cette réservation ?")) {
            const el = document.getElementById(id);
            if(el) {
                el.style.opacity = '0';
                setTimeout(() => el.remove(), 500);
                SmartCampus.showToast('info', 'Réservation annulée.');
            }
        }
    },

    modifyBooking(id) {
        SmartCampus.showToast('success', 'Redirection vers l\'éditeur...');
        setTimeout(() => location.hash = '#booking', 500);
    },

    initMap() {
        if (typeof renderMap === 'function') {
            setTimeout(renderMap, 100); 
        }
    },

    async initBooking() {
        // Range slider value update
        const capInput = document.getElementById('filter-capacity');
        const capDisplay = document.getElementById('cap-val');
        if(capInput && capDisplay) {
            capInput.addEventListener('input', (e) => capDisplay.innerText = e.target.value);
            capInput.addEventListener('change', () => this.refreshBookingResults()); // Trigger search on release
        }
        
        // Other filters trigger search
        const triggers = ['search-input', 'filter-free-only', 'type-class', 'type-lab', 'type-hall', 'eq-pc'];
        triggers.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener(el.type === 'text' ? 'input' : 'change', () => {
                // Debounce simple text input
                if(el.type === 'text') {
                    clearTimeout(window.searchDebounce);
                    window.searchDebounce = setTimeout(() => this.refreshBookingResults(), 300);
                } else {
                    this.refreshBookingResults();
                }
            });
        });

        // Initial Search with real data from DB
        await this.refreshBookingResults(); 
    },

    async refreshBookingResults() {
        const grid = document.getElementById('booking-results-grid');
        const countBadge = document.getElementById('result-count');
        
        if(!grid) return;

        // Get Filter Values
        const query = document.getElementById('search-input')?.value.toLowerCase() || '';
        const freeOnly = document.getElementById('filter-free-only')?.checked || false;
        const minCap = parseInt(document.getElementById('filter-capacity')?.value || 0);
        const hasPc = document.getElementById('eq-pc')?.checked || false;
        
        const types = [];
        if(document.getElementById('type-class')?.checked) types.push('cours');
        if(document.getElementById('type-lab')?.checked) types.push('labo');
        if(document.getElementById('type-hall')?.checked) types.push('reunion');

        // Get rooms from API
        const allRooms = await API.getRooms();
        
        const filtered = allRooms.filter(r => {
            // Filter by type
            const matchesType = types.length === 0 || types.includes(r.room_type);
            
            // Filter by search query
            const matchesQuery = !query || 
                r.name.toLowerCase().includes(query) || 
                r.id.toLowerCase().includes(query);
            
            // Filter by capacity
            const matchesCap = r.capacity >= minCap;
            
            // Filter by availability
            const isFree = !freeOnly || (r.occupancy / r.capacity < 0.5);
            
            // Filter by PC equipment
            const matchesPc = !hasPc || r.nb_pc > 0;

            return matchesType && matchesQuery && matchesCap && isFree && matchesPc;
        });

        // Render
        if(countBadge) countBadge.innerText = `${filtered.length} Espaces trouvés`;
        
        if(filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted opacity-25"></i>
                    <p class="text-muted mt-3">Aucun espace ne correspond à vos critères.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(r => {
            const ratio = r.occupancy / (r.capacity || 1);
            let statusBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Libre</span>';
            if(ratio > 0.8) statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-x-circle me-1"></i>Saturé</span>';
            else if(ratio > 0.5) statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="bi bi-exclamation-circle me-1"></i>Occupé</span>';

            const typeNames = {
                'cours': 'Salle de cours',
                'labo': 'Laboratoire',
                'reunion': 'Réunion',
                'box': 'Box'
            };

            return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm hover-lift">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-3">
                            ${statusBadge}
                            <small class="text-muted fw-bold">${typeNames[r.room_type] || r.room_type}</small>
                        </div>
                        <h5 class="fw-bold mb-1">${r.name}</h5>
                        <p class="text-muted small mb-1">${r.id}</p>
                        <p class="text-muted small mb-3">${r.temperature}°C • ${r.occupancy}/${r.capacity} pers.</p>
                        
                        <div class="d-flex gap-2 mb-4">
                            <span class="badge bg-light text-dark border"><i class="bi bi-people me-1"></i>${r.capacity}</span>
                            ${r.nb_pc > 0 ? `<span class="badge bg-light text-dark border"><i class="bi bi-pc-display me-1"></i>${r.nb_pc} PC</span>` : ''}
                            <span class="badge bg-light text-dark border"><i class="bi bi-wifi"></i></span>
                        </div>

                        <button class="btn btn-outline-primary w-100 btn-sm" onclick="UIUpdater.showBookingModal('${r.id}', '${r.name}')">Réserver</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    async initMaintenance() {
        // Load rooms for the ticket form dropdown
        try {
            const rooms = await API.getRooms();
            const roomSelect = document.querySelector('#new-ticket select[name="location"]');
            
            if (roomSelect && rooms.length > 0) {
                // Keep the placeholder and "Autre" option, add real rooms
                const options = '<option value="">Sélectionner une salle...</option>' +
                    rooms.map(r => `<option value="${r.id}">${r.name} (${r.id})</option>`).join('') +
                    '<option value="other">Autre / Couloir</option>';
                roomSelect.innerHTML = options;
            }
        } catch (error) {
            console.error('Erreur chargement des salles:', error);
        }
    },
    
    initSettings() {
        // Tick Rate
        const slider = document.getElementById('sim-tick');
        const display = document.getElementById('sim-tick-val');
        if(slider && display) {
            slider.addEventListener('input', (e) => {
                const val = e.target.value;
                display.innerText = `${val}ms`;
                if(SmartCampus && SmartCampus.CONFIG) {
                    SmartCampus.CONFIG.tickRate = parseInt(val);
                }
            });
        }
    },


    renderChart() {
        const options = {
            series: [{ name: 'Consommation', data: [310, 420, 380, 500, 450, 480, 410] }],
            chart: { type: 'area', height: 350, toolbar: { show: false } },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'] },
            colors: ['#3b82f6'],
            fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 90, 100] } }
        };
        const chart = new ApexCharts(document.querySelector("#chart-consumption"), options);
        chart.render();
    }
};

// Start Router when DOM ready
document.addEventListener('DOMContentLoaded', () => Router.init());

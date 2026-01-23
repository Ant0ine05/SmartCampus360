const Templates = {
    'login': `
<div class="card p-5 shadow-lg border-0" style="width: 400px; background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); color: white; border-radius: 20px;">
    <div class="text-center mb-5">
        <div class="rounded-circle bg-primary bg-gradient d-inline-flex align-items-center justify-content-center mb-3 shadow" style="width: 80px; height: 80px;">
            <i class="bi bi-buildings-fill fs-1 text-white"></i>
        </div>
        <h3 class="fw-bold mb-1">SmartCampus 360</h3>
        <p class="text-secondary small">Veuillez vous identifier</p>
    </div>

    <form onsubmit="Router.login(event)">
        <div class="mb-4">
            <label class="form-label text-secondary small text-uppercase fw-bold ls-1">Email</label>
            <div class="input-group">
                <span class="input-group-text bg-dark border-secondary text-secondary"><i class="bi bi-envelope"></i></span>
                <input type="email" class="form-control bg-dark border-secondary text-white" placeholder="email@campus.fr" required>
            </div>
        </div>
        <div class="mb-5">
            <label class="form-label text-secondary small text-uppercase fw-bold ls-1">Mot de passe</label>
            <div class="input-group">
                <span class="input-group-text bg-dark border-secondary text-secondary"><i class="bi bi-lock"></i></span>
                <input type="password" class="form-control bg-dark border-secondary text-white" placeholder="••••••••" required>
            </div>
        </div>
        <div class="d-grid">
            <button type="submit" class="btn btn-primary btn-lg shadow-sm font-weight-bold">Connexion</button>
        </div>
    </form>
    
    <div class="text-center mt-4">
        <small class="text-muted">Accès réservé au personnel autorisé</small>
        <br>
        <small class="text-muted opacity-50 mt-2 d-block">Test: marie.dubois@campus.fr / password123</small>
    </div>
</div>
    `,
    'dashboard': `
<div class="row g-4 mb-4">
    <!-- Welcome Header -->
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center bg-white p-4 rounded shadow-sm border-0 card-custom shimmer-effect">
            <div>
                <h4 class="fw-bold text-dark mb-1" id="dashboard-greeting">Bonjour 👋</h4>
                <p class="text-muted mb-0">Voici le résumé de votre activité sur le campus aujourd'hui.</p>
            </div>
            <div class="d-flex gap-3">
                 <div class="text-end">
                    <h6 class="fw-bold mb-0 text-primary" id="dashboard-time">--:--</h6>
                    <small class="text-muted" id="dashboard-date">-- --</small>
                 </div>
                 <button class="btn btn-primary shadow-sm" onclick="location.hash='#booking'"><i class="bi bi-plus-lg me-2"></i>Nouvelle Réservation</button>
            </div>
        </div>
    </div>

    <!-- COLUMN 1: My Reservations -->
    <div class="col-lg-6">
        <div class="card-custom p-4 h-100 border-0 shadow-sm bg-white">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-0" id="dashboard-bookings-title"><i class="bi bi-calendar-check me-2"></i>Mes Réservations</h6>
                <span class="badge bg-light text-dark border">0 à venir</span>
            </div>
            
            <div class="d-flex flex-column gap-3">
                <!-- Les réservations seront chargées dynamiquement par UIUpdater -->
                <div class="text-center py-5 text-muted">
                    <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
                    <p class="small">Chargement des réservations...</p>
                </div>
            </div>
             <button class="btn btn-link text-decoration-none text-center mt-3 w-100 text-muted small">Voir calendrier complet</button>
        </div>
    </div>

    <!-- COLUMN 2: Tickets & Requests -->
    <div class="col-lg-6">
        <div class="d-flex flex-column gap-4 h-100">
            <!-- Active Ticket -->
            <div class="card-custom p-4 border-0 shadow-sm bg-white position-relative overflow-hidden flex-fill">
                <!-- Background Decor Icon -->
                <div class="position-absolute top-0 end-0 p-3 text-warning opacity-25" style="font-size: 6rem; z-index: 0; transform: rotate(15deg) translate(10px, -10px); pointer-events: none;">
                    <i class="bi bi-life-preserver"></i>
                </div>
                
                <div class="position-relative" style="z-index: 1;">
                    <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-3" id="dashboard-tickets-title"><i class="bi bi-ticket-perforated me-2"></i>Tickets Actifs</h6>
                    
                    <div id="dashboard-tickets">
                        <!-- Les tickets seront chargés dynamiquement -->
                        <div class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
                            <p class="small">Chargement des tickets...</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="card-custom p-4 border-0 shadow-sm bg-white flex-fill">
                <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-3"><i class="bi bi-graph-up me-2"></i>Statistiques Campus</h6>
                
                <div class="row g-3">
                    <div class="col-6">
                        <div class="p-3 bg-light rounded text-center">
                            <h4 class="fw-bold mb-0" id="stat-rooms">0</h4>
                            <small class="text-muted">Salles</small>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 bg-light rounded text-center">
                            <h4 class="fw-bold mb-0" id="stat-bookings">0</h4>
                            <small class="text-muted">Réservations</small>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="p-3 rounded text-center position-relative overflow-hidden" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <div class="d-flex justify-content-between align-items-center text-white">
                                <div class="text-start">
                                    <small class="d-block opacity-75 mb-1">Consommation Campus</small>
                                    <h2 class="fw-bold mb-0" id="dashboard-energy-value">482</h2>
                                </div>
                                <div class="text-end">
                                    <span class="fs-4 fw-bold">kW/h</span>
                                    <div class="small opacity-75" id="dashboard-energy-trend">
                                        <i class="bi bi-arrow-up"></i> En direct
                                    </div>
                                </div>
                            </div>
                            <div id="dashboard-energy-chart" class="mt-2" style="height: 40px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- ROW 2: Quick Availability -->
    <div class="col-12">
         <div class="card-custom p-4 border-0 shadow-sm bg-white">
            <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-3"><i class="bi bi-lightning-charge me-2"></i>Disponibilités (Live)</h6>
            <div class="row g-3" id="quick-availability">
                <!-- Les salles seront chargées dynamiquement -->
                <div class="col-12 text-center py-3 text-muted">
                    <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
                    <p class="small">Chargement des disponibilités...</p>
                </div>
            </div>
         </div>
    </div>
</div>
    `,
    'map': `
<div class="position-relative h-100 w-100 overflow-hidden rounded-4 shadow-sm border border-secondary bg-dark custom-map-wrapper" style="min-height: 80vh;">
    <!-- Map Canvas (Z-0) -->
    <div id="campus-map" class="w-100 h-100 position-absolute top-0 start-0 d-flex justify-content-center align-items-center bg-dark" style="z-index: 0;">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="ms-3 text-secondary">Chargement du Digital Twin...</p>
    </div>

    <!-- Top Bar (Z-10) -->
    <div class="position-absolute top-0 start-0 w-100 p-4 d-flex justify-content-between align-items-start pointer-none" style="z-index: 10;">
        <!-- Location Selector -->
        <div class="card bg-dark border border-secondary shadow-lg p-1 ps-2 pe-3 pointer-auto d-flex flex-row align-items-center gap-3 rounded-pill text-white">
            <div class="icon-circle sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;"><i class="bi bi-geo-alt-fill"></i></div>
            <div class="lh-sm">
                <span class="d-block text-secondary small text-uppercase fw-bold" style="font-size: 0.65rem;">Localisation Actuelle</span>
                <select class="form-select form-select-sm border-0 p-0 fw-bold text-white bg-transparent shadow-none" style="cursor: pointer;">
                     <option class="text-dark">Campus Paris-Saclay • RDC</option>
                     <option class="text-dark">Campus Paris-Saclay • Etage 1</option>
                </select>
            </div>
        </div>

        <!-- View Modes (Segmented Control) -->
        <div class="bg-dark border border-secondary rounded-pill shadow-lg p-1 pointer-auto d-flex" id="map-mode-selector">
             <input type="radio" class="btn-check" name="mapmode" id="mode-occ" autocomplete="off" checked onchange="updateMapMode('occupancy')">
             <label class="btn btn-sm rounded-pill btn-outline-primary border-0 fw-bold px-3 transition-all" for="mode-occ"><i class="bi bi-people-fill me-2"></i>Occupation</label>
             
             <input type="radio" class="btn-check map-admin-only" name="mapmode" id="mode-nrg" autocomplete="off" onchange="updateMapMode('thermal')">
             <label class="btn btn-sm rounded-pill btn-outline-warning border-0 fw-bold px-3 transition-all map-admin-only" for="mode-nrg"><i class="bi bi-thermometer-half me-2"></i>Température</label>
             
             <input type="radio" class="btn-check map-admin-only" name="mapmode" id="mode-tech" autocomplete="off" onchange="updateMapMode('tech')">
             <label class="btn btn-sm rounded-pill btn-outline-white text-light border-0 fw-bold px-3 transition-all map-admin-only" for="mode-tech"><i class="bi bi-router-fill me-2"></i>Tech</label>
        </div>
    </div>

    <!-- Bottom Controls & Legend (Z-10) -->
    <div class="position-absolute bottom-0 start-0 w-100 p-4 d-flex justify-content-between align-items-end pointer-none" style="z-index: 10;">
        <!-- Legend -->
        <div class="card bg-dark border border-secondary shadow-lg p-3 pointer-auto text-white" style="min-width: 280px; border-radius: 12px;">
             <small class="text-uppercase text-secondary fw-bold ls-1 mb-2 d-block" style="font-size: 0.7rem;" id="legend-title">Légende - Occupation</small>
             <div id="legend-content" class="d-flex flex-column gap-2 text-small">
                  <!-- Contenu dynamique injecté par JavaScript -->
             </div>
        </div>

        <!-- Zoom/Reset Tools -->
        <div class="d-flex flex-column gap-2 pointer-auto">
            <button class="btn btn-dark border border-secondary shadow-lg rounded-circle p-2 d-flex align-items-center justify-content-center hover-scale" style="width:40px;height:40px;" onclick="resetZoom()" title="Recentrer"><i class="bi bi-crosshair text-white"></i></button>
            <button class="btn btn-dark border border-secondary shadow-lg rounded-circle p-2 d-flex align-items-center justify-content-center hover-scale" style="width:40px;height:40px;" onclick="zoomMap(0.1)" title="Zoom +"><i class="bi bi-plus-lg text-white"></i></button>
            <button class="btn btn-dark border border-secondary shadow-lg rounded-circle p-2 d-flex align-items-center justify-content-center hover-scale" style="width:40px;height:40px;" onclick="zoomMap(-0.1)" title="Zoom -"><i class="bi bi-dash-lg text-white"></i></button>
        </div>
    </div>
</div>

<!-- Enhanced Offcanvas Room Details -->
<div class="offcanvas offcanvas-end shadow-lg border-0 rounded-start-4 m-3" style="height: calc(100% - 2rem);" tabindex="-1" id="roomOffcanvas" aria-labelledby="roomOffcanvasLabel">
  <div class="offcanvas-header pt-4 px-4 sticky-top bg-white z-index-10">
    <div>
        <span class="badge bg-primary-subtle text-primary mb-2 rounded-pill px-3" id="detail-room-type">Salle de Cours</span>
        <h3 class="offcanvas-title fw-bold" id="detail-room-id">B201</h3>
    </div>
    <button type="button" class="btn-close text-reset bg-light rounded-circle p-2" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  
  <div class="offcanvas-body px-4 pb-4 custom-scrollbar">
    <!-- Quick Status -->
    <div class="card bg-success-subtle border-0 mb-4" id="detail-room-status-card">
        <div class="card-body d-flex align-items-center">
             <div class="rounded-circle bg-success text-white p-2 me-3" id="detail-room-status-icon"><i class="bi bi-check-lg"></i></div>
             <div>
                 <h6 class="fw-bold text-success-emphasis mb-0" id="detail-room-status-text">Actuellement Libre</h6>
                 <small class="text-success-emphasis opacity-75" id="detail-room-schedule">Jusqu'à 14:00</small>
             </div>
        </div>
    </div>

    <!-- Key Metrics -->
    <div class="row g-2 mb-4">
        <div class="col-6">
            <div class="p-3 bg-light rounded text-center h-100">
                <i class="bi bi-people fs-4 text-primary mb-2 d-block"></i>
                <span class="d-block fw-bold display-6" id="detail-room-occ" style="font-size: 1.5rem;">0</span>
                <span class="text-muted small">Personnes</span>
            </div>
        </div>
        <div class="col-6">
            <div class="p-3 bg-light rounded text-center h-100">
                <i class="bi bi-thermometer-half fs-4 text-danger mb-2 d-block"></i>
                <span class="d-block fw-bold display-6" id="detail-room-temp" style="font-size: 1.5rem;">21°</span>
                <span class="text-muted small">Température</span>
            </div>
        </div>
    </div>

    <!-- Next Event -->
    <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-3">Agenda</h6>
    <div class="card border border-start-0 border-end-0 border-top-0 border-bottom-1 rounded-0 mb-0 shadow-none">
        <div class="card-body px-0 py-3 d-flex gap-3">
             <div class="text-center" style="min-width: 50px;">
                 <span class="d-block fw-bold">14:00</span>
                 <span class="small text-muted">16:00</span>
             </div>
             <div class="vr"></div>
             <div>
                 <h6 class="fw-bold mb-1">Algorithmique Avancée</h6>
                 <div class="d-flex align-items-center gap-2">
                     <span class="badge bg-light text-dark border">Gr. A2</span>
                     <small class="text-muted">Pr. Turing</small>
                 </div>
             </div>
        </div>
    </div>
    
    <!-- Equipment -->
    <h6 class="fw-bold text-uppercase text-muted small ls-1 my-3">Équipements</h6>
    <div class="d-flex flex-wrap gap-2 mb-4">
        <span class="badge bg-light text-secondary border py-2 px-3 fw-normal"><i class="bi bi-wifi me-2"></i>Wifi 6E</span>
        <span class="badge bg-light text-secondary border py-2 px-3 fw-normal"><i class="bi bi-projector me-2"></i>Projecteur 4K</span>
        <span class="badge bg-light text-secondary border py-2 px-3 fw-normal"><i class="bi bi-outlet me-2"></i>Prises</span>
    </div>

    <!-- Actions -->
    <div class="d-grid gap-2">
        <button class="btn btn-primary py-2 shadow-sm"><i class="bi bi-calendar-plus me-2"></i>Réserver ce créneau</button>
        <button class="btn btn-outline-danger py-2" onclick="location.hash='#maintenance'"><i class="bi bi-exclamation-triangle me-2"></i>Signaler un problème</button>
    </div>
  </div>
</div>
    `,
    'booking': `
<div class="row g-4 h-100">
    <!-- Filters Sidebar -->
    <div class="col-md-4 col-lg-3">
        <!-- Mes Réservations -->
        <div class="card-custom p-4 border-0 shadow-sm bg-white mb-3">
            <h6 class="fw-bold text-uppercase text-muted small mb-3"><i class="bi bi-calendar-check me-2"></i>Mes Réservations</h6>
            <div id="my-bookings-list">
                <div class="text-center py-3 text-muted">
                    <div class="spinner-border spinner-border-sm mb-2" role="status"></div>
                    <p class="small">Chargement...</p>
                </div>
            </div>
        </div>

        <!-- Filtres -->
        <div class="card-custom p-4 border-0 shadow-sm h-100 bg-white">
            <h6 class="fw-bold text-uppercase text-muted small mb-4"><i class="bi bi-sliders me-2"></i>Filtres</h6>
            
            <!-- Search -->
            <div class="mb-4">
                <label class="form-label small fw-bold">Recherche</label>
                <div class="input-group">
                    <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control bg-light border-0" id="search-input" placeholder="Nom, mot-clé...">
                </div>
            </div>

            <!-- Availability -->
            <div class="mb-4">
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="filter-free-only">
                    <label class="form-check-label small fw-bold" for="filter-free-only">Disponibles uniquement</label>
                </div>
            </div>

            <!-- Type -->
            <div class="mb-4">
                <label class="form-label small fw-bold">Type d'espace</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Classroom" id="type-class">
                    <label class="form-check-label small" for="type-class">Salles de Cours</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Lab" id="type-lab">
                    <label class="form-check-label small" for="type-lab">Laboratoires</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="Hall" id="type-hall">
                    <label class="form-check-label small" for="type-hall">Espaces Communs</label>
                </div>
            </div>

            <!-- Equipment -->
            <div class="mb-4">
                <label class="form-label small fw-bold">Équipements</label>
                <div class="d-flex flex-wrap gap-2">
                    <input type="checkbox" class="btn-check" id="eq-pc" autocomplete="off">
                    <label class="btn btn-sm btn-outline-secondary rounded-pill" for="eq-pc"><i class="bi bi-pc-display me-1"></i>PC</label>

                    <input type="checkbox" class="btn-check" id="eq-proj" autocomplete="off">
                    <label class="btn btn-sm btn-outline-secondary rounded-pill" for="eq-proj"><i class="bi bi-projector me-1"></i>Visio</label>

                    <input type="checkbox" class="btn-check" id="eq-board" autocomplete="off">
                    <label class="btn btn-sm btn-outline-secondary rounded-pill" for="eq-board"><i class="bi bi-easel me-1"></i>Tableau</label>
                </div>
            </div>

            <!-- Capacity -->
            <div class="mb-3">
                <label class="form-label small fw-bold">Capacité Min: <span id="cap-val" class="text-primary">1</span></label>
                <input type="range" class="form-range" min="1" max="200" step="5" value="1" id="filter-capacity">
            </div>

             <button class="btn btn-primary w-100 shadow-sm mt-3" onclick="Router.refreshBookingResults()"><i class="bi bi-arrow-repeat me-2"></i>Actualiser</button>
        </div>
    </div>

    <!-- Results & Recos -->
    <div class="col-md-8 col-lg-9">
        <div class="d-flex flex-column h-100 gap-4 overflow-auto pb-5 custom-scrollbar">
            
            <!-- Recommendations section removed - using only real data from DB -->

            <!-- Results Grid -->
            <div>
                 <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="fw-bold text-muted small text-uppercase m-0">Résultats de recherche</h6>
                    <span class="badge bg-light text-dark border" id="result-count">0 Salles trouvées</span>
                 </div>
                 
                 <div id="booking-results-grid" class="row g-3">
                    <!-- Cards injected by JS -->
                    <div class="col-12 text-center py-5 text-muted">
                        <div class="spinner-border text-primary mb-3" role="status"></div>
                        <p>Recherche des meilleurs espaces...</p>
                    </div>
                 </div>
            </div>

        </div>
    </div>
</div>
    `,
    'maintenance': `
<div class="card-custom p-0 border-0 shadow-sm overflow-hidden h-100">
    <!-- Header Tabs -->
    <div class="card-header bg-white border-bottom p-0">
        <ul class="nav nav-tabs nav-fill card-header-tabs m-0" id="maintenanceTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active py-3 fw-bold rounded-0 border-0 border-bottom-primary" id="active-tab" data-bs-toggle="tab" data-bs-target="#active-tickets" type="button" role="tab"><i class="bi bi-activity me-2"></i>Tickets en Cours</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link py-3 fw-bold rounded-0 border-0" id="new-tab" data-bs-toggle="tab" data-bs-target="#new-ticket" type="button" role="tab"><i class="bi bi-plus-circle-fill me-2"></i>Nouveau Ticket</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link py-3 fw-bold rounded-0 border-0" id="history-tab" data-bs-toggle="tab" data-bs-target="#history-tickets" type="button" role="tab"><i class="bi bi-archive-fill me-2"></i>Historique</button>
            </li>
        </ul>
    </div>

    <div class="card-body p-4 bg-light">
        <div class="tab-content" id="maintenanceTabContent">
            
            <!-- Tab 1: Active Tickets -->
            <div class="tab-pane fade show active" id="active-tickets" role="tabpanel">
                <!-- Les tickets sont chargés dynamiquement depuis l'API -->
                <div class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <p class="text-muted">Chargement des tickets...</p>
                </div>
            </div>

            <!-- Tab 2: New Ticket Form -->
            <div class="tab-pane fade" id="new-ticket" role="tabpanel">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <form class="bg-white p-4 rounded shadow-sm" onsubmit="event.preventDefault(); SmartCampus.triggerTicketSubmit(this);">
                            <h6 class="fw-bold text-uppercase text-muted mb-4">Signalement d'Incident</h6>
                            
                            <div class="row g-3 mb-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small">Priorité</label>
                                    <select class="form-select bg-light border-0" name="priority">
                                        <option value="moyen">Normale</option>
                                        <option value="urgent">Urgent</option>
                                        <option value="bas">Basse</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold small">Lieu / Salle</label>
                                    <select class="form-select bg-light border-0" name="location">
                                        <option value="">Chargement des salles...</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold small">Sujet</label>
                                <input type="text" class="form-control bg-light border-0" name="title" placeholder="Ex: Écran bleu sur PC Professeur" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold small">Description détaillée</label>
                                <textarea class="form-control bg-light border-0" rows="4" name="description" placeholder="Décrivez le problème..." required></textarea>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold small">Pièce jointe (Photo/Document)</label>
                                <input type="file" class="form-control">
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary shadow-sm"><i class="bi bi-send-fill me-2"></i>Envoyer le ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Tab 3: History -->
            <div class="tab-pane fade" id="history-tickets" role="tabpanel">
                <!-- L'historique sera chargé dynamiquement -->
                <div class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status"></div>
                    <p class="text-muted">Chargement de l'historique...</p>
                </div>
            </div>

        </div>
    </div>
</div>
    `,
    'settings': `
<div class="row g-4 justify-content-center">
    <!-- Profile Sidebar -->
    <div class="col-md-4">
        <div class="card-custom p-4 border-0 shadow-sm mb-4 text-center">
            <div class="avatar-circle bg-primary text-white mx-auto mb-3" id="settings-avatar" style="width: 100px; height: 100px; font-size: 2.5rem;">AD</div>
            <h5 class="fw-bold mb-1" id="settings-name">Admin Campus</h5>
            <span class="badge bg-primary-subtle text-primary rounded-pill mb-3" id="settings-role-badge">Personnel Administratif</span>
            
            <div class="text-start mt-4">
                <small class="text-muted text-uppercase fw-bold ls-1 d-block mb-3">Droits d'accès</small>
                <ul class="list-unstyled small text-secondary" id="settings-rights-list">
                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Administration Système</li>
                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Gestion Incidents (Full)</li>
                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Accès Salles (Master)</li>
                    <li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>Configuration IoT</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Main Settings Area -->
    <div class="col-md-8">
        <!-- Account Info -->
        <div class="card-custom p-4 border-0 shadow-sm mb-4">
            <h5 class="fw-bold mb-4 border-bottom pb-2"><i class="bi bi-person-gear me-2"></i>Informations Personnelles</h5>
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Adresse Email</label>
                    <input type="email" class="form-control" id="settings-email" value="..." disabled>
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted">Rôle</label>
                    <input type="text" class="form-control" id="settings-role-input" value="..." disabled>
                </div>
            </div>
            
            <div class="mt-4">
                <h6 class="fw-bold fs-7 text-uppercase text-muted mb-3">Sécurité</h6>
                <button class="btn btn-outline-secondary btn-sm me-2"><i class="bi bi-key me-2"></i>Changer Mot de passe</button>
                <button class="btn btn-outline-secondary btn-sm"><i class="bi bi-shield-lock me-2"></i>Double Authentification</button>
            </div>
        </div>

        <!-- Notifications -->
        <div class="card-custom p-4 border-0 shadow-sm mb-4">
            <h5 class="fw-bold mb-4 border-bottom pb-2"><i class="bi bi-bell me-2"></i>Préférences de Notification</h5>
            
            <div class="mb-3">
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="notif-resa" checked>
                    <label class="form-check-label" for="notif-resa">Confirmations de réservation</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="notif-cancel" checked>
                    <label class="form-check-label" for="notif-cancel">Alertes Annulation</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="notif-ticket">
                    <label class="form-check-label" for="notif-ticket">Mises à jour Tickets Maintenance</label>
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="notif-sys" checked>
                    <label class="form-check-label" for="notif-sys">Alertes Système Critiques (Email)</label>
                </div>
            </div>
        </div>

        <!-- Simulation Config (Kept as it is useful for demo) -->
        <div class="card-custom p-4 border-0 shadow-sm mb-4 bg-light">
            <h5 class="fw-bold mb-4 border-bottom pb-2 text-muted">Dev Tools / Simulation</h5>
            <div class="mb-3">
                <label for="sim-tick" class="form-label fw-bold small text-uppercase">Vitesse Simulation</label>
                <div class="d-flex align-items-center gap-3">
                    <input type="range" class="form-range" min="1000" max="10000" step="500" value="3000" id="sim-tick">
                    <span class="badge bg-primary" id="sim-tick-val">3000ms</span>
                </div>
            </div>
            <div class="d-flex justify-content-end">
                <button class="btn btn-success text-white" onclick="SmartCampus.showToast('success', 'Profil mis à jour !')"><i class="bi bi-save me-2"></i>Enregistrer les modifications</button>
            </div>
        </div>
    </div>
</div>
    `,
    'history': `
<div class="card-custom p-4 border-0 shadow-sm">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="fw-bold m-0"><i class="bi bi-clock-history me-2"></i>Historique Complet des Évènements</h5>
        <button class="btn btn-outline-secondary btn-sm" onclick="history.back()"><i class="bi bi-arrow-left me-2"></i>Retour</button>
    </div>

    <div class="table-responsive">
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th scope="col" class="border-0 rounded-start">Horodatage</th>
                    <th scope="col" class="border-0">Type</th>
                    <th scope="col" class="border-0">Description</th>
                    <th scope="col" class="border-0">Lieu</th>
                    <th scope="col" class="border-0">Statut</th>
                    <th scope="col" class="border-0 rounded-end">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="text-muted font-monospace">18 Jan 14:32</span></td>
                    <td><span class="badge bg-warning-subtle text-warning"><i class="bi bi-thermometer-high"></i> Temp</span></td>
                    <td>Surchauffe détectée > 25°C</td>
                    <td><strong>Amphi A</strong></td>
                    <td><span class="badge bg-success rounded-pill">Résolu</span></td>
                    <td><button class="btn btn-sm btn-light border">Détails</button></td>
                </tr>
                <tr>
                    <td><span class="text-muted font-monospace">18 Jan 13:15</span></td>
                    <td><span class="badge bg-primary-subtle text-primary"><i class="bi bi-people-fill"></i> Occu</span></td>
                    <td>Capacité max atteinte</td>
                    <td><strong>Cafétéria</strong></td>
                    <td><span class="badge bg-secondary rounded-pill">Archivé</span></td>
                    <td><button class="btn btn-sm btn-light border">Détails</button></td>
                </tr>
                 <tr>
                    <td><span class="text-muted font-monospace">18 Jan 09:45</span></td>
                    <td><span class="badge bg-danger-subtle text-danger"><i class="bi bi-lightning-fill"></i> Élec</span></td>
                    <td>Coupure secteur localisée</td>
                    <td><strong>Labo Physique</strong></td>
                    <td><span class="badge bg-success rounded-pill">Résolu</span></td>
                    <td><button class="btn btn-sm btn-light border">Détails</button></td>
                </tr>
                <tr>
                    <td><span class="text-muted font-monospace">17 Jan 20:00</span></td>
                    <td><span class="badge bg-info-subtle text-info"><i class="bi bi-gear"></i> Sys</span></td>
                    <td>Mise à jour firmware capteurs</td>
                    <td><strong>Global</strong></td>
                    <td><span class="badge bg-success rounded-pill">Succès</span></td>
                    <td><button class="btn btn-sm btn-light border">Détails</button></td>
                </tr>
                <tr>
                    <td><span class="text-muted font-monospace">17 Jan 18:30</span></td>
                    <td><span class="badge bg-secondary-subtle text-secondary"><i class="bi bi-door-open"></i> Accès</span></td>
                    <td>Porte forcée après heures</td>
                    <td><strong>Zone Admin</strong></td>
                    <td><span class="badge bg-warning text-dark rounded-pill">Enquête</span></td>
                    <td><button class="btn btn-sm btn-light border">Rapport</button></td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <nav aria-label="Page navigation" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item disabled"><a class="page-link" href="#">Précédent</a></li>
        <li class="page-item active"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">Suivant</a></li>
      </ul>
    </nav>
</div>
    `,
    'admin': `
<div class="row g-4 mb-4">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="fw-bold mb-0 text-dark">Supervision Campus</h3>
            <button class="btn btn-outline-primary btn-sm"><i class="bi bi-download me-2"></i>Export Rapport</button>
        </div>
    </div>

    <!-- KPI Cards -->
    <div class="col-md-3">
        <div class="card-custom p-3 bg-white border-0 shadow-sm h-100 d-flex flex-row align-items-center justify-content-between">
            <div>
                 <h6 class="text-muted text-uppercase small fw-bold ls-1 mb-1">Occupation Globale</h6>
                 <h2 class="fw-bold text-dark mb-0">78%</h2>
                 <small class="text-success fw-bold"><i class="bi bi-arrow-up-short"></i>+12% vs Hier</small>
            </div>
            <div class="icon-circle bg-primary-subtle text-primary"><i class="bi bi-buildings"></i></div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card-custom p-3 bg-white border-0 shadow-sm h-100 d-flex flex-row align-items-center justify-content-between">
             <div>
                 <h6 class="text-muted text-uppercase small fw-bold ls-1 mb-1">Tickets Ouverts</h6>
                 <h2 class="fw-bold text-dark mb-0">14</h2>
                 <small class="text-danger fw-bold"><i class="bi bi-arrow-up-short"></i>Critique: 2</small>
            </div>
            <div class="icon-circle bg-warning-subtle text-warning"><i class="bi bi-ticket-perforated"></i></div>
        </div>
    </div>
    <div class="col-md-3">
         <div class="card-custom p-3 bg-white border-0 shadow-sm h-100 d-flex flex-row align-items-center justify-content-between">
             <div>
                 <h6 class="text-muted text-uppercase small fw-bold ls-1 mb-1">Demandes Valid.</h6>
                 <h2 class="fw-bold text-dark mb-0">8</h2>
                 <small class="text-muted">En attente</small>
            </div>
            <div class="icon-circle bg-purple-subtle text-purple"><i class="bi bi-check2-circle"></i></div>
        </div>
    </div>
    <div class="col-md-3">
         <div class="card-custom p-3 bg-white border-0 shadow-sm h-100 d-flex flex-row align-items-center justify-content-between">
             <div>
                 <h6 class="text-muted text-uppercase small fw-bold ls-1 mb-1">Conso. Énergie</h6>
                 <h2 class="fw-bold text-dark mb-0">450 <span class="fs-6 text-muted">kWh</span></h2>
                 <small class="text-success fw-bold">-5% vs Moyenne</small>
            </div>
            <div class="icon-circle bg-success-subtle text-success"><i class="bi bi-lightning-charge"></i></div>
        </div>
    </div>

    <!-- Charts & Main Content -->
    <div class="col-lg-8">
        <div class="card-custom p-4 bg-white border-0 shadow-sm h-100">
             <div class="d-flex justify-content-between align-items-center mb-4">
                 <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-0">Fréquentation & Usage</h6>
                 <select class="form-select form-select-sm w-auto border-0 bg-light fw-bold">
                     <option>Cette Semaine</option>
                     <option>Ce Mois</option>
                 </select>
             </div>
             <div id="admin-chart-usage" style="min-height: 300px;"></div>
        </div>
    </div>

    <!-- Side Lists -->
    <div class="col-lg-4">
        <div class="d-flex flex-column gap-4 h-100">
             <!-- Pending Requests -->
             <div class="card-custom p-4 bg-white border-0 shadow-sm flex-fill">
                  <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-3">À Valider (4)</h6>
                  <div class="d-flex flex-column gap-3">
                      <div class="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                          <div class="d-flex align-items-center">
                              <img src="https://ui-avatars.com/api/?name=Alice+D&background=random" class="rounded-circle me-3" style="width:32px;height:32px;">
                              <div class="lh-1">
                                  <span class="d-block fw-bold small text-dark">Alice D.</span>
                                  <small class="text-muted" style="font-size: 0.75rem;">Salle Conf. • 14:00</small>
                              </div>
                          </div>
                          <div class="btn-group">
                              <button class="btn btn-sm btn-white text-success border shadow-sm" title="Valider" onclick="SmartCampus.showToast('success', 'Réservation validée')"><i class="bi bi-check-lg"></i></button>
                              <button class="btn btn-sm btn-white text-danger border shadow-sm" title="Refuser"><i class="bi bi-x-lg"></i></button>
                          </div>
                      </div>
                      <div class="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                          <div class="d-flex align-items-center">
                              <img src="https://ui-avatars.com/api/?name=Bob+M&background=random" class="rounded-circle me-3" style="width:32px;height:32px;">
                              <div class="lh-1">
                                  <span class="d-block fw-bold small text-dark">Bob M.</span>
                                  <small class="text-muted" style="font-size: 0.75rem;">Prêt Projecteur</small>
                              </div>
                          </div>
                          <div class="btn-group">
                              <button class="btn btn-sm btn-white text-success border shadow-sm" title="Valider" onclick="SmartCampus.showToast('success', 'Demande approuvée')"><i class="bi bi-check-lg"></i></button>
                              <button class="btn btn-sm btn-white text-danger border shadow-sm" title="Refuser"><i class="bi bi-x-lg"></i></button>
                          </div>
                      </div>
                  </div>
                  <button class="btn btn-link text-center w-100 mt-2 small text-muted text-decoration-none">Voir tout</button>
             </div>

             <!-- Quick Actions -->
             <div class="card-custom p-4 bg-primary text-white border-0 shadow-sm">
                  <h6 class="fw-bold text-uppercase small ls-1 mb-3 text-white-50">Actions Rapides</h6>
                  <div class="d-grid gap-2">
                       <button class="btn btn-light text-primary fw-bold text-start"><i class="bi bi-megaphone me-2"></i>Diffuser Message</button>
                       <button class="btn btn-outline-light text-start"><i class="bi bi-door-closed me-2"></i>Verrouillage Global</button>
                  </div>
             </div>
        </div>
    </div>
    
    <!-- Recent Activity Table -->
     <div class="col-12">
        <div class="card-custom p-4 bg-white border-0 shadow-sm">
            <h6 class="fw-bold text-uppercase text-muted small ls-1 mb-3">Dernières Activités Supervisées</h6>
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th class="border-0 text-secondary small text-uppercase">Horodatage</th>
                            <th class="border-0 text-secondary small text-uppercase">Utilisateur</th>
                            <th class="border-0 text-secondary small text-uppercase">Action</th>
                            <th class="border-0 text-secondary small text-uppercase">Cible</th>
                            <th class="border-0 text-secondary small text-uppercase">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-muted small">Aujourd'hui, 09:42</td>
                            <td><div class="fw-bold text-dark">Thomas Anderson</div></td>
                            <td>Badge Accès</td>
                            <td>Labo Informatique (L203)</td>
                            <td><span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Autorisé</span></td>
                        </tr>
                        <tr>
                            <td class="text-muted small">Aujourd'hui, 09:15</td>
                            <td><div class="fw-bold text-dark">Bureau Admin</div></td>
                            <td>Changement Température</td>
                            <td>Amphi A (C101)</td>
                            <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">Ajusté 21°C</span></td>
                        </tr>
                         <tr>
                            <td class="text-muted small">Hier, 18:30</td>
                            <td><div class="fw-bold text-dark">Système Auto</div></td>
                            <td>Extinction Lumières</td>
                            <td>Zone Est (Tout)</td>
                            <td><span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill">Auto</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
    `,
};

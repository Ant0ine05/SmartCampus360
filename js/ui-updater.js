/**
 * SmartCampus360 - UI Updater
 * Met à jour dynamiquement l'UI avec les données de la BDD
 */

const UIUpdater = {
    /**
     * Mettre à jour la page de réservation avec les vraies salles
     */
    async updateBookingPage() {
        // Charger les réservations de l'utilisateur
        await this.updateMyBookingsPage();
        
        const grid = document.getElementById('booking-results-grid');
        if (!grid) return;

        try {
            const rooms = await API.getRooms();

            if (rooms.length === 0) {
                grid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="bi bi-inbox fs-1 text-muted opacity-25"></i>
                        <p class="text-muted mt-3">Aucune salle trouvée dans la base de données.</p>
                    </div>
                `;
                return;
            }

            // Mettre à jour le compteur
            const countBadge = document.getElementById('result-count');
            if (countBadge) {
                countBadge.textContent = `${rooms.length} Espaces trouvés`;
            }

            // Afficher les salles
            grid.innerHTML = rooms.map(room => {
                const ratio = room.occupancy / (room.capacity || 1);
                let statusBadge, statusClass;

                if (ratio > 0.8) {
                    statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-x-circle me-1"></i>Saturé</span>';
                    statusClass = 'border-danger';
                } else if (ratio > 0.5) {
                    statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning-subtle"><i class="bi bi-exclamation-circle me-1"></i>Occupé</span>';
                    statusClass = 'border-warning';
                } else {
                    statusBadge = '<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i>Libre</span>';
                    statusClass = 'border-success';
                }

                const typeIcon = this.getRoomTypeIcon(room.room_type);
                const typeName = this.getRoomTypeName(room.room_type);

                return `
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm hover-lift ${statusClass}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                ${statusBadge}
                                <small class="text-muted fw-bold">${typeName}</small>
                            </div>
                            <h5 class="fw-bold mb-1">${room.name}</h5>
                            <p class="text-muted small mb-1">${room.id}</p>
                            <p class="text-muted small mb-3">${room.temperature || 20}°C • ${room.occupancy}/${room.capacity} pers.</p>
                            
                            <div class="d-flex gap-2 mb-4">
                                <span class="badge bg-light text-dark border"><i class="bi bi-people me-1"></i>${room.capacity}</span>
                                ${room.nb_pc > 0 ? `<span class="badge bg-light text-dark border"><i class="bi bi-pc-display me-1"></i>${room.nb_pc} PC</span>` : ''}
                                <span class="badge bg-light text-dark border"><i class="bi bi-wifi"></i></span>
                            </div>

                            <button class="btn btn-outline-primary w-100 btn-sm" onclick="UIUpdater.showBookingModal('${room.id}', '${room.name}')">
                                <i class="bi bi-calendar-plus me-1"></i>Réserver
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur chargement salles:', error);
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                    <p class="text-danger mt-3">Erreur de chargement. Vérifiez que l'API est démarrée.</p>
                </div>
            `;
        }
    },

    /**
     * Afficher les réservations de l'utilisateur dans la page booking
     */
    async updateMyBookingsPage() {
        const container = document.getElementById('my-bookings-list');
        if (!container) return;

        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return;

            const bookings = await API.getBookings();
            const isAdmin = currentUser.role === 'admin';
            
            // Filtrer selon le rôle
            let userBookings = bookings;
            if (!isAdmin) {
                userBookings = bookings.filter(b => b.user_id === currentUser.id);
            }

            if (userBookings.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-3 text-muted">
                        <i class="bi bi-calendar-x fs-4 opacity-25"></i>
                        <p class="small mt-2 mb-0">Aucune réservation</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = userBookings.slice(0, 5).map(booking => {
                const startDate = new Date(booking.start_time);
                const day = startDate.getDate();
                const month = startDate.toLocaleString('fr-FR', { month: 'short' });
                const time = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(booking.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                
                const statusMap = {
                    'confirme': { class: 'success', icon: 'check-circle' },
                    'en_attente': { class: 'warning', icon: 'clock' },
                    'annule': { class: 'danger', icon: 'x-circle' }
                };
                const status = statusMap[booking.status] || statusMap['confirme'];

                return `
                <div class="card border-0 shadow-sm mb-2 hover-scale" style="cursor: pointer;" onclick="UIUpdater.showBookingDetail(${booking.id})">
                    <div class="card-body p-2">
                        <div class="d-flex align-items-center">
                            <div class="date-box bg-primary-subtle text-primary rounded text-center me-2" style="min-width: 40px; padding: 4px;">
                                <small class="d-block fw-bold" style="font-size: 10px;">${month.toUpperCase()}</small>
                                <span class="d-block fw-bold">${day}</span>
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="fw-bold mb-0 small">${booking.room_name || booking.room_id}</h6>
                                <small class="text-muted" style="font-size: 11px;">
                                    <i class="bi bi-clock me-1"></i>${time}-${endTime}
                                </small>
                                ${isAdmin ? `<br><small class="text-muted" style="font-size: 10px;"><i class="bi bi-person me-1"></i>${booking.user_name || 'Inconnu'}</small>` : ''}
                            </div>
                            <i class="bi bi-${status.icon} text-${status.class}"></i>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur chargement réservations:', error);
        }
    },

    /**
     * Afficher le détail d'une réservation dans un modal
     */
    async showBookingDetail(bookingId) {
        try {
            const bookings = await API.getBookings();
            const booking = bookings.find(b => b.id === bookingId);
            if (!booking) return;

            const startDate = new Date(booking.start_time);
            const endDate = new Date(booking.end_time);
            const dateStr = startDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const startTime = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const endTime = endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            const statusMap = {
                'confirme': { class: 'success', label: 'Confirmée' },
                'en_attente': { class: 'warning', label: 'En attente' },
                'annule': { class: 'danger', label: 'Annulée' }
            };
            const status = statusMap[booking.status] || statusMap['confirme'];

            const currentUser = this.getCurrentUser();
            const isAdmin = currentUser && currentUser.role === 'admin';

            const modal = `
                <div class="modal fade" id="bookingDetailModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title"><i class="bi bi-calendar-check me-2"></i>Détail de la réservation</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <span class="badge bg-${status.class}">${status.label}</span>
                                </div>
                                
                                <h6 class="fw-bold mb-3">${booking.room_name || booking.room_id}</h6>
                                
                                <div class="mb-3">
                                    <small class="text-muted d-block"><i class="bi bi-calendar me-2"></i>${dateStr}</small>
                                    <small class="text-muted d-block"><i class="bi bi-clock me-2"></i>${startTime} - ${endTime}</small>
                                    <small class="text-muted d-block"><i class="bi bi-geo-alt me-2"></i>${booking.room_id}</small>
                                </div>

                                ${isAdmin ? `
                                    <div class="alert alert-info">
                                        <i class="bi bi-person me-2"></i>Réservé par: <strong>${booking.user_name || 'Inconnu'}</strong>
                                    </div>
                                ` : ''}
                                
                                <div class="alert alert-light">
                                    <small class="text-muted"><i class="bi bi-info-circle me-2"></i>ID de réservation: #${booking.id}</small>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                                ${booking.status === 'confirme' ? `
                                    <button type="button" class="btn btn-danger" onclick="UIUpdater.cancelBookingFromDetail(${booking.id})">
                                        <i class="bi bi-trash me-1"></i>Annuler
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Supprimer l'ancien modal s'il existe
            const oldModal = document.getElementById('bookingDetailModal');
            if (oldModal) oldModal.remove();

            // Ajouter le nouveau
            document.body.insertAdjacentHTML('beforeend', modal);

            // Afficher
            const modalEl = new bootstrap.Modal(document.getElementById('bookingDetailModal'));
            modalEl.show();
        } catch (error) {
            console.error('Erreur affichage détail réservation:', error);
        }
    },

    /**
     * Annuler une réservation depuis le modal de détail
     */
    async cancelBookingFromDetail(bookingId) {
        const modalEl = bootstrap.Modal.getInstance(document.getElementById('bookingDetailModal'));
        if (modalEl) modalEl.hide();
        
        await this.cancelBooking(bookingId);
        await this.updateMyBookingsPage();
    },

    /**
     * Mettre à jour la page de maintenance avec les vrais tickets
     */
    async updateMaintenancePage() {
        const container = document.getElementById('active-tickets');
        if (!container) return;

        try {
            const allTickets = await API.getTickets();
            const currentUser = this.getCurrentUser();
            const isAdmin = currentUser && currentUser.role === 'admin';

            // Filtrer les tickets actifs
            let activeTickets = allTickets.filter(t => t.status !== 'resolu');
            
            // Si user normal, filtrer uniquement ses tickets
            if (!isAdmin && currentUser) {
                activeTickets = activeTickets.filter(t => t.user_id === currentUser.id);
            }
            // Si admin, afficher tous les tickets actifs

            if (activeTickets.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-check-circle fs-1 text-success"></i>
                        <p class="text-muted mt-3">Aucun ticket en cours !</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `<div class="row g-3">` + activeTickets.map(ticket => {
                const statusMap = {
                    'nouveau': { class: 'danger', label: 'Nouveau' },
                    'en_cours': { class: 'warning', label: 'En cours' },
                    'resolu': { class: 'success', label: 'Résolu' }
                };
                const status = statusMap[ticket.status] || statusMap['nouveau'];

                const priorityMap = {
                    'urgent': '🔴',
                    'moyen': '🟡',
                    'bas': '🟢'
                };
                const priorityIcon = priorityMap[ticket.priority] || '⚪';

                const timeAgo = this.getTimeAgo(new Date(ticket.created_at));

                // Afficher qui a créé le ticket si admin
                const creatorInfo = isAdmin && ticket.firstname ? `
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle sm bg-secondary-subtle text-secondary me-2" style="width:24px;height:24px;font-size:10px;">
                            ${ticket.firstname[0]}${ticket.lastname[0]}
                        </div>
                        <small class="text-muted">Créé par ${ticket.firstname} ${ticket.lastname}</small>
                    </div>
                ` : '<small class="text-muted fst-italic">Mon ticket</small>';

                return `
                <div class="col-md-6">
                    <div class="card p-3 border-0 shadow-sm h-100 hover-lift">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="badge bg-${status.class}-subtle text-${status.class} border border-${status.class}-subtle">${status.label}</span>
                            <small class="text-muted font-monospace">#TK-${ticket.id} ${priorityIcon}</small>
                        </div>
                        <h6 class="fw-bold mb-1">${ticket.title}</h6>
                        <p class="text-muted small mb-3">${ticket.description || 'Pas de description'}</p>
                        <div class="d-flex align-items-center justify-content-between mt-auto">
                            ${creatorInfo}
                            <small class="text-muted"><i class="bi bi-clock me-1"></i>${timeAgo}</small>
                        </div>
                        ${ticket.status === 'nouveau' && isAdmin ? `
                            <button class="btn btn-sm btn-primary mt-3 w-100" onclick="UIUpdater.updateTicket(${ticket.id}, 'en_cours')">
                                <i class="bi bi-play-fill me-1"></i>Prendre en charge
                            </button>
                        ` : ticket.status === 'en_cours' && isAdmin ? `
                            <button class="btn btn-sm btn-success mt-3 w-100" onclick="UIUpdater.updateTicket(${ticket.id}, 'resolu')">
                                <i class="bi bi-check-lg me-1"></i>Marquer comme résolu
                            </button>
                        ` : !isAdmin && ticket.status === 'nouveau' ? `
                            <button class="btn btn-sm btn-warning mt-3 w-100" onclick="UIUpdater.updateTicket(${ticket.id}, 'en_cours')">
                                <i class="bi bi-play-fill me-1"></i>Mettre en cours
                            </button>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('') + `</div>`;
        } catch (error) {
            console.error('Erreur chargement tickets:', error);
        }
    },

    /**
     * Afficher l'historique des tickets résolus
     */
    async updateTicketHistory() {
        const container = document.getElementById('history-tickets');
        if (!container) return;

        try {
            const allTickets = await API.getTickets();
            const currentUser = this.getCurrentUser();
            const isAdmin = currentUser && currentUser.role === 'admin';
            
            // Filtrer les tickets résolus
            let resolvedTickets = allTickets.filter(t => t.status === 'resolu');
            
            // Si user normal, filtrer uniquement ses tickets
            if (!isAdmin && currentUser) {
                resolvedTickets = resolvedTickets.filter(t => t.user_id === currentUser.id);
            }
            // Si admin, afficher tout l'historique

            if (resolvedTickets.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="bi bi-inbox fs-1 text-muted opacity-25"></i>
                        <p class="text-muted mt-3">Aucun ticket résolu dans l'historique</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="table-responsive bg-white rounded shadow-sm">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light">
                            <tr>
                                <th class="border-0 ps-4">ID</th>
                                <th class="border-0">Sujet</th>
                                <th class="border-0">Lieu</th>
                                <th class="border-0">Priorité</th>
                                <th class="border-0">Créé le</th>
                                <th class="border-0 pe-4 text-end">Traité par</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resolvedTickets.map(ticket => {
                                const priorityMap = {
                                    'urgent': '<span class="badge bg-danger-subtle text-danger">Urgent</span>',
                                    'moyen': '<span class="badge bg-warning-subtle text-warning">Normal</span>',
                                    'bas': '<span class="badge bg-success-subtle text-success">Bas</span>'
                                };
                                const priority = priorityMap[ticket.priority] || priorityMap['moyen'];

                                const createdDate = new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                });

                                return `
                                <tr>
                                    <td class="ps-4 text-muted small font-monospace">#TK-${ticket.id}</td>
                                    <td>
                                        <span class="fw-bold text-dark">${ticket.title}</span>
                                        ${ticket.description ? `<br><span class="text-muted small">${ticket.description.substring(0, 50)}...</span>` : ''}
                                    </td>
                                    <td><span class="badge bg-light text-dark border">${ticket.location || 'N/A'}</span></td>
                                    <td>${priority}</td>
                                    <td class="text-muted small">${createdDate}</td>
                                    <td class="pe-4 text-end">
                                        ${ticket.firstname ? `<small class="text-muted">${ticket.firstname} ${ticket.lastname}</small>` : '<small class="text-muted fst-italic">N/A</small>'}
                                    </td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            console.error('Erreur chargement historique:', error);
            container.innerHTML = `
                <div class="alert alert-danger m-3">
                    Erreur lors du chargement de l'historique des tickets
                </div>
            `;
        }
    },

    /**
     * Afficher les réservations récentes
     */
    async updateBookingsList() {
        try {
            const bookings = await API.getBookings();
            const currentUser = this.getCurrentUser();
            const isAdmin = currentUser && currentUser.role === 'admin';

            // Filtrer selon le rôle
            let displayBookings = bookings;
            if (!isAdmin && currentUser) {
                // User normal : seulement ses propres réservations
                displayBookings = bookings.filter(b => b.user_id === currentUser.id);
            }
            // Admin : toutes les réservations

            const recentBookings = displayBookings.slice(0, 3);

            // Mettre à jour le titre selon le rôle
            const titleEl = document.getElementById('dashboard-bookings-title');
            if (titleEl) {
                if (isAdmin) {
                    titleEl.innerHTML = '<i class="bi bi-calendar-check me-2"></i>Toutes les Réservations';
                } else {
                    titleEl.innerHTML = '<i class="bi bi-calendar-check me-2"></i>Mes Réservations';
                }
            }

            // Mettre à jour le compteur
            const badge = document.querySelector('.badge.bg-light.text-dark.border');
            if (badge && badge.textContent.includes('à venir')) {
                badge.textContent = `${displayBookings.length} à venir`;
            }

            // Afficher les 3 prochaines réservations dans le dashboard
            const container = document.querySelector('.col-lg-6 .d-flex.flex-column.gap-3');
            if (container && recentBookings.length > 0) {
                container.innerHTML = recentBookings.map((booking, index) => {
                    const startDate = new Date(booking.start_time);
                    const month = startDate.toLocaleString('fr-FR', { month: 'short' }).toUpperCase();
                    const day = startDate.getDate();
                    const time = startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(booking.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                    // Afficher le nom de l'utilisateur si admin
                    const userInfo = isAdmin ? `<div class="text-muted small">
                                        <i class="bi bi-person me-1"></i>${booking.user_name || 'Inconnu'}
                                    </div>` : '';

                    return `
                    <div class="card border-0 shadow-sm bg-light hover-scale" id="resa-${booking.id}">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <div class="date-box bg-white rounded p-2 text-center me-3 shadow-sm" style="min-width: 60px;">
                                    <span class="d-block fw-bold text-primary small">${month}</span>
                                    <span class="d-block fw-bold fs-5">${day}</span>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">${booking.room_name || booking.room_id}</h6>
                                    <div class="text-muted small">
                                        <i class="bi bi-geo-alt me-1"></i>${booking.room_id} • ${time} - ${endTime}
                                    </div>
                                    ${userInfo}
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><a class="dropdown-item text-danger" href="#" onclick="UIUpdater.cancelBooking(${booking.id})">
                                        <i class="bi bi-trash me-2"></i>Annuler
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');
            } else if (container) {
                container.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-calendar-x fs-1 opacity-25"></i>
                        <p class="small mt-2">Aucune réservation à venir</p>
                    </div>
                `;
            }

            // Mettre à jour les disponibilités rapides
            await this.updateQuickAvailability();

            // Mettre à jour les tickets du dashboard
            await this.updateDashboardTickets();

            // Mettre à jour les stats
            await this.updateDashboardStats();
        } catch (error) {
            console.error('Erreur chargement réservations:', error);
        }
    },

    /**
     * Afficher les tickets actifs dans le dashboard
     */
    async updateDashboardTickets() {
        try {
            const tickets = await API.getTickets();
            const currentUser = this.getCurrentUser();
            const isAdmin = currentUser && currentUser.role === 'admin';

            // Filtrer selon le rôle
            let displayTickets = tickets.filter(t => t.status !== 'resolu');
            if (!isAdmin && currentUser) {
                // User normal : seulement ses propres tickets
                displayTickets = displayTickets.filter(t => t.user_id === currentUser.id);
            }
            // Admin : tous les tickets actifs

            const activeTickets = displayTickets.slice(0, 2);

            // Mettre à jour le titre selon le rôle
            const titleEl = document.getElementById('dashboard-tickets-title');
            if (titleEl) {
                if (isAdmin) {
                    titleEl.innerHTML = '<i class="bi bi-ticket-perforated me-2"></i>Tous les Tickets Actifs';
                } else {
                    titleEl.innerHTML = '<i class="bi bi-ticket-perforated me-2"></i>Mes Tickets Actifs';
                }
            }

            const container = document.getElementById('dashboard-tickets');
            if (!container) return;

            if (activeTickets.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4 text-success">
                        <i class="bi bi-check-circle fs-1"></i>
                        <p class="small mt-2 mb-0">Aucun ticket actif</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = activeTickets.map(ticket => {
                const statusMap = {
                    'nouveau': { class: 'danger', label: 'Nouveau' },
                    'en_cours': { class: 'warning', label: 'En cours' }
                };
                const status = statusMap[ticket.status] || statusMap['nouveau'];

                // Afficher le nom de l'utilisateur si admin
                const userInfo = isAdmin && ticket.firstname ? `
                    <div class="text-muted small mt-1">
                        <i class="bi bi-person me-1"></i>${ticket.firstname} ${ticket.lastname}
                    </div>
                ` : '';

                return `
                <div class="card bg-${status.class}-subtle border-0 mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="badge bg-${status.class} ${status.class === 'warning' ? 'text-dark' : ''}">${status.label}</span>
                            <a href="#maintenance" class="text-decoration-none small fw-bold stretched-link">Voir détails</a>
                        </div>
                        <h6 class="fw-bold text-dark mb-1">${ticket.title}</h6>
                        <small class="text-muted">${ticket.location || 'Non spécifié'}</small>
                        ${userInfo}
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur chargement tickets dashboard:', error);
        }
    },

    /**
     * Mettre à jour les statistiques du dashboard
     */
    async updateDashboardStats() {
        try {
            const [rooms, bookings] = await Promise.all([
                API.getRooms(),
                API.getBookings()
            ]);

            const statRooms = document.getElementById('stat-rooms');
            const statBookings = document.getElementById('stat-bookings');

            if (statRooms) statRooms.textContent = rooms.length;
            if (statBookings) statBookings.textContent = bookings.length;
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    },

    /**
     * Afficher les salles disponibles en aperçu rapide
     */
    async updateQuickAvailability() {
        try {
            const rooms = await API.getRooms();
            const container = document.getElementById('quick-availability');
            if (!container) return;

            // Prendre les 4 premières salles
            const quickRooms = rooms.slice(0, 4);

            if (quickRooms.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center py-3 text-muted">
                        <p class="small">Aucune salle disponible</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = quickRooms.map(room => {
                const ratio = room.occupancy / (room.capacity || 1);
                let statusClass, statusIcon, statusText;

                if (ratio < 0.3) {
                    statusClass = 'bg-success-subtle border-success-subtle';
                    statusIcon = 'check-circle';
                    statusText = 'Libre';
                } else if (ratio < 0.7) {
                    statusClass = 'bg-light';
                    statusIcon = 'clock';
                    statusText = 'Peu occupé';
                } else {
                    statusClass = 'bg-warning-subtle border-warning-subtle';
                    statusIcon = 'exclamation-circle';
                    statusText = 'Occupé';
                }

                return `
                <div class="col-md-3">
                    <div class="p-3 border rounded h-100 d-flex justify-content-between align-items-center ${statusClass}">
                        <div>
                            <h6 class="fw-bold mb-1">${room.name}</h6>
                            <small class="fw-bold"><i class="bi bi-${statusIcon} me-1"></i>${statusText}</small>
                        </div>
                        <button class="btn btn-light btn-sm rounded-circle shadow-sm" onclick="UIUpdater.showBookingModal('${room.id}', '${room.name}')" title="Réserver">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Erreur chargement disponibilités:', error);
        }
    },

    /**
     * Annuler une réservation
     */
    async cancelBooking(bookingId) {
        if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

        try {
            await AppData.cancelBooking(bookingId);
            SmartCampus.showToast('success', 'Réservation annulée avec succès');

            // Animer la suppression
            const el = document.getElementById(`resa-${bookingId}`);
            if (el) {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.remove();
                    this.updateBookingsList(); // Recharger la liste
                }, 500);
            }
        } catch (error) {
            SmartCampus.showToast('error', 'Erreur lors de l\'annulation');
        }
    },

    /**
     * Mettre à jour le statut d'un ticket
     */
    async updateTicket(ticketId, newStatus) {
        try {
            await AppData.updateTicketStatus(ticketId, newStatus);
            SmartCampus.showToast('success', 'Ticket mis à jour');
            this.updateMaintenancePage();
        } catch (error) {
            SmartCampus.showToast('error', 'Erreur lors de la mise à jour');
        }
    },

    /**
     * Afficher le modal de réservation
     */
    showBookingModal(roomId, roomName) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateStr = tomorrow.toISOString().split('T')[0];
        const timeStr = '09:00';

        const modal = `
            <div class="modal fade" id="bookingModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Réserver ${roomName}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="booking-form">
                                <input type="hidden" name="room_id" value="${roomId}">
                                
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Date</label>
                                    <input type="date" class="form-control" name="date" value="${dateStr}" required>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <label class="form-label fw-bold">Heure début</label>
                                        <input type="time" class="form-control" name="start_time" value="${timeStr}" required>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label fw-bold">Heure fin</label>
                                        <input type="time" class="form-control" name="end_time" value="10:00" required>
                                    </div>
                                </div>
                                
                                <div class="alert alert-info">
                                    <i class="bi bi-info-circle me-2"></i>
                                    La réservation sera confirmée automatiquement.
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-primary" onclick="UIUpdater.submitBooking()">
                                <i class="bi bi-check-lg me-1"></i>Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Supprimer l'ancien modal s'il existe
        const oldModal = document.getElementById('bookingModal');
        if (oldModal) oldModal.remove();

        // Ajouter le nouveau
        document.body.insertAdjacentHTML('beforeend', modal);

        // Afficher
        const modalEl = new bootstrap.Modal(document.getElementById('bookingModal'));
        modalEl.show();
    },

    /**
     * Soumettre une réservation
     */
    async submitBooking() {
        const form = document.getElementById('booking-form');
        const formData = new FormData(form);

        const date = formData.get('date');
        const startTime = formData.get('start_time');
        const endTime = formData.get('end_time');
        const roomId = formData.get('room_id');

        const startDateTime = `${date} ${startTime}:00`;
        const endDateTime = `${date} ${endTime}:00`;

        try {
            await AppData.createBooking(roomId, startDateTime, endDateTime);

            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            modal.hide();

            SmartCampus.showToast('success', 'Réservation créée avec succès !');

            // Recharger les réservations
            setTimeout(() => this.updateBookingsList(), 500);
        } catch (error) {
            SmartCampus.showToast('error', error.message || 'Erreur lors de la réservation');
        }
    },

    /**
     * Helpers
     */
    getRoomTypeIcon(type) {
        const icons = {
            'cours': 'bi-door-closed',
            'labo': 'bi-flask',
            'reunion': 'bi-people',
            'box': 'bi-box'
        };
        return icons[type] || 'bi-door-closed';
    },

    getRoomTypeName(type) {
        const names = {
            'cours': 'Salle de cours',
            'labo': 'Laboratoire',
            'reunion': 'Salle de réunion',
            'box': 'Box de travail'
        };
        return names[type] || 'Salle';
    },

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        return `Il y a ${Math.floor(seconds / 86400)}j`;
    },

    /**
     * Récupérer l'utilisateur connecté
     */
    getCurrentUser() {
        const token = localStorage.getItem('sc360_auth');
        if (!token) return null;
        try {
            return JSON.parse(token);
        } catch {
            return null;
        }
    },

    /**
     * Mettre à jour le profil utilisateur (Navbar & Greeting & Settings)
     */
    updateUserProfile() {
        const userStr = localStorage.getItem('sc360_auth');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            const userFullName = `${user.firstname} ${user.lastname}`;
            const userInitials = `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
            const isAdmin = user.role === 'admin';

            // --- 1. Global Navbar Updates ---
            const navName = document.getElementById('navbar-user-name');
            const navAvatar = document.getElementById('navbar-user-avatar');

            if (navName) navName.textContent = userFullName;
            if (navAvatar) {
                navAvatar.textContent = userInitials;
                // Optional: Change color based on role
                if (isAdmin) {
                    navAvatar.classList.add('bg-primary');
                    navAvatar.classList.remove('bg-secondary');
                } else {
                    navAvatar.classList.add('bg-secondary');
                    navAvatar.classList.remove('bg-primary');
                }
            }

            // --- 2. Dashboard Greetings ---
            const dashGreeting = document.getElementById('dashboard-greeting');
            if (dashGreeting) {
                // Afficher "Bonjour, [Prénom]" au lieu de "Tableau de bord"
                dashGreeting.innerHTML = `Bonjour, ${user.firstname} 👋`;
            }

            // --- 3. Settings Page Updates ---
            const settingsName = document.getElementById('settings-name');
            const settingsAvatar = document.getElementById('settings-avatar');
            const settingsRoleBadge = document.getElementById('settings-role-badge');
            const settingsEmail = document.getElementById('settings-email');
            const settingsRoleInput = document.getElementById('settings-role-input');
            const settingsRightsList = document.getElementById('settings-rights-list');

            if (settingsName) {
                settingsName.textContent = userFullName;
                settingsAvatar.textContent = userInitials;
                settingsEmail.value = user.email;

                // Role handling
                const roleLabel = isAdmin ? 'Administrateur' : 'Utilisateur Standard';
                const roleBadgeText = isAdmin ? 'Personnel Administratif' : 'Étudiant / Staff';

                settingsRoleInput.value = roleLabel;
                settingsRoleBadge.textContent = roleBadgeText;

                // Dynamic Rights List
                const rights = isAdmin ? [
                    'Administration Système',
                    'Gestion Incidents (Full)',
                    'Accès Salles (Master)',
                    'Configuration IoT'
                ] : [
                    'Réservation de Salles',
                    'Signalement Incidents',
                    'Accès Salles (Standard)',
                    'Consultation Planning'
                ];

                settingsRightsList.innerHTML = rights.map(right =>
                    `<li class="mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i>${right}</li>`
                ).join('');
            }

        } catch (e) {
            console.error('Erreur parsing user profile', e);
        }
    },

    /**
     * Mettre à jour l'heure et la date (Dashboard)
     */
    updateDateTime() {
        const timeEl = document.getElementById('dashboard-time');
        const dateEl = document.getElementById('dashboard-date');

        if (!timeEl && !dateEl) return;

        const now = new Date();

        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }

        if (dateEl) {
            // Format: "Mardi 24 Oct"
            const options = { weekday: 'long', day: 'numeric', month: 'short' };
            // Capitalize first letter of day
            let dateStr = now.toLocaleDateString('fr-FR', options);
            dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            dateEl.textContent = dateStr;
        }
    }
};

// Global Timer for Clock
setInterval(() => {
    UIUpdater.updateDateTime();
}, 1000);

// Hook dans le router pour déclencher les mises à jour
window.addEventListener('hashchange', async () => {
    const hash = location.hash.replace('#', '');

    // Attendre que le DOM soit mis à jour
    await new Promise(resolve => setTimeout(resolve, 100));

    // Always update user profile (Navbar is always present)
    UIUpdater.updateUserProfile();

    if (hash === 'booking') {
        UIUpdater.updateBookingPage();
    } else if (hash === 'maintenance') {
        UIUpdater.updateMaintenancePage();
    } else if (hash === 'dashboard') {
        UIUpdater.updateBookingsList();
        UIUpdater.updateDateTime(); // Initial update
    }
});

/**
 * LIVE MAP RENDERER - "AMONG US" STYLE
 * High fidelity SVG Map with Pan/Zoom and dynamic data overlays.
 */

// SmartCampus Map Module - "Among Us" Style Edition

// Digital Twin Layout Definition
const MAP_LAYOUT = {
    // Corridors (The walking areas) - "Among Us" style grey paths
    corridors: [
        { id: 'c_main', d: 'M 100 400 L 900 400 L 900 500 L 100 500 Z' }, // Main horizontal hall
        { id: 'c_north', d: 'M 450 100 L 550 100 L 550 400 L 450 400 Z' }, // North vertical hall intersection
        { id: 'c_east', d: 'M 900 420 L 1100 420 L 1100 480 L 900 480 Z' }, // East connector
    ],
    // Rooms (Interactive zones)
    rooms: [
        // North Wing
        { id: 'C101', name: 'Amphi A', x: 200, y: 50, w: 200, h: 250, type: 'Classroom', door: {x: 450, y: 200} }, 
        { id: 'L203', name: 'Serveurs', x: 600, y: 50, w: 150, h: 150, type: 'Tech', door: {x: 550, y: 125} },
        
        // Main Hall South Side
        { id: 'K001', name: 'Cafétéria', x: 350, y: 550, w: 300, h: 200, type: 'Hall', door: {x: 500, y: 500} },
        
        // East Wing
        { id: 'L202', name: 'Labo Chimie', x: 950, y: 200, w: 200, h: 200, type: 'Lab', door: {x: 900, y: 450} }, 
        { id: 'A002', name: 'Bibliothèque', x: 100, y: 550, w: 200, h: 150, type: 'Office', door: {x: 200, y: 500} }
    ],
    // Waypoints for navigation (Graph nodes)
    nodes: {
        'entry': {x: 50, y: 450},
        'center': {x: 500, y: 450},
        'north_junct': {x: 500, y: 250},
        'east_junct': {x: 1000, y: 450}
    }
};

const SmartCampusMap = {
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    activeMode: 'occupancy', // occupancy, thermal, security

    init() {
        this.renderAppMap();
        this.setupInteractions();
        // Start live update loop
        setInterval(() => this.refreshMapState(), 2000);
    },

    renderAppMap() {
        const container = document.getElementById('campus-map');
        if(!container) return;

        // Create SVG Canvas
        // Viewbox 0 0 1200 800
        const svg = `
        <svg id="map-svg" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; transition: transform 0.3s ease;">
            <defs>
                <pattern id="floorPattern" patternUnits="userSpaceOnUse" width="40" height="40">
                    <path d="M0 40 L40 0 H20 L0 20 M40 40 V20 L20 40" stroke="#334155" stroke-width="1" fill="none"/>
                </pattern>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
            </defs>

            <!-- Group to apply Pan/Zoom -->
            <g id="map-world">
                <!-- Floor (Corridors) -->
                <g id="layer-corridors">
                    ${MAP_LAYOUT.corridors.map(c => `
                        <path d="${c.d}" fill="#1e293b" stroke="#475569" stroke-width="8" stroke-linejoin="round" />
                        <path d="${c.d}" fill="url(#floorPattern)" opacity="0.3" />
                    `).join('')}
                </g>

                <!-- Rooms -->
                <g id="layer-rooms">
                    ${MAP_LAYOUT.rooms.map(r => `
                        <g class="room-group" id="room-${r.id}" onclick="SmartCampus.showRoomDetails('${r.id}')" style="cursor: pointer;">
                            <!-- Room Floor -->
                            <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="10"
                                  fill="#cbd5e1" stroke="#0f172a" stroke-width="6" />

                            <!-- Status Overlay (The active color) -->
                            <rect x="${r.x+6}" y="${r.y+6}" width="${r.w-12}" height="${r.h-12}" rx="5"
                                  fill="#10b981" opacity="0.2" class="room-status-fill" id="status-${r.id}" />

                            <!-- Room Label -->
                            <text x="${r.x + r.w/2}" y="${r.y + r.h/2}" text-anchor="middle" dominant-baseline="middle"
                                  fill="#1e293b" font-weight="bold" font-family="Outfit" font-size="20" style="pointer-events: none;">
                                ${r.name}
                            </text>

                            <!-- Icon -->
                            <foreignObject x="${r.x + r.w/2 - 15}" y="${r.y + r.h/2 - 40}" width="30" height="30">
                                <i class="bi bi-geo-alt-fill text-dark fs-4"></i>
                            </foreignObject>
                        </g>
                    `).join('')}
                </g>

                <!-- Navigation Layer -->
                <g id="layer-nav">
                    <path id="nav-path" d="" fill="none" stroke="#3b82f6" stroke-width="6" stroke-dasharray="15,10" display="none" />
                    <circle id="nav-marker" cx="0" cy="0" r="15" fill="#3b82f6" stroke="white" stroke-width="3" display="none">
                        <animateMotion id="nav-anim" dur="4s" repeatCount="indefinite" path="" />
                    </circle>
                </g>
            </g>
        </svg>
        `;

        container.innerHTML = svg;
    },

    refreshMapState() {
        if(!document.getElementById('map-svg')) return;

        // Use global mock state
        const rooms = SmartCampus.state.rooms;
        const mode = this.activeMode;

        rooms.forEach(roomData => {
            const el = document.getElementById(`status-${roomData.id}`);
            if(!el) return;

            let color = '#10b981'; // Default Green (Free)
            let opacity = 0.2;

            if (mode === 'occupancy') {
                const occupancyRate = roomData.occupancy / (roomData.capacity || 1);
                if (occupancyRate > 0.8) { color = '#ef4444'; opacity = 0.5; } // Red (Full)
                else if (occupancyRate > 0.4) { color = '#f59e0b'; opacity = 0.4; } // Yellow (Busy)
            } else if (mode === 'thermal') {
                 if (roomData.temperature > 24) { color = '#ef4444'; opacity = 0.6; } // Hot
                 else if (roomData.temperature < 19) { color = '#3b82f6'; opacity = 0.6; } // Cold
                 else { color = '#10b981'; opacity = 0.2; }
            } else if (mode === 'security') {
                 // Mock security alerts
                 if (roomData.id === 'A002') { color = '#f59e0b'; opacity = 0.8; } // Restricted
            }

            el.setAttribute('fill', color);
            el.setAttribute('opacity', opacity);
        });
    },

    highlightRoom(id) {
        // Reset styles
        document.querySelectorAll('.room-group rect').forEach(r => r.setAttribute('stroke', '#0f172a'));

        const grp = document.getElementById(`room-${id}`);
        if(grp) {
            const rect = grp.querySelector('rect');
            rect.setAttribute('stroke', '#3b82f6'); // Highlight Blue
            // Open info toast
            SmartCampus.showRoomDetails(id);
        }
    },

    // Simple Pathfinding (Mocked for demo)
    drawRoute(targetId) {
        const pathEl = document.getElementById('nav-path');
        const markerEl = document.getElementById('nav-marker');
        const animEl = document.getElementById('nav-anim');

        if (!targetId) {
            pathEl.style.display = 'none';
            markerEl.style.display = 'none';
            return;
        }

        const room = MAP_LAYOUT.rooms.find(r => r.id === targetId);
        if(!room) return;

        // Hardcoded simple paths concepts
        // Path always starts from 'entry' (50, 450) -> 'center' (500, 450)
        let d = `M 50 450 L 500 450`;

        // Determine branch
        if (room.y < 400) { // North Wing
            d += ` L 500 250 L ${room.door.x} 250 L ${room.door.x} ${room.door.y}`;
        } else if (room.x > 800) { // East Wing
            d += ` L 1000 450 L ${room.door.x} 450 L ${room.door.x} ${room.door.y}`;
        } else { // South / Main
             d += ` L ${room.door.x} 450 L ${room.door.x} ${room.door.y}`;
        }

        pathEl.setAttribute('d', d);
        pathEl.style.display = 'block';

        animEl.setAttribute('path', d);
        markerEl.style.display = 'block';

        this.highlightRoom(targetId);
    },

    resetView() {
        const world = document.getElementById('map-world');
        this.zoomLevel = 1; this.panX = 0; this.panY = 0;
        if(world) world.style.transform = `translate(0px, 0px) scale(1)`;
    },

    zoom(delta) {
        this.zoomLevel += delta * 0.2;
        if (this.zoomLevel < 0.5) this.zoomLevel = 0.5;
        if (this.zoomLevel > 3) this.zoomLevel = 3;
        const world = document.getElementById('map-world');
        if(world) world.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel})`;
    }
};

// Expose to Global
SmartCampus.startNavigation = (id) => SmartCampusMap.drawRoute(id);
SmartCampus.resetNavigation = () => {
    SmartCampusMap.drawRoute(null);
    document.getElementById('nav-target').value = "";
    document.getElementById('mt-status').parentElement.parentElement.parentElement.classList.remove('show');
};
SmartCampus.showRoomDetails = (id) => {
    const toast = document.getElementById('map-toast');
    const room = SmartCampus.state.rooms.find(r => r.id === id);
    if(toast && room) {
        const bsToast = new bootstrap.Toast(toast);
        document.getElementById('mt-title').innerText = `${room.name} (${room.id})`;
        document.getElementById('mt-cap').innerText = `${room.occupancy}/${room.capacity}`;

        const statusEl = document.getElementById('mt-status');
        if(room.occupancy > 20) { statusEl.className = 'badge bg-danger'; statusEl.innerText = 'Saturé'; }
        else if(room.occupancy > 10) { statusEl.className = 'badge bg-warning text-dark'; statusEl.innerText = 'Occupé'; }
        else { statusEl.className = 'badge bg-success'; statusEl.innerText = 'Libre'; }

        bsToast.show();
    }
};
SmartCampus.zoomMap = (d) => SmartCampusMap.zoom(d);
SmartCampus.centerMap = () => SmartCampusMap.resetView();

// Hook into router init
SmartCampus.initMap = () => SmartCampusMap.init();

// Helper for radio buttons
function updateMapMode(mode) {
    SmartCampusMap.activeMode = mode;
    SmartCampusMap.refreshMapState();
}
let transform = { x: 0, y: 0, scale: 1 };
let isDragging = false;
let startX, startY;



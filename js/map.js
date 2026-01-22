/**
 * LIVE MAP RENDERER
 * High fidelity SVG Map with Pan/Zoom and dynamic data overlays.
 */

// Mapping des vraies salles de la BDD vers les zones de la carte
const ROOM_TO_MAP_ZONE = {
    'A101': { x: 250, y: 250, zone: 'GARDEN' },
    'A102': { x: 400, y: 525, zone: 'ORANGE' },
    'A103': { x: 800, y: 575, zone: 'GYM' },
    'B201': { x: 200, y: 725, zone: 'BLUE' },
    'B202': { x: 610, y: 750, zone: 'CAFE' },
    'B203': { x: 825, y: 350, zone: 'LIBRARY' },
    'C301': { x: 1190, y: 525, zone: 'GREEN' },
    'C302': { x: 1190, y: 725, zone: 'ART' },
    'C303': { x: 1550, y: 670, zone: 'CHEMISTRY' },
    'D401': { x: 600, y: 300, zone: 'ADMIN' },
    'D402': { x: 750, y: 450, zone: 'IP_ROOM' },
    'E501': { x: 950, y: 550, zone: 'REST1' }
};

// Reverse mapping zone -> room ID
const MAP_ZONE_TO_ROOM = {};
Object.keys(ROOM_TO_MAP_ZONE).forEach(roomId => {
    const zone = ROOM_TO_MAP_ZONE[roomId].zone;
    MAP_ZONE_TO_ROOM[zone] = roomId;
});

let currentMapMode = 'occupancy'; // 'occupancy' | 'thermal' | 'tech'
let transform = { x: 0, y: 0, scale: 1 };
let isDragging = false;
let startX, startY;
let mapRoomsData = []; // Store real rooms data from API

async function renderMap() {
    const container = document.getElementById('campus-map');
    if (!container) return;
    
    // Load real rooms data from API
    try {
        mapRoomsData = await API.getRooms();
        console.log(`🗺️ Carte chargée avec ${mapRoomsData.length} salles depuis la BDD`);
    } catch (error) {
        console.error('Erreur chargement salles pour la carte:', error);
        mapRoomsData = [];
    }
    
    // Add CSS for map controls if not present
    if(!document.getElementById('map-style')) {
        const style = document.createElement('style');
        style.id = 'map-style';
        style.textContent = `
            .map-container { background: #0f172a; cursor: grab; overflow: hidden; position: relative; }
            .map-container:active { cursor: grabbing; }
            .room-shape { fill: #1e293b; stroke: #475569; stroke-width: 4; transition: fill 0.3s; }
            .room-shape:hover { stroke: #cbd5e1; stroke-width: 6; cursor: pointer; }
            .corridor { fill: #334155; stroke: none; }
            .door { fill: #94a3b8; }
            .map-label { font-family: 'Outfit', sans-serif; font-weight: 700; fill: rgba(255,255,255,0.8); pointer-events: none; text-transform: uppercase; letter-spacing: 1px; }
            .map-sublabel { font-family: 'Inter', sans-serif; font-weight: 500; fill: rgba(255,255,255,0.5); font-size: 10px; pointer-events: none; }
            .icon-alert { animation: pulseAlert 1s infinite; fill: #ef4444; filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.8)); }
            @keyframes pulseAlert { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
            
            #map-controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 100; }
            .control-btn { width: 40px; height: 40px; border-radius: 50%; background: #1e293b; color: white; border: 1px solid #475569; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5); font-size: 1.2rem; transition: background 0.2s; }
            .control-btn:hover { background: #334155; }
        `;
        document.head.appendChild(style);
    }

    const svgContent = `
    
    <svg id="svg-map" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <g id="map-group">
            <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
                </pattern>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>

            <!-- Background Grid -->
            <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#grid-pattern)" />

            <!-- === LEFT BUILDING === -->
            <!-- CORRIDORS - Dark Theme -->
            <!-- Main Vertical Left -->
            <path class="corridor" d="M 350,150 V 900 H 450 V 450 H 750 V 350 H 450 V 150 Z" />
            <!-- Main Horizontal Crossing -->
            <path class="corridor" d="M 100,550 H 1300 V 650 H 350 V 550 Z" />
            
            <!-- TOP ROW -->
            <g class="room-group" data-id="GARDEN" onclick="openRoomDetails('GARDEN')">
                <rect x="150" y="150" width="200" height="200" rx="4" class="room-shape" />
                <text x="250" y="240" text-anchor="middle" class="map-label" font-size="20">Garden</text>
                <circle cx="280" cy="160" r="10" class="door" />
            </g>
             <g class="room-group" data-id="REST1" onclick="openRoomDetails('REST1')">
                <rect x="450" y="150" width="100" height="100" rx="4" class="room-shape" />
                <text x="500" y="200" text-anchor="middle" class="map-sublabel">Rest Room</text>
            </g>
             <g class="room-group" data-id="NCUB" onclick="openRoomDetails('NCUB')">
                <rect x="550" y="150" width="100" height="100" rx="4" class="room-shape" />
                <text x="600" y="200" text-anchor="middle" class="map-sublabel">N. Cubicle</text>
            </g>
            <g class="room-group" data-id="LIB_CLASS" onclick="openRoomDetails('LIB_CLASS')">
                <rect x="750" y="150" width="150" height="100" rx="4" class="room-shape" />
                <text x="825" y="200" text-anchor="middle" class="map-sublabel">Library Class</text>
            </g>
             <g class="room-group" data-id="IP_ROOM" onclick="openRoomDetails('IP_ROOM')">
                <rect x="550" y="250" width="200" height="100" rx="4" class="room-shape" />
                <text x="650" y="300" text-anchor="middle" class="map-label" font-size="16">IP Room</text>
            </g>
            <g class="room-group" data-id="LIBRARY" onclick="openRoomDetails('LIBRARY')">
                <rect x="750" y="250" width="150" height="200" rx="4" class="room-shape" />
                <text x="825" y="350" text-anchor="middle" class="map-label" font-size="20">Library</text>
            </g>

            <!-- MIDDLE ROW -->
            <g class="room-group" data-id="SERVER" onclick="openRoomDetails('SERVER')">
                <rect x="50" y="400" width="100" height="150" rx="4" class="room-shape" />
                <text x="100" y="475" text-anchor="middle" class="map-sublabel">Server</text>
            </g>
             <g class="room-group" data-id="ORANGE" onclick="openRoomDetails('ORANGE')">
                <rect x="250" y="450" width="300" height="150" rx="4" class="room-shape" />
                <text x="400" y="525" text-anchor="middle" class="map-label text-warning" font-size="24">Orange Room</text>
                <text x="400" y="550" text-anchor="middle" class="map-sublabel" id="label-ORANGE">--</text>
            </g>
             <g class="room-group" data-id="GYM" onclick="openRoomDetails('GYM')">
                <rect x="650" y="450" width="300" height="250" rx="4" class="room-shape" />
                <text x="800" y="575" text-anchor="middle" class="map-label" font-size="30">Gym</text>
                 <text x="800" y="600" text-anchor="middle" class="map-sublabel" id="label-GYM">--</text>
            </g>

            <!-- BOTTOM ROW -->
            <g class="room-group" data-id="BLUE" onclick="openRoomDetails('BLUE')">
                <rect x="100" y="650" width="200" height="150" rx="4" class="room-shape" />
                <text x="200" y="725" text-anchor="middle" class="map-label text-info" font-size="20">Blue Room</text>
                <text x="200" y="750" text-anchor="middle" class="map-sublabel" id="label-BLUE">--</text>
            </g>
             <g class="room-group" data-id="NURSE" onclick="openRoomDetails('NURSE')">
                <rect x="350" y="650" width="150" height="80" rx="4" class="room-shape" />
                <text x="425" y="690" text-anchor="middle" class="map-sublabel">Nurse</text>
            </g>
             <g class="room-group" data-id="PEE" onclick="openRoomDetails('PEE')">
                <rect x="350" y="730" width="150" height="70" rx="4" class="room-shape" />
                <text x="425" y="765" text-anchor="middle" class="map-sublabel">Restroom</text>
            </g>
            <g class="room-group" data-id="CAFE" onclick="openRoomDetails('CAFE')">
                <rect x="550" y="650" width="120" height="200" rx="4" class="room-shape" />
                <text x="610" y="750" text-anchor="middle" class="map-label" font-size="16">Cafe</text>
            </g>
            <g class="room-group" data-id="KITCHEN" onclick="openRoomDetails('KITCHEN')">
                <rect x="670" y="650" width="120" height="200" rx="4" class="room-shape" />
                <text x="730" y="750" text-anchor="middle" class="map-label" font-size="16">Kitchen</text>
            </g>
            <g class="room-group" data-id="ENGLISH" onclick="openRoomDetails('ENGLISH')">
                <rect x="790" y="650" width="110" height="120" rx="4" class="room-shape" />
                <text x="845" y="710" text-anchor="middle" class="map-sublabel">English</text>
            </g>
            <g class="room-group" data-id="SCUB" onclick="openRoomDetails('SCUB')">
                <rect x="790" y="770" width="110" height="80" rx="4" class="room-shape" />
                <text x="845" y="810" text-anchor="middle" class="map-sublabel">S. Cubicle</text>
            </g>
            
            <!-- === RIGHT BUILDING === -->
             <path class="corridor" d="M 1300,550 H 1550 V 650 H 1300 Z" />
             <path class="corridor" d="M 1300,550 V 900 H 1350 V 550 Z" />
             
            <g class="room-group" data-id="GREEN" onclick="openRoomDetails('GREEN')">
                <rect x="1100" y="450" width="180" height="150" rx="4" class="room-shape" />
                <text x="1190" y="525" text-anchor="middle" class="map-label text-success" font-size="20">Green</text>
                <text x="1190" y="550" text-anchor="middle" class="map-label text-success" font-size="20">Room</text>
                <text x="1190" y="575" text-anchor="middle" class="map-sublabel" id="label-GREEN">--</text>
            </g>
            <g class="room-group" data-id="ART" onclick="openRoomDetails('ART')">
                <rect x="1100" y="650" width="180" height="150" rx="4" class="room-shape" />
                <text x="1190" y="725" text-anchor="middle" class="map-label" font-size="20">Art Room</text>
                <text x="1190" y="750" text-anchor="middle" class="map-sublabel" id="label-ART">--</text>
            </g>
             <g class="room-group" data-id="WET_REST" onclick="openRoomDetails('WET_REST')">
                <rect x="1350" y="550" width="150" height="120" rx="4" class="room-shape" />
                <text x="1425" y="610" text-anchor="middle" class="map-sublabel">Wet Restroom</text>
            </g>
            <g class="room-group" data-id="DRY_REST" onclick="openRoomDetails('DRY_REST')">
                <rect x="1350" y="670" width="150" height="120" rx="4" class="room-shape" />
                <text x="1425" y="730" text-anchor="middle" class="map-sublabel">Dry Restroom</text>
            </g>
             <g class="room-group" data-id="CHEMISTRY" onclick="openRoomDetails('CHEMISTRY')">
                <rect x="1500" y="550" width="100" height="240" rx="4" class="room-shape" />
                <text x="1550" y="670" text-anchor="middle" class="map-label" font-size="16" transform="rotate(-90, 1550, 670)">Chemistry</text>
                 <text x="1575" y="670" text-anchor="middle" class="map-sublabel" id="label-CHEMISTRY">--</text>
            </g>

             <!-- Alert Overlay Layer -->
             <g id="layer-alerts" style="pointer-events: none;"></g>

        </g>
    </svg>
    `;

    // Sync UI
    const activeRadio = document.getElementById(`filter-${currentMapMode}`);
    if (activeRadio) activeRadio.checked = true;

    container.innerHTML = svgContent;
    setupMapInteractions();
    
    // Delayed refresh to ensure DOM logic (BBox) works, even though we use Hardcoded now
    setTimeout(() => refreshMapColors(), 100);

    if (!window.mapUpdaterAttached) {
        window.addEventListener('campus-update', () => {
            refreshMapColors();
            if(window.selectedRoomId) updateOffcanvasData(window.selectedRoomId);
        });
        window.mapUpdaterAttached = true;
    }
}

function setupMapInteractions() {
    const container = document.getElementById('campus-map');
    
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - transform.x;
        startY = e.clientY - transform.y;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        transform.x = e.clientX - startX;
        transform.y = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        transform.scale = Math.min(Math.max(0.5, transform.scale + scaleAmount), 3);
        updateTransform();
    });
}

function updateTransform() {
    const group = document.getElementById('map-group');
    if(group) {
        group.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
        group.style.transformOrigin = 'center center';
    }
}

window.zoomMap = (amount) => {
    transform.scale = Math.min(Math.max(0.5, transform.scale + amount), 3);
    updateTransform();
};

window.resetZoom = () => {
    transform = { x: 0, y: 0, scale: 1 };
    updateTransform();
};

function refreshMapColors() {
    const rooms = document.querySelectorAll('.room-group');
    const alertsLayer = document.getElementById('layer-alerts');
    if(!rooms || !alertsLayer) return;

    alertsLayer.innerHTML = ''; // Clear alerts

    rooms.forEach(g => {
        const zoneId = g.getAttribute('data-id').trim();
        const roomId = MAP_ZONE_TO_ROOM[zoneId] || zoneId;
        
        // Get room data from API cache
        const roomData = mapRoomsData.find(r => r.id === roomId);
        const rect = g.querySelector('.room-shape');
        const sub = document.getElementById(`label-${zoneId}`);

        if (!roomData) return;

        let color = '#1e293b'; // Base Dark Blue

        // Check if room has maintenance tickets (alerts)
        const hasAlert = roomData.has_maintenance || false;

        if(hasAlert) {
             let cx = 0, cy = 0;
             
             // PRIORITY 1: Hardcoded Coordinates (100% RELIABLE)
             if(MAP_ZONES[zoneId]) {
                 cx = MAP_ZONES[zoneId].x;
                 cy = MAP_ZONES[zoneId].y;
                 console.log(`[Map] Alert on ${zoneId} -> Hardcoded coords: ${cx}, ${cy}`);
             }
             // PRIORITY 2: BBox Calculation (Fallback)
             else {
                 try {
                    const bbox = rect.getBBox();
                    if (bbox.width > 0) {
                        cx = bbox.x + bbox.width / 2;
                        cy = bbox.y + bbox.height / 2;
                    }
                 } catch(e) {}
             }

             // LAST RESORT FAILSAFE
             if (cx === 0 || cy === 0) {
                 cx = 800; // Center map
                 cy = 500;
                 console.warn(`[Map] Fallback to center for ${zoneId}`);
             }

             if(cx !== 0 && cy !== 0) {
                 // Create group for the icon
                 const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                 
                 // SVG Icon Path
                 const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                 iconPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"); 
                 iconPath.setAttribute("fill", "#ef4444");
                 
                 // Center and Scale
                 const offset = 12;
                 iconGroup.setAttribute("transform", `translate(${cx - offset}, ${cy - offset}) scale(2)`);
                 
                 iconGroup.classList.add('icon-alert');
                 iconGroup.appendChild(iconPath);
                 
                 alertsLayer.appendChild(iconGroup);
                 
                 // Pulse the room color
                 color = '#450a0a'; 
             }
        } else {
             if (currentMapMode === 'occupancy') {
                const ratio = roomData.occupancy / (roomData.capacity || 1);
                if (ratio > 0.8) color = '#7f1d1d'; // Crowded (Red-900)
                else if (ratio > 0.4) color = '#78350f'; // Busy (Amber-900)
                else color = '#1e293b'; // Dark
                
                if(sub) sub.textContent = `${roomData.occupancy} / ${roomData.capacity}`;

            } else if (currentMapMode === 'thermal') {
                const temp = roomData.temperature || 20;
                if (temp < 19) color = '#1e3a8a'; // Cold (Blue-900)
                else if (temp > 23) color = '#7f1d1d'; // Hot
                else color = '#14532d'; // Good (Green-900)
                
                if(sub) sub.textContent = `${temp}°C`;
            } else {
                 if(sub) sub.textContent = roomData.room_type || '';
            }
        }
        
        rect.style.fill = color;
    });
}

// === INTERACTION HANDLERS ===

window.selectedRoomId = null;

function openRoomDetails(zoneId) {
    // Convert zone to real room ID
    const roomId = MAP_ZONE_TO_ROOM[zoneId] || zoneId;
    window.selectedRoomId = roomId;
    updateOffcanvasData(roomId);

    const offcanvasEl = document.getElementById('roomOffcanvas');
    if(offcanvasEl) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
        bsOffcanvas.show();

        offcanvasEl.removeEventListener('hidden.bs.offcanvas', handleOffcanvasClose);
        offcanvasEl.addEventListener('hidden.bs.offcanvas', handleOffcanvasClose);
    }
}

function handleOffcanvasClose() {
    window.selectedRoomId = null;
}

async function updateOffcanvasData(roomId) {
    // Get real room data from API
    const room = mapRoomsData.find(r => r.id === roomId);
    if (!room) {
        console.warn('Salle non trouvée:', roomId);
        return;
    }

    const setTxt = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };

    const typeNames = {
        'cours': 'Salle de Cours',
        'labo': 'Laboratoire',
        'reunion': 'Salle de Réunion',
        'box': 'Box de Travail'
    };

    setTxt('detail-room-id', room.name);
    setTxt('detail-room-type', typeNames[room.room_type] || room.room_type);
    setTxt('detail-room-temp', room.temperature + '°C');
    setTxt('detail-room-occ', room.occupancy);
    
    // Load bookings for this room
    try {
        const bookings = await API.getBookingsByRoom(roomId);
        const nextBooking = bookings.find(b => new Date(b.start_time) > new Date());
        if (nextBooking) {
            const time = new Date(nextBooking.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            setTxt('detail-room-schedule', `Réservé à ${time}`);
        } else {
            setTxt('detail-room-schedule', 'Libre');
        }
    } catch (error) {
        console.error('Erreur chargement réservations:', error);
    }
}

// Export for global usage
window.updateMapMode = (mode) => {
    currentMapMode = mode;
    refreshMapColors();
};
window.renderMap = renderMap;
window.openRoomDetails = openRoomDetails;
window.MAP_ZONES = MAP_ZONES; // Export for debugging

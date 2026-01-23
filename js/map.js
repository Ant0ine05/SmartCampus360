/**
 * LIVE MAP RENDERER
 * High fidelity SVG Map with Pan/Zoom and dynamic data overlays.
 */

// Mapping des vraies salles de la BDD vers les zones de la carte
const ROOM_TO_MAP_ZONE = {
    'A101': { x: 150, y: 150, zone: 'GARDEN' },
    'A102': { x: 500, y: 400, zone: 'ORANGE' },
    'A103': { x: 900, y: 500, zone: 'GYM' },
    'B201': { x: 150, y: 725, zone: 'BLUE' },
    'B202': { x: 425, y: 675, zone: 'CAFE' },
    'B203': { x: 975, y: 200, zone: 'LIBRARY' },
    'C301': { x: 1250, y: 275, zone: 'GREEN' },
    'C302': { x: 1250, y: 575, zone: 'ART' },
    'C303': { x: 1425, y: 475, zone: 'CHEMISTRY' },
    'D401': { x: 150, y: 575, zone: 'SERVER' },
    'D402': { x: 650, y: 125, zone: 'IP_ROOM' },
    'E501': { x: 400, y: 100, zone: 'REST1' },
    'E502': { x: 500, y: 100, zone: 'NCUB' },
    'E503': { x: 825, y: 125, zone: 'LIB_CLASS' },
    'F101': { x: 425, y: 550, zone: 'NURSE' },
    'F102': { x: 575, y: 700, zone: 'KITCHEN' },
    'F103': { x: 825, y: 700, zone: 'ENGLISH' },
    'F104': { x: 975, y: 700, zone: 'SCUB' },
    'G201': { x: 1200, y: 700, zone: 'WET_REST' },
    'G202': { x: 1300, y: 700, zone: 'DRY_REST' }
};

// Reverse mapping zone -> room ID
const MAP_ZONE_TO_ROOM = {};
Object.keys(ROOM_TO_MAP_ZONE).forEach(roomId => {
    const zone = ROOM_TO_MAP_ZONE[roomId].zone;
    MAP_ZONE_TO_ROOM[zone] = roomId;
});

// MAP_ZONES pour les coordonnées des alertes
const MAP_ZONES = {};
Object.keys(ROOM_TO_MAP_ZONE).forEach(roomId => {
    const data = ROOM_TO_MAP_ZONE[roomId];
    MAP_ZONES[data.zone] = { x: data.x, y: data.y };
});

let currentMapMode = 'occupancy'; // 'occupancy' | 'thermal' | 'tech'
let transform = { x: 0, y: 0, scale: 1 };
let isDragging = false;
let startX, startY;
let mapRoomsData = []; // Store real rooms data from API
let mapUpdateInterval = null;

async function loadMapData() {
    try {
        mapRoomsData = await API.getRooms();
        console.log(`🗺️ ${mapRoomsData.length} salles chargées`);
        
        // Afficher un exemple de température pour debug
        if (mapRoomsData.length > 0) {
            const sample = mapRoomsData[0];
            console.log(`Exemple ${sample.id}: temp=${sample.temperature}°C, occ=${sample.occupancy}/${sample.capacity}`);
        }
        
        refreshMapColors();
        
        // Mettre à jour l'offcanvas si une salle est sélectionnée
        if (window.selectedRoomId) {
            updateOffcanvasData(window.selectedRoomId);
        }
        
        return mapRoomsData;
    } catch (error) {
        console.error('Erreur chargement données carte:', error);
        return [];
    }
}

async function renderMap() {
    const container = document.getElementById('campus-map');
    if (!container) return;
    
    // Load real rooms data from API
    await loadMapData();
    
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

            <!-- === CORRIDORS === -->
            <!-- Main horizontal corridor -->
            <path class="corridor" d="M 50,400 H 1350 V 500 H 50 Z" />
            <!-- Vertical corridor left -->
            <path class="corridor" d="M 250,50 H 350 V 850 H 250 Z" />
            <!-- Vertical corridor center -->
            <path class="corridor" d="M 650,200 H 750 V 850 H 650 Z" />
            <!-- Vertical corridor right -->
            <path class="corridor" d="M 1050,200 H 1150 V 850 H 1050 Z" />
            <!-- Top horizontal connector -->
            <path class="corridor" d="M 350,250 H 1050 V 350 H 350 Z" />
            <!-- Bottom horizontal connector -->
            <path class="corridor" d="M 350,650 H 1050 V 750 H 350 Z" />
            
            <!-- === TOP ROW === -->
            <g class="room-group" data-id="GARDEN" onclick="openRoomDetails('GARDEN')">
                <rect x="50" y="50" width="200" height="200" rx="4" class="room-shape" />
                <text x="150" y="140" text-anchor="middle" class="map-label" font-size="22">GARDEN ROOM</text>
                <text x="150" y="165" text-anchor="middle" class="map-sublabel">A101</text>
            </g>
            
            <g class="room-group" data-id="SERVER" onclick="openRoomDetails('SERVER')">
                <rect x="50" y="500" width="200" height="150" rx="4" class="room-shape" />
                <text x="150" y="570" text-anchor="middle" class="map-sublabel" font-size="12">Salle Serveur</text>
                <text x="150" y="590" text-anchor="middle" class="map-sublabel">D401</text>
            </g>
            
            <g class="room-group" data-id="REST1" onclick="openRoomDetails('REST1')">
                <rect x="350" y="50" width="100" height="100" rx="4" class="room-shape" />
                <text x="400" y="95" text-anchor="middle" class="map-sublabel" font-size="11">Rest Room</text>
                <text x="400" y="110" text-anchor="middle" class="map-sublabel">E501</text>
            </g>
            
            <g class="room-group" data-id="NCUB" onclick="openRoomDetails('NCUB')">
                <rect x="450" y="50" width="100" height="100" rx="4" class="room-shape" />
                <text x="500" y="95" text-anchor="middle" class="map-sublabel" font-size="11">Cubicle Nord</text>
                <text x="500" y="110" text-anchor="middle" class="map-sublabel">E502</text>
            </g>
            
            <g class="room-group" data-id="IP_ROOM" onclick="openRoomDetails('IP_ROOM')">
                <rect x="550" y="50" width="200" height="150" rx="4" class="room-shape" />
                <text x="650" y="120" text-anchor="middle" class="map-label" font-size="18">IP ROOM</text>
                <text x="650" y="145" text-anchor="middle" class="map-sublabel">D402</text>
            </g>
            
            <g class="room-group" data-id="LIB_CLASS" onclick="openRoomDetails('LIB_CLASS')">
                <rect x="750" y="50" width="150" height="150" rx="4" class="room-shape" />
                <text x="825" y="115" text-anchor="middle" class="map-sublabel" font-size="12">Library Class</text>
                <text x="825" y="135" text-anchor="middle" class="map-sublabel">E503</text>
            </g>
            
            <g class="room-group" data-id="LIBRARY" onclick="openRoomDetails('LIBRARY')">
                <rect x="900" y="50" width="150" height="300" rx="4" class="room-shape" />
                <text x="975" y="190" text-anchor="middle" class="map-label" font-size="20">BIBLIOTHEQUE</text>
                <text x="975" y="215" text-anchor="middle" class="map-sublabel">B203</text>
            </g>

            <!-- === MIDDLE ROW === -->
            <g class="room-group" data-id="ORANGE" onclick="openRoomDetails('ORANGE')">
                <rect x="350" y="350" width="300" height="100" rx="4" class="room-shape" />
                <text x="500" y="395" text-anchor="middle" class="map-label" font-size="24">ORANGE ROOM</text>
                <text x="500" y="420" text-anchor="middle" class="map-sublabel">A102</text>
                <text x="500" y="440" text-anchor="middle" class="map-sublabel" id="label-ORANGE">--</text>
            </g>
            
            <g class="room-group" data-id="GYM" onclick="openRoomDetails('GYM')">
                <rect x="750" y="350" width="300" height="300" rx="4" class="room-shape" />
                <text x="900" y="490" text-anchor="middle" class="map-label" font-size="32">GYMNASE</text>
                <text x="900" y="520" text-anchor="middle" class="map-sublabel" font-size="14">A103</text>
                <text x="900" y="545" text-anchor="middle" class="map-sublabel" id="label-GYM">--</text>
            </g>

            <!-- === BOTTOM ROW === -->
            <g class="room-group" data-id="BLUE" onclick="openRoomDetails('BLUE')">
                <rect x="50" y="650" width="200" height="150" rx="4" class="room-shape" />
                <text x="150" y="715" text-anchor="middle" class="map-label" font-size="20">BLUE ROOM</text>
                <text x="150" y="740" text-anchor="middle" class="map-sublabel">B201</text>
                <text x="150" y="760" text-anchor="middle" class="map-sublabel" id="label-BLUE">--</text>
            </g>
            
            <g class="room-group" data-id="NURSE" onclick="openRoomDetails('NURSE')">
                <rect x="350" y="500" width="150" height="100" rx="4" class="room-shape" />
                <text x="425" y="545" text-anchor="middle" class="map-sublabel" font-size="12">Infirmerie</text>
                <text x="425" y="565" text-anchor="middle" class="map-sublabel">F101</text>
            </g>
            
            <g class="room-group" data-id="CAFE" onclick="openRoomDetails('CAFE')">
                <rect x="350" y="600" width="150" height="150" rx="4" class="room-shape" />
                <text x="425" y="670" text-anchor="middle" class="map-label" font-size="18">CAFETERIA</text>
                <text x="425" y="695" text-anchor="middle" class="map-sublabel">B202</text>
            </g>
            
            <g class="room-group" data-id="KITCHEN" onclick="openRoomDetails('KITCHEN')">
                <rect x="500" y="650" width="150" height="100" rx="4" class="room-shape" />
                <text x="575" y="695" text-anchor="middle" class="map-label" font-size="14">Cuisine</text>
                <text x="575" y="715" text-anchor="middle" class="map-sublabel">F102</text>
            </g>
            
            <g class="room-group" data-id="ENGLISH" onclick="openRoomDetails('ENGLISH')">
                <rect x="750" y="650" width="150" height="100" rx="4" class="room-shape" />
                <text x="825" y="695" text-anchor="middle" class="map-sublabel" font-size="12">Salle Anglais</text>
                <text x="825" y="715" text-anchor="middle" class="map-sublabel">F103</text>
            </g>
            
            <g class="room-group" data-id="SCUB" onclick="openRoomDetails('SCUB')">
                <rect x="900" y="650" width="150" height="100" rx="4" class="room-shape" />
                <text x="975" y="695" text-anchor="middle" class="map-sublabel" font-size="12">Cubicle Sud</text>
                <text x="975" y="715" text-anchor="middle" class="map-sublabel">F104</text>
            </g>
            
            <!-- === RIGHT BUILDING === -->
            <g class="room-group" data-id="GREEN" onclick="openRoomDetails('GREEN')">
                <rect x="1150" y="200" width="200" height="150" rx="4" class="room-shape" />
                <text x="1250" y="265" text-anchor="middle" class="map-label" font-size="22">GREEN ROOM</text>
                <text x="1250" y="290" text-anchor="middle" class="map-sublabel">C301</text>
                <text x="1250" y="310" text-anchor="middle" class="map-sublabel" id="label-GREEN">--</text>
            </g>
            
            <g class="room-group" data-id="ART" onclick="openRoomDetails('ART')">
                <rect x="1150" y="500" width="200" height="150" rx="4" class="room-shape" />
                <text x="1250" y="565" text-anchor="middle" class="map-label" font-size="22">ART ROOM</text>
                <text x="1250" y="590" text-anchor="middle" class="map-sublabel">C302</text>
                <text x="1250" y="610" text-anchor="middle" class="map-sublabel" id="label-ART">--</text>
            </g>
            
            <g class="room-group" data-id="WET_REST" onclick="openRoomDetails('WET_REST')">
                <rect x="1150" y="650" width="100" height="100" rx="4" class="room-shape" />
                <text x="1200" y="695" text-anchor="middle" class="map-sublabel" font-size="10">Toilettes</text>
                <text x="1200" y="710" text-anchor="middle" class="map-sublabel" font-size="10">Humides</text>
                <text x="1200" y="725" text-anchor="middle" class="map-sublabel">G201</text>
            </g>
            
            <g class="room-group" data-id="DRY_REST" onclick="openRoomDetails('DRY_REST')">
                <rect x="1250" y="650" width="100" height="100" rx="4" class="room-shape" />
                <text x="1300" y="695" text-anchor="middle" class="map-sublabel" font-size="10">Toilettes</text>
                <text x="1300" y="710" text-anchor="middle" class="map-sublabel" font-size="10">Seches</text>
                <text x="1300" y="725" text-anchor="middle" class="map-sublabel">G202</text>
            </g>
            
            <g class="room-group" data-id="CHEMISTRY" onclick="openRoomDetails('CHEMISTRY')">
                <rect x="1350" y="200" width="150" height="550" rx="4" class="room-shape" />
                <text x="1425" y="470" text-anchor="middle" class="map-label" font-size="20" transform="rotate(-90, 1425, 470)">LABO CHIMIE - C303</text>
                <text x="1470" y="475" text-anchor="middle" class="map-sublabel" id="label-CHEMISTRY">--</text>
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
            loadMapData(); // Recharger les données quand la simulation se met à jour
        });
        window.mapUpdaterAttached = true;
    }
    
    // Rafraîchir les données toutes les 3 secondes (synchronisé avec la simulation)
    if (mapUpdateInterval) clearInterval(mapUpdateInterval);
    mapUpdateInterval = setInterval(() => loadMapData(), 3000);
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

    // Mettre à jour les informations de base
    setTxt('detail-room-id', room.name);
    setTxt('detail-room-type', typeNames[room.room_type] || room.room_type);
    
    // Afficher la température avec 1 décimale
    const temp = parseFloat(room.temperature) || 20;
    setTxt('detail-room-temp', temp.toFixed(1) + '°C');
    
    setTxt('detail-room-occ', `${room.occupancy} / ${room.capacity}`);
    
    console.log(`📊 Offcanvas mis à jour - ${room.id}: ${temp.toFixed(1)}°C, ${room.occupancy}/${room.capacity}`);
    
    // Mettre à jour le statut de la salle
    const ratio = room.occupancy / (room.capacity || 1);
    const statusCard = document.getElementById('detail-room-status-card');
    const statusIcon = document.getElementById('detail-room-status-icon');
    const statusText = document.getElementById('detail-room-status-text');
    
    if (statusCard && statusIcon && statusText) {
        if (ratio > 0.8) {
            statusCard.className = 'card bg-danger-subtle border-0 mb-4';
            statusIcon.className = 'rounded-circle bg-danger text-white p-2 me-3';
            statusIcon.innerHTML = '<i class="bi bi-x-lg"></i>';
            statusText.className = 'fw-bold text-danger-emphasis mb-0';
            statusText.innerText = 'Salle saturée';
        } else if (ratio > 0.5) {
            statusCard.className = 'card bg-warning-subtle border-0 mb-4';
            statusIcon.className = 'rounded-circle bg-warning text-white p-2 me-3';
            statusIcon.innerHTML = '<i class="bi bi-exclamation-lg"></i>';
            statusText.className = 'fw-bold text-warning-emphasis mb-0';
            statusText.innerText = 'Salle occupée';
        } else if (room.occupancy > 0) {
            statusCard.className = 'card bg-info-subtle border-0 mb-4';
            statusIcon.className = 'rounded-circle bg-info text-white p-2 me-3';
            statusIcon.innerHTML = '<i class="bi bi-people"></i>';
            statusText.className = 'fw-bold text-info-emphasis mb-0';
            statusText.innerText = 'Partiellement occupée';
        } else {
            statusCard.className = 'card bg-success-subtle border-0 mb-4';
            statusIcon.className = 'rounded-circle bg-success text-white p-2 me-3';
            statusIcon.innerHTML = '<i class="bi bi-check-lg"></i>';
            statusText.className = 'fw-bold text-success-emphasis mb-0';
            statusText.innerText = 'Actuellement libre';
        }
    }
    
    // Load bookings for this room
    try {
        const bookings = await API.getBookingsByRoom(roomId);
        const nextBooking = bookings.find(b => new Date(b.start_time) > new Date());
        if (nextBooking) {
            const time = new Date(nextBooking.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            setTxt('detail-room-schedule', `Réservé à ${time}`);
        } else {
            setTxt('detail-room-schedule', 'Aucune réservation prévue');
        }
    } catch (error) {
        console.error('Erreur chargement réservations:', error);
        setTxt('detail-room-schedule', 'Non disponible');
    }
}

// Export for global usage
window.updateMapMode = (mode) => {
    currentMapMode = mode;
    refreshMapColors();
    
    // Mettre à jour la légende
    if (Router && typeof Router.updateMapLegend === 'function') {
        Router.updateMapLegend(mode);
    }
};
window.renderMap = renderMap;
window.loadMapData = loadMapData;
window.openRoomDetails = openRoomDetails;
window.MAP_ZONES = MAP_ZONES; // Export for debugging

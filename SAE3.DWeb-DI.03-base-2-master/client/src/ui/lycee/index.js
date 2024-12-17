import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

let LyceeView = {};

let markers = L.markerClusterGroup({
    zoomToBoundsOnClick: false // Prevent zooming on cluster click
});
LyceeView.render = function(lycees, map) {
    // Initialisation de la carte
    map = L.map('map').setView([45.836252, 1.231627], 6); // Vue par défaut
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    if (!map) {
        console.error("Map object is undefined");
        return;
    }

    // Initialisation des clusters (un cluster global pour tout niveau de zoom)
    const markerCluster = L.markerClusterGroup({
        zoomToBoundsOnClick: false,
        disableClusteringAtZoom: 15 // Désactiver le clustering à partir du zoom 15
    });

    // Ajout des marqueurs
    function renderMarkers(lycees) {
        markerCluster.clearLayers(); // Nettoie les anciens marqueurs du cluster

        lycees.forEach((lycee) => {
            if (!lycee.latitude || !lycee.longitude) return;

            const nbcandidat = lycee.nbCandidat || 0;
            const marker = L.marker([parseFloat(lycee.latitude), parseFloat(lycee.longitude)])
                .bindPopup(`<b>${lycee.appellation_officielle}</b><br>Nombre de candidats : ${nbcandidat}`);
            
            markerCluster.addLayer(marker);
        });

        map.addLayer(markerCluster); // Ajoute le cluster mis à jour à la carte
    }

    // Détection et log des doublons
    function detectDuplicates(arr) {
        const seen = new Set();
        const duplicates = arr.filter((item) => {
            const key = `${item.latitude},${item.longitude}`;
            if (seen.has(key)) return true;
            seen.add(key);
            return false;
        });
        return duplicates;
    }

    // Log des informations sur les lycées
    function logLyceeInfo(lycees) {
        const duplicates = detectDuplicates(lycees);
        console.log(`Total lycées : ${lycees.length}`);
        console.log(`Doublons détectés : ${duplicates.length}`);
        console.log(`Nombre total de marqueurs dans le cluster : ${markerCluster.getLayers().length}`);
    }

    // Gestion du zoom
    map.on('zoomend', () => {
        const zoom = map.getZoom();
        console.log("Zoom actuel :", zoom);
        logLyceeInfo(lycees);
        renderMarkers(lycees); // Met à jour les clusters pour le zoom actuel
    });

    // Initialisation des clusters au démarrage
    renderMarkers(lycees);
    logLyceeInfo(lycees);

    // Gestion des clics sur les clusters
    markerCluster.on('clusterclick', function (a) {
        const markers = a.layer.getAllChildMarkers();
        const totalCandidats = markers.reduce((sum, marker) => {
            const popupContent = marker.getPopup().getContent();
            const match = popupContent.match(/Nombre de candidats : (\d+)/);
            return sum + (match ? parseInt(match[1]) : 0);
        }, 0);

        a.layer.bindPopup(`Nombre total de candidats : ${totalCandidats}`).openPopup();
    });
};


export { LyceeView };
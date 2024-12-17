import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

let LyceeView = {};


LyceeView.render = function(lycees, map) {
    // Initialisation de la carte
    map = L.map('map').setView([45.836252, 1.231627], 0); // Vue par défaut
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const markerCluster = L.markerClusterGroup({
        zoomToBoundsOnClick: false,
        disableClusteringAtZoom: 15 
    });

    function renderMarkers(lycees) {
        markerCluster.clearLayers();
        let totalCandidats = 0; 
    
        lycees.forEach((lycee) => {
            const nbcandidat = lycee.nbCandidat || 0;
            totalCandidats += nbcandidat;
    
            const marker = L.marker([parseFloat(lycee.latitude), parseFloat(lycee.longitude)])
                .bindPopup(`<b>${lycee.appellation_officielle}</b><br>Nombre de candidats : ${nbcandidat}`);
            
            markerCluster.addLayer(marker);
        });
    
        console.log(`Nombre total de candidats : ${totalCandidats}`);
    
        map.addLayer(markerCluster); 
    }
    map.on('zoomend', () => {
        renderMarkers(lycees); 
    });
    renderMarkers(lycees);
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
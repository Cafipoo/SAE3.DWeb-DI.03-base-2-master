import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Chart } from '../chart/index.js';

let LyceeView = {};
let filteredLycees = [];
let filteredPostBac = [];
let map;
let circle;
let lyceeCluster;
let circleActive = true; // État actif ou non du filtre du cercle

LyceeView.render = function (lycees, postBac, mapValue) {
    mapValue = mapValue * 1000;

    // Initialisation de la carte
    if (!map) {
        map = L.map('map').setView([45.836252, 1.231627], 7);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        lyceeCluster = L.markerClusterGroup({ zoomToBoundsOnClick: false });
    }

    // Supprimer le cercle existant
    if (circle) {
        map.removeLayer(circle);
    }

    // Ajouter un nouveau cercle
    circle = L.circle([45.836252, 1.231627], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: mapValue,
    }).addTo(map);

    // Gestion du cluster
    lyceeCluster.on('clusterclick', function (event) {
        const markers = event.layer.getAllChildMarkers();
        let popupContent = `<b>Informations sur le cluster :</b><br>`;
        let generalTotal = 0, sti2dTotal = 0, postBacTotal = 0, autresTotal = 0, candidatsTotal = 0;

        markers.forEach((marker) => {
            const { categorizedSeries, lyceeCandidats, postBacCandidats } = marker;

            if (categorizedSeries) {
                generalTotal += categorizedSeries.Général || 0;
                sti2dTotal += categorizedSeries.STI2D || 0;
                postBacTotal += categorizedSeries.PostBac || 0;
                autresTotal += categorizedSeries.Autres || 0;
            }

            candidatsTotal += (lyceeCandidats || 0) + (postBacCandidats || 0);
        });

        popupContent += `
            Total de candidats : ${candidatsTotal}<br>
            Général : ${generalTotal}<br>
            STI2D : ${sti2dTotal}<br>
            Post-Bac : ${postBacTotal}<br>
            Autres : ${autresTotal}
        `;

        event.layer.bindPopup(popupContent).openPopup();
    });

    function categorizeSeries(series) {
        const categories = {
            Général: ['GEN', 'L', 'ES', 'S', 'Générale'],
            STI2D: ['STI2D'],
            PostBac: ['Post-Bac'],
        };

        const result = { Général: 0, STI2D: 0, PostBac: 0, Autres: 0 };

        series.forEach((serie) => {
            let found = false;

            for (const [category, codes] of Object.entries(categories)) {
                if (codes.includes(serie.SerieDiplomeCode)) {
                    result[category] += serie.nbCandidat || 0;
                    found = true;
                    break;
                }
            }

            if (!found) {
                result.Autres += serie.nbCandidat || 0;
            }
        });

        return result;
    }

    function renderLyceeMarkers(lycees) {
        lyceeCluster.clearLayers();

        lycees.forEach((lycee) => {
            if (lycee.latitude == null || lycee.longitude == null) return;

            const markerLatLng = L.latLng(parseFloat(lycee.latitude), parseFloat(lycee.longitude));
            if (circleActive && circle.getLatLng().distanceTo(markerLatLng) > circle.getRadius()) return;

            const totalCandidats = lycee.series.reduce((sum, serie) => sum + (serie.nbCandidat || 0), 0);
            const categorizedSeries = categorizeSeries(lycee.series);

            const marker = L.marker(markerLatLng, {}).bindPopup(`
                <b>${lycee.appellation_officielle}</b><br>
                Nombre de candidats : ${totalCandidats}<br>
                Général : ${categorizedSeries.Général}<br>
                STI2D : ${categorizedSeries.STI2D}<br>
                Post-Bac : ${categorizedSeries.PostBac}<br>
                Autres : ${categorizedSeries.Autres}
            `);

            marker.lyceeCandidats = totalCandidats;
            marker.categorizedSeries = categorizedSeries;
            lyceeCluster.addLayer(marker);
        });

        map.addLayer(lyceeCluster);
    }

    function renderPostBacMarkers(postBac) {
        postBac.forEach((pb) => {
            const geopoint = pb.coordonnees && pb.coordonnees._geopoint;
            if (!geopoint) return;

            const [latitude, longitude] = geopoint.split(',').map(Number);
            const markerLatLng = L.latLng(latitude, longitude);
            if (circleActive && circle.getLatLng().distanceTo(markerLatLng) > circle.getRadius()) return;

            const marker = L.marker(markerLatLng, {
                icon: L.divIcon({
                    className: 'postbac-marker',
                    html: `<div class="postbac-marker-visible" style="background-color: #ff5733; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>`,
                }),
            }).bindPopup(`
                <b>Post-Bac</b><br>
                Commune : ${pb.coordonnees.nom_de_la_commune} (${pb.coordonnees.code_postal})<br>
                Nombre de candidats : ${pb.nbCandidats || 0}
            `);

            marker.postBacCandidats = pb.nbCandidats || 0;
            marker.categorizedSeries = { Général: 0, STI2D: 0, PostBac: pb.nbCandidats || 0, Autres: 0 };

            lyceeCluster.addLayer(marker);
        });
    }

    function updateMarkers() {
        if (!circleActive) {
            if (circle) map.removeLayer(circle); // Masquer le cercle
        } else {
            if (!map.hasLayer(circle)) map.addLayer(circle); // Réafficher le cercle si actif
        }

        const bounds = circleActive ? circle.getBounds() : L.latLngBounds([[-90, -180], [90, 180]]);
        const filteredLycees = lycees.filter((lycee) => {
            if (lycee.latitude == null || lycee.longitude == null) return false;
            const markerLatLng = L.latLng(parseFloat(lycee.latitude), parseFloat(lycee.longitude));
            return bounds.contains(markerLatLng);
        });

        const filteredPostBac = postBac.filter((pb) => {
            const geopoint = pb.coordonnees && pb.coordonnees._geopoint;
            if (!geopoint) return false;
            const [latitude, longitude] = geopoint.split(',').map(Number);
            const markerLatLng = L.latLng(latitude, longitude);
            return bounds.contains(markerLatLng);
        });

        renderLyceeMarkers(filteredLycees);
        renderPostBacMarkers(filteredPostBac);

        let chart = document.getElementById('chart-slider').value;
        Chart.render(filteredLycees, filteredPostBac, chart);
        return { filteredLycees, filteredPostBac };
    }

    // Ajout d'un gestionnaire pour le bouton de bascule
    document.getElementById('toggle-circle').addEventListener('click', () => {
        circleActive = !circleActive;
        updateMarkers();
    });

    updateMarkers();
};

export { LyceeView, filteredLycees, filteredPostBac};

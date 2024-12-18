import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {Chart} from '../chart/index.js';

let LyceeView = {};
let circlePopupValues = {};

LyceeView.render = function (lycees, postBac) {
    // Initialisation de la carte
    let map = L.map('map').setView([45.836252, 1.231627], 7);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const defaultRadius = 650000; // Rayon par défaut en mètres
    let circle = L.circle([45.836252, 1.231627], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: defaultRadius,
    }).addTo(map);

    let circleActive = true;

    const lyceeCluster = L.markerClusterGroup({ zoomToBoundsOnClick: false });

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

    lyceeCluster.on('clusterclick', function (event) {
        const markers = event.layer.getAllChildMarkers(); // Obtenir tous les marqueurs du cluster

        // Créer un résumé des informations dans le cluster
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

    function calculateCircleTotals(bounds) {
        const totals = { Général: 0, STI2D: 0, PostBac: 0, Autres: 0, Total: 0 };

        lycees.forEach((lycee) => {
            if (lycee.latitude == null || lycee.longitude == null) return;

            const markerLatLng = L.latLng(parseFloat(lycee.latitude), parseFloat(lycee.longitude));
            if (!bounds.contains(markerLatLng)) return;

            const categorizedSeries = categorizeSeries(lycee.series);
            totals.Général += categorizedSeries.Général;
            totals.STI2D += categorizedSeries.STI2D;
            totals.PostBac += categorizedSeries.PostBac;
            totals.Autres += categorizedSeries.Autres;
            totals.Total += Object.values(categorizedSeries).reduce((a, b) => a + b, 0);
        });

        postBac.forEach((pb) => {
            const geopoint = pb.coordonnees && pb.coordonnees._geopoint;
            if (!geopoint) return;

            const [latitude, longitude] = geopoint.split(',').map(Number);
            const markerLatLng = L.latLng(latitude, longitude);
            if (!bounds.contains(markerLatLng)) return;

            totals.PostBac += pb.nbCandidats || 0;
            totals.Total += pb.nbCandidats || 0;
        });

        return totals;
    }

    function renderLyceeMarkers(lycees, bounds) {
        lyceeCluster.clearLayers();

        lycees.forEach((lycee) => {
            if (lycee.latitude == null || lycee.longitude == null) return;

            const markerLatLng = L.latLng(parseFloat(lycee.latitude), parseFloat(lycee.longitude));
            if (circleActive && !bounds.contains(markerLatLng)) return;

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

    function renderPostBacMarkers(postBac, bounds) {
        postBac.forEach((pb) => {
            const geopoint = pb.coordonnees && pb.coordonnees._geopoint;
            if (!geopoint) return;

            const [latitude, longitude] = geopoint.split(',').map(Number);
            const markerLatLng = L.latLng(latitude, longitude);
            if (circleActive && !bounds.contains(markerLatLng)) return;

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

    function updateCirclePopup() {
        const bounds = circle.getBounds();
        const totals = calculateCircleTotals(bounds);

        circle.bindPopup(`
            <b>Statistiques dans le cercle :</b><br>
            Total de candidats : ${totals.Total}<br>
            Général : ${totals.Général}<br>
            STI2D : ${totals.STI2D}<br>
            Post-Bac : ${totals.PostBac}<br>
            Autres : ${totals.Autres}
        `).openPopup();
        const circlePopup = {
            getLatLng: () => circle.getLatLng(),
            getPopupContent: () => {
                const bounds = circle.getBounds();
                const totals = calculateCircleTotals(bounds);
                return {
                    Total: totals.Total,
                    Générale: totals.Général,
                    STI2D: totals.STI2D,
                    PostBac: totals.PostBac,
                    Autres: totals.Autres,
                };
            }
        };
        circlePopupValues = circlePopup.getPopupContent();
        return circlePopupValues;
    }

    function updateMarkers() {
        const bounds = circle.getBounds();

        if (circleActive) {
            map.removeLayer(lyceeCluster);
            updateCirclePopup();
            Chart.render(lycees,postBac);
        } else {
            renderLyceeMarkers(lycees, L.latLngBounds([[-90, -180], [90, 180]]));
            renderPostBacMarkers(postBac, L.latLngBounds([[-90, -180], [90, 180]]));
            map.addLayer(lyceeCluster);
        }
    }

    function toggleCircle() {
        circleActive = !circleActive;
        if (circleActive) {
            map.addLayer(circle);
            map.removeLayer(lyceeCluster);
            updateMarkers();
        } else {
            map.removeLayer(circle);
            renderLyceeMarkers(lycees, L.latLngBounds([[-90, -180], [90, 180]]));
            renderPostBacMarkers(postBac, L.latLngBounds([[-90, -180], [90, 180]]));
            map.addLayer(lyceeCluster);
        }
    }

    document.getElementById('toggle-circle').addEventListener('click', toggleCircle);

    window.updateMapRadius = function (value) {
        document.getElementById('map-value').innerText = value + ' km';
        const radiusInMeters = parseInt(value) * 1000;
        circle.setRadius(radiusInMeters);

        if (circleActive) updateMarkers();
    };


    updateMarkers();
};

export { LyceeView };

export { circlePopupValues };

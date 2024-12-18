import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

let LyceeView = {};

LyceeView.render = function(lycees, postBac) {
    // Initialisation de la carte
    let map = L.map('map').setView([45.836252, 1.231627], 10);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Groupe de clusters pour lycées et post-bac
    const lyceeCluster = L.markerClusterGroup({
        zoomToBoundsOnClick: false // Prevent zooming on cluster click
    });

    // Fonction pour catégoriser les séries
    function categorizeSeries(series) {
        const categories = {
            Général: ['GEN', 'L', 'ES', 'S', 'Générale'],
            STI2D: ['STI2D'],
            PostBac: ['Post-Bac'],
        };

        const result = { Général: 0, STI2D: 0, PostBac: 0, Autres: 0 };

        series.forEach((serie) => {
            let found = false;

            // Vérifie dans quelle catégorie appartient la série
            for (const [category, codes] of Object.entries(categories)) {
                if (codes.includes(serie.SerieDiplomeCode)) {
                    result[category] += serie.nbCandidat || 0;
                    found = true;
                    break;
                }
            }

            // Si la série ne correspond à aucune catégorie définie, la placer dans "Autres"
            if (!found) {
                result.Autres += serie.nbCandidat || 0;
            }
        });

        return result;
    }

    // Fonction pour ajouter les marqueurs des lycées
    function renderLyceeMarkers(lycees) {
        lycees.forEach((lycee) => {
            if (lycee.latitude == null || lycee.longitude == null) return;

            const totalCandidats = lycee.series.reduce((sum, serie) => sum + (serie.nbCandidat || 0), 0);
            const categorizedSeries = categorizeSeries(lycee.series);

            const marker = L.marker([parseFloat(lycee.latitude), parseFloat(lycee.longitude)], {
                icon: L.divIcon({
                    className: 'lycee-marker',
                    html: `<div style="background-color: #3388ff; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>`,
                }),
            }).bindPopup(`
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

    // Fonction pour ajouter les marqueurs des post-bacs
    function renderPostBacMarkers(postBac) {
        postBac.forEach((pb) => {
            const geopoint = pb.coordonnees && pb.coordonnees._geopoint;
            if (!geopoint) return;

            const [latitude, longitude] = geopoint.split(',').map(Number);
            if (!latitude || !longitude) return;

            const marker = L.marker([latitude, longitude], {
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

            // Ajouter les marqueurs au cluster pour qu'ils soient comptabilisés
            lyceeCluster.addLayer(marker);

            // Stocker un attribut pour les masquer/afficher facilement
            marker._isPostBac = true;
        });
    }

    // Rendu des marqueurs
    renderLyceeMarkers(lycees);
    renderPostBacMarkers(postBac);

    // Fonction pour masquer ou afficher les marqueurs post-bac
    function togglePostBacMarkers() {
        const currentZoom = map.getZoom();
        lyceeCluster.eachLayer((marker) => {
            if (marker._isPostBac) {
                const markerEl = marker.getElement();
                if (markerEl) {
                    if (currentZoom > 10) {
                        // Afficher les marqueurs post-bac
                        markerEl.style.display = 'block';
                    } else {
                        // Cacher les marqueurs post-bac
                        markerEl.style.display = 'none';
                    }
                }
            }
        });
    }

    // Gérer l'événement de zoom pour afficher/masquer les marqueurs post-bac
    map.on('zoomend', togglePostBacMarkers);

    // Affichage des informations dans les clusters lors du clic
    function configureClusterEvents(clusterGroup) {
        clusterGroup.on('clusterclick', function (a) {
            const markers = a.layer.getAllChildMarkers();
            let totalCandidats = 0;
            let categorizedCounts = { Général: 0, STI2D: 0, PostBac: 0, Autres: 0 };

            markers.forEach(marker => {
                if (marker.lyceeCandidats) {
                    totalCandidats += marker.lyceeCandidats;
                    const categories = marker.categorizedSeries;
                    for (const key in categories) {
                        categorizedCounts[key] += categories[key];
                    }
                } else if (marker.postBacCandidats) {
                    totalCandidats += marker.postBacCandidats;
                    categorizedCounts.PostBac += marker.postBacCandidats;
                }
            });

            const seriesInfo = `
                Général : ${categorizedCounts.Général}<br>
                STI2D : ${categorizedCounts.STI2D}<br>
                Post-Bac : ${categorizedCounts.PostBac}<br>
                Autres : ${categorizedCounts.Autres}
            `;

            a.layer.bindPopup(`Nombre total de candidats : ${totalCandidats}<br>${seriesInfo}`).openPopup();
        });
    }

    configureClusterEvents(lyceeCluster);

    // Ajouter le cluster à la carte
    map.addLayer(lyceeCluster);

    // Masquer les post-bac initialement
    togglePostBacMarkers();
};

export { LyceeView };

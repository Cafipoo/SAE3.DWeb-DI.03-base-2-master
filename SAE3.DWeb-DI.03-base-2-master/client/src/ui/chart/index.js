import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


let Chart = {};

Chart.render = function(lycees, postBac) {
    console.log(lycees, postBac);

    let seriesCountByPostalCode = {};

    // Préparer les données pour les lycées
    lycees.forEach(lycee => {
        if (!seriesCountByPostalCode[lycee.code_postal_uai]) {
            seriesCountByPostalCode[lycee.code_postal_uai] = {
                "Générale": 0,
                "STI2D": 0,
                "Post-Bac": 0,
                "Autres": 0
            };
        }

        lycee.series.forEach(serie => {
            if (seriesCountByPostalCode[lycee.code_postal_uai].hasOwnProperty(serie.SerieDiplomeCode)) {
                seriesCountByPostalCode[lycee.code_postal_uai][serie.SerieDiplomeCode] += serie.nbCandidat;
            } else {
                seriesCountByPostalCode[lycee.code_postal_uai]["Autres"] += serie.nbCandidat;
            }
        });
    });

    // Préparer les données pour les post-bacs
    postBac.forEach(pb => {
        const codePostal = pb.coordonnees.code_postal;
        if (!seriesCountByPostalCode[codePostal]) {
            seriesCountByPostalCode[codePostal] = {
                "Générale": 0,
                "STI2D": 0,
                "Post-Bac": 0,
                "Autres": 0
            };
        }
        seriesCountByPostalCode[codePostal]["Post-Bac"] += pb.nbCandidats || 0;
    });

    // Préparer les données pour la chart
    const seriesData = {
        "Générale": [],
        "STI2D": [],
        "Post-Bac": [],
        "Autres": []
    };
    const categories = [];

    for (const [codePostal, counts] of Object.entries(seriesCountByPostalCode)) {
        categories.push(codePostal);
        seriesData["Générale"].push(counts["Générale"]);
        seriesData["STI2D"].push(counts["STI2D"]);
        seriesData["Post-Bac"].push(counts["Post-Bac"]);
        seriesData["Autres"].push(counts["Autres"]);
    }
    const sortedData = categories.map((category, index) => {
        return {
            category,
            "Générale": seriesData["Générale"][index],
            "STI2D": seriesData["STI2D"][index],
            "Post-Bac": seriesData["Post-Bac"][index],
            "Autres": seriesData["Autres"][index]
        };
    }).sort((a, b) => a.category - b.category);

    categories.length = 0;
    seriesData["Générale"].length = 0;
    seriesData["STI2D"].length = 0;
    seriesData["Post-Bac"].length = 0;
    seriesData["Autres"].length = 0;

    sortedData.forEach(data => {
        categories.push(data.category);
        seriesData["Générale"].push(data["Générale"]);
        seriesData["STI2D"].push(data["STI2D"]);
        seriesData["Post-Bac"].push(data["Post-Bac"]);
        seriesData["Autres"].push(data["Autres"]);
    });

    const options = {
        series: [
            { name: 'Générale', data: seriesData["Générale"] },
            { name: 'STI2D', data: seriesData["STI2D"] },
            { name: 'Post-Bac', data: seriesData["Post-Bac"] },
            { name: 'Autres', data: seriesData["Autres"] }
        ],
        chart: {
            type: 'bar',
            height: categories.length * 30,
            stacked: true,
            width: '100%',
        },
        plotOptions: {
            bar: {
                horizontal: true,
                dataLabels: {
                    total: {
                        enabled: true,
                        offsetX: 0,
                        style: {
                            fontSize: '13px',
                            fontWeight: 900
                        }
                    }
                }
            },
        },
        stroke: {
            width: 1,
            colors: ['#fff']
        },
        title: {
            text: 'Répartition des candidats par code postal'
        },
        xaxis: {
            categories: categories,
            labels: {
                formatter: function (val) {
                    return val;
                }
            }
        },
        yaxis: {
            title: {
                text: undefined
            },
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val;
                }
            }
        },
        fill: {
            opacity: 1
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            offsetX: 40
        }
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
};

export { Chart };
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


let Chart = {};

let chartInstance = null;

Chart.render = function(lycees, postBac, chart) {

    let seriesCountByPostalCode = {};

    lycees.forEach(lycee => {
        if (!seriesCountByPostalCode[lycee.code_postal_uai]) {
            seriesCountByPostalCode[lycee.code_postal_uai] = {
                "Générale": 0,
                "STI2D": 0,
                "Post-Bac": 0,
                "Autres": 0,
                "Total": 0
            };
        }

        lycee.series.forEach(serie => {
            if (seriesCountByPostalCode[lycee.code_postal_uai].hasOwnProperty(serie.SerieDiplomeCode)) {
                seriesCountByPostalCode[lycee.code_postal_uai][serie.SerieDiplomeCode] += serie.nbCandidat;
            } else {
                seriesCountByPostalCode[lycee.code_postal_uai]["Autres"] += serie.nbCandidat;
            }
            seriesCountByPostalCode[lycee.code_postal_uai]["Total"] += serie.nbCandidat;
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
                "Autres": 0,
                "Total": 0
            };
        }
        seriesCountByPostalCode[codePostal]["Post-Bac"] += pb.nbCandidats || 0;
        seriesCountByPostalCode[codePostal]["Total"] += pb.nbCandidats || 0;
    });

    // Trier les départements par ordre décroissant de candidatures
    const sortedData = Object.entries(seriesCountByPostalCode).map(([codePostal, counts]) => {
        return {
            codePostal,
            ...counts
        };
    }).sort((a, b) => b.Total - a.Total);

    // Regrouper les départements en dessous du seuil
    const seriesData = {
        "Générale": [],
        "STI2D": [],
        "Post-Bac": [],
        "Autres": []
    };
    const categories = [];
    let autres = {
        "Générale": 0,
        "STI2D": 0,
        "Post-Bac": 0,
        "Autres": 0
    };

    sortedData.forEach(data => {
        if (data.Total <= chart) {
            autres["Générale"] += data["Générale"];
            autres["STI2D"] += data["STI2D"];
            autres["Post-Bac"] += data["Post-Bac"];
            autres["Autres"] += data["Autres"];
        } else {
            categories.push(data.codePostal);
            seriesData["Générale"].push(data["Générale"]);
            seriesData["STI2D"].push(data["STI2D"]);
            seriesData["Post-Bac"].push(data["Post-Bac"]);
            seriesData["Autres"].push(data["Autres"]);
        }
    });

    if (autres["Générale"] > 0 || autres["STI2D"] > 0 || autres["Post-Bac"] > 0 || autres["Autres"] > 0) {
        categories.push("Autres départements");
        seriesData["Générale"].push(autres["Générale"]);
        seriesData["STI2D"].push(autres["STI2D"]);
        seriesData["Post-Bac"].push(autres["Post-Bac"]);
        seriesData["Autres"].push(autres["Autres"]);
    }

    const options = {
        series: [
            { name: 'Générale', data: seriesData["Générale"] },
            { name: 'STI2D', data: seriesData["STI2D"] },
            { name: 'Post-Bac', data: seriesData["Post-Bac"] },
            { name: 'Autres', data: seriesData["Autres"] }
        ],
        chart: {
            type: 'bar',
            height: 1000, // Ajuster la hauteur en fonction du nombre de catégories
            stacked: true,
            width: '100%', // Prendre toute la largeur disponible
            toolbar: {
                show: true
            },
            animations: {
                enabled: false // Désactiver les animations
            }
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

    if (chartInstance) {
        chartInstance.updateOptions(options);
    } else {
        chartInstance = new ApexCharts(document.querySelector("#chart"), options);
        chartInstance.render();
    }
};


export { Chart };
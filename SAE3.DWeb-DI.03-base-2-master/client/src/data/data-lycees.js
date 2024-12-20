import { Candidats } from "./data-candidats.js";

let dataPromise = fetch("./src/data/json/lycees.json").then(response => response.json());

let Lycees = {};

Lycees.getLyceecandidat = async function(candidats) {
    let data = await dataPromise;
    let sortedData = data.sort((a, b) => a.numero_uai.localeCompare(b.numero_uai));

    function binarySearch(arr, x, key) {
        let low = 0, high = arr.length - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            if (arr[mid][key] === x) return arr[mid];
            else if (arr[mid][key] < x) low = mid + 1;
            else high = mid - 1;
        }
        return null;
    }

    let totalCandidats = 0;
    let lyceesMap = new Map();

    for (let candidat of candidats) {
        let lycee = binarySearch(sortedData, candidat.ecole, 'numero_uai');

        if (lycee && lycee.longitude && lycee.latitude) {
            let key = lycee.numero_uai;
            if (!lyceesMap.has(key)) {
                lyceesMap.set(key, {
                    appellation_officielle: lycee.appellation_officielle,
                    longitude: lycee.longitude,
                    latitude: lycee.latitude,
                    code_postal_uai: lycee.code_postal_uai.slice(0, -3) + '000',
                    series: []
                });
            }
            let lyceeData = lyceesMap.get(key);
            for (let serie of candidat.series) {
                lyceeData.series.push({
                    SerieDiplomeCode: serie.SerieDiplomeCode,
                    nbCandidat: serie.nbCandidats
                });
                totalCandidats += serie.nbCandidats;
            }
        }
    }

    let result = Array.from(lyceesMap.values());
    result.sort((a, b) => a.code_postal_uai.localeCompare(b.code_postal_uai));
    return result;
}

export { Lycees };
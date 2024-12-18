import { Candidats } from "./data-candidats.js";

let data = await fetch("./src/data/json/lycees.json");
data = await data.json();

let Lycees = {}

Lycees.getAll = function(){ 
    return data.slice(1).map(lycee => ({
            appellation_officielle: lycee.appellation_officielle,
            longitude: lycee.longitude,
            latitude: lycee.latitude
        })
    );
}
Lycees.getEcole = function(candidats){
    let result = [];
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
    for (let candidat of candidats) {
        let lycee = binarySearch(sortedData, candidat.ecole, 'numero_uai') || binarySearch(sortedData, candidat.ecole, 'appellation_officielle');
        if (lycee && lycee.longitude && lycee.latitude) {
            result.push({
                appellation_officielle: lycee.appellation_officielle,
                longitude: lycee.longitude,
                latitude: lycee.latitude,
                nbCandidat: candidat.nbCandidat
            });
            totalCandidats += candidat.nbCandidat;
        }  
    }
    console.log("Total candidats:", totalCandidats);
    return result;
}
Lycees.getLyceecandidat = function(candidats){
    let result = [];
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
    let lyceesMap = new Map(); // Utilisation d'une Map pour regrouper les données par lycée

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
            for (let serie of candidat.series) {
                lyceesMap.get(key).series.push({
                    SerieDiplomeCode: serie.SerieDiplomeCode,
                    nbCandidat: serie.nbCandidats
                });
                totalCandidats += serie.nbCandidats;
            }
        }
    }

    result = Array.from(lyceesMap.values());
    result.sort((a, b) => a.code_postal_uai.localeCompare(b.code_postal_uai));
    return result;
}

export { Lycees };
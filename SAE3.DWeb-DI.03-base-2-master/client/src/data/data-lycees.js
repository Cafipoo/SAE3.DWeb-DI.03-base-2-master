

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
    for (let candidat of candidats) {
        for (let lycee of data) {
            if (lycee.numero_uai == candidat.ecole){
                result.push({
                    numero_uai: lycee.numero_uai,
                    appellation_officielle: lycee.appellation_officielle,
                    longitude: lycee.longitude,
                    latitude: lycee.latitude,
                    nbCandidat: candidat.nbCandidat
                });
            }
        }
    }
    return result;
}

export { Lycees };
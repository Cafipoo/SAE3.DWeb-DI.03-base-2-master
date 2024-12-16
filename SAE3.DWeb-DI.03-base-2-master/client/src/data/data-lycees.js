

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

export { Lycees };
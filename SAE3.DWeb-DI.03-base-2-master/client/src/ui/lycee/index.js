import {Lycees} from "../../data/data-lycees.js";



let LyceeView = {};

LyceeView.render = function(lycees){
    var map = L.map('map').setView([45.836252, 1.231627], 7);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    /*Itération 4 */

    // let x = "";
    // let y = "";
    // let nom = "";
    // console.log(lycees);
    // lycees.forEach(lycee => {
    //     x = lycee.latitude;
    //     y = lycee.longitude; 
    //     nom = lycee.appellation_officielle;

    //     if (x === "" || y === "" || nom === ""){
    //         return;
    //     }
    //     L.marker([x, y]).
    //     addTo(map).
    //     bindPopup(nom);
    // });

    /*Itération 5 */
    let x = "";
    let y = "";
    let nom = "";
    let nb = "";
    console.log(lycees);
    lycees.forEach(lycee => {
        x = lycee.latitude;
        y = lycee.longitude; 
        nom = lycee.appellation_officielle;
        nb = lycee.nbCandidat;

        if (x === "" || y === "" || nom === ""){
            return;
        }
        L.marker([x, y]).
        addTo(map).
        bindPopup(nom + "<br>" + " Nombre de candidats : " + nb);
        console.log(nb);
    });
}

export { LyceeView };
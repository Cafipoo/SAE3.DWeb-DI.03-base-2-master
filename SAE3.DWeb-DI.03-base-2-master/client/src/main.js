import { HeaderView } from "./ui/header/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import './index.css';

import L from 'leaflet';


let C = {};

C.init = async function(){
    V.init();
    console.log(Candidats.getAll());
    console.log(Lycees.getAll());
}

let V = {
    header: document.querySelector("#header")
};

V.init = function(){
    V.renderHeader();
    V.renderMap();
}

V.renderHeader= function(){
    V.header.innerHTML = HeaderView.render();
}

V.renderMap = function(){
    var map = L.map('map').setView([45.836252, 1.231627], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

C.init();
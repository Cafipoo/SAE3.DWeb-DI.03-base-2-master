import { HeaderView } from "./ui/header/index.js";
import { LyceeView } from "./ui/lycee/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import './index.css';

import L from 'leaflet';


let C = {};

C.init = async function(){
    V.init();
    // console.log(Candidats.getAll());
    // console.log(Candidats.getEcole());
    // console.log(Lycees.getAll());
    
}

let V = {
    header: document.querySelector("#header"),
    map: document.querySelector("#map"),
};

V.init = async function(){
    V.renderHeader();
    V.renderMarker();
}

V.renderHeader= function(){
    V.header.innerHTML = HeaderView.render();
}

V.renderMarker = function(){
    let candidats = Candidats.getEcole();
    LyceeView.render(Lycees.getEcole(candidats));
}


C.init();
import { HeaderView } from "./ui/header/index.js";
import { LyceeView } from "./ui/lycee/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { Codes } from "./data/data-code.js";
import './index.css';

import L from 'leaflet';


let C = {};

C.init = async function(){
    V.init();
    // let candidats = Candidats.getDiplomesParLycée();
    // console.log(Lycees.getLyceecandidat(candidats));
    // console.log(Candidats.getPostBack());
    // console.log(Codes.getAll());
    console.log(Candidats.getPostBacByDepartement());
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
    const lycees = Lycees.getLyceecandidat(Candidats.getDiplomesParLycée());
    const postBac = Candidats.getPostBacByDepartement();
    LyceeView.render(lycees, postBac);
}


C.init();
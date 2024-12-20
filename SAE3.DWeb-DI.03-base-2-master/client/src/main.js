import { HeaderView } from "./ui/header/index.js";
import { LyceeView } from "./ui/lycee/index.js";
import { Candidats } from "./data/data-candidats.js";
import { Lycees } from "./data/data-lycees.js";
import { Codes } from "./data/data-code.js";
import './index.css';
import { Chart } from "./ui/chart/index.js";
import L from 'leaflet';

const lycees = Lycees.getLyceecandidat(Candidats.getDiplomesParLycée());
const postBac = Candidats.getPostBacByDepartement();

let C = {};

C.init = async function(){
    V.init();
}

let V = {
    header: document.querySelector("#header"),
    map: document.querySelector("#map"),
};

V.init = async function(){
    V.renderHeader();
    C.loadValue();
}

V.renderHeader= function(){
    V.header.innerHTML = HeaderView.render();
}

C.updateChart = function(value) {
    document.getElementById('chart-value').innerText = value;
    const chart = parseInt(value);
    V.renderChart(lycees, postBac, chart);
};
document.getElementById('chart-slider').addEventListener('change', (event) => {
    C.updateChart(event.target.value);
});


C.updateMap = function(value) {
    document.getElementById('map-value').innerText = value;
    const mapValue = parseInt(value);
    V.renderMarker(lycees, postBac, mapValue);
};
document.getElementById('map-slider').addEventListener('change', (event) => {
    C.updateMap(event.target.value);
});

C.loadValue = function(){
    let chart = document.getElementById('chart-slider').value;
    let mapValue = document.getElementById('map-slider').value;
    V.renderMarker(lycees, postBac, mapValue);
    V.renderChart(lycees, postBac, chart);
}
V.renderChart = function(lycees, postBac, slider){
    Chart.render(lycees, postBac, slider);
}
V.renderMarker = function(lycees, postBac, mapValue){
    LyceeView.render(lycees, postBac, mapValue);
}




C.init();
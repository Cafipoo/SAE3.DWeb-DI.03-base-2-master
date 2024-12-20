import { Codes } from "./data-code.js";

async function fetchData() {
    const response = await fetch("./src/data/json/candidatures.json");
    return await response.json();
}

let data = await fetchData();

let Candidats = {};

Candidats.getDiplomesParLycée = function() {
    const ecoleCounts = data.slice(1).reduce((acc, candidat) => {
        let ecole = '';
        let SerieDiplomeCode = '';

        for (let i = 0; i < candidat.Scolarite.length; i++) {
            if (candidat.Scolarite[i].UAIEtablissementorigine && candidat.Baccalaureat.TypeDiplomeLibelle === "Baccalauréat en préparation") {
                ecole = candidat.Scolarite[i].UAIEtablissementorigine;
                break;
            }
        }

        if (ecole && candidat.Baccalaureat && candidat.Baccalaureat.SerieDiplomeCode) {
            SerieDiplomeCode = candidat.Baccalaureat.SerieDiplomeCode;
            const key = `${ecole} - ${SerieDiplomeCode}`;

            if (!acc[key]) {
                acc[key] = {
                    ecole,
                    series: []
                };
            }

            const serieExistante = acc[key].series.find(item => item.SerieDiplomeCode === SerieDiplomeCode);
            if (serieExistante) {
                serieExistante.nbCandidats += 1;
            } else {
                acc[key].series.push({
                    SerieDiplomeCode,
                    nbCandidats: 1
                });
            }
        }

        return acc;
    }, {});

    const result = Object.values(ecoleCounts).map(item => {
        item.series.sort((a, b) => a.SerieDiplomeCode.localeCompare(b.SerieDiplomeCode));
        return item;
    });

    result.sort((a, b) => a.ecole.localeCompare(b.ecole));
    return result;
};

Candidats.getPostBacByDepartement = function() {
    const codesCoordonnees = Codes.getAll();
    const candidatsAvecBac = data.filter(candidat => 
        candidat.Baccalaureat && candidat.Baccalaureat.TypeDiplomeLibelle === "Baccalauréat obtenu"
    );

    const candidatsParCodePostal = {};
    let pascodePostal = 0;
    candidatsAvecBac.forEach(candidat => {
        let codePostal = null;

        for (let i = 0; i < 2; i++) {
            if (candidat.Scolarite[i] && candidat.Scolarite[i].CommuneEtablissementOrigineCodePostal) {
                codePostal = candidat.Scolarite[i].CommuneEtablissementOrigineCodePostal;
                break;
            }
        }

        if (codePostal) {
            const normalizedCodePostal = codePostal.slice(0, 2) + "000";
            const coordonnees = codesCoordonnees.find(coord => coord.code_postal === normalizedCodePostal);
            if (coordonnees) {
                if (!candidatsParCodePostal[normalizedCodePostal]) {
                    candidatsParCodePostal[normalizedCodePostal] = { 
                        coordonnees, 
                        nbCandidats: 0 
                    };
                }
                candidatsParCodePostal[normalizedCodePostal].nbCandidats += 1;
            }
        } else {
            pascodePostal++;
        }
    });

    const result = Object.values(candidatsParCodePostal).map(item => ({
        coordonnees: item.coordonnees,
        nbCandidats: item.nbCandidats
    }));

    result.sort((a, b) => a.coordonnees.code_postal.localeCompare(b.coordonnees.code_postal));

    return result;
};

export { Candidats };

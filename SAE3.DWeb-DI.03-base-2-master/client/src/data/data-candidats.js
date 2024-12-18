let data = await fetch("./src/data/json/candidatures.json");
data = await data.json();
import { Codes } from "./data-code.js";

let Candidats = {}

Candidats.getAll = function(){
    return data;
}

Candidats.getEcole = function(){
    const ecoles = data.slice(1).map(candidat => {
        for (let i = 0; i < candidat.Scolarite.length; i++) {
            if (candidat.Scolarite[i].UAIEtablissementorigine) {
                return candidat.Scolarite[i].UAIEtablissementorigine;
            }
        }
    });
    const ecoleCounts = ecoles.reduce((acc, ecole) => {
        acc[ecole] = (acc[ecole] || 0) + 1;
        return acc;
    }, {});

    const candidats = Object.keys(ecoleCounts).map(ecole => ({
        ecole,
        nbCandidat: ecoleCounts[ecole]
    }));
    candidats.sort((a, b) => a.ecole.localeCompare(b.ecole)); 
    return candidats;
}
Candidats.getDiplomesParLycée = function() {
    // Utilisation d'un dictionnaire pour accumuler les informations
    const ecoleCounts = data.slice(1).reduce((acc, candidat) => {
        // Recherche de l'établissement
        let ecole = '';
        let SerieDiplomeCode = '';

        // Extraction des informations nécessaires
        for (let i = 0; i < candidat.Scolarite.length; i++) {
            if (candidat.Scolarite[i].UAIEtablissementorigine || candidat.Baccalaureat.TypeDiplomeLibelle== "Baccalauréat en préparation") {
                ecole = candidat.Scolarite[i].UAIEtablissementorigine;
                break; // Une fois l'établissement trouvé, on peut sortir de la boucle
            }
        }

        // Vérification si le candidat a un diplôme et un code de série
        if (ecole && candidat.Baccalaureat && candidat.Baccalaureat.SerieDiplomeCode) {
            SerieDiplomeCode = candidat.Baccalaureat.SerieDiplomeCode;

            // Construction de la clé pour l'agrégation
            const key = `${ecole} - ${SerieDiplomeCode}`;

            // Si la clé n'existe pas encore, on l'initialise
            if (!acc[key]) {
                acc[key] = {
                    ecole,
                    series: [] // Liste des séries de diplôme
                };
            }

            // Recherche si la série de diplôme existe déjà dans l'établissement
            const serieExistante = acc[key].series.find(item => item.SerieDiplomeCode === SerieDiplomeCode);
            if (serieExistante) {
                // Si la série existe, on incrémente le nombre de candidats
                serieExistante.nbCandidats += 1;
            } else {
                // Sinon, on l'ajoute à la liste des séries
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

    console.log(result);
    return result;
};
Candidats.getPostBack = function() {
    const candidatsAvecBac = data.filter(candidat => 
        candidat.Baccalaureat && candidat.Baccalaureat.TypeDiplomeLibelle === "Baccalauréat obtenu"
    );

    const result = candidatsAvecBac.map(candidat => {
        for (let i = 0; i < candidat.Scolarite.length; i++) {
            const codePostal = candidat.Scolarite[i].CommuneEtablissementOrigineCodePostal;
            if (codePostal) { 
                return { codePostal };
            }
        }
        return null; 
    }).filter(item => item !== null); 

    result.sort((a, b) => a.codePostal.localeCompare(b.codePostal));
    return result;
};
Candidats.getPostBacByDepartement  = function() {
    const codesCoordonnees = Codes.getAll();
    // Filtrer les candidats post-bac (Baccalauréat obtenu)
    const candidatsAvecBac = data.filter(candidat => 
        candidat.Baccalaureat && candidat.Baccalaureat.TypeDiplomeLibelle === "Baccalauréat obtenu"
    );

    // Regrouper les candidats par code postal
    const candidatsParCodePostal = candidatsAvecBac.reduce((acc, candidat) => {
        // Trouver le code postal valide
        const scolarite = candidat.Scolarite.find(s => s.CommuneEtablissementOrigineCodePostal);
        if (scolarite && scolarite.CommuneEtablissementOrigineCodePostal) {
            const codePostal = scolarite.CommuneEtablissementOrigineCodePostal;

            // Vérifier si le code postal existe dans les coordonnées
            const coordonnees = codesCoordonnees.find(coord => coord.code_postal === codePostal);
            if (coordonnees) {
                acc[codePostal] = acc[codePostal] || { 
                    coordonnees, 
                    nbCandidats: 0 
                };
                acc[codePostal].nbCandidats += 1; // Incrémenter le compteur de candidats
            }
        }
        return acc;
    }, {});

    const result = Object.values(candidatsParCodePostal).map(item => ({
        coordonnees: item.coordonnees,
        nbCandidats: item.nbCandidats
    }));

    // Trier les résultats par ordre de code postal
    result.sort((a, b) => a.coordonnees.code_postal.localeCompare(b.coordonnees.code_postal));

    return result;
};



export { Candidats };
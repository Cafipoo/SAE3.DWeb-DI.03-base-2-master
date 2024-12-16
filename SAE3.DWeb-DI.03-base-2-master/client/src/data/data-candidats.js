

let data = await fetch("./src/data/json/candidatures.json");
data = await data.json();

let Candidats = {}

Candidats.getAll = function(){
    return data;
}

Candidats.getEcole = function(){
    const ecoles = data.slice(1).map(candidat => candidat.Scolarite[0].UAIEtablissementorigine);

    const ecoleCounts = ecoles.reduce((acc, ecole) => {
        acc[ecole] = (acc[ecole] || 0) + 1;
        return acc;
    }, {});

    const candidats = Object.keys(ecoleCounts).map(ecole => ({
        ecole,
        nbCandidat: ecoleCounts[ecole]
    }));

    return candidats;
}


export { Candidats };
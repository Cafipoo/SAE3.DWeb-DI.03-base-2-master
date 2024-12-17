

let data = await fetch("./src/data/json/candidatures.json");
data = await data.json();

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
    const lycees = data.slice(1).map(candidat => {
        let ecole = '';
        let serieDiplome = '';
        
        for (let i = 0; i < candidat.Scolarite.length; i++) {
            if (candidat.Scolarite[i].UAIEtablissementorigine) {
                ecole = candidat.Scolarite[i].NomEtablissementOrigine;
            }
        }

        if (candidat.Baccalaureat && candidat.Baccalaureat.SerieDiplomeLibelle) {
            serieDiplome = candidat.Baccalaureat.SerieDiplomeLibelle;
        }

        return { ecole, serieDiplome };
    });

    const ecoleCounts = lycees.reduce((acc, { ecole, serieDiplome }) => {
        if (!ecole || !serieDiplome) return acc;

        const key = `${ecole} - ${serieDiplome}`;
        if (!acc[key]) {
            acc[key] = {
                ecole: ecole,
                serieDiplome: serieDiplome,
                nbCandidats: 0
            };
        }
        acc[key].nbCandidats += 1;

        return acc;
    }, {});
    const result = Object.values(ecoleCounts).reduce((acc, { ecole, serieDiplome, nbCandidats }) => {
        const ecoleExistante = acc.find(item => item.ecole === ecole);

        if (ecoleExistante) {
            const serieExistante = ecoleExistante.series.find(item => item.serieDiplome === serieDiplome);
            if (serieExistante) {
                serieExistante.nbCandidats += nbCandidats;
            } else {
                ecoleExistante.series.push({
                    serieDiplome: serieDiplome,
                    nbCandidats: nbCandidats
                });
            }
        } else {
            acc.push({
                ecole: ecole,
                series: [{
                    serieDiplome: serieDiplome,
                    nbCandidats: nbCandidats
                }]
            });
        }

        return acc;
    }, []);

    result.forEach(item => {
        item.series.sort((a, b) => a.serieDiplome.localeCompare(b.serieDiplome));
    });

    result.sort((a, b) => a.ecole.localeCompare(b.ecole));

    return result;
};


export { Candidats };
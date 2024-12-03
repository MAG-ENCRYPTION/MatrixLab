const fs = require('fs');

// Fonction pour écrire des données dans un fichier .bin
function writeBinFile(filename, hexSequence) {
    // Convertir les séquences hexadécimales en un buffer binaire
    const buffer = Buffer.from(hexSequence.split(' ').map(byte => parseInt(byte, 16)));

    // Écrire dans le fichier
    fs.writeFile(filename, buffer, (err) => {
        if (err) {
            console.error(`Erreur lors de l'écriture du fichier : ${err}`);
        } else {
            console.log(`Fichier ${filename} créé avec succès !`);
        }
    });
}

// Nom du fichier à générer
const filename = 'output.bin';

// Séquence hexadécimale à écrire
const hexSequence = 'FF FF AA FF 00 22 33';

// Appeler la fonction
writeBinFile(filename, hexSequence);

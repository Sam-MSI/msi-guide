// constants.js - Constantes et configurations
export const frenchLabels = {
    // Composants principaux
    'cpu': 'Processeur',
    'gpu': 'Carte graphique',
    'ram': 'Mémoire vive (RAM)',
    'ssd': 'Stockage SSD',
    
    // Écran
    'screen_quality': 'Qualité d\'écran',
    'Réactivité': 'Fréquence de rafraîchissement',
    'screen_colors': 'Précision des couleurs',
    
    // Confort
    'mobility': 'Mobilité / Poids',
    'Silence': 'Niveau sonore',
    'Autonomie': 'Autonomie batterie',
    'Norme Wi-Fi/Bluetooth': 'Connectivité sans fil',
    'Pavé numérique': 'Pavé numérique'
};

export const categoryIcons = {
    'COMPOSANTS PRINCIPAUX': '🔧',
    'ECRAN': '🖥️',
    'CONFORT': '✨'
};

export const getPriorityCoefficient = (order) => {
    const coefficients = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
    return coefficients[order] || 0.1;
};

export const API_ENDPOINTS = {
    USAGE_SPECS: 'https://api.jsonbin.io/v3/b/68c2f2ced0ea881f407a80ff',
    RANKINGS: 'https://api.jsonbin.io/v3/b/68c2f2dbd0ea881f407a8105',
    LAPTOPS: 'https://api.jsonbin.io/v3/b/68c2f2c043b1c97be93f90fa'
};
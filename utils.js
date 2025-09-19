// utils.js - Fonctions utilitaires
export function extractNumber(str) {
    if (!str) return 0;
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

export function extractStorageSize(storage) {
    if (!storage) return 0;
    if (storage.includes('To')) {
        return extractNumber(storage) * 1000;
    }
    return extractNumber(storage);
}

export function extractWeight(weightStr) {
    if (!weightStr) return 999; // Poids très élevé si pas d'info
    const str = String(weightStr).toLowerCase();
    const match = str.match(/(\d+[,.]?\d*)\s*kg/);
    if (match) {
        return parseFloat(match[1].replace(',', '.'));
    }
    return 999;
}

export function getRankingPosition(value, rankingArray) {
    if (!rankingArray || !value) return 999;
    const position = rankingArray.findIndex(item => item === value);
    return position === -1 ? 999 : position;
}

export function getUsageDescription(usageKey) {
    const descriptions = {
        'navigation_internet_multimedia': 'Web, streaming, réseaux sociaux, bureautique légère',
        'data_analyse': 'Analyse de données, Excel avancé, bases de données',
        'communication': 'Visioconférence, Teams, présentations professionnelles',
        'etudes_elearning': 'Cours en ligne, prise de notes, recherches académiques',
        'programmation': 'Développement, IDE, compilation, serveurs locaux',
        'jeuxvideo': 'Gaming, e-sport, streaming de jeux',
        'montage_photo': 'Photoshop, Lightroom, retouche d\'images professionnelle',
        'montage_video': 'Premiere Pro, After Effects, production vidéo',
        'creation_2d': 'Illustrator, InDesign, design graphique',
        'creation_3d': 'Modélisation et animation 3D professionnelle',
        'beaucoup_de_deplacements': 'Mobilité maximale, autonomie importante, légèreté'
    };
    return descriptions[usageKey] || 'Usage spécialisé';
}

export function getResellerName(reseller) {
    const resellerNames = {
        'MSI-Store': 'MSI',
        'LDLC': 'LDLC',
        'Boulanger': 'Boulanger',
        'Fnac': 'Fnac',
        'Amazon': 'Amazon'
    };
    return resellerNames[reseller] || reseller;
}

export function getSpecWeight(specName) {
    const weights = {
        'cpu': 25,
        'gpu': 30,
        'ram': 20,
        'ssd': 15,
        'screen_quality': 10,
        'screen_colors': 5,
        'mobility': 8
    };
    return weights[specName] || 5;
}
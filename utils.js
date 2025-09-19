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
export function getMostDemandingWithPriority(values, specType) {
            if (!values || values.length === 0) return null;
            if (values.length === 1) return values[0].value;

            // Filtrer les valeurs nulles
            const validValues = values.filter(v => v.value !== null);
            if (validValues.length === 0) return null;
            if (validValues.length === 1) return validValues[0].value;

            // Trier par priorité (ordre de sélection) d'abord
            validValues.sort((a, b) => a.order - b.order);

            // Logique de comparaison selon le type de spécification avec priorité
            const result = validValues.reduce((most, current) => {
                // Si c'est le premier usage (priorité maximale), il a plus de poids
                if (current.order === 0) {
                    if (isMoreDemanding(current.value, most.value, specType)) {
                        return current;
                    }
                    // Même si current n'est pas plus exigeant, il garde une influence forte
                    if (current.priority >= 0.8) {
                        return current;
                    }
                }
                
                // Pour les autres usages, appliquer la logique normale mais avec coefficient
                if (isMoreDemanding(current.value, most.value, specType) && current.priority > 0.5) {
                    return current;
                }
                return most;
            });
            
            return result.value;
}
    export function combineSpecsWithPriority() {
            // Initialiser la structure de résultat
            const result = {
                minimum: {},
                recommande: {},
                ideal: {}
            };

            // Pour chaque usage sélectionné, récupérer les specs avec leurs coefficients de priorité
            const allUsageSpecsWithPriority = selectedUsages.map((usage, index) => ({
                specs: usageSpecs[usage].specs,
                priority: getPriorityCoefficient(index),
                order: index
            }));

            // Pour chaque catégorie
            const firstUsageSpecs = usageSpecs[selectedUsages[0]].specs;
            Object.keys(firstUsageSpecs).forEach(category => {
                result.minimum[category] = {};
                result.recommande[category] = {};
                result.ideal[category] = {};

                // Pour chaque spécification dans cette catégorie
                Object.keys(firstUsageSpecs[category]).forEach(specName => {
                    // Collecter toutes les valeurs pour cette spec dans tous les usages avec priorités
                    const allValues = {
                        minimum: [],
                        recommande: [],
                        ideal: []
                    };

                    allUsageSpecsWithPriority.forEach(({ specs, priority, order }) => {
                        const spec = specs[category] && specs[category][specName];
                        if (spec) {
                            if (spec.minimum !== null) allValues.minimum.push({ value: spec.minimum, priority, order });
                            if (spec.recommande !== null) allValues.recommande.push({ value: spec.recommande, priority, order });
                            if (spec.ideal !== null) allValues.ideal.push({ value: spec.ideal, priority, order });
                        }
                    });

                    // Prendre la valeur la plus exigeante en tenant compte des priorités
                    result.minimum[category][specName] = {
                        minimum: getMostDemandingWithPriority(allValues.minimum, specName)
                    };
                    result.recommande[category][specName] = {
                        recommande: getMostDemandingWithPriority(allValues.recommande, specName)
                    };
                    result.ideal[category][specName] = {
                        ideal: getMostDemandingWithPriority(allValues.ideal, specName)
                    };
                });
            });
            return result;
        }
        export function isMoreDemanding(value1, value2, specType) {
            if (!value1 || !value2) return !!value1;

            const spec = specType.toLowerCase();
            
            // CPU - Utiliser le classement
            if (spec.includes('cpu')) {
                const rank1 = getRankingPosition(value1, rankings.cpu);
                const rank2 = getRankingPosition(value2, rankings.cpu);
                return rank1 < rank2; // Plus le rang est petit, plus c'est puissant
            }
            
            // GPU - Utiliser le classement
            if (spec.includes('gpu')) {
                const rank1 = getRankingPosition(value1, rankings.gpu);
                const rank2 = getRankingPosition(value2, rankings.gpu);
                return rank1 < rank2;
            }
            
            // RAM - Extraire les GB
            if (spec.includes('ram')) {
                const gb1 = extractNumber(value1);
                const gb2 = extractNumber(value2);
                if (gb1 !== gb2) return gb1 > gb2;
                return value1.includes('DDR5') && value2.includes('DDR4');
            }
            
            // SSD - Extraire la capacité
            if (spec.includes('ssd')) {
                const size1 = extractStorageSize(value1);
                const size2 = extractStorageSize(value2);
                if (size1 !== size2) return size1 > size2;
                return value1.includes('PCIe 5.0') && value2.includes('PCIe 4.0');
            }
            
            // Écran - Utiliser le classement
            if (spec.includes('screen_quality')) {
                const rank1 = getRankingPosition(value1, rankings.screen_quality);
                const rank2 = getRankingPosition(value2, rankings.screen_quality);
                return rank1 < rank2;
            }
            
            if (spec.includes('screen_colors')) {
                const rank1 = getRankingPosition(value1, rankings.screen_colors);
                const rank2 = getRankingPosition(value2, rankings.screen_colors);
                return rank1 < rank2;
            }
            
            // Fréquence Hz
            if (spec.includes('réactivité') || spec.includes('hz')) {
                const hz1 = extractNumber(value1);
                const hz2 = extractNumber(value2);
                return hz1 > hz2;
            }
            
            // Wi-Fi
            if (spec.includes('wi-fi')) {
                const wifiVersions = { 'wi-fi 6': 1, 'wi-fi 6e': 2, 'wi-fi 7': 3 };
                const wifi1 = wifiVersions[value1.toLowerCase()] || 0;
                const wifi2 = wifiVersions[value2.toLowerCase()] || 0;
                return wifi1 > wifi2;
            }
            
            // Mobilité (poids) - Plus c'est léger, mieux c'est
            if (spec.includes('mobility') || spec.includes('poids')) {
                const weight1 = extractWeight(value1);
                const weight2 = extractWeight(value2);
                return weight1 < weight2; // Plus léger est mieux
            }
            
            return false;
}
    export function calculateFallbackDistance(laptopValue, requiredValue, specName) {
            if (!laptopValue || !requiredValue) return 1000;
            
            // CPU/GPU/Écran - Utiliser les positions dans le ranking
            if (specName === 'cpu' || specName === 'gpu' || specName === 'screen_quality' || specName === 'screen_colors') {
                const rankingArray = rankings[specName] || (specName.includes('screen') ? rankings.screen_quality : rankings.cpu);
                const laptopRank = getRankingPosition(laptopValue, rankingArray);
                const requiredRank = getRankingPosition(requiredValue, rankingArray);
                
                if (laptopRank === 999 || requiredRank === 999) return 1000;
                
                // Retourner la différence absolue (même si laptop est moins bon)
                return Math.abs(laptopRank - requiredRank);
            }
            
            // RAM - Utiliser les GB
            if (specName === 'ram') {
                const laptopGB = extractNumber(laptopValue);
                const requiredGB = extractNumber(requiredValue);
                
                // Retourner la différence absolue en paliers de 8GB
                return Math.abs(laptopGB - requiredGB) / 8;
            }
            
            // SSD - Utiliser la capacité
            if (specName === 'ssd') {
                const laptopSize = extractStorageSize(laptopValue);
                const requiredSize = extractStorageSize(requiredValue);
                
                // Retourner la différence absolue en paliers de 256GB
                return Math.abs(laptopSize - requiredSize) / 256;
            }
            
            // Mobilité (poids) - Utiliser les kg
            if (specName === 'mobility') {
                const laptopWeight = extractWeight(laptopValue);
                const requiredWeight = extractWeight(requiredValue);
                
                // Retourner la différence absolue en paliers de 0.2kg
                return Math.abs(laptopWeight - requiredWeight) / 0.2;
            }
            
            return 10; // Distance par défaut pour les autres specs
        }
export function findMatchingLaptops(specs, level, maxResults = 3, excludeLaptops = [], baseLaptopPrice = null) {
            let matches = [];

            console.log(`\n🔍 Recherche des ${maxResults} laptops pour: ${level}`);
            if (excludeLaptops.length > 0) {
                console.log(`❌ Exclusions: ${excludeLaptops.map(l => l.name).join(', ')}`);
            }
            if (baseLaptopPrice) {
                console.log(`💰 Prix de référence pour ${level}: ${baseLaptopPrice}€ (max autorisé: ${(baseLaptopPrice * 1.3).toFixed(0)}€)`);
            }

            // Chercher uniquement les laptops qui respectent les critères (sans fallback)
            laptopsData.forEach((laptop, index) => {
                // Filtrer la console Claw si l'usage "jeuxvideo" n'est pas sélectionné
                if (laptop.name.startsWith('Claw') && !selectedUsages.includes('jeuxvideo')) {
                    return;
                }

                // Exclure les laptops déjà utilisés
                if (excludeLaptops.some(excluded => excluded.name === laptop.name)) {
                    return;
                }

                // ✨ NOUVEAU: Vérifier le budget pour le niveau minimum
                if (!isWithinPriceBudget(laptop, level, baseLaptopPrice)) {
                    return;
                }

                let totalDistance = 0;
                let distanceDetails = [];
                let isValid = true;
                
                // Calculer la distance pour chaque spec importante
                const categories = specs[level];
                Object.keys(categories).forEach(category => {
                    Object.keys(categories[category]).forEach(specName => {
                        const requiredValue = categories[category][specName][level];
                        if (requiredValue && laptop.specs[specName]) {
                            const distance = calculateDistance(laptop.specs[specName], requiredValue, specName);
                            if (distance === -1) {
                                isValid = false; // Le laptop ne répond pas aux exigences minimales
                            } else {
                                totalDistance += distance;
                                distanceDetails.push(`${specName}: ${distance}`);
                            }
                        }
                    });
                });

                if (isValid) {
                    console.log(`${laptop.name}: Distance totale ${totalDistance}, Prix: ${laptop.specs.price}€ (${distanceDetails.join(', ')})`);
                    matches.push({ laptop, distance: totalDistance });
                }
            });

            // Trier par distance et prendre les meilleurs
            matches.sort((a, b) => a.distance - b.distance);
            const bestMatches = matches.slice(0, maxResults).map(m => m.laptop);

            console.log(`🏆 Matches trouvés: ${bestMatches.map(l => `${l.name} (${l.specs.price}€)`).join(', ')}`);
            return bestMatches;
        }

        export function findMatchingLaptopsWithFallback(specs, level, maxResults = 1, excludeLaptops = [], baseLaptopPrice = null) {
            let matches = [];

            console.log(`🔄 Recherche fallback pour: ${level}`);
            
            laptopsData.forEach((laptop, index) => {
                // Eviter les doublons et filtrer Claw
                if ((laptop.name.startsWith('Claw') && !selectedUsages.includes('jeuxvideo')) ||
                    excludeLaptops.some(excluded => excluded.name === laptop.name)) {
                    return;
                }

                // ✨ NOUVEAU: Vérifier le budget pour le niveau minimum (même en fallback)
                if (!isWithinPriceBudget(laptop, level, baseLaptopPrice)) {
                    return;
                }

                let totalDistance = 0;
                let distanceDetails = [];
                
                // Calculer la distance pour chaque spec importante (sans exclusion)
                const categories = specs[level];
                Object.keys(categories).forEach(category => {
                    Object.keys(categories[category]).forEach(specName => {
                        const requiredValue = categories[category][specName][level];
                        if (requiredValue && laptop.specs[specName]) {
                            let distance = calculateDistance(laptop.specs[specName], requiredValue, specName);
                            // Convertir les distances négatives en distances positives pour la comparaison
                            if (distance === -1) {
                                distance = calculateFallbackDistance(laptop.specs[specName], requiredValue, specName);
                            }
                            totalDistance += Math.abs(distance);
                            distanceDetails.push(`${specName}: ${distance}`);
                        }
                    });
                });

                console.log(`${laptop.name} (fallback): Distance totale ${totalDistance}, Prix: ${laptop.specs.price}€ (${distanceDetails.join(', ')})`);
                matches.push({ laptop, distance: totalDistance, isFallback: true });
            });

            // Trier par distance et prendre les meilleurs
            matches.sort((a, b) => a.distance - b.distance);
            const bestMatches = matches.slice(0, maxResults).map(m => m.laptop);

            console.log(`🏆 Fallback matches: ${bestMatches.map(l => `${l.name} (${l.specs.price}€)`).join(', ')}`);
            return bestMatches;
        }

        export function calculateDistance(laptopValue, requiredValue, specName) {
            if (!laptopValue || !requiredValue) return -1;
            
            // Condition spéciale pour les GPUs
            if (specName === 'gpu') {
                const integratedGPUs = [
                    "Intel Arc 140V GPU",
                    "Intel Arc 140T GPU", 
                    "Integree : Intel Arc graphics 8 Cores",
                    "AMD Radeon™ Graphics",
                    "Integree : Intel UHD Graphics"
                ];
                
                // Si l'usage demande un GPU intégré ET que jeuxvideo n'est pas sélectionné
                if (integratedGPUs.includes(requiredValue) && !selectedUsages.includes('jeuxvideo')) {
                    // Accepter SEULEMENT les GPU intégrés, exclure tous les GPU dédiés
                    if (!integratedGPUs.includes(laptopValue)) {
                        console.log(`  GPU: Exclusion usage bureautique - "${requiredValue}" demandé mais laptop a dédié "${laptopValue}"`);
                        return -1;
                    }
                }
                // Si l'usage demande un GPU intégré (logique normale)
                else if (integratedGPUs.includes(requiredValue)) {
                    if (!integratedGPUs.includes(laptopValue)) {
                        console.log(`  GPU: Exclusion - Usage demande intégré "${requiredValue}" mais laptop a dédié "${laptopValue}"`);
                        return -1;
                    }
                }
            }
            
            // CPU/GPU/Écran - Utiliser les positions dans le ranking
            if (specName === 'cpu' || specName === 'gpu' || specName === 'screen_quality' || specName === 'screen_colors') {
                const rankingArray = rankings[specName] || (specName.includes('screen') ? rankings.screen_quality : rankings.cpu);
                const laptopRank = getRankingPosition(laptopValue, rankingArray);
                const requiredRank = getRankingPosition(requiredValue, rankingArray);
                
                if (laptopRank === 999 || requiredRank === 999) return -1;
                if (laptopRank > requiredRank) return -1; // Laptop moins bon que requis
                
                return requiredRank - laptopRank; // Distance = nombre de positions en dessus
            }
            
            // RAM - Utiliser les GB
            if (specName === 'ram') {
                const laptopGB = extractNumber(laptopValue);
                const requiredGB = extractNumber(requiredValue);
                
                if (laptopGB < requiredGB) return -1; // Pas assez de RAM
                return Math.floor((laptopGB - requiredGB) / 8); // Distance par paliers de 8GB
            }
            
            // SSD - Utiliser la capacité
            if (specName === 'ssd') {
                const laptopSize = extractStorageSize(laptopValue);
                const requiredSize = extractStorageSize(requiredValue);
                
                if (laptopSize < requiredSize) return -1; // Pas assez de stockage
                return Math.floor((laptopSize - requiredSize) / 256); // Distance par paliers de 256GB
            }
            
            // Mobilité (poids) - Utiliser les kg
            if (specName === 'mobility') {
                const laptopWeight = extractWeight(laptopValue);
                const requiredWeight = extractWeight(requiredValue);
                
                if (laptopWeight > requiredWeight) return -1; // Trop lourd
                return Math.floor((requiredWeight - laptopWeight) * 5); // Distance par paliers de 0.2kg
            }
            
            return 0; // Distance nulle pour les autres specs
        }


// recommendationEngine.js - Logique de recommandation et matching
import { extractNumber, extractStorageSize, extractWeight, getRankingPosition, getResellerName } from './utils.js';
import { frenchLabels, categoryIcons, getPriorityCoefficient } from './constants.js';

export function combineSpecsWithPriority(selectedUsages, usageSpecs, rankings) {
    const result = {
        minimum: {},
        recommande: {},
        ideal: {}
    };

    const allUsageSpecsWithPriority = selectedUsages.map((usage, index) => ({
        specs: usageSpecs[usage].specs,
        priority: getPriorityCoefficient(index),
        order: index
    }));

    const firstUsageSpecs = usageSpecs[selectedUsages[0]].specs;
    Object.keys(firstUsageSpecs).forEach(category => {
        result.minimum[category] = {};
        result.recommande[category] = {};
        result.ideal[category] = {};

        Object.keys(firstUsageSpecs[category]).forEach(specName => {
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

            result.minimum[category][specName] = {
                minimum: getMostDemandingWithPriority(allValues.minimum, specName, rankings)
            };
            result.recommande[category][specName] = {
                recommande: getMostDemandingWithPriority(allValues.recommande, specName, rankings)
            };
            result.ideal[category][specName] = {
                ideal: getMostDemandingWithPriority(allValues.ideal, specName, rankings)
            };
        });
    });

    return result;
}

function getMostDemandingWithPriority(values, specType, rankings) {
    if (!values || values.length === 0) return null;
    if (values.length === 1) return values[0].value;

    const validValues = values.filter(v => v.value !== null);
    if (validValues.length === 0) return null;
    if (validValues.length === 1) return validValues[0].value;

    validValues.sort((a, b) => a.order - b.order);

    const result = validValues.reduce((most, current) => {
        if (current.order === 0) {
            if (isMoreDemanding(current.value, most.value, specType, rankings)) {
                return current;
            }
            if (current.priority >= 0.8) {
                return current;
            }
        }
        
        if (isMoreDemanding(current.value, most.value, specType, rankings) && current.priority > 0.5) {
            return current;
        }
        return most;
    });
    
    return result.value;
}

function isMoreDemanding(value1, value2, specType, rankings) {
    if (!value1 || !value2) return !!value1;

    const spec = specType.toLowerCase();
    
    if (spec.includes('cpu')) {
        const rank1 = getRankingPosition(value1, rankings.cpu);
        const rank2 = getRankingPosition(value2, rankings.cpu);
        return rank1 < rank2;
    }
    
    if (spec.includes('gpu')) {
        const rank1 = getRankingPosition(value1, rankings.gpu);
        const rank2 = getRankingPosition(value2, rankings.gpu);
        return rank1 < rank2;
    }
    
    if (spec.includes('ram')) {
        const gb1 = extractNumber(value1);
        const gb2 = extractNumber(value2);
        if (gb1 !== gb2) return gb1 > gb2;
        return value1.includes('DDR5') && value2.includes('DDR4');
    }
    
    if (spec.includes('ssd')) {
        const size1 = extractStorageSize(value1);
        const size2 = extractStorageSize(value2);
        if (size1 !== size2) return size1 > size2;
        return value1.includes('PCIe 5.0') && value2.includes('PCIe 4.0');
    }
    
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
    
    if (spec.includes('réactivité') || spec.includes('hz')) {
        const hz1 = extractNumber(value1);
        const hz2 = extractNumber(value2);
        return hz1 > hz2;
    }
    
    if (spec.includes('wi-fi')) {
        const wifiVersions = { 'wi-fi 6': 1, 'wi-fi 6e': 2, 'wi-fi 7': 3 };
        const wifi1 = wifiVersions[value1.toLowerCase()] || 0;
        const wifi2 = wifiVersions[value2.toLowerCase()] || 0;
        return wifi1 > wifi2;
    }
    
    if (spec.includes('mobility') || spec.includes('poids')) {
        const weight1 = extractWeight(value1);
        const weight2 = extractWeight(value2);
        return weight1 < weight2;
    }
    
    return false;
}

export function generateRecommendations(selectedUsages, usageSpecs, rankings, laptopsData) {
    const recommendations = document.getElementById('recommendations');
    const selectedUsagesDiv = document.getElementById('selectedUsages');
    const configGrid = document.getElementById('configGrid');

    // Afficher les usages sélectionnés
    let usageText = '<h3 style="margin-bottom: 15px; color: #1a1a1a;">📋 Vos usages sélectionnés :</h3>';
    selectedUsages.forEach((usage, index) => {
        const spec = usageSpecs[usage];
        if (spec) {
            usageText += `<div style="display: inline-block; margin: 5px 10px 5px 0; padding: 8px 15px; background: #fff; border: 2px solid #CC0000; border-radius: 25px; color: #CC0000; font-weight: 600;">
                <span style="background: #CC0000; color: white; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; font-size: 0.8rem;">${index + 1}</span>
                <img src="${spec.image}" style="width: 16px; height: 16px; margin-right: 5px; vertical-align: middle;" onerror="this.style.display='none';"> ${spec.name}
            </div>`;
        }
    });
    selectedUsagesDiv.innerHTML = usageText;

    // Générer les configurations combinées avec priorités
    const combinedSpecs = combineSpecsWithPriority(selectedUsages, usageSpecs, rankings);
    configGrid.innerHTML = generateConfigCards(combinedSpecs, selectedUsages, rankings, laptopsData);
    
    recommendations.style.display = 'block';
    recommendations.scrollIntoView({ behavior: 'smooth' });
}

function isWithinPriceBudget(laptop, level, baseLaptopPrice) {
    if ((level === 'minimum' || level === 'recommande') && baseLaptopPrice) {
        const maxPrice = baseLaptopPrice * 1.3;
        if (laptop.specs.price > maxPrice) {
            console.log(`💰 Prix exclu: ${laptop.name} (${laptop.specs.price}€) > ${maxPrice.toFixed(0)}€ (base: ${baseLaptopPrice}€)`);
            return false;
        }
    }
    return true;
}

function calculateDistance(laptopValue, requiredValue, specName, selectedUsages, rankings) {
    if (!laptopValue || !requiredValue) return -1;
    
    if (specName === 'gpu') {
        const integratedGPUs = [
            "Intel Arc 140V GPU",
            "Intel Arc 140T GPU", 
            "Integree : Intel Arc graphics 8 Cores",
            "AMD Radeon™ Graphics",
            "Integree : Intel UHD Graphics"
        ];
        
        if (integratedGPUs.includes(requiredValue) && !selectedUsages.includes('jeuxvideo')) {
            if (!integratedGPUs.includes(laptopValue)) {
                console.log(`  GPU: Exclusion usage bureautique - "${requiredValue}" demandé mais laptop a dédié "${laptopValue}"`);
                return -1;
            }
        }
        else if (integratedGPUs.includes(requiredValue)) {
            if (!integratedGPUs.includes(laptopValue)) {
                console.log(`  GPU: Exclusion - Usage demande intégré "${requiredValue}" mais laptop a dédié "${laptopValue}"`);
                return -1;
            }
        }
    }
    
    if (specName === 'cpu' || specName === 'gpu' || specName === 'screen_quality' || specName === 'screen_colors') {
        const rankingArray = rankings[specName] || (specName.includes('screen') ? rankings.screen_quality : rankings.cpu);
        const laptopRank = getRankingPosition(laptopValue, rankingArray);
        const requiredRank = getRankingPosition(requiredValue, rankingArray);
        
        if (laptopRank === 999 || requiredRank === 999) return -1;
        if (laptopRank > requiredRank) return -1;
        
        return requiredRank - laptopRank;
    }
    
    if (specName === 'ram') {
        const laptopGB = extractNumber(laptopValue);
        const requiredGB = extractNumber(requiredValue);
        
        if (laptopGB < requiredGB) return -1;
        return Math.floor((laptopGB - requiredGB) / 8);
    }
    
    if (specName === 'ssd') {
        const laptopSize = extractStorageSize(laptopValue);
        const requiredSize = extractStorageSize(requiredValue);
        
        if (laptopSize < requiredSize) return -1;
        return Math.floor((laptopSize - requiredSize) / 256);
    }
    
    if (specName === 'mobility') {
        const laptopWeight = extractWeight(laptopValue);
        const requiredWeight = extractWeight(requiredValue);
        
        if (laptopWeight > requiredWeight) return -1;
        return Math.floor((requiredWeight - laptopWeight) * 5);
    }
    
    return 0;
}

function calculateFallbackDistance(laptopValue, requiredValue, specName, rankings) {
    if (!laptopValue || !requiredValue) return 1000;
    
    if (specName === 'cpu' || specName === 'gpu' || specName === 'screen_quality' || specName === 'screen_colors') {
        const rankingArray = rankings[specName] || (specName.includes('screen') ? rankings.screen_quality : rankings.cpu);
        const laptopRank = getRankingPosition(laptopValue, rankingArray);
        const requiredRank = getRankingPosition(requiredValue, rankingArray);
        
        if (laptopRank === 999 || requiredRank === 999) return 1000;
        return Math.abs(laptopRank - requiredRank);
    }
    
    if (specName === 'ram') {
        const laptopGB = extractNumber(laptopValue);
        const requiredGB = extractNumber(requiredValue);
        return Math.abs(laptopGB - requiredGB) / 8;
    }
    
    if (specName === 'ssd') {
        const laptopSize = extractStorageSize(laptopValue);
        const requiredSize = extractStorageSize(requiredValue);
        return Math.abs(laptopSize - requiredSize) / 256;
    }
    
    if (specName === 'mobility') {
        const laptopWeight = extractWeight(laptopValue);
        const requiredWeight = extractWeight(requiredValue);
        return Math.abs(laptopWeight - requiredWeight) / 0.2;
    }
    
    return 10;
}

function findMatchingLaptops(specs, level, maxResults, excludeLaptops, baseLaptopPrice, selectedUsages, rankings, laptopsData) {
    let matches = [];

    console.log(`\n🔍 Recherche des ${maxResults} laptops pour: ${level}`);
    if (excludeLaptops.length > 0) {
        console.log(`❌ Exclusions: ${excludeLaptops.map(l => l.name).join(', ')}`);
    }
    if (baseLaptopPrice) {
        console.log(`💰 Prix de référence pour ${level}: ${baseLaptopPrice}€ (max autorisé: ${(baseLaptopPrice * 1.3).toFixed(0)}€)`);
    }

    laptopsData.forEach((laptop, index) => {
        if (laptop.name.startsWith('Claw') && !selectedUsages.includes('jeuxvideo')) {
            return;
        }

        if (excludeLaptops.some(excluded => excluded.name === laptop.name)) {
            return;
        }

        if (!isWithinPriceBudget(laptop, level, baseLaptopPrice)) {
            return;
        }

        let totalDistance = 0;
        let distanceDetails = [];
        let isValid = true;
        
        const categories = specs[level];
        Object.keys(categories).forEach(category => {
            Object.keys(categories[category]).forEach(specName => {
                const requiredValue = categories[category][specName][level];
                if (requiredValue && laptop.specs[specName]) {
                    const distance = calculateDistance(laptop.specs[specName], requiredValue, specName, selectedUsages, rankings);
                    if (distance === -1) {
                        isValid = false;
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

    matches.sort((a, b) => a.distance - b.distance);
    const bestMatches = matches.slice(0, maxResults).map(m => m.laptop);

    console.log(`🏆 Matches trouvés: ${bestMatches.map(l => `${l.name} (${l.specs.price}€)`).join(', ')}`);
    return bestMatches;
}

function findMatchingLaptopsWithFallback(specs, level, maxResults, excludeLaptops, baseLaptopPrice, selectedUsages, rankings, laptopsData) {
    let matches = [];

    console.log(`🔄 Recherche fallback pour: ${level}`);
    
    laptopsData.forEach((laptop, index) => {
        if ((laptop.name.startsWith('Claw') && !selectedUsages.includes('jeuxvideo')) ||
            excludeLaptops.some(excluded => excluded.name === laptop.name)) {
            return;
        }

        if (!isWithinPriceBudget(laptop, level, baseLaptopPrice)) {
            return;
        }

        let totalDistance = 0;
        let distanceDetails = [];
        
        const categories = specs[level];
        Object.keys(categories).forEach(category => {
            Object.keys(categories[category]).forEach(specName => {
                const requiredValue = categories[category][specName][level];
                if (requiredValue && laptop.specs[specName]) {
                    let distance = calculateDistance(laptop.specs[specName], requiredValue, specName, selectedUsages, rankings);
                    if (distance === -1) {
                        distance = calculateFallbackDistance(laptop.specs[specName], requiredValue, specName, rankings);
                    }
                    totalDistance += Math.abs(distance);
                    distanceDetails.push(`${specName}: ${distance}`);
                }
            });
        });

        console.log(`${laptop.name} (fallback): Distance totale ${totalDistance}, Prix: ${laptop.specs.price}€ (${distanceDetails.join(', ')})`);
        matches.push({ laptop, distance: totalDistance, isFallback: true });
    });

    matches.sort((a, b) => a.distance - b.distance);
    const bestMatches = matches.slice(0, maxResults).map(m => m.laptop);

    console.log(`🏆 Fallback matches: ${bestMatches.map(l => `${l.name} (${l.specs.price}€)`).join(', ')}`);
    return bestMatches;
}

function generateMSIRecommendations(laptops, level) {
    if (!laptops || laptops.length === 0) return '';
    
    const containerId = `recommendations-${level}`;
    
    return `
        <div class="msi-recommendation" id="${containerId}">
            ${laptops.length > 1 ? `
                <button class="laptop-navigation laptop-nav-prev" onclick="navigateLaptop('${containerId}', -1)">‹</button>
                <button class="laptop-navigation laptop-nav-next" onclick="navigateLaptop('${containerId}', 1)">›</button>
            ` : ''}
            
            <div class="laptop-content">
                ${laptops.map((laptop, index) => `
                    <div class="laptop-slide" data-laptop-index="${index}" ${index === 0 ? '' : 'style="display: none;"'}>
                        <div class="msi-rec-header">
                            <div class="msi-rec-title">${laptop.name}</div>
                            <div class="msi-rec-price">${laptop.specs.price}€</div>
                        </div>
                        
                        ${laptop.image ? `<img src="${laptop.image}" alt="${laptop.name}" class="msi-product-image" onerror="this.style.display='none'">` : ''}
                        
                        <div class="msi-spec-grid">
                            <div class="msi-spec-item">
                                <div class="msi-spec-label">Processeur</div>
                                <div class="msi-spec-value">${laptop.specs.cpu || 'N/A'}</div>
                            </div>
                            <div class="msi-spec-item">
                                <div class="msi-spec-label">Carte graphique</div>
                                <div class="msi-spec-value">${laptop.specs.gpu || 'N/A'}</div>
                            </div>
                            <div class="msi-spec-item">
                                <div class="msi-spec-label">Mémoire RAM</div>
                                <div class="msi-spec-value">${laptop.specs.ram || 'N/A'}</div>
                            </div>
                            <div class="msi-spec-item">
                                <div class="msi-spec-label">Stockage</div>
                                <div class="msi-spec-value">${laptop.specs.ssd || 'N/A'}</div>
                            </div>
                            <div class="msi-spec-item">
                                <div class="msi-spec-label">Écran</div>
                                <div class="msi-spec-value">${laptop.specs.screen_quality || 'N/A'}${laptop.specs.screen_refresh ? ' - ' + laptop.specs.screen_refresh : ''}</div>
                            </div>
                            <div class="msi-spec-item">
                                <div class="msi-spec-label">Poids</div>
                                <div class="msi-spec-value">${laptop.specs.mobility || 'N/A'}</div>
                            </div>
                        </div>
                        
                        <a href="${laptop.specs.link}" target="_blank" class="msi-buy-btn">
                            Voir chez ${getResellerName(laptop.reseller)}
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateConfigCards(specs, selectedUsages, rankings, laptopsData) {
    const levels = [
        { key: 'minimum', title: 'Configuration Minimum', description: 'Pour débuter avec un budget serré' },
        { key: 'recommande', title: 'Configuration Recommandée', description: 'Le meilleur équilibre performance/prix' },
        { key: 'ideal', title: 'Configuration Idéale', description: 'Pour une expérience optimale sans compromis' }
    ];

    const results = {
        minimum: [],
        recommande: [],
        ideal: []
    };

    let globalExclusions = [];
    const basePrices = {
        minimum: null,
        recommande: null,
        ideal: null
    };

    const priorityOrder = ['ideal', 'recommande', 'minimum'];
    
    console.log('\n🎯 === PHASE 1: Premier choix pour chaque niveau ===');
    for (const levelKey of priorityOrder) {
        console.log(`\n🔍 Phase 1 - ${levelKey.toUpperCase()}`);
        const matchingLaptops = findMatchingLaptops(specs, levelKey, 1, globalExclusions, null, selectedUsages, rankings, laptopsData);
        
        if (matchingLaptops.length > 0) {
            results[levelKey].push(matchingLaptops[0]);
            globalExclusions.push(matchingLaptops[0]);
            basePrices[levelKey] = matchingLaptops[0].specs.price;
            console.log(`✅ ${levelKey}: ${matchingLaptops[0].name} sélectionné (${matchingLaptops[0].specs.price}€)`);
        } else {
            console.log(`🔄 Fallback pour ${levelKey}`);
            const fallbackLaptops = findMatchingLaptopsWithFallback(specs, levelKey, 1, globalExclusions, null, selectedUsages, rankings, laptopsData);
            if (fallbackLaptops.length > 0) {
                results[levelKey].push(fallbackLaptops[0]);
                globalExclusions.push(fallbackLaptops[0]);
                basePrices[levelKey] = fallbackLaptops[0].specs.price;
                console.log(`✅ ${levelKey} (fallback): ${fallbackLaptops[0].name} sélectionné (${fallbackLaptops[0].specs.price}€)`);
            } else {
                console.log(`❌ ${levelKey}: Aucun PC trouvé même en fallback`);
            }
        }
    }

    console.log('\n🎯 === PHASE 2: Deuxième choix pour chaque niveau ===');
    for (const levelKey of priorityOrder) {
        if (results[levelKey].length < 2) {
            console.log(`\n🔍 Phase 2 - ${levelKey.toUpperCase()}`);
            const matchingLaptops = findMatchingLaptops(specs, levelKey, 1, globalExclusions, basePrices[levelKey], selectedUsages, rankings, laptopsData);
            if (matchingLaptops.length > 0) {
                results[levelKey].push(matchingLaptops[0]);
                globalExclusions.push(matchingLaptops[0]);
                console.log(`✅ ${levelKey} (2ème): ${matchingLaptops[0].name} sélectionné (${matchingLaptops[0].specs.price}€)`);
            } else {
                console.log(`❌ ${levelKey} (2ème): Aucun PC correspondant trouvé dans le budget`);
            }
        }
    }

    console.log('\n🎯 === PHASE 3: Troisième choix pour chaque niveau ===');
    for (const levelKey of priorityOrder) {
        if (results[levelKey].length < 3) {
            console.log(`\n🔍 Phase 3 - ${levelKey.toUpperCase()}`);
            const matchingLaptops = findMatchingLaptops(specs, levelKey, 1, globalExclusions, basePrices[levelKey], selectedUsages, rankings, laptopsData);
            if (matchingLaptops.length > 0) {
                results[levelKey].push(matchingLaptops[0]);
                globalExclusions.push(matchingLaptops[0]);
                console.log(`✅ ${levelKey} (3ème): ${matchingLaptops[0].name} sélectionné (${matchingLaptops[0].specs.price}€)`);
            } else {
                console.log(`❌ ${levelKey} (3ème): Aucun PC correspondant trouvé dans le budget`);
            }
        }
    }

    console.log('\n📊 === RÉSULTATS FINAUX ===');
    Object.entries(results).forEach(([level, laptops]) => {
        const prices = laptops.map(l => `${l.specs.price}€`).join(', ');
        console.log(`${level.toUpperCase()}: ${laptops.map(l => l.name).join(', ') || 'Aucun'} (${prices})`);
    });

    return levels.map(level => {
        const spec = specs[level.key];
        const matchingLaptops = results[level.key];
        
        return `
            <div class="config-card ${level.key}">
                <div class="config-title">${level.title}</div>
                <p style="color: #666; margin-bottom: 25px; font-size: 0.95rem; line-height: 1.4;">${level.description}</p>
                
                ${Object.entries(spec).map(([category, categorySpecs]) => {
                    const validSpecs = Object.entries(categorySpecs).filter(([specName, values]) => {
                        const value = values[level.key];
                        return value !== null && value !== undefined && value !== '';
                    });

                    if (validSpecs.length === 0) {
                        return '';
                    }

                    return `
                        <div class="category-section">
                            <div class="category-title" data-category="${category}">
                                ${categoryIcons[category] || '🔧'} ${category}
                            </div>
                            ${validSpecs.map(([specName, values]) => {
                                const value = values[level.key];
                                const displayName = frenchLabels[specName] || specName;
                                return `
                                    <div class="spec-item">
                                        <div class="spec-label">${displayName}</div>
                                        <div class="spec-value">${value}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }).join('')}
                
                ${matchingLaptops.length > 0 ? generateMSIRecommendations(matchingLaptops, level.key) : ''}
            </div>
        `;
    }).join('');
}
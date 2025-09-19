// dataManager.js - Gestion des données
import { API_ENDPOINTS } from './constants.js';

export async function loadData() {
    try {
        console.log('Chargement des données...');
        
        const [usageResponse, rankingResponse, laptopsResponse] = await Promise.all([
            fetch(API_ENDPOINTS.USAGE_SPECS),
            fetch(API_ENDPOINTS.RANKINGS),
            fetch(API_ENDPOINTS.LAPTOPS)
        ]);

        if (!usageResponse.ok || !rankingResponse.ok || !laptopsResponse.ok) {
            throw new Error('Erreur lors du chargement des données');
        }

        const usageData = await usageResponse.json();
        const rankingData = await rankingResponse.json();
        const laptopsDataResponse = await laptopsResponse.json();

        return {
            usageSpecs: usageData.record || usageData,
            rankings: rankingData.record || rankingData,
            laptopsData: laptopsDataResponse.record || laptopsDataResponse
        };
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        throw error;
    }
}

export function showErrorMessage(message) {
    const usageGrid = document.getElementById('usageGrid');
    usageGrid.innerHTML = `<div class="loading" style="color: #cc0000;">${message}</div>`;
}
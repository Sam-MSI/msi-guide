// uiController.js - Gestion de l'interface utilisateur
import { getUsageDescription, getResellerName } from './utils.js';
import { getPriorityCoefficient } from './constants.js';

export function renderUsageCards(usageSpecs, setupEventListeners) {
    const grid = document.getElementById('usageGrid');
    
    const cards = Object.entries(usageSpecs).map(([key, usage]) => `
        <div class="usage-card" data-usage="${key}">
            <div class="usage-number">1</div>
            <img src="${usage.image}" alt="${usage.name}" class="usage-icon" onerror="this.style.display='none';">
            <div class="usage-title">${usage.name}</div>
            <div class="usage-desc">${getUsageDescription(key)}</div>
        </div>
    `).join('');
    
    grid.innerHTML = cards;
    setupEventListeners();
}

export function updateNumbers(selectedUsages) {
    const cards = document.querySelectorAll('.usage-card');
    cards.forEach(card => {
        const usage = card.dataset.usage;
        const index = selectedUsages.indexOf(usage);
        const numberElement = card.querySelector('.usage-number');
        
        if (index > -1) {
            numberElement.textContent = index + 1;
        }
    });
}

export function updateGenerateButton(selectedUsages) {
    document.getElementById('generateBtn').disabled = selectedUsages.length === 0;
}

export function resetSelections() {
    document.querySelectorAll('.usage-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('recommendations').style.display = 'none';
}

export function navigateLaptop(containerId, direction) {
    const container = document.getElementById(containerId);
    const slides = container.querySelectorAll('.laptop-slide');
    const currentSlide = container.querySelector('.laptop-slide:not([style*="display: none"])');
    const currentIndex = parseInt(currentSlide.dataset.laptopIndex);
    
    let newIndex = currentIndex + direction;
    
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    currentSlide.style.display = 'none';
    slides[newIndex].style.display = 'block';
    
    slides[newIndex].style.opacity = '0';
    slides[newIndex].style.transform = 'translateX(' + (direction > 0 ? '20px' : '-20px') + ')';
    
    setTimeout(() => {
        slides[newIndex].style.transition = 'all 0.3s ease';
        slides[newIndex].style.opacity = '1';
        slides[newIndex].style.transform = 'translateX(0)';
    }, 10);
}
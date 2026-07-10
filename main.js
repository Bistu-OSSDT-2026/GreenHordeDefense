let selectedPlant = null;
let shovelMode = false;
let selectedPlants = [];
let currentSeason = null;

function startGame(season) {
    currentSeason = season;
    selectedPlants = [];
    
    document.getElementById('game-menu').classList.add('hidden');
    document.getElementById('plant-select-screen').classList.remove('hidden');
    document.getElementById('game-area').classList.add('hidden');
    
    updateSelectedPlantsPreview();
}

function togglePlantSelection(plantType) {
    audioManager.playClick();
    const index = selectedPlants.indexOf(plantType);
    
    if (index > -1) {
        selectedPlants.splice(index, 1);
    } else {
        if (selectedPlants.length >= 6) {
            return;
        }
        selectedPlants.push(plantType);
    }
    
    updateSelectedPlantsPreview();
}

function updateSelectedPlantsPreview() {
    const cards = document.querySelectorAll('.plant-select-card');
    cards.forEach(card => {
        const plantType = card.dataset.plant;
        card.classList.toggle('selected', selectedPlants.includes(plantType));
        card.classList.toggle('disabled', !selectedPlants.includes(plantType) && selectedPlants.length >= 6);
    });
    
    document.getElementById('selected-count').textContent = selectedPlants.length;
    
    const list = document.getElementById('selected-plants-list');
    list.innerHTML = '';
    
    selectedPlants.forEach((plantType, index) => {
        const config = Plant.getConfig(plantType);
        const item = document.createElement('div');
        item.className = 'selected-plant-preview';
        item.innerHTML = `
            <img src="${config.image}" class="plant-icon">
            <span class="plant-cost">${config.cost}</span>
            <span class="remove-btn" onclick="removeSelectedPlant(${index})">×</span>
        `;
        list.appendChild(item);
    });
    
    const confirmBtn = document.getElementById('confirm-plant-btn');
    confirmBtn.disabled = selectedPlants.length === 0;
}

function removeSelectedPlant(index) {
    audioManager.playClick();
    selectedPlants.splice(index, 1);
    updateSelectedPlantsPreview();
}

function confirmPlantSelection() {
    if (selectedPlants.length === 0) return;
    
    audioManager.playClick();
    audioManager.startBGM('day');
    
    document.getElementById('plant-select-screen').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    
    game = new Game();
    game.selectedPlants = [...selectedPlants];
    game.startGame(currentSeason);
    SeasonEffects.applySeasonEffects(currentSeason);
    SeasonEffects.createSeasonOverlay(currentSeason);
    shovelMode = false;
    updateShovelUI();
    
    updatePlantSelector();
}

function updatePlantSelector() {
    const selector = document.getElementById('plant-selector');
    const allCards = selector.querySelectorAll('.plant-card');
    allCards.forEach(card => card.remove());
    
    selectedPlants.forEach(plantType => {
        const config = Plant.getConfig(plantType);
        const card = document.createElement('div');
        card.className = 'plant-card';
        card.dataset.plant = plantType;
        card.onclick = () => selectPlant(plantType);
        card.innerHTML = `
            <img src="${config.image}" class="plant-icon">
            <span class="plant-cost">${config.cost}</span>
            <div class="plant-cooldown" id="cd-${plantType}"></div>
        `;
        selector.appendChild(card);
    });
}

function selectPlant(plantType) {
    const plantConfig = Plant.getConfig(plantType);
    if (game.sun < plantConfig.cost) {
        return;
    }

    audioManager.playClick();
    shovelMode = false;
    updateShovelUI();
    
    const cards = document.querySelectorAll('.plant-card');
    cards.forEach(card => card.classList.remove('selected'));

    const selectedCard = document.querySelector(`[data-plant="${plantType}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedPlant = plantType;
    }
}

function toggleShovel() {
    shovelMode = !shovelMode;
    updateShovelUI();
    if (shovelMode) {
        selectedPlant = null;
        const cards = document.querySelectorAll('.plant-card');
        cards.forEach(card => card.classList.remove('selected'));
    }
}

function updateShovelUI() {
    const shovelBtn = document.getElementById('shovel-btn');
    if (shovelBtn) {
        shovelBtn.classList.toggle('active', shovelMode);
    }
}

function handleCellClick(row, col) {
    if (game.state !== GAME_STATES.PLAYING) return;

    if (shovelMode) {
        game.removePlant(row, col);
        return;
    }

    if (!selectedPlant) return;

    const success = game.placePlant(selectedPlant, row, col);
    if (success) {
        selectedPlant = null;
        const cards = document.querySelectorAll('.plant-card');
        cards.forEach(card => card.classList.remove('selected'));
    }
}

function togglePause() {
    if (game) {
        game.togglePause();
    }
}

function backToMenu() {
    if (game) {
        game.backToMenu();
    }
}

function restartGame() {
    if (game) {
        selectedPlant = null;
        shovelMode = false;
        updateShovelUI();
        const cards = document.querySelectorAll('.plant-card');
        cards.forEach(card => card.classList.remove('selected'));
        game.restartWithSelectedPlants();
    }
}

function updateBGMVolume(val) {
    audioManager.setBGMVolume(val / 100);
    document.getElementById('bgmVolumeValue').textContent = val + '%';
    document.getElementById('pauseBGMVolumeValue').textContent = val + '%';
    document.getElementById('pauseBGMVolume').value = val;
}

function updateSFXVolume(val) {
    audioManager.setSFXVolume(val / 100);
    document.getElementById('sfxVolumeValue').textContent = val + '%';
    document.getElementById('pauseSFXVolumeValue').textContent = val + '%';
    document.getElementById('pauseSFXVolume').value = val;
}

document.addEventListener('DOMContentLoaded', () => {
    const lawnContainer = document.getElementById('lawn-container');
    
    lawnContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('sun-item')) {
            e.stopPropagation();
        }
    });

    const plantKeys = {
        '1': 'sunflower',
        '2': 'peaShooter',
        '3': 'icePea',
        '4': 'doublePea',
        '5': 'firePea',
        '6': 'melonPult',
        '7': 'cherryBomb',
        '8': 'jalapeno',
        '9': 'wallnut',
        '0': 'squash',
        'q': 'doomShroom',
        'w': 'sunShroom',
        'e': 'puffShroom',
        'r': 'iceShroom'
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
            return;
        }
        if (e.key === 's' || e.key === 'S') {
            toggleShovel();
            return;
        }
        const plantType = plantKeys[e.key];
        if (plantType && game && game.state === GAME_STATES.PLAYING) {
            selectPlant(plantType);
        }
    });
});

function playSound(soundName) {
    const audio = new Audio(`95版/sounds/${soundName}.ogg`);
    audio.volume = 0.3;
    audio.play().catch(() => {});
}
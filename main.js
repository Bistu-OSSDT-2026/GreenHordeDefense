let selectedPlant = null;
let shovelMode = false;
let selectedBGM = 'day';
let isPreviewingBGM = false;

function selectBGM(track) {
    selectedBGM = track;
    AudioManager.playClick();
    if (isPreviewingBGM) {
        AudioManager.stopBGM(() => {
            AudioManager.startBGM(track);
        });
    }
}

function toggleBGMPreview() {
    const btn = document.getElementById('bgmPreviewBtn');
    AudioManager.playClick();

    if (isPreviewingBGM) {
        AudioManager.stopBGM();
        isPreviewingBGM = false;
        btn.textContent = '▶ 试听';
    } else {
        AudioManager.startBGM(selectedBGM);
        isPreviewingBGM = true;
        btn.textContent = '⏹ 停止';
    }
}

function updateMenuBGMVolume(val) {
    document.getElementById('menuBGMVolumeValue').textContent = val + '%';
    AudioManager.setBGMVolume(val / 100);
}

function startGame(season) {
    AudioManager.playClick();
    if (isPreviewingBGM) {
        AudioManager.stopBGM(() => {
            AudioManager.startBGM(selectedBGM);
        });
    } else {
        AudioManager.startBGM(selectedBGM);
    }
    game = new Game();
    game.startGame(season);
    SeasonEffects.applySeasonEffects(season);
    SeasonEffects.createSeasonOverlay(season);
    shovelMode = false;
    updateShovelUI();
}

function selectPlant(plantType) {
    const plantConfig = Plant.getConfig(plantType);
    if (game.sun < plantConfig.cost) {
        return;
    }

    AudioManager.playClick();
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
    AudioManager.playClick();
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
        AudioManager.playClick();
        game.togglePause();
    }
}

function backToMenu() {
    if (game) {
        AudioManager.playClick();
        AudioManager.stopBGM();
        isPreviewingBGM = false;
        const btn = document.getElementById('bgmPreviewBtn');
        if (btn) btn.textContent = '▶ 试听';
        game.backToMenu();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const lawnContainer = document.getElementById('lawn-container');
    
    lawnContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('sun-item')) {
            e.stopPropagation();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePause();
        }
    });

    document.addEventListener('click', () => {
        AudioManager.init();
    }, { once: true });
});
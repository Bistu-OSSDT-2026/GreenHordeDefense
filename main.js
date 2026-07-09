let selectedPlant = null;
let shovelMode = false;

function startGame(season) {
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
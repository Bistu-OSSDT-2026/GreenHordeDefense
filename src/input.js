// Event handling module for PVZ game.
// Sets up all DOM event listeners via delegation.
// No imports from game modules — uses callbacks pattern.

export function initInput(gameState, callbacks) {
    // gameState: { selectedPlant: string|null, shovelMode: boolean }
    // callbacks: { onStartGame, onSelectPlant, onToggleShovel, onCellClick,
    //              onTogglePause, onBackToMenu, onCollectSun }

    // --- Season buttons: delegate on .season-select ---
    const seasonSelect = document.querySelector('.season-select');
    function handleSeasonClick(e) {
        const btn = e.target.closest('.season-btn');
        if (!btn) return;
        const season = ['spring', 'summer', 'autumn', 'winter']
            .find(s => btn.classList.contains(s));
        if (season) callbacks.onStartGame(season);
    }
    if (seasonSelect) {
        seasonSelect.addEventListener('click', handleSeasonClick);
    }

    // --- Plant cards: delegate on #plant-selector ---
    const plantSelector = document.getElementById('plant-selector');
    function handlePlantCardClick(e) {
        const card = e.target.closest('.plant-card');
        if (!card || card.classList.contains('disabled')) return;
        const plantType = card.dataset.plant;
        if (plantType) callbacks.onSelectPlant(plantType);
    }
    if (plantSelector) {
        plantSelector.addEventListener('click', handlePlantCardClick);
    }

    // --- Grid cells: delegate on #lawn ---
    const lawn = document.getElementById('lawn');
    function handleLawnClick(e) {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        callbacks.onCellClick(row, col);
    }
    if (lawn) {
        lawn.addEventListener('click', handleLawnClick);
    }

    // --- Sun items: delegate on #lawn-container ---
    const lawnContainer = document.getElementById('lawn-container');
    function handleSunClick(e) {
        const sunItem = e.target.closest('.sun-item');
        if (!sunItem) return;
        e.stopPropagation();
        const sunId = parseFloat(sunItem.id.replace('sun-', ''));
        if (!isNaN(sunId) && callbacks.onCollectSun) {
            callbacks.onCollectSun(sunId);
        }
    }
    if (lawnContainer) {
        lawnContainer.addEventListener('click', handleSunClick);
    }

    // --- Shovel button ---
    const shovelBtn = document.getElementById('shovel-btn');
    if (shovelBtn) {
        shovelBtn.addEventListener('click', callbacks.onToggleShovel);
    }

    // --- Pause button ---
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', callbacks.onTogglePause);
    }

    // --- Pause overlay buttons ---
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
        const continueBtn = pauseOverlay.querySelector('button:nth-child(2)');
        const menuBtn = pauseOverlay.querySelector('button:nth-child(3)');
        if (continueBtn) continueBtn.addEventListener('click', callbacks.onTogglePause);
        if (menuBtn) menuBtn.addEventListener('click', callbacks.onBackToMenu);
    }

    // --- Game-over button ---
    const gameOver = document.getElementById('game-over');
    if (gameOver) {
        const menuBtn = gameOver.querySelector('button');
        if (menuBtn) menuBtn.addEventListener('click', callbacks.onBackToMenu);
    }

    // --- Keyboard shortcuts ---
    const plantKeys = {
        '1': 'sunflower', '2': 'peaShooter', '3': 'icePea', '4': 'doublePea',
        '5': 'firePea', '6': 'melonPult', '7': 'cherryBomb', '8': 'jalapeno',
        '9': 'wallnut', '0': 'squash', 'q': 'doomShroom', 'w': 'sunShroom',
        'e': 'puffShroom', 'r': 'iceShroom'
    };
    function handleKeydown(e) {
        if (e.key === 'Escape') { callbacks.onTogglePause(); return; }
        if (e.key === 's' || e.key === 'S') { callbacks.onToggleShovel(); return; }
        const plantType = plantKeys[e.key];
        if (plantType) callbacks.onSelectPlant(plantType);
    }
    document.addEventListener('keydown', handleKeydown);

    // Return cleanup function
    return () => {
        if (seasonSelect) seasonSelect.removeEventListener('click', handleSeasonClick);
        if (plantSelector) plantSelector.removeEventListener('click', handlePlantCardClick);
        if (lawn) lawn.removeEventListener('click', handleLawnClick);
        if (lawnContainer) lawnContainer.removeEventListener('click', handleSunClick);
        if (shovelBtn) shovelBtn.removeEventListener('click', callbacks.onToggleShovel);
        if (pauseBtn) pauseBtn.removeEventListener('click', callbacks.onTogglePause);
        document.removeEventListener('keydown', handleKeydown);
    };
}

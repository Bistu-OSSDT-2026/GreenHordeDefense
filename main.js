let selectedPlant = null;
let shovelMode = false;

// 由 plant-picker.js 调用：本局已选的植物 ID 数组（来自用户挑选）
// 为 null 或 undefined 时不进行过滤（兼容老流程）
let currentPickedPlants = null;

function startGame(season, pickedPlants) {
    // 兼容：若没传 pickedPlants（老调用方式）则不过滤
    currentPickedPlants = Array.isArray(pickedPlants) ? pickedPlants.slice() : null;

    game = new Game();
    game.startGame(season);
    SeasonEffects.applySeasonEffects(season);
    SeasonEffects.createSeasonOverlay(season);
    shovelMode = false;
    updateShovelUI();
}

function selectPlant(plantType) {
    // 防御性过滤：如果没在本局挑选列表里，禁止选择
    if (currentPickedPlants && currentPickedPlants.indexOf(plantType) < 0) {
        return;
    }

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
        // 双保险：没在选择器的卡也跳过
        if (selectedCard.classList.contains('picker-hidden')) return;
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
        // 回到菜单时清掉过滤
        currentPickedPlants = null;
        const cards = document.querySelectorAll('.plant-card');
        cards.forEach(card => card.classList.remove('picker-hidden'));
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
        game.restartGame();
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
});

function playSound(soundName) {
    const audio = new Audio(`95版/sounds/${soundName}.ogg`);
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

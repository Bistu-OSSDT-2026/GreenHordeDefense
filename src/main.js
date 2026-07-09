import { GAME_STATES } from './constants.js';
import { Game } from './Game.js';
import { Plant } from './Plant.js';
import { LevelManager, SeasonEffects } from './LevelManager.js';
import * as UI from './ui.js';
import { initInput } from './input.js';

// --- Application state ---
let game = null;
const levelManager = new LevelManager();

// --- UI state owned by main.js, referenced by input.js ---
const gameState = {
    selectedPlant: null,
    shovelMode: false
};

// --- Callbacks wired to input.js ---
const callbacks = {
    onStartGame(season) {
        game = new Game();
        game.startGame(season, levelManager);
        SeasonEffects.applySeasonEffects(season);
        SeasonEffects.createSeasonOverlay(season);
        gameState.shovelMode = false;
        gameState.selectedPlant = null;
        UI.updateShovelButton(false);
        UI.deselectAllPlantCards();
    },

    onSelectPlant(plantType) {
        if (!game || game.state !== GAME_STATES.PLAYING) return;
        const config = Plant.getConfig(plantType);
        if (game.sun < config.cost) return;

        gameState.shovelMode = false;
        UI.updateShovelButton(false);
        gameState.selectedPlant = plantType;
        UI.selectPlantCard(plantType);
    },

    onToggleShovel() {
        gameState.shovelMode = !gameState.shovelMode;
        UI.updateShovelButton(gameState.shovelMode);
        if (gameState.shovelMode) {
            gameState.selectedPlant = null;
            UI.deselectAllPlantCards();
        }
    },

    onCellClick(row, col) {
        if (!game || game.state !== GAME_STATES.PLAYING) return;

        if (gameState.shovelMode) {
            game.removePlant(row, col);
            return;
        }

        if (!gameState.selectedPlant) return;

        const success = game.placePlant(gameState.selectedPlant, row, col);
        if (success) {
            gameState.selectedPlant = null;
            UI.deselectAllPlantCards();
        }
    },

    onTogglePause() {
        if (game) game.togglePause();
    },

    onBackToMenu() {
        if (game) game.backToMenu();
    },

    onCollectSun(sunId) {
        if (game) game.collectSun(sunId);
    }
};

// --- Initialize input handling ---
initInput(gameState, callbacks);

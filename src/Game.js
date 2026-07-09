import { GAME_STATES, SEASON_RULES, PLANT_TYPES } from './constants.js';
import { Plant } from './Plant.js';
import { Projectile } from './Plant.js';
import { Zombie } from './Zombie.js';
import * as UI from './ui.js';

export class Game {
    constructor() {
        this.state = GAME_STATES.MENU;
        this.sun = 150;
        this.currentSeason = 'spring';
        this.currentWave = 0;
        this.maxWaves = 5;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.sunItems = [];
        this.lawnmowers = [true, true, true, true, true];
        this.score = 0;
        this.selectedPlant = null;
        this.lastSunDrop = 0;
        this.sunDropInterval = 7500;
        this.waveTimer = 0;
        this.waveDelay = 15000;
        this.gameLoop = null;
        this.lastUpdate = 0;
        this.weather = 'sunny';
        this.bigWaveCount = 0;
        this.lastBigWave = 0;
        this.levelManager = null;
        this.zombiesInWave = 0;
        this.zombiesSpawned = 0;
        this.cooldowns = {};
        this.pausedAt = null;
    }

    startGame(season, levelManager) {
        this.currentSeason = season;
        this.state = GAME_STATES.PLAYING;
        this.sun = 150;
        this.currentWave = 0;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.sunItems = [];
        this.lawnmowers = [true, true, true, true, true];
        this.score = 0;
        this.selectedPlant = null;
        this.lastSunDrop = Date.now();
        this.waveTimer = Date.now();
        this.bigWaveCount = 0;
        this.lastBigWave = 0;
        this.levelManager = levelManager;
        this.zombiesInWave = 0;
        this.zombiesSpawned = 0;
        this.cooldowns = {};
        this.pausedAt = null;

        const level = levelManager.getLevelById(season);
        this.weather = level ? level.weather : 'sunny';
        this.maxWaves = level ? level.waves.length : 5;

        this.updateUI();
        this.showSeasonEffect(season);
        this.startWave();
        this.startGameLoop();
    }

    startGameLoop() {
        this.lastUpdate = Date.now();
        const loop = () => {
            if (this.state !== GAME_STATES.PLAYING) return;

            const now = Date.now();
            const deltaTime = now - this.lastUpdate;
            this.lastUpdate = now;

            this.update(deltaTime);
            this.render();

            this.gameLoop = requestAnimationFrame(loop);
        };
        this.gameLoop = requestAnimationFrame(loop);
    }

    update(deltaTime) {
        this.updateSunDrop();
        this.updatePlants(deltaTime);
        this.updateZombies(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateSunItems(deltaTime);
        this.checkWaveTransition();
        this.checkGameOver();
    }

    updateSunDrop() {
        const now = Date.now();
        if (now - this.lastSunDrop >= this.sunDropInterval) {
            this.spawnSun();
            this.lastSunDrop = now;
        }
    }

    spawnSun() {
        const container = document.getElementById('lawn-container');
        const containerHeight = container.clientHeight;
        const x = Math.random() * (window.innerWidth - 100) + 50;
        const targetY = Math.random() * (containerHeight - 200) + 100;

        const sunItem = {
            id: Date.now() + Math.random(),
            x,
            y: -50,
            targetY,
            state: 'falling',
            createdAt: Date.now()
        };
        this.sunItems.push(sunItem);

        const sunElement = UI.createSunElement(container, sunItem, () => this.collectSun(sunItem.id));

        setTimeout(() => {
            UI.transitionSunToStationary(sunElement, targetY);
            sunItem.state = 'stationary';
            sunItem.y = targetY;
        }, 3000);
    }

    spawnSunNearPlant(plant) {
        const container = document.getElementById('lawn-container');
        const x = plant.x + (Math.random() - 0.5) * 60;
        const y = plant.y + (Math.random() - 0.5) * 60;

        const sunItem = {
            id: Date.now() + Math.random(),
            x,
            y: y - 80,
            targetY: y,
            state: 'falling',
            createdAt: Date.now()
        };
        this.sunItems.push(sunItem);

        const sunElement = UI.createSunElement(container, sunItem, () => this.collectSun(sunItem.id));

        setTimeout(() => {
            UI.transitionSunToStationary(sunElement, y);
            sunItem.state = 'stationary';
            sunItem.y = y;
        }, 1500);
    }

    collectSun(id) {
        const index = this.sunItems.findIndex(s => s.id === id);
        if (index !== -1) {
            this.sun += 25;
            this.sunItems.splice(index, 1);
            UI.removeSunElement(id);
            UI.updateSunDisplay(this.sun);
        }
    }

    updatePlants(deltaTime) {
        for (let i = this.plants.length - 1; i >= 0; i--) {
            this.plants[i].update(deltaTime, this);
        }
    }

    updateZombies(deltaTime) {
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            zombie.update(deltaTime, this);

            if (zombie.health <= 0) {
                this.zombies.splice(i, 1);
                this.score += zombie.score;
                UI.updateScoreDisplay(this.score);

                if (zombie.wasBurned) {
                    zombie.showAshAnimation();
                    setTimeout(() => UI.removeElementById(`zombie-${zombie.id}`), 1000);
                } else {
                    zombie.showDeadAnimation();
                    setTimeout(() => UI.removeElementById(`zombie-${zombie.id}`), 500);
                }
            } else if (zombie.x < 0 && !zombie.hasEnteredHouse) {
                zombie.hasEnteredHouse = true;
                this.handleZombieEnterHouse(zombie.row);
            }
        }
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);

            if (projectile.x > window.innerWidth || projectile.x < 0) {
                this.projectiles.splice(i, 1);
                UI.removeElementById(`proj-${projectile.id}`);
                continue;
            }

            for (const zombie of this.zombies) {
                if (zombie.row === projectile.row &&
                    Math.abs(zombie.x - projectile.x) < 50 &&
                    Math.abs(zombie.y - projectile.y) < 50) {

                    this.handleProjectileHit(projectile, zombie);
                    this.projectiles.splice(i, 1);
                    UI.removeElementById(`proj-${projectile.id}`);
                    break;
                }
            }
        }
    }

    updateSunItems(deltaTime) {
        const now = Date.now();
        const SUN_EXPIRE_TIME = 8000;
        for (let i = this.sunItems.length - 1; i >= 0; i--) {
            const sun = this.sunItems[i];
            if (sun.state === 'stationary' && now - sun.createdAt > SUN_EXPIRE_TIME + 3000) {
                this.sunItems.splice(i, 1);
                UI.fadeOutSunElement(sun.id);
            }
        }
    }

    startWave() {
        this.currentWave++;
        this.waveTimer = Date.now();
        UI.updateWaveDisplay(this.currentWave, this.maxWaves);

        if (this.currentWave > this.maxWaves) {
            return;
        }

        const level = this.levelManager.getLevelById(this.currentSeason);
        const waveConfig = level ? level.waves[this.currentWave - 1] : null;
        if (!waveConfig) return;

        const totalZombies = waveConfig.zombies.reduce((sum, g) => sum + g.count, 0);
        this.zombiesInWave = totalZombies;
        this.zombiesSpawned = 0;

        if (waveConfig.isBigWave) {
            this.bigWaveCount++;
            UI.showBigWaveWarning();
        }

        this.spawnZombies(waveConfig);
    }

    spawnZombies(waveConfig) {
        let delay = 0;
        for (const group of waveConfig.zombies) {
            for (let i = 0; i < group.count; i++) {
                setTimeout(() => {
                    if (this.state !== GAME_STATES.PLAYING) return;
                    const row = Math.floor(Math.random() * 5);
                    this.spawnZombie(group.type, row);
                }, delay);
                delay += 3000;
            }
        }
    }

    spawnZombie(type, row) {
        const zombie = this.createZombie(type, row);
        this.zombies.push(zombie);
        this.zombiesSpawned++;
        zombie.createElement();
    }

    createZombie(type, row) {
        const zombieConfigs = {
            normal: { health: 200, speed: 0.8, name: '普通僵尸', score: 100 },
            cone: { health: 600, speed: 0.75, name: '路障僵尸', score: 200 },
            bucket: { health: 1200, speed: 0.7, name: '铁桶僵尸', score: 300 },
            football: { health: 1600, speed: 1.0, name: '橄榄球僵尸', score: 400 },
            newspaper: { health: 300, speed: 0.5, name: '读报僵尸', score: 150, hasNewspaper: true }
        };

        const config = zombieConfigs[type] || zombieConfigs.normal;
        const rules = SEASON_RULES[this.currentSeason];
        const speed = config.speed * (rules.zombieMoveSpeedMultiplier || 1);

        return new Zombie(type, config.health, speed, row, config.name, config.score, config.hasNewspaper);
    }

    handleZombieEnterHouse(row) {
        if (this.lawnmowers[row]) {
            this.lawnmowers[row] = false;
            this.triggerLawnmower(row);
        } else {
            this.loseGame();
        }
    }

    triggerLawnmower(row) {
        const lawnmower = document.getElementById(`lawnmower-${row}`);
        if (lawnmower) {
            lawnmower.classList.add('triggered');

            for (let i = this.zombies.length - 1; i >= 0; i--) {
                const zombie = this.zombies[i];
                if (zombie.row === row) {
                    this.zombies.splice(i, 1);
                    this.score += zombie.score;
                    UI.updateScoreDisplay(this.score);
                    UI.removeElementById(`zombie-${zombie.id}`);
                }
            }

            setTimeout(() => {
                if (lawnmower) lawnmower.remove();
            }, 3000);
        }
    }

    handleProjectileHit(projectile, zombie) {
        let damage = projectile.damage;
        const rules = SEASON_RULES[this.currentSeason];

        if (rules.shooterDamageMultiplier && PLANT_TYPES.SHOOTER.includes(projectile.plantType)) {
            damage *= rules.shooterDamageMultiplier;
        }

        if (rules.fireDamageMultiplier && PLANT_TYPES.FIRE.includes(projectile.plantType)) {
            damage *= rules.fireDamageMultiplier;
        }

        zombie.takeDamage(damage);

        if (projectile.type === 'icePea') {
            zombie.slowed = true;
            zombie.slowTimer = 3000;
        }
    }

    placePlant(plantType, row, col) {
        const plantConfig = Plant.getConfig(plantType);
        if (this.sun < plantConfig.cost) return false;

        const existingPlant = this.plants.find(p => p.row === row && p.col === col);
        if (existingPlant) return false;

        this.sun -= plantConfig.cost;
        const plant = new Plant(plantType, row, col, this);
        this.plants.push(plant);
        plant.createElement();

        UI.updateSunDisplay(this.sun);
        this.startPlantCooldown(plantType);

        return true;
    }

    removePlant(row, col) {
        const plant = this.plants.find(p => p.row === row && p.col === col);
        if (plant) {
            plant.destroy(); // destroy() handles array removal
            return true;
        }
        return false;
    }

    startPlantCooldown(plantType) {
        const plantConfig = Plant.getConfig(plantType);
        const rules = SEASON_RULES[this.currentSeason];
        const cooldown = plantConfig.cooldown * (rules.plantCooldownMultiplier || 1);
        const cooldownMs = cooldown * 1000;
        this.cooldowns[plantType] = Date.now() + cooldownMs;
        UI.startPlantCooldown(plantType, cooldownMs);
    }

    checkGameOver() {
        if (this.zombies.some(z => z.x < -100 && z.hasEnteredHouse && !this.lawnmowers[z.row])) {
            this.loseGame();
        }
    }

    checkWaveTransition() {
        if (this.currentWave > this.maxWaves) return;
        if (this.state !== GAME_STATES.PLAYING) return;
        if (this.zombiesSpawned < this.zombiesInWave) return;
        if (this.zombies.length > 0) return;

        const now = Date.now();
        if (now - this.waveTimer < this.waveDelay) return;

        if (this.currentWave >= this.maxWaves) {
            this.winGame();
        } else {
            this.startWave();
        }
    }

    winGame() {
        this.state = GAME_STATES.WIN;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        UI.showGameOver('🎉 胜利！', `恭喜你在${SEASON_RULES[this.currentSeason].name}中击败了所有僵尸！`);
    }

    loseGame() {
        this.state = GAME_STATES.LOSE;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        UI.showGameOver('💀 失败', '僵尸攻入了你的家门！');
    }

    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            this.pausedAt = Date.now();
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
            UI.showPauseOverlay();
        } else if (this.state === GAME_STATES.PAUSED) {
            const pauseDuration = Date.now() - this.pausedAt;
            this.pausedAt = null;

            // Compensate sun drop and wave timers
            this.lastSunDrop += pauseDuration;
            this.waveTimer += pauseDuration;

            // Restart active cooldowns with adjusted remaining time
            const now = Date.now();
            for (const [plantType, endTime] of Object.entries(this.cooldowns)) {
                const remaining = endTime + pauseDuration - now;
                if (remaining > 0) {
                    this.cooldowns[plantType] = now + remaining;
                    UI.startPlantCooldown(plantType, remaining);
                } else {
                    delete this.cooldowns[plantType];
                    UI.finishPlantCooldown(plantType);
                }
            }

            this.state = GAME_STATES.PLAYING;
            this.startGameLoop();
            UI.hidePauseOverlay();
        }
    }

    backToMenu() {
        this.state = GAME_STATES.MENU;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.cooldowns = {};
        UI.cancelAllCooldowns();
        UI.hideAllOverlays();
        UI.showMenu();
    }

    updateUI() {
        UI.showGameArea();
        UI.updateSunDisplay(this.sun);
        UI.updateWaveDisplay(this.currentWave, this.maxWaves);
        UI.updateSeasonDisplay(SEASON_RULES[this.currentSeason].name);
    }

    showSeasonEffect(season) {
        UI.applySeasonEffect(season);
    }

    render() {
        for (const plant of this.plants) {
            plant.render();
        }
        for (const zombie of this.zombies) {
            zombie.render();
        }
        for (const projectile of this.projectiles) {
            projectile.render();
        }
    }
}

const PLANT_TYPES = {
    ASH: ['cherryBomb', 'jalapeno', 'doomShroom', 'squash'],
    SHOOTER: ['peaShooter', 'icePea', 'doublePea', 'firePea', 'puffShroom'],
    THROWER: ['melonPult'],
    FIRE: ['firePea', 'jalapeno'],
    ICE: ['icePea', 'iceShroom'],
    SUN: ['sunflower', 'sunShroom'],
    DEFENSE: ['wallnut']
};

const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose'
};

const SEASON_RULES = {
    spring: {
        name: '春天',
        sunShroomGrowthSpeed: 1.2,
        plantCooldownMultiplier: 0.85,
        shooterDamageMultiplier: 1.2,
        wallnutHealPerSecond: 1
    },
    summer: {
        name: '夏天',
        fireDamageMultiplier: 1.5,
        zombieAttackSpeedMultiplier: 1.2,
        zombieMoveSpeedMultiplier: 1.0
    },
    autumn: {
        name: '秋天',
        zombieMoveSpeedMultiplier: 1.1,
        shooterAccuracy: 0.85,
        ashExplosionRangeMultiplier: 0.8,
        wallnutLeafShield: true
    },
    winter: {
        name: '冬天',
        sunProductionNormal: true,
        plantCooldownMultiplier: 1.15,
        zombieMoveSpeedMultiplier: 0.8,
        zombieAttackSpeedMultiplier: 0.8
    }
};

class Game {
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
    }

    startGame(season) {
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
        
        const level = levelManager.getLevelById(season);
        this.weather = level ? level.weather : 'sunny';
        
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
        this.updateCooldowns(deltaTime);
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
            rotation: 0
        };
        this.sunItems.push(sunItem);
        
        const sunElement = document.createElement('div');
        sunElement.className = 'sun-item falling';
        sunElement.id = `sun-${sunItem.id}`;
        sunElement.style.left = `${x}px`;
        sunElement.style.top = '-50px';
        sunElement.style.setProperty('--target-y', `${targetY}px`);
        sunElement.innerHTML = `<img src="95版/images/Sun1.png" style="width:100%;height:100%;">`;
        sunElement.onclick = () => this.collectSun(sunItem.id);
        document.getElementById('lawn-container').appendChild(sunElement);
        
        setTimeout(() => {
            sunElement.classList.remove('falling');
            sunElement.classList.add('stationary');
            sunElement.style.top = `${targetY}px`;
            sunItem.state = 'stationary';
            sunItem.y = targetY;
        }, 3000);
    }

    spawnSunNearPlant(plant) {
        const x = plant.x + (Math.random() - 0.5) * 60;
        const y = plant.y + (Math.random() - 0.5) * 60;
        
        const sunItem = {
            id: Date.now() + Math.random(),
            x,
            y: y - 80,
            targetY: y,
            state: 'falling',
            rotation: 0
        };
        this.sunItems.push(sunItem);
        
        const sunElement = document.createElement('div');
        sunElement.className = 'sun-item falling';
        sunElement.id = `sun-${sunItem.id}`;
        sunElement.style.left = `${x}px`;
        sunElement.style.top = `${y - 80}px`;
        sunElement.style.setProperty('--target-y', '80px');
        sunElement.innerHTML = `<img src="95版/images/Sun1.png" style="width:100%;height:100%;">`;
        sunElement.onclick = () => this.collectSun(sunItem.id);
        document.getElementById('lawn-container').appendChild(sunElement);
        
        setTimeout(() => {
            sunElement.classList.remove('falling');
            sunElement.classList.add('stationary');
            sunElement.style.top = `${y}px`;
            sunItem.state = 'stationary';
            sunItem.y = y;
        }, 1500);
    }

    collectSun(id) {
        const index = this.sunItems.findIndex(s => s.id === id);
        if (index !== -1) {
            this.sun += 25;
            this.sunItems.splice(index, 1);
            const element = document.getElementById(`sun-${id}`);
            if (element) element.remove();
            this.updateSunUI();
        }
    }

    updatePlants(deltaTime) {
        for (const plant of this.plants) {
            plant.update(deltaTime, this);
        }
    }

    updateZombies(deltaTime) {
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            zombie.update(deltaTime, this);
            
            if (zombie.health <= 0) {
                this.zombies.splice(i, 1);
                this.score += zombie.score;
                this.updateScoreUI();
                
                if (zombie.wasBurned) {
                    zombie.showAshAnimation();
                    setTimeout(() => {
                        const element = document.getElementById(`zombie-${zombie.id}`);
                        if (element) element.remove();
                    }, 1000);
                } else {
                    zombie.showDeadAnimation();
                    setTimeout(() => {
                        const element = document.getElementById(`zombie-${zombie.id}`);
                        if (element) element.remove();
                    }, 500);
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
                const element = document.getElementById(`proj-${projectile.id}`);
                if (element) element.remove();
                continue;
            }
            
            for (const zombie of this.zombies) {
                if (zombie.row === projectile.row &&
                    Math.abs(zombie.x - projectile.x) < 50 &&
                    Math.abs(zombie.y - projectile.y) < 50) {
                    
                    this.handleProjectileHit(projectile, zombie);
                    this.projectiles.splice(i, 1);
                    const element = document.getElementById(`proj-${projectile.id}`);
                    if (element) element.remove();
                    break;
                }
            }
        }
    }

    updateSunItems(deltaTime) {
        for (let i = this.sunItems.length - 1; i >= 0; i--) {
            const sun = this.sunItems[i];
            sun.y += sun.vy;
            sun.rotation += 0.05;
            
            const element = document.getElementById(`sun-${sun.id}`);
            if (element) {
                element.style.top = `${sun.y}px`;
                element.style.transform = `rotate(${sun.rotation}deg)`;
            }
            
            if (sun.y > window.innerHeight) {
                this.sunItems.splice(i, 1);
                if (element) element.remove();
            }
        }
    }

    startWave() {
        this.currentWave++;
        this.waveTimer = Date.now();
        this.updateWaveUI();
        
        if (this.currentWave > this.maxWaves) {
            return;
        }
        
        const level = levelManager.getLevelById(this.currentSeason);
        const waveConfig = level ? level.waves[this.currentWave - 1] : null;
        if (!waveConfig) return;
        
        if (waveConfig.isBigWave) {
            this.bigWaveCount++;
            this.showBigWaveWarning();
        }
        
        this.spawnZombies(waveConfig);
    }

    showBigWaveWarning() {
        const warning = document.createElement('div');
        warning.style.position = 'absolute';
        warning.style.top = '50%';
        warning.style.left = '50%';
        warning.style.transform = 'translate(-50%, -50%)';
        warning.style.fontSize = '3rem';
        warning.style.fontWeight = 'bold';
        warning.style.color = '#ef4444';
        warning.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.8)';
        warning.style.zIndex = '100';
        warning.style.pointerEvents = 'none';
        warning.textContent = '一大波僵尸即将来袭！';
        document.getElementById('lawn-container').appendChild(warning);
        
        setTimeout(() => warning.remove(), 3000);
    }

    checkWaveTransition() {
        if (this.zombies.length === 0 && this.currentWave > 0) {
            if (this.currentWave >= this.maxWaves && this.bigWaveCount >= 2) {
                this.winGame();
                return;
            }
            
            const now = Date.now();
            if (now - this.waveTimer >= this.waveDelay) {
                this.startWave();
            }
        }
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
                    this.updateScoreUI();
                    const element = document.getElementById(`zombie-${zombie.id}`);
                    if (element) element.remove();
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
        
        this.updateSunUI();
        this.startPlantCooldown(plantType);
        
        return true;
    }

    removePlant(row, col) {
        const index = this.plants.findIndex(p => p.row === row && p.col === col);
        if (index !== -1) {
            const plant = this.plants[index];
            plant.destroy();
            this.plants.splice(index, 1);
            return true;
        }
        return false;
    }

    startPlantCooldown(plantType) {
        const plantConfig = Plant.getConfig(plantType);
        const rules = SEASON_RULES[this.currentSeason];
        const cooldown = plantConfig.cooldown * (rules.plantCooldownMultiplier || 1);
        
        const cdElement = document.getElementById(`cd-${plantType}`);
        if (cdElement) {
            cdElement.style.height = '100%';
            const card = cdElement.parentElement;
            card.classList.add('disabled');
            
            setTimeout(() => {
                cdElement.style.height = '0%';
                card.classList.remove('disabled');
            }, cooldown * 1000);
        }
    }

    updateCooldowns(deltaTime) {
        for (const plant of this.plants) {
            if (plant.attackCooldown > 0) {
                plant.attackCooldown -= deltaTime;
            }
        }
    }

    checkGameOver() {
        if (this.zombies.some(z => z.x < -100 && z.hasEnteredHouse && !this.lawnmowers[z.row])) {
            this.loseGame();
        }
    }

    winGame() {
        this.state = GAME_STATES.WIN;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('game-over-title').textContent = '🎉 胜利！';
        document.getElementById('game-over-message').textContent = `恭喜你在${SEASON_RULES[this.currentSeason].name}中击败了所有僵尸！`;
    }

    loseGame() {
        this.state = GAME_STATES.LOSE;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('game-over-title').textContent = '💀 失败';
        document.getElementById('game-over-message').textContent = '僵尸攻入了你的家门！';
    }

    togglePause() {
        if (this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.PAUSED;
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
            document.getElementById('pause-overlay').classList.remove('hidden');
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.startGameLoop();
            document.getElementById('pause-overlay').classList.add('hidden');
        }
    }

    backToMenu() {
        this.state = GAME_STATES.MENU;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        
        document.getElementById('game-area').classList.add('hidden');
        document.getElementById('game-menu').classList.remove('hidden');
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('pause-overlay').classList.add('hidden');
    }

    updateUI() {
        document.getElementById('game-menu').classList.add('hidden');
        document.getElementById('game-area').classList.remove('hidden');
        this.updateSunUI();
        this.updateWaveUI();
        this.updateSeasonUI();
    }

    updateSunUI() {
        document.getElementById('sun-count').textContent = this.sun;
    }

    updateScoreUI() {
        const el = document.getElementById('score-count');
        if (el) el.textContent = this.score;
    }

    updateWaveUI() {
        document.getElementById('wave-count').textContent = `${this.currentWave}/${this.maxWaves}`;
    }

    updateSeasonUI() {
        document.getElementById('season-info').textContent = SEASON_RULES[this.currentSeason].name;
    }

    showSeasonEffect(season) {
        const container = document.getElementById('lawn-container');
        
        container.querySelectorAll('.season-effect').forEach(el => el.remove());
        container.querySelectorAll('.rain-drop').forEach(el => el.remove());
        container.querySelectorAll('.fog-overlay').forEach(el => el.remove());
        container.querySelectorAll('.summer-glow').forEach(el => el.remove());
        container.querySelectorAll('.leaf').forEach(el => el.remove());
        container.querySelectorAll('.snowflake').forEach(el => el.remove());
        
        const effect = document.createElement('div');
        effect.className = `season-effect ${season}-effect`;
        container.appendChild(effect);
        
        switch(season) {
            case 'spring':
                this.createRain();
                break;
            case 'summer':
                this.createSummerGlow();
                break;
            case 'autumn':
                this.createLeaves();
                this.createFog();
                break;
            case 'winter':
                this.createSnowflakes();
                break;
        }
    }

    createRain() {
        const container = document.getElementById('lawn-container');
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.animationDelay = `${Math.random() * 0.5}s`;
                drop.style.animationDuration = `${0.3 + Math.random() * 0.3}s`;
                container.appendChild(drop);
            }, i * 50);
        }
    }

    createSummerGlow() {
        const container = document.getElementById('lawn-container');
        const glow = document.createElement('div');
        glow.className = 'summer-glow';
        container.appendChild(glow);
    }

    createFog() {
        const container = document.getElementById('lawn-container');
        const fog = document.createElement('div');
        fog.className = 'fog-overlay';
        container.appendChild(fog);
    }

    createLeaves() {
        const container = document.getElementById('lawn-container');
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const leaf = document.createElement('div');
                leaf.className = 'leaf';
                leaf.style.left = `${Math.random() * 100}%`;
                leaf.style.animationDelay = `${Math.random() * 5}s`;
                leaf.style.animationDuration = `${5 + Math.random() * 5}s`;
                container.appendChild(leaf);
            }, i * 500);
        }
    }

    createSnowflakes() {
        const container = document.getElementById('lawn-container');
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const snowflake = document.createElement('div');
                snowflake.className = 'snowflake';
                snowflake.style.left = `${Math.random() * 100}%`;
                snowflake.style.animationDelay = `${Math.random() * 8}s`;
                snowflake.style.animationDuration = `${5 + Math.random() * 5}s`;
                container.appendChild(snowflake);
            }, i * 300);
        }
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

let game = new Game();
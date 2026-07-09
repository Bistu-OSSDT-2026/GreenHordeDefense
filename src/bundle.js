// PVZ Game Bundle - auto-generated, no ES modules required
(function() {
"use strict";

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

class Zombie {
    constructor(type, health, speed, row, name, score, hasNewspaper = false) {
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.baseSpeed = speed;
        this.speed = speed;
        this.row = row;
        this.name = name;
        this.score = score;
        this.hasNewspaper = hasNewspaper;
        this.newspaperHealth = 50;
        this.x = window.innerWidth + 100;
        this.y = this.calculateY(row);
        this.id = Date.now() + Math.random();
        this.element = null;
        this.eating = false;
        this.targetPlant = null;
        this.eatTimer = 0;
        this.hasEnteredHouse = false;
        this.slowed = false;
        this.slowTimer = 0;
        this.animationFrame = 0;
    }

    calculateY(row) {
        const containerHeight = document.getElementById('lawn-container').clientHeight;
        const rowHeight = containerHeight / 5;
        return rowHeight * row + rowHeight / 2 - 40;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'zombie';
        this.element.id = `zombie-${this.id}`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;

        let imagePath = '95版/reanim/Zombie_body.png';
        switch (this.type) {
            case 'cone':
                imagePath = '95版/reanim/Zombie_cone1.png';
                break;
            case 'bucket':
                imagePath = '95版/reanim/Zombie_bucket1.png';
                break;
            case 'football':
                imagePath = '95版/reanim/Zombie_body.png';
                break;
            case 'newspaper':
                imagePath = '95版/reanim/Zombie_body.png';
                break;
        }

        this.element.innerHTML = `
            <img src="${imagePath}" class="zombie-image" style="width:100%;height:100%;">
            <div class="zombie-ash" style="display:none;"></div>
            <div class="zombie-dead" style="display:none;"></div>
        `;
        document.getElementById('lawn-container').appendChild(this.element);
    }

    update(deltaTime, game) {
        if (this.slowed) {
            this.slowTimer -= deltaTime;
            if (this.slowTimer <= 0) {
                this.slowed = false;
                this.speed = this.baseSpeed;
            } else {
                this.speed = this.baseSpeed * 0.5;
            }
        }

        if (!this.eating) {
            this.x -= this.speed * deltaTime * 0.02;
            this.checkCollision(game);
        } else {
            this.eatTimer += deltaTime;
            const attackInterval = 1000 / (game.currentSeason === 'summer' ? 1.2 : 1);

            if (this.eatTimer >= attackInterval) {
                this.eatTimer = 0;
                this.eatPlant(game);
            }
        }

        this.animationFrame = (this.animationFrame + deltaTime * 0.01) % 100;

        if (this.hasNewspaper && this.newspaperHealth <= 0) {
            this.hasNewspaper = false;
            this.speed = this.baseSpeed * 2;
            if (this.element) {
                this.element.classList.add('enraged');
            }
        }
    }

    checkCollision(game) {
        const plantsInRow = game.plants.filter(p => p.row === this.row);

        const closestPlant = plantsInRow.find(p => {
            return p.x > this.x - 60 && p.x < this.x + 100;
        });

        if (closestPlant) {
            this.eating = true;
            this.targetPlant = closestPlant;
            this.x = Math.min(this.x, closestPlant.x - 80);
        } else {
            this.eating = false;
            this.targetPlant = null;
        }
    }

    eatPlant(game) {
        if (!this.targetPlant || this.targetPlant.health <= 0) {
            this.eating = false;
            this.targetPlant = null;
            return;
        }

        const plantType = this.targetPlant.type;
        let damage = 0;

        if (plantType === 'wallnut') {
            damage = this.targetPlant.maxHealth / 30;
        } else {
            damage = this.targetPlant.maxHealth / 3;
        }

        this.targetPlant.takeDamage(damage);
    }

    takeDamage(damage) {
        if (this.hasNewspaper) {
            this.newspaperHealth -= damage;
            if (this.newspaperHealth <= 0) {
                damage = Math.abs(this.newspaperHealth);
                this.hasNewspaper = false;
                this.speed = this.baseSpeed * 2;
                if (this.element) {
                    this.element.classList.add('enraged');
                }
            } else {
                return;
            }
        }

        this.health -= damage;
    }

    showAshAnimation() {
        if (!this.element) return;

        const image = this.element.querySelector('.zombie-image');
        const ash = this.element.querySelector('.zombie-ash');

        if (image) {
            image.style.display = 'none';
        }

        if (ash) {
            ash.style.display = 'block';
        }

        this.element.classList.add('ash');
    }

    showDeadAnimation() {
        if (!this.element) return;

        const image = this.element.querySelector('.zombie-image');
        const ash = this.element.querySelector('.zombie-ash');

        if (image) {
            image.style.display = 'none';
        }

        if (ash) {
            ash.style.display = 'none';
        }

        this.element.classList.add('dead');
    }

    render() {
        if (this.element) {
            this.element.style.left = `${this.x}px`;

            if (!this.eating) {
                const bounce = Math.sin(this.animationFrame) * 5;
                this.element.style.transform = `translateY(${bounce}px)`;
            }
        }
    }
}



class Plant {
    static configs = {
        sunflower: {
            cost: 50,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 7500,
            type: 'sun',
            image: '95版/reanim/SunFlower_head.png'
        },
        peaShooter: {
            cost: 100,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 1400,
            damage: 20,
            type: 'shooter',
            image: '95版/reanim/PeaShooter_Head.png'
        },
        icePea: {
            cost: 100,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 1400,
            damage: 20,
            type: 'shooter',
            projectileType: 'icePea',
            image: '95版/reanim/SnowPea_head.png'
        },
        doublePea: {
            cost: 200,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 1400,
            damage: 20,
            type: 'shooter',
            doubleShot: true,
            image: '95版/reanim/ThreePeater_head.png'
        },
        firePea: {
            cost: 175,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 1400,
            damage: 20,
            type: 'shooter',
            projectileType: 'firePea',
            image: '95版/reanim/PeaShooter_Head.png'
        },
        melonPult: {
            cost: 300,
            cooldown: 10,
            health: 100,
            attackCooldown: 2500,
            damage: 80,
            type: 'thrower',
            projectileType: 'melon',
            image: '95版/reanim/Melonpult_body.png'
        },
        cherryBomb: {
            cost: 150,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '95版/reanim/CherryBomb_left1.png'
        },
        jalapeno: {
            cost: 125,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '95版/reanim/Jalapeno_body.png'
        },
        wallnut: {
            cost: 50,
            cooldown: 30,
            health: 60,
            type: 'defense',
            maxHealth: 60,
            image: '95版/reanim/Wallnut_body.png'
        },
        squash: {
            cost: 50,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'melee',
            image: '95版/reanim/Squash_body.png'
        },
        doomShroom: {
            cost: 125,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '95版/reanim/DoomShroom_body.png'
        },
        sunShroom: {
            cost: 25,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 15000,
            type: 'sun',
            grows: true,
            growthTime: 20000,
            image: '95版/reanim/SunShroom_head.png'
        },
        puffShroom: {
            cost: 0,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 1400,
            damage: 20,
            type: 'shooter',
            image: '95版/reanim/PuffShroom_head.png'
        },
        iceShroom: {
            cost: 75,
            cooldown: 30,
            health: 100,
            type: 'ice',
            image: '95版/reanim/IceShroom_body.png'
        }
    };

    static getConfig(type) {
        return Plant.configs[type] || Plant.configs.peaShooter;
    }

    constructor(type, row, col, game) {
        this.type = type;
        this.row = row;
        this.col = col;
        this.game = game;
        this.config = Plant.getConfig(type);
        this.health = this.config.health;
        this.maxHealth = this.config.maxHealth || this.config.health;
        this.attackCooldown = 0;
        this.lastAttackTime = 0;
        this.grown = false;
        this.growthTimer = 0;
        this.exploding = false;
        this.explodeTimer = 0;
        this.targetZombie = null;
        this.id = Date.now() + Math.random();
        this.element = null;

        this.updatePosition();
    }

    updatePosition() {
        const lawn = document.getElementById('lawn');
        if (!lawn) return;

        const rows = lawn.getElementsByClassName('row');
        if (rows[this.row]) {
            const cells = rows[this.row].getElementsByClassName('cell');
            if (cells[this.col]) {
                const rect = cells[this.col].getBoundingClientRect();
                const containerRect = document.getElementById('lawn-container').getBoundingClientRect();
                this.x = rect.left - containerRect.left + rect.width / 2;
                this.y = rect.top - containerRect.top + rect.height / 2;
            }
        }
    }

    createElement() {
        const rows = document.getElementById('lawn').getElementsByClassName('row');
        if (rows[this.row]) {
            const cells = rows[this.row].getElementsByClassName('cell');
            if (cells[this.col]) {
                cells[this.col].classList.add('has-plant');

                this.element = document.createElement('img');
                this.element.className = 'plant-in-cell';
                this.element.src = this.config.image;
                this.element.id = `plant-${this.id}`;

                cells[this.col].appendChild(this.element);
            }
        }
        this.updatePosition();
    }

    update(deltaTime, game) {
        if (this.health <= 0) {
            this.destroy();
            return;
        }

        if (this.config.grows && !this.grown) {
            this.growthTimer += deltaTime;
            const growthTime = this.config.growthTime / (game.currentSeason === 'spring' ? 1.2 : 1);
            if (this.growthTimer >= growthTime) {
                this.grown = true;
                this.config.attackCooldown = 7500;
            }
        }

        if (game.currentSeason === 'spring' && this.type === 'wallnut') {
            this.health = Math.min(this.maxHealth, this.health + deltaTime * 0.001);
        }

        if (this.config.type === 'shooter' || this.config.type === 'thrower') {
            this.attackCooldown -= deltaTime;
            if (this.attackCooldown <= 0) {
                this.attack(game);
            }
        }

        if (this.config.type === 'sun') {
            this.attackCooldown -= deltaTime;
            if (this.attackCooldown <= 0) {
                this.produceSun(game);
                this.attackCooldown = this.config.attackCooldown;
            }
        }

        if (this.config.type === 'ash' && !this.exploding) {
            this.checkExplode(game);
        }

        if (this.type === 'squash') {
            this.checkSquash(game);
        }

        if (this.type === 'iceShroom') {
            this.freezeAll(game);
        }
    }

    attack(game) {
        const rules = SEASON_RULES[game.currentSeason];

        if (rules.shooterAccuracy !== undefined && Math.random() > rules.shooterAccuracy) {
            this.attackCooldown = this.config.attackCooldown;
            return;
        }

        const zombie = this.findTarget(game);
        if (!zombie) {
            this.attackCooldown = 100;
            return;
        }

        let damage = this.config.damage;

        if (game.weather === 'rain') {
            if (PLANT_TYPES.SHOOTER.includes(this.type) || PLANT_TYPES.THROWER.includes(this.type)) {
                damage *= 1.2;
            }
        }

        const projectileType = this.config.projectileType || 'pea';
        const projectile = new Projectile(projectileType, this.x, this.y, this.row, damage, this.type);
        game.projectiles.push(projectile);
        projectile.createElement();

        if (this.config.doubleShot) {
            setTimeout(() => {
                const projectile2 = new Projectile(projectileType, this.x, this.y, this.row, damage, this.type);
                game.projectiles.push(projectile2);
                projectile2.createElement();
            }, 100);
        }

        this.attackCooldown = this.config.attackCooldown;
    }

    findTarget(game) {
        const zombiesInRow = game.zombies.filter(z => z.row === this.row && z.x > this.x);
        if (zombiesInRow.length === 0) return null;
        return zombiesInRow.reduce((closest, z) => z.x < closest.x ? z : closest);
    }

    produceSun(game) {
        game.spawnSunNearPlant(this);
        this.attackCooldown = this.config.attackCooldown;
    }

    checkExplode(game) {
        if (!this.exploding) {
            this.exploding = true;
            this.explodeTimer = this.config.explodeDelay;

            if (this.element) {
                this.element.classList.add('exploding');
            }
        }

        if (this.exploding) {
            this.explodeTimer -= 16;
            if (this.explodeTimer <= 0) {
                this.explode(game);
            }
        }
    }

    checkSquash(game) {
        if (this.targetZombie) {
            if (this.targetZombie.health <= 0) {
                this.targetZombie = null;
                this.destroy();
                return;
            }

            const distance = Math.abs(this.targetZombie.x - this.x);
            if (distance > 80) {
                this.targetZombie = null;
                return;
            }

            this.performSquash(game);
            return;
        }

        const zombiesInRow = game.zombies.filter(z =>
            z.row === this.row &&
            Math.abs(z.x - this.x) < 100
        );

        if (zombiesInRow.length > 0) {
            this.targetZombie = zombiesInRow[0];
        }
    }

    performSquash(game) {
        if (!this.targetZombie) return;

        this.targetZombie.takeDamage(this.config.damage);

        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${this.x - 50}px`;
        explosion.style.top = `${this.y - 50}px`;
        document.getElementById('lawn-container').appendChild(explosion);

        setTimeout(() => explosion.remove(), 500);

        this.destroy();
    }

    explode(game) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${this.x - 50}px`;
        explosion.style.top = `${this.y - 50}px`;
        document.getElementById('lawn-container').appendChild(explosion);

        setTimeout(() => explosion.remove(), 500);

        let damage = this.config.damage;

        if (game.weather === 'rain') {
            damage *= 0.7;
        }

        if (this.type === 'jalapeno') {
            for (const zombie of game.zombies) {
                if (zombie.row === this.row) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        } else if (this.type === 'doomShroom') {
            const range = 200;
            for (const zombie of game.zombies) {
                const dx = zombie.x - this.x;
                const dy = zombie.y - this.y;
                if (Math.sqrt(dx * dx + dy * dy) < range) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        } else {
            const range = 120;
            for (const zombie of game.zombies) {
                const dx = zombie.x - this.x;
                const dy = zombie.y - this.y;
                if (Math.sqrt(dx * dx + dy * dy) < range) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        }

        this.destroy();
    }

    freezeAll(game) {
        for (const zombie of game.zombies) {
            zombie.slowed = true;
            zombie.slowTimer = 5000;
        }
        this.destroy();
    }

    takeDamage(damage) {
        if (this.exploding || this.type === 'squash') return;

        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.element) {
            this.element.remove();
        }

        const rows = document.getElementById('lawn').getElementsByClassName('row');
        if (rows[this.row]) {
            const cells = rows[this.row].getElementsByClassName('cell');
            if (cells[this.col]) {
                cells[this.col].classList.remove('has-plant');
            }
        }

        const index = this.game.plants.findIndex(p => p.id === this.id);
        if (index !== -1) {
            this.game.plants.splice(index, 1);
        }
    }

    render() {
        if (this.element) {
            this.updatePosition();
        }
    }
}

class Projectile {
    constructor(type, x, y, row, damage, plantType) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.row = row;
        this.damage = damage;
        this.plantType = plantType;
        this.speed = type === 'melon' ? 8 : 15;
        this.id = Date.now() + Math.random();
        this.element = null;
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = `projectile ${this.type}`;
        this.element.id = `proj-${this.id}`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        document.getElementById('lawn-container').appendChild(this.element);
    }

    update(deltaTime) {
        this.x += this.speed;
    }

    render() {
        if (this.element) {
            this.element.style.left = `${this.x}px`;
        }
    }
}



class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 'spring',
                name: '春天',
                description: '细雨微风，全局温和增益，难度偏低',
                weather: 'rainy',
                background: 'background1.jpg',
                music: 'lawnbgm(1).mp3',
                waves: [
                    { zombies: [{ type: 'normal', count: 3 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 5 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 8 }, { type: 'cone', count: 2 }], isBigWave: true },
                    { zombies: [{ type: 'normal', count: 6 }, { type: 'cone', count: 3 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 10 }, { type: 'cone', count: 5 }, { type: 'bucket', count: 2 }], isBigWave: true }
                ]
            },
            {
                id: 'summer',
                name: '夏天',
                description: '烈日高温，火系强势，攻防两极分化',
                weather: 'sunny',
                background: 'background1.jpg',
                music: 'lawnbgm(5).mp3',
                waves: [
                    { zombies: [{ type: 'normal', count: 4 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 6 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 9 }, { type: 'cone', count: 3 }], isBigWave: true },
                    { zombies: [{ type: 'normal', count: 7 }, { type: 'cone', count: 4 }, { type: 'football', count: 1 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 12 }, { type: 'cone', count: 6 }, { type: 'bucket', count: 3 }, { type: 'football', count: 2 }], isBigWave: true }
                ]
            },
            {
                id: 'autumn',
                name: '秋天',
                description: '落叶大风，视野干扰，战术拉扯向',
                weather: 'windy',
                background: 'background1.jpg',
                music: 'lawnbgm(4).mp3',
                waves: [
                    { zombies: [{ type: 'normal', count: 4 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 6 }, { type: 'newspaper', count: 2 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 10 }, { type: 'newspaper', count: 4 }], isBigWave: true },
                    { zombies: [{ type: 'normal', count: 8 }, { type: 'cone', count: 4 }, { type: 'newspaper', count: 3 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 13 }, { type: 'cone', count: 6 }, { type: 'bucket', count: 4 }, { type: 'newspaper', count: 5 }], isBigWave: true }
                ]
            },
            {
                id: 'winter',
                name: '冬天',
                description: '严寒暴雪，阳光正常产出，全植物冷却+15%',
                weather: 'snowy',
                background: 'background1.jpg',
                music: 'lawnbgm(6).mp3',
                waves: [
                    { zombies: [{ type: 'normal', count: 5 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 7 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 10 }, { type: 'cone', count: 4 }], isBigWave: true },
                    { zombies: [{ type: 'normal', count: 9 }, { type: 'cone', count: 5 }, { type: 'bucket', count: 2 }], isBigWave: false },
                    { zombies: [{ type: 'normal', count: 14 }, { type: 'cone', count: 8 }, { type: 'bucket', count: 5 }, { type: 'football', count: 3 }], isBigWave: true }
                ]
            }
        ];

        this.currentLevelIndex = 0;
    }

    getLevelById(id) {
        return this.levels.find(l => l.id === id);
    }

    getLevelByIndex(index) {
        return this.levels[index];
    }

    getNextLevel(currentLevelId) {
        const currentIndex = this.levels.findIndex(l => l.id === currentLevelId);
        if (currentIndex < this.levels.length - 1) {
            return this.levels[currentIndex + 1];
        }
        return null;
    }

    getAllLevels() {
        return this.levels;
    }

    getTotalLevels() {
        return this.levels.length;
    }
}

class SeasonEffects {
    static applySeasonEffects(season) {
        const rules = SEASON_RULES[season];
        const container = document.getElementById('lawn-container');

        container.style.filter = 'none';

        switch (season) {
            case 'spring':
                container.style.filter = 'hue-rotate(150deg) saturate(1.2)';
                break;
            case 'summer':
                container.style.filter = 'brightness(1.2) contrast(1.1) saturate(1.3)';
                break;
            case 'autumn':
                container.style.filter = 'sepia(0.5) hue-rotate(-15deg) saturate(1.2)';
                break;
            case 'winter':
                container.style.filter = 'hue-rotate(180deg) brightness(1.1) saturate(0.8)';
                break;
        }
    }

    static createSeasonOverlay(season) {
        const container = document.getElementById('lawn-container');
        let overlay = container.querySelector('.season-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.className = 'season-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '19';

        switch (season) {
            case 'spring':
                overlay.style.background = 'linear-gradient(to bottom, rgba(74, 222, 128, 0.05), rgba(34, 197, 94, 0.1))';
                this.createFlowers(overlay);
                break;
            case 'summer':
                overlay.style.background = 'linear-gradient(to bottom, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))';
                this.createHeatwaves(overlay);
                break;
            case 'autumn':
                overlay.style.background = 'linear-gradient(to bottom, rgba(251, 146, 60, 0.05), rgba(249, 115, 22, 0.1))';
                this.createLeaves(overlay);
                break;
            case 'winter':
                overlay.style.background = 'linear-gradient(to bottom, rgba(103, 232, 249, 0.1), rgba(34, 211, 238, 0.05))';
                this.createSnow(overlay);
                break;
        }

        container.appendChild(overlay);
    }

    static createFlowers(container) {
        for (let i = 0; i < 5; i++) {
            const flower = document.createElement('div');
            flower.style.position = 'absolute';
            flower.style.width = '20px';
            flower.style.height = '20px';
            flower.style.background = '#fbbf24';
            flower.style.borderRadius = '50%';
            flower.style.left = `${10 + Math.random() * 80}%`;
            flower.style.top = `${30 + Math.random() * 60}%`;
            flower.style.animation = `flowerSway ${3 + Math.random() * 2}s ease-in-out infinite`;
            container.appendChild(flower);
        }
    }

    static createHeatwaves(container) {
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.style.position = 'absolute';
            wave.style.width = '100%';
            wave.style.height = '20px';
            wave.style.background = 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.2), transparent)';
            wave.style.top = `${30 + i * 20}%`;
            wave.style.animation = `heatwave ${2 + Math.random()}s ease-in-out infinite`;
            container.appendChild(wave);
        }
    }

    static createLeaves(container) {
        for (let i = 0; i < 8; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            leaf.style.left = `${Math.random() * 100}%`;
            leaf.style.top = '-50px';
            leaf.style.animationDelay = `${Math.random() * 10}s`;
            leaf.style.animationDuration = `${8 + Math.random() * 7}s`;
            leaf.style.width = `${20 + Math.random() * 20}px`;
            leaf.style.height = `${20 + Math.random() * 20}px`;
            container.appendChild(leaf);
        }
    }

    static createSnow(container) {
        for (let i = 0; i < 15; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.style.left = `${Math.random() * 100}%`;
            snowflake.style.top = '-20px';
            snowflake.style.animationDelay = `${Math.random() * 10}s`;
            snowflake.style.animationDuration = `${6 + Math.random() * 6}s`;
            snowflake.style.width = `${5 + Math.random() * 10}px`;
            snowflake.style.height = `${5 + Math.random() * 10}px`;
            container.appendChild(snowflake);
        }
    }
}

// Stateless DOM utility functions for the PVZ game UI.
// No imports from game modules — only uses standard DOM APIs.

// --- Display updates ---
function updateSunDisplay(count) {
    document.getElementById('sun-count').textContent = count;
}

function updateWaveDisplay(current, max) {
    document.getElementById('wave-count').textContent = `${current}/${max}`;
}

function updateScoreDisplay(score) {
    const el = document.getElementById('score-count');
    if (el) el.textContent = score;
}

function updateSeasonDisplay(name) {
    document.getElementById('season-info').textContent = name;
}

// --- Menu transitions ---
function showMenu() {
    document.getElementById('game-menu').classList.remove('hidden');
    document.getElementById('game-area').classList.add('hidden');
}

function showGameArea() {
    document.getElementById('game-menu').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
}

function showGameOver(title, message) {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-message').textContent = message;
}

function hideGameOver() {
    document.getElementById('game-over').classList.add('hidden');
}

function showPauseOverlay() {
    document.getElementById('pause-overlay').classList.remove('hidden');
}

function hidePauseOverlay() {
    document.getElementById('pause-overlay').classList.add('hidden');
}

function hideAllOverlays() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');
}

// --- Plant card UI ---
function selectPlantCard(plantType) {
    const cards = document.querySelectorAll('.plant-card');
    cards.forEach(card => card.classList.remove('selected'));
    const target = document.querySelector(`[data-plant="${plantType}"]`);
    if (target) target.classList.add('selected');
}

function deselectAllPlantCards() {
    document.querySelectorAll('.plant-card').forEach(card => card.classList.remove('selected'));
}

function startPlantCooldown(plantType, cooldownMs) {
    const cdElement = document.getElementById(`cd-${plantType}`);
    if (!cdElement) return;
    cdElement.style.height = '100%';
    const card = cdElement.parentElement;
    card.classList.add('disabled');
    setTimeout(() => {
        cdElement.style.height = '0%';
        card.classList.remove('disabled');
    }, cooldownMs);
}

// --- Shovel button ---
function updateShovelButton(active) {
    const btn = document.getElementById('shovel-btn');
    if (btn) btn.classList.toggle('active', active);
}

// --- Big wave warning ---
function showBigWaveWarning() {
    const container = document.getElementById('lawn-container');
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
    container.appendChild(warning);
    setTimeout(() => warning.remove(), 3000);
}

// --- Season visual effects ---
function clearSeasonEffects() {
    const container = document.getElementById('lawn-container');
    container.querySelectorAll('.season-effect, .rain-drop, .fog-overlay, .summer-glow, .leaf, .snowflake')
        .forEach(el => el.remove());
}

function applySeasonEffect(season) {
    clearSeasonEffects();

    const container = document.getElementById('lawn-container');
    const effect = document.createElement('div');
    effect.className = `season-effect ${season}-effect`;
    container.appendChild(effect);

    switch (season) {
        case 'spring':
            createRain();
            break;
        case 'summer':
            createSummerGlow();
            break;
        case 'autumn':
            createLeaves();
            createFog();
            break;
        case 'winter':
            createSnowflakes();
            break;
    }
}

function createRain() {
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

function createSummerGlow() {
    const container = document.getElementById('lawn-container');
    const glow = document.createElement('div');
    glow.className = 'summer-glow';
    container.appendChild(glow);
}

function createFog() {
    const container = document.getElementById('lawn-container');
    const fog = document.createElement('div');
    fog.className = 'fog-overlay';
    container.appendChild(fog);
}

function createLeaves() {
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

function createSnowflakes() {
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

// --- Sun item DOM helpers ---
function createSunElement(container, sunData, onClick) {
    const sunElement = document.createElement('div');
    sunElement.className = 'sun-item falling';
    sunElement.id = `sun-${sunData.id}`;
    sunElement.style.left = `${sunData.x}px`;
    sunElement.style.top = `${sunData.y}px`;
    sunElement.style.setProperty('--target-y', `${sunData.targetY}px`);
    sunElement.innerHTML = `<img src="95版/images/Sun1.png" style="width:100%;height:100%;">`;
    sunElement.addEventListener('click', onClick);
    container.appendChild(sunElement);
    return sunElement;
}

function transitionSunToStationary(element, targetY) {
    element.classList.remove('falling');
    element.classList.add('stationary');
    element.style.top = `${targetY}px`;
}

function removeSunElement(id) {
    const el = document.getElementById(`sun-${id}`);
    if (el) el.remove();
}

function fadeOutSunElement(id) {
    const el = document.getElementById(`sun-${id}`);
    if (el) {
        el.style.transition = 'opacity 0.5s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }
}

// --- Generic DOM helpers ---
function removeElementById(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// UI namespace for Game.js compatibility
const UI = {
    updateSunDisplay, updateWaveDisplay, updateScoreDisplay, updateSeasonDisplay,
    showMenu, showGameArea, showGameOver, hideGameOver,
    showPauseOverlay, hidePauseOverlay, hideAllOverlays,
    selectPlantCard, deselectAllPlantCards, startPlantCooldown,
    updateShovelButton, showBigWaveWarning, clearSeasonEffects, applySeasonEffect,
    createSunElement, transitionSunToStationary, removeSunElement, fadeOutSunElement,
    removeElementById
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
        this.levelManager = null;
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
        UI.startPlantCooldown(plantType, cooldown * 1000);
    }

    checkGameOver() {
        if (this.zombies.some(z => z.x < -100 && z.hasEnteredHouse && !this.lawnmowers[z.row])) {
            this.loseGame();
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
            if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
            UI.showPauseOverlay();
        } else if (this.state === GAME_STATES.PAUSED) {
            this.state = GAME_STATES.PLAYING;
            this.startGameLoop();
            UI.hidePauseOverlay();
        }
    }

    backToMenu() {
        this.state = GAME_STATES.MENU;
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
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

// Event handling module for PVZ game.
// Sets up all DOM event listeners via delegation.
// No imports from game modules — uses callbacks pattern.

function initInput(gameState, callbacks) {
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

})();

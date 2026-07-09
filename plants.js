class Plant {
    static configs = {
        sunflower: {
            cost: 50,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 15000,
            type: 'sun',
            image: '图片和动画素材/向日葵.gif'
        },
        peaShooter: {
            cost: 100,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            image: '图片和动画素材/豌豆射手.gif'
        },
        icePea: {
            cost: 175,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            projectileType: 'icePea',
            image: '图片和动画素材/寒冰射手.gif'
        },
        doublePea: {
            cost: 200,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            doubleShot: true,
            image: '图片和动画素材/双发射手.gif'
        },
        firePea: {
            cost: 175,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            projectileType: 'firePea',
            image: '图片和动画素材/火焰豌豆射手.gif'
        },
        melonPult: {
            cost: 300,
            cooldown: 10,
            health: 100,
            attackCooldown: 5000,
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
            image: '图片和动画素材/樱桃炸弹.gif'
        },
        jalapeno: {
            cost: 125,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '图片和动画素材/火爆辣椒.gif'
        },
        wallnut: {
            cost: 50,
            cooldown: 30,
            health: 60,
            type: 'defense',
            maxHealth: 60,
            image: '图片和动画素材/坚果.png'
        },
        squash: {
            cost: 50,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'melee',
            image: '图片和动画素材/窝瓜.gif'
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
            attackCooldown: 30000,
            type: 'sun',
            grows: true,
            growthTime: 20000,
            image: '95版/reanim/SunShroom_head.png'
        },
        puffShroom: {
            cost: 0,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
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
                if (this.type === 'firePea') {
                    this.element.classList.add('fire-pea');
                }
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

        if (this.config.type === 'ash') {
            if (!this.exploding) {
                this.exploding = true;
                this.explodeTimer = this.config.explodeDelay;
                if (this.element) {
                    this.element.classList.add('exploding');
                }
            }
            this.explodeTimer -= deltaTime;
            if (this.explodeTimer <= 0) {
                this.explode(game);
            }
        }

        if (this.type === 'squash') {
            this.checkSquash(game);
        }

        if (this.type === 'iceShroom') {
            if (!this.frozen) {
                this.frozen = true;
                setTimeout(() => {
                    this.freezeAll(game);
                }, 1400);
            }
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

        AudioManager.playPlantShoot();
        this.attackCooldown = this.config.attackCooldown;
    }

    findTarget(game) {
        const lawnWidth = document.getElementById('lawn-container').clientWidth;
        const zombiesInRow = game.zombies.filter(z => 
            z.row === this.row && 
            z.x > this.x && 
            z.x < lawnWidth + 50
        );
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
        const cellWidth = 100;
        const zombiesInRow = game.zombies.filter(z => 
            z.row === this.row && 
            Math.abs(z.x - this.x) < cellWidth * 1.5
        );

        if (zombiesInRow.length > 0) {
            this.performSquash(game, zombiesInRow);
        }
    }

    performSquash(game, zombies) {
        for (const zombie of zombies) {
            zombie.takeDamage(this.config.damage);
        }
        
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${this.x - 50}px`;
        explosion.style.top = `${this.y - 50}px`;
        document.getElementById('lawn-container').appendChild(explosion);

        setTimeout(() => explosion.remove(), 500);
        
        this.destroy();
    }

    explode(game) {
        AudioManager.playExplosion();
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
            this.createJalapenoFire(game);
            for (const zombie of game.zombies) {
                if (zombie.row === this.row) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        } else if (this.type === 'doomShroom') {
            const cellWidth = 100;
            const cellHeight = 100;
            const rangeX = cellWidth * 4;
            const rangeY = cellHeight * 4;
            for (const zombie of game.zombies) {
                const dx = Math.abs(zombie.x - this.x);
                const dy = Math.abs(zombie.y - this.y);
                if (dx <= rangeX && dy <= rangeY) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        } else if (this.type === 'cherryBomb') {
            const lawn = document.getElementById('lawn');
            const containerRect = document.getElementById('lawn-container').getBoundingClientRect();
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            
            for (let r = this.row - 1; r <= this.row + 1; r++) {
                for (let c = this.col - 1; c <= this.col + 1; c++) {
                    if (r >= 0 && r < 5 && c >= 0 && c < 9) {
                        const rows = lawn.getElementsByClassName('row');
                        if (rows[r]) {
                            const cells = rows[r].getElementsByClassName('cell');
                            if (cells[c]) {
                                const rect = cells[c].getBoundingClientRect();
                                minX = Math.min(minX, rect.left - containerRect.left);
                                maxX = Math.max(maxX, rect.right - containerRect.left);
                                minY = Math.min(minY, rect.top - containerRect.top);
                                maxY = Math.max(maxY, rect.bottom - containerRect.top);
                            }
                        }
                    }
                }
            }
            
            for (const zombie of game.zombies) {
                if (zombie.x >= minX && zombie.x <= maxX && zombie.y >= minY && zombie.y <= maxY) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        } else {
            const cellWidth = 100;
            const cellHeight = 100;
            const rangeX = cellWidth * 1.5;
            const rangeY = cellHeight * 1.5;
            for (const zombie of game.zombies) {
                const dx = Math.abs(zombie.x - this.x);
                const dy = Math.abs(zombie.y - this.y);
                if (dx <= rangeX && dy <= rangeY) {
                    zombie.wasBurned = true;
                    zombie.takeDamage(damage);
                }
            }
        }

        this.destroy();
    }

    createJalapenoFire(game) {
        const container = document.getElementById('lawn-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const rowHeight = containerHeight / 5;
        const rowTop = this.row * rowHeight;
        
        for (let x = 0; x < containerWidth; x += 40) {
            const fire = document.createElement('img');
            fire.src = '图片和动画素材/火爆辣椒火焰.gif';
            fire.style.position = 'absolute';
            fire.style.left = `${x}px`;
            fire.style.top = `${rowTop}px`;
            fire.style.width = '60px';
            fire.style.height = '80px';
            fire.style.objectFit = 'contain';
            fire.style.zIndex = '10';
            fire.style.pointerEvents = 'none';
            container.appendChild(fire);
            
            setTimeout(() => fire.remove(), 1500);
        }
    }

    freezeAll(game) {
        for (const zombie of game.zombies) {
            zombie.slowed = true;
            zombie.frozen = true;
            zombie.slowTimer = 6000;
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
        this.speed = type === 'melon' ? 6 : 12;
        this.id = Date.now() + Math.random();
        this.element = null;
        this.imagePath = this.getImagePath();
    }

    getImagePath() {
        switch (this.type) {
            case 'melon':
                return '95版/reanim/WinterMelon_projectile.png';
            default:
                return '';
        }
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = `projectile ${this.type}`;
        this.element.id = `proj-${this.id}`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        
        if (this.imagePath) {
            this.element.innerHTML = `<img src="${this.imagePath}" style="width:100%;height:100%;object-fit:contain;">`;
        }
        
        document.getElementById('lawn-container').appendChild(this.element);
    }

    update(deltaTime) {
        this.x += this.speed;
        if (this.type === 'melon') {
            this.y += 0.3;
        }
    }

    render() {
        if (this.element) {
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        }
    }
}
class Plant {
    static configs = {
        sunflower: {
            cost: 50,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 7500,
            type: 'sun',
            image: '95版/reanim/SunFlower_head.gif'
        },
        peaShooter: {
            cost: 100,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            image: '95版/reanim/PeaShooter_Head.gif'
        },
        icePea: {
            cost: 175,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            projectileType: 'icePea',
            image: '95版/reanim/SnowPea_head.gif'
        },
        doublePea: {
            cost: 200,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            doubleShot: true,
            image: '95版/reanim/ThreePeater_head.gif'
        },
        firePea: {
            cost: 175,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            projectileType: 'firePea',
            image: '95版/reanim/PeaShooter_Head.gif'
        },
        melonPult: {
            cost: 300,
            cooldown: 10,
            health: 100,
            attackCooldown: 2500,
            damage: 80,
            type: 'thrower',
            projectileType: 'melon',
            image: '95版/reanim/Melonpult_body.webp'
        },
        cherryBomb: {
            cost: 150,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '95版/reanim/CherryBomb_left1.gif'
        },
        jalapeno: {
            cost: 125,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '95版/reanim/Jalapeno_body.gif'
        },
        wallnut: {
            cost: 50,
            cooldown: 30,
            health: 60,
            type: 'defense',
            maxHealth: 60,
            image: '95版/reanim/Wallnut_body.gif'
        },
        squash: {
            cost: 50,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'melee',
            image: '95版/reanim/Squash_body.gif'
        },
        doomShroom: {
            cost: 125,
            cooldown: 30,
            health: 100,
            damage: 1800,
            type: 'ash',
            explodeDelay: 1400,
            image: '95版/reanim/DoomShroom_body.gif'
        },
        sunShroom: {
            cost: 25,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 15000,
            type: 'sun',
            grows: true,
            growthTime: 20000,
            image: '95版/reanim/SunShroom_head.gif'
        },
        puffShroom: {
            cost: 0,
            cooldown: 7.5,
            health: 100,
            attackCooldown: 2800,
            damage: 20,
            type: 'shooter',
            image: '95版/reanim/PuffShroom_head.gif'
        },
        iceShroom: {
            cost: 75,
            cooldown: 30,
            health: 100,
            type: 'ice',
            image: '95版/reanim/IceShroom_body.gif'
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
        
        AudioManager.playExplosion();
        this.destroy();
    }

    explode(game) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${this.x - 50}px`;
        explosion.style.top = `${this.y - 50}px`;
        document.getElementById('lawn-container').appendChild(explosion);

        setTimeout(() => explosion.remove(), 500);

        AudioManager.playExplosion();

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
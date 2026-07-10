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
        this.y = 0;
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
        const rows = document.getElementById('lawn').getElementsByClassName('row');
        if (rows[row]) {
            const rowRect = rows[row].getBoundingClientRect();
            const containerRect = document.getElementById('lawn-container').getBoundingClientRect();
            return rowRect.top - containerRect.top + rowRect.height / 2 - 84;
        }
        const containerHeight = document.getElementById('lawn-container').clientHeight;
        const rowHeight = containerHeight / 5;
        return rowHeight * row + rowHeight / 2 - 84;
    }

    createElement() {
        this.y = this.calculateY(this.row);
        this.element = document.createElement('div');
        this.element.className = 'zombie';
        this.element.id = `zombie-${this.id}`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        
        let imagePath = '图片和动画素材/普通僵尸走路.gif';
        switch (this.type) {
            case 'cone':
                imagePath = '图片和动画素材/普通僵尸走路.gif';
                break;
            case 'bucket':
                imagePath = '图片和动画素材/普通僵尸走路.gif';
                break;
            case 'football':
                imagePath = '图片和动画素材/黑橄榄球僵尸.gif';
                break;
            case 'newspaper':
                imagePath = '图片和动画素材/读报僵尸.gif';
                break;
            case 'gargantuar':
                imagePath = '图片和动画素材/巨人僵尸.gif';
                break;
        }
        
        this.element.innerHTML = `
            <img src="${imagePath}" class="zombie-image" style="width:100%;height:100%;">
            <img src="图片和动画素材/僵尸灰烬.gif" class="zombie-ash" style="display:none;width:100%;height:100%;object-fit:contain;">
            <div class="zombie-dead" style="display:none;"></div>
        `;
        document.getElementById('lawn-container').appendChild(this.element);
    }

    update(deltaTime, game) {
        if (this.slowed) {
            this.slowTimer -= deltaTime;
            if (this.slowTimer <= 0) {
                this.slowed = false;
                this.frozen = false;
                this.speed = this.baseSpeed;
            } else if (this.frozen) {
                this.speed = 0;
            } else {
                this.speed = this.baseSpeed * 0.5;
            }
        }

        if (this.type === 'newspaper' && !this.hasNewspaper && this.health <= 200) {
            this.speed = this.baseSpeed * 2.5;
        }

        if (!this.eating) {
            this.x -= this.speed * deltaTime * 0.02;
            this.checkCollision(game);
            
            if (this.type === 'gargantuar') {
                this.checkPlantCrush(game);
            }
        } else {
            this.eatTimer += deltaTime;
            const rules = SEASON_RULES[game.currentSeason];
            let attackInterval = 1000 / (rules.zombieAttackSpeedMultiplier || 1);
            
            if (this.type === 'newspaper' && !this.hasNewspaper && this.health <= 200) {
                attackInterval = 1000 / ((rules.zombieAttackSpeedMultiplier || 1) * 4);
            }
            
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
            if (this.type === 'gargantuar') {
                this.crushPlant(closestPlant, game);
            } else {
                this.eating = true;
                this.targetPlant = closestPlant;
                this.x = Math.min(this.x, closestPlant.x - 80);
            }
        } else {
            this.eating = false;
            this.targetPlant = null;
        }
    }

    checkPlantCrush(game) {
        const plantsInRow = game.plants.filter(p => p.row === this.row);
        
        for (const plant of plantsInRow) {
            if (Math.abs(plant.x - this.x) < 80) {
                this.crushPlant(plant, game);
            }
        }
    }

    crushPlant(plant, game) {
        const plantTypes = ['cherryBomb', 'jalapeno', 'doomShroom'];
        if (plantTypes.includes(plant.type)) {
            return;
        }
        
        plant.health = 0;
        plant.element.style.display = 'none';
        game.plants = game.plants.filter(p => p.id !== plant.id);
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
            damage = this.targetPlant.maxHealth / 5;
        }

        this.targetPlant.takeDamage(damage);
        audioManager.playChomp();
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
            ash.src = '图片和动画素材/僵尸灰烬.gif';
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
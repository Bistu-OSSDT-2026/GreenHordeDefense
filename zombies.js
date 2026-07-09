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
        
        setTimeout(() => {
            AudioManager.playZombieGroan();
        }, 300);
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
                AudioManager.playChomp();
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

        if (!this.groanTimer) {
            this.groanTimer = Math.random() * 5000 + 3000;
        }
        this.groanTimer -= deltaTime;
        if (this.groanTimer <= 0 && this.health > 0) {
            AudioManager.playZombieGroan();
            this.groanTimer = Math.random() * 8000 + 5000;
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
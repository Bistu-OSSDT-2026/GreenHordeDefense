import { SEASON_RULES } from './constants.js';

export class LevelManager {
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

export class SeasonEffects {
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

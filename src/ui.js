// Stateless DOM utility functions for the PVZ game UI.
// No imports from game modules — only uses standard DOM APIs.

// --- Display updates ---
export function updateSunDisplay(count) {
    document.getElementById('sun-count').textContent = count;
}

export function updateWaveDisplay(current, max) {
    document.getElementById('wave-count').textContent = `${current}/${max}`;
}

export function updateScoreDisplay(score) {
    const el = document.getElementById('score-count');
    if (el) el.textContent = score;
}

export function updateSeasonDisplay(name) {
    document.getElementById('season-info').textContent = name;
}

// --- Menu transitions ---
export function showMenu() {
    document.getElementById('game-menu').classList.remove('hidden');
    document.getElementById('game-area').classList.add('hidden');
}

export function showGameArea() {
    document.getElementById('game-menu').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
}

export function showGameOver(title, message) {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('game-over-title').textContent = title;
    document.getElementById('game-over-message').textContent = message;
}

export function hideGameOver() {
    document.getElementById('game-over').classList.add('hidden');
}

export function showPauseOverlay() {
    document.getElementById('pause-overlay').classList.remove('hidden');
}

export function hidePauseOverlay() {
    document.getElementById('pause-overlay').classList.add('hidden');
}

export function hideAllOverlays() {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-overlay').classList.add('hidden');
}

// --- Plant card UI ---
export function selectPlantCard(plantType) {
    const cards = document.querySelectorAll('.plant-card');
    cards.forEach(card => card.classList.remove('selected'));
    const target = document.querySelector(`[data-plant="${plantType}"]`);
    if (target) target.classList.add('selected');
}

export function deselectAllPlantCards() {
    document.querySelectorAll('.plant-card').forEach(card => card.classList.remove('selected'));
}

export function startPlantCooldown(plantType, cooldownMs) {
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
export function updateShovelButton(active) {
    const btn = document.getElementById('shovel-btn');
    if (btn) btn.classList.toggle('active', active);
}

// --- Big wave warning ---
export function showBigWaveWarning() {
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
export function clearSeasonEffects() {
    const container = document.getElementById('lawn-container');
    container.querySelectorAll('.season-effect, .rain-drop, .fog-overlay, .summer-glow, .leaf, .snowflake')
        .forEach(el => el.remove());
}

export function applySeasonEffect(season) {
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
export function createSunElement(container, sunData, onClick) {
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

export function transitionSunToStationary(element, targetY) {
    element.classList.remove('falling');
    element.classList.add('stationary');
    element.style.top = `${targetY}px`;
}

export function removeSunElement(id) {
    const el = document.getElementById(`sun-${id}`);
    if (el) el.remove();
}

export function fadeOutSunElement(id) {
    const el = document.getElementById(`sun-${id}`);
    if (el) {
        el.style.transition = 'opacity 0.5s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }
}

// --- Generic DOM helpers ---
export function removeElementById(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

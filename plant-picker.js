/* ============================================================
 * plant-picker.js
 * 开局选植物界面逻辑
 * 作者：zsyss66（Task assigned by user）
 * 关联：feature/zsyss66-plant-picker
 *
 * 流程：
 *   季节按钮 → showPlantPicker(season) → 渲染 14 张卡牌
 *     → 用户点选（最多 6 种）→ confirmPicks() → startGame(season, pickedPlants)
 *
 * 依赖：
 *   - plants.js (Plant.configs / Plant.getConfig) 已在 main.js 之前加载
 *   - styles.css (植物选择器 .picker-card 等样式)
 * ============================================================ */

(function () {
    'use strict';

    // 最多选几种植物（可改这个数字调整难度）
    const MAX_PICKS = 6;

    // 当前季节（点击季节按钮时记录）
    let currentSeason = null;

    // 当前已选的植物 ID 数组
    let selectedPlants = [];

    // 卡牌 DOM 缓存（key = plantType）
    const cardCache = {};

    // ====== 入口：季节按钮调用 ======
    function showPlantPicker(season) {
        currentSeason = season;
        selectedPlants = [];

        // 隐藏主菜单和游戏区
        document.getElementById('game-menu').classList.add('hidden');
        document.getElementById('game-area').classList.add('hidden');

        // 显示选植物界面
        const screen = document.getElementById('plant-picker-screen');
        screen.classList.remove('hidden');

        // 渲染卡牌
        renderPicker();
        updateCounter();
        updateConfirmButton();
    }

    // ====== 渲染 14 张植物卡 ======
    function renderPicker() {
        const grid = document.getElementById('picker-grid');
        grid.innerHTML = '';
        cardCache.valueOf = Object.prototype.valueOf;
        for (const k in cardCache) delete cardCache[k];

        // 用 Plant.configs 来生成（保持与 game 同步）
        const plantTypes = Object.keys(Plant.configs);

        // 选植物界面专用图片映射：覆盖 plants.js 里配错的图
        // （这些图都是从 95版/reanim/ 复用的原版 PvZ 美术资源）
        const PICKER_IMAGE_OVERRIDE = {
            cherryBomb: '95版/reanim/CherryBomb_left1.png',
            jalapeno:   '95版/reanim/Jalapeno_body.png',
            doomShroom: '95版/reanim/DoomShroom_body.png',
            iceShroom:  '95版/reanim/IceShroom_body.png',
            squash:     '95版/reanim/Squash_body.png',
            wallnut:    '95版/reanim/Wallnut_body.png',
            melonPult:  '95版/reanim/Melonpult_body.png',
            sunflower:  '95版/reanim/SunFlower_head.png',
            sunShroom:  '95版/reanim/SunShroom_head.png',
            puffShroom: '95版/reanim/PuffShroom_head.png',
            icePea:     '95版/reanim/SnowPea_head.png',
            doublePea:  '95版/reanim/ThreePeater_head.png',
            peaShooter: '95版/reanim/PeaShooter_Head.png',
            firePea:    '95版/reanim/PeaShooter_Head.png'  // 火焰豌豆临时复用豌豆射手图
        };

        plantTypes.forEach(type => {
            const config = Plant.getConfig(type);
            const imageSrc = PICKER_IMAGE_OVERRIDE[type] || config.image;
            const card = document.createElement('div');
            card.className = 'picker-card';
            card.dataset.plant = type;
            card.innerHTML = `
                <img src="${imageSrc}" class="picker-icon" alt="${type}">
                <span class="picker-cost">${config.cost}</span>
                <div class="picker-checkmark">✓</div>
            `;
            card.addEventListener('click', () => togglePick(type));
            grid.appendChild(card);
            cardCache[type] = card;
        });
    }

    // ====== 点击一张卡：选/取消 ======
    function togglePick(type) {
        const idx = selectedPlants.indexOf(type);
        if (idx >= 0) {
            // 已选 → 取消
            selectedPlants.splice(idx, 1);
        } else {
            // 未选
            if (selectedPlants.length >= MAX_PICKS) {
                // 已满，提示
                flashPickerHint('最多只能选 ' + MAX_PICKS + ' 种植物哦！');
                return;
            }
            selectedPlants.push(type);
        }
        refreshCardStates();
        updateCounter();
        updateConfirmButton();
    }

    // ====== 刷新卡牌视觉状态 ======
    function refreshCardStates() {
        for (const type in cardCache) {
            const card = cardCache[type];
            const isSelected = selectedPlants.indexOf(type) >= 0;
            const isFull = selectedPlants.length >= MAX_PICKS;
            card.classList.toggle('selected', isSelected);
            card.classList.toggle('disabled', isFull && !isSelected);
        }
    }

    // ====== 更新计数显示 ======
    function updateCounter() {
        document.getElementById('picker-count').textContent = selectedPlants.length;
        document.getElementById('picker-max').textContent = MAX_PICKS;
    }

    // ====== 更新"开始战斗"按钮可用性 ======
    function updateConfirmButton() {
        const btn = document.getElementById('picker-confirm');
        // 至少选 1 个植物才能开始
        btn.disabled = selectedPlants.length === 0;
    }

    // ====== 提示动画（满了的时候闪一下） ======
    function flashPickerHint(msg) {
        const hint = document.querySelector('.picker-hint');
        if (!hint) return;
        const original = hint.textContent;
        hint.textContent = msg;
        hint.style.color = '#ff6b6b';
        hint.style.fontWeight = 'bold';
        setTimeout(() => {
            hint.textContent = original;
            hint.style.color = '';
            hint.style.fontWeight = '';
        }, 1500);
    }

    // ====== "重选"按钮 ======
    function resetPicks() {
        selectedPlants = [];
        refreshCardStates();
        updateCounter();
        updateConfirmButton();
    }

    // ====== "返回主菜单"按钮 ======
    function backToMenuFromPicker() {
        const screen = document.getElementById('plant-picker-screen');
        screen.classList.add('hidden');
        document.getElementById('game-menu').classList.remove('hidden');
        selectedPlants = [];
        currentSeason = null;
    }

    // ====== "开始战斗"按钮 ======
    function confirmPicks() {
        if (selectedPlants.length === 0) return;

        // 隐藏选植物界面
        document.getElementById('plant-picker-screen').classList.add('hidden');

        // 启动游戏，传入选中的植物
        startGame(currentSeason, selectedPlants.slice());

        // 过滤植物选择器：只显示选中的植物
        applyPlantFilter(selectedPlants);
    }

    // ====== 过滤顶部 plant-selector 只显示选中的植物 ======
    function applyPlantFilter(pickedPlants) {
        const pickedSet = new Set(pickedPlants);
        const allCards = document.querySelectorAll('#plant-selector .plant-card');
        allCards.forEach(card => {
            const plantType = card.dataset.plant;
            if (pickedSet.has(plantType)) {
                card.classList.remove('picker-hidden');
            } else {
                card.classList.add('picker-hidden');
            }
        });
    }

    // ====== 暴露给外部的接口 ======
    window.showPlantPicker = showPlantPicker;
    window.applyPlantFilter = applyPlantFilter;
    window.resetPicks = resetPicks;
    window.backToMenuFromPicker = backToMenuFromPicker;
    window.confirmPicks = confirmPicks;

    // ====== DOM Ready 之后绑定按钮 ======
    document.addEventListener('DOMContentLoaded', () => {
        const btnConfirm = document.getElementById('picker-confirm');
        const btnReset = document.getElementById('picker-reset');
        const btnBack = document.getElementById('picker-back');

        if (btnConfirm) btnConfirm.addEventListener('click', confirmPicks);
        if (btnReset) btnReset.addEventListener('click', resetPicks);
        if (btnBack) btnBack.addEventListener('click', backToMenuFromPicker);
    });
})();

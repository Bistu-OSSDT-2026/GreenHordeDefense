# PVZ四季塔防游戏规则文档

## 一、游戏基础规则

### 1.1 输赢判定
- **胜利条件**: 击败所有僵尸波次
- **失败条件**: 任何一路的僵尸攻入家门（到达最左侧）

### 1.2 小推车机制
- 每路配备一个小推车，初始状态隐藏
- 当僵尸攻击进入家门区域时，自动触发小推车
- 小推车会从左向右碾压（击杀）该行所有僵尸
- 同一关卡的小推车是一次性的，用完即消失
- 小推车只能由僵尸触发，不能手动触发

### 1.3 游戏场景
- 固定场景：前院（白天和黑夜）
- 去掉泳池和屋顶
- 5行9列的格子布局

## 二、植物系统

### 2.1 植物列表及属性

| 植物名称 | 阳光消耗 | 攻击间隔 | 伤害 | 类型 | 冷却时间 |
|---------|---------|---------|------|------|---------|
| 向日葵 | 50 | - | - | 产阳光 | 7.5秒 |
| 豌豆射手 | 100 | 1.4秒 | 20 | 射手 | 7.5秒 |
| 寒冰射手 | 100 | 1.4秒 | 20(减速) | 射手/冰系 | 7.5秒 |
| 双发射手 | 200 | 1.4秒 | 20×2 | 射手 | 7.5秒 |
| 火焰豌豆射手 | 175 | 1.4秒 | 20(火焰) | 射手/火系 | 7.5秒 |
| 西瓜投手 | 300 | 2.5秒 | 80 | 投手 | 10秒 |
| 樱桃炸弹 | 150 | - | 1800 | 灰烬 | 30秒 |
| 火爆辣椒 | 125 | - | 1800 | 灰烬/火系 | 30秒 |
| 坚果 | 50 | - | - | 防御 | 30秒 |
| 窝瓜 | 50 | - | 1800 | 灰烬/近战 | 30秒 |
| 毁灭菇 | 125 | - | 1800 | 灰烬 | 30秒 |
| 阳光菇 | 25 | - | - | 产阳光 | 7.5秒 |
| 小喷菇 | 0 | 1.4秒 | 20 | 射手 | 7.5秒 |
| 寒冰菇 | 75 | - | 冻结全屏 | 冰系 | 30秒 |

### 2.2 植物类型划分

```javascript
const PLANT_TYPES = {
  ASH: ['cherryBomb', 'jalapeno', 'doomShroom', 'potatoMine'],
  SHOOTER: ['peaShooter', 'icePea', 'doublePea', 'firePea', 'puffShroom'],
  THROWER: ['melonPult'],
  FIRE: ['firePea', 'jalapeno'],
  ICE: ['icePea', 'iceShroom'],
  SUN: ['sunflower', 'sunShroom'],
  DEFENSE: ['wallnut', 'squash']
};
```

### 2.3 特殊植物机制

#### 灰烬植物
- 樱桃炸弹：爆炸前有1.4秒准备时间，播放爆炸动画
- 火爆辣椒：爆炸前有1.4秒准备时间，攻击整行
- 毁灭菇：爆炸前有1.4秒准备时间，大范围内伤害
- 土豆地雷：僵尸踩上立即爆炸，无需准备时间；未准备好时僵尸可啃食
- 窝瓜：锁定敌人后跳起来砸向敌人，触发时无敌

#### 无敌机制
- 窝瓜、樱桃炸弹、土豆地雷在触发时无敌
- 不受僵尸啃食、小丑僵尸爆炸等伤害影响

#### 植物生命值
- 普通植物：被啃食5次死亡
- 坚果：60点血量，僵尸30秒啃完

## 三、僵尸系统

### 3.1 僵尸列表及属性

| 僵尸名称 | 血量(豌豆数) | 移动速度 | 特殊能力 |
|---------|-------------|---------|---------|
| 普通僵尸 | 10(200) | 2 | - |
| 路障僵尸 | 30(600) | 2 | 路障防护 |
| 铁桶僵尸 | 60(1200) | 2 | 铁桶防护 |
| 橄榄球僵尸 | 80(1600) | 2.5 | 高血量 |
| 读报僵尸 | 15(300) | 1.5→3 | 丢失报纸后加速 |

### 3.2 僵尸伤害计算
- 一颗豌豆伤害：20
- 灰烬植物伤害：1800
- 普通僵尸：10×20 = 200血量
- 路障僵尸：30×20 = 600血量
- 铁桶僵尸：60×20 = 1200血量
- 橄榄球僵尸：80×20 = 1600血量
- 读报僵尸：15×20 = 300血量

### 3.3 读报僵尸机制
- 初始移动速度：1.5
- 报纸被打落后移动速度：3
- 报纸有额外血量（约50）

## 四、四季关卡系统

### 4.1 关卡列表
1. **春天** - 细雨微风，全局温和增益，难度偏低
2. **夏天** - 烈日高温，火系强势，攻防两极分化
3. **秋天** - 落叶大风，视野干扰，战术拉扯向
4. **冬天** - 严寒暴雪，阳光正常产出，全植物冷却+15%

### 4.2 四季固定规则

```javascript
const SEASON_RULES = {
  spring: {
    sunShroomGrowthSpeed: 1.2,
    plantCooldownMultiplier: 0.85,
    shooterDamageMultiplier: 1.2
  },
  summer: {
    fireDamageMultiplier: 1.5,
    zombieAttackSpeedMultiplier: 1.2,
    zombieMoveSpeedMultiplier: 1.0
  },
  autumn: {
    zombieMoveSpeedMultiplier: 1.1,
    shooterAccuracy: 0.85,
    ashExplosionRangeMultiplier: 0.8
  },
  winter: {
    sunProductionNormal: true,
    plantCooldownMultiplier: 1.15,
    zombieMoveSpeedMultiplier: 0.8,
    zombieAttackSpeedMultiplier: 0.8
  }
};
```

### 4.3 四季专属效果

#### 春季
- 阳光菇生长时间缩短20%
- 全植物冷却时间缩短15%
- 坚果每秒自动恢复1点血量
- 射手植物伤害增加20%

#### 夏季
- 火系植物伤害+50%
- 所有僵尸攻击欲望提升，啃咬速度+20%

#### 秋季
- 坚果获得一层临时落叶护盾，抵挡一次大额伤害
- 射手子弹15%概率丢失目标
- 灰烬植物爆炸范围缩小20%
- 僵尸移动速度增加10%

#### 冬季
- 阳光产出正常，无减产
- 全植物冷却时间增加15%
- 全体地面僵尸移速降低20%
- 全体地面僵尸啃食速度降低20%

## 五、天气系统

### 5.1 雨天规则
- 除窝瓜外所有灰烬植物伤害削弱
- 全部射手、投手植物伤害强化

## 六、游戏平衡公式

### 6.1 伤害计算公式
```javascript
function calculateDamage(baseDamage, plantType, season, weather) {
  let multiplier = 1;
  
  if (season === 'summer' && PLANT_TYPES.FIRE.includes(plantType)) {
    multiplier *= 1.5;
  }
  
  if (season === 'spring' && PLANT_TYPES.SHOOTER.includes(plantType)) {
    multiplier *= 1.2;
  }
  
  if (weather === 'rain' && PLANT_TYPES.ASH.includes(plantType) && plantType !== 'squash') {
    multiplier *= 0.7;
  }
  
  if (weather === 'rain' && (PLANT_TYPES.SHOOTER.includes(plantType) || PLANT_TYPES.THROWER.includes(plantType))) {
    multiplier *= 1.2;
  }
  
  return baseDamage * multiplier;
}
```

### 6.2 冷却时间计算公式
```javascript
function calculateCooldown(baseCooldown, season) {
  if (season === 'spring') {
    return baseCooldown * 0.85;
  }
  if (season === 'winter') {
    return baseCooldown * 1.15;
  }
  return baseCooldown;
}
```

### 6.3 僵尸移动速度计算公式
```javascript
function calculateZombieSpeed(baseSpeed, season, zombieType) {
  let multiplier = 1;
  
  if (season === 'autumn') {
    multiplier *= 1.1;
  }
  if (season === 'winter') {
    multiplier *= 0.8;
  }
  
  return baseSpeed * multiplier;
}
```

## 七、波次系统

### 7.1 波次生成规则
- 每关包含多个僵尸波次
- 波次难度逐渐递增
- 每波僵尸数量和种类根据关卡进度调整

### 7.2 波次结构
```javascript
const WAVE_CONFIG = {
  spring: [
    { zombies: [{ type: 'normal', count: 5 }] },
    { zombies: [{ type: 'normal', count: 8 }, { type: 'cone', count: 2 }] },
    { zombies: [{ type: 'normal', count: 10 }, { type: 'cone', count: 5 }] },
    { zombies: [{ type: 'normal', count: 12 }, { type: 'cone', count: 6 }, { type: 'bucket', count: 2 }] }
  ],
  summer: [
    { zombies: [{ type: 'normal', count: 6 }] },
    { zombies: [{ type: 'normal', count: 10 }, { type: 'cone', count: 3 }] },
    { zombies: [{ type: 'normal', count: 12 }, { type: 'cone', count: 6 }, { type: 'football', count: 2 }] },
    { zombies: [{ type: 'normal', count: 15 }, { type: 'cone', count: 8 }, { type: 'bucket', count: 4 }, { type: 'football', count: 3 }] }
  ],
  autumn: [
    { zombies: [{ type: 'normal', count: 7 }] },
    { zombies: [{ type: 'normal', count: 11 }, { type: 'newspaper', count: 3 }] },
    { zombies: [{ type: 'normal', count: 13 }, { type: 'cone', count: 5 }, { type: 'newspaper', count: 4 }] },
    { zombies: [{ type: 'normal', count: 16 }, { type: 'cone', count: 7 }, { type: 'bucket', count: 5 }, { type: 'newspaper', count: 5 }] }
  ],
  winter: [
    { zombies: [{ type: 'normal', count: 8 }] },
    { zombies: [{ type: 'normal', count: 12 }, { type: 'cone', count: 4 }] },
    { zombies: [{ type: 'normal', count: 14 }, { type: 'cone', count: 7 }, { type: 'bucket', count: 3 }] },
    { zombies: [{ type: 'normal', count: 18 }, { type: 'cone', count: 10 }, { type: 'bucket', count: 6 }, { type: 'football', count: 4 }] }
  ]
};
```

## 八、游戏状态管理

### 8.1 游戏状态
```javascript
const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose'
};
```

### 9.2 数据结构
```javascript
const gameState = {
  currentLevel: 0,
  currentSeason: 'spring',
  currentWave: 0,
  sun: 150,
  plants: [],
  zombies: [],
  projectiles: [],
  lawnmowers: [true, true, true, true, true],
  gameState: 'playing',
  score: 0,
  weather: 'sunny'
};
```

## 十、前端渲染规范

### 10.1 Canvas绘制
- 使用Canvas进行游戏渲染
- 分层绘制：背景→植物→僵尸→子弹→UI

### 10.2 动画效果
- 植物攻击动画
- 僵尸移动和啃食动画
- 爆炸效果
- 四季特效（落叶、雪花等）

### 10.3 UI元素
- 阳光显示
- 植物卡片选择区
- 冷却时间显示
- 波次提示
- 游戏结束界面
export const PLANT_TYPES = {
    ASH: ['cherryBomb', 'jalapeno', 'doomShroom', 'squash'],
    SHOOTER: ['peaShooter', 'icePea', 'doublePea', 'firePea', 'puffShroom'],
    THROWER: ['melonPult'],
    FIRE: ['firePea', 'jalapeno'],
    ICE: ['icePea', 'iceShroom'],
    SUN: ['sunflower', 'sunShroom'],
    DEFENSE: ['wallnut']
};

export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose'
};

export const SEASON_RULES = {
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

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgmAudio = null;
        this.bgmPlaying = false;
        this.bgmVolume = 0.3;
        this.sfxVolume = 0.5;
        this.masterGain = null;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 1;
            this.masterGain.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    setBGMVolume(volume) {
        this.bgmVolume = Math.min(1, Math.max(0, volume));
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.bgmVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.min(1, Math.max(0, volume));
    }

    playClick() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.15, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    playPlantDeploy() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playPlantShoot() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playChomp() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playZombieGroan() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        osc.frequency.linearRampToValueAtTime(150, now + 0.4);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.15, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    playZombieEnter() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.3);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.1, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playShovel() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playExplosion() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playWin() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + i * 0.15 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.3);
        });
    }

    playLose() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const notes = [440, 392, 349, 294];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.2);
            gain.gain.setValueAtTime(0, now + i * 0.2);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + i * 0.2 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.4);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.4);
        });
    }

    playSunDrop() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playSunCollect() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const notes = [880, 1100, 1320];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            gain.gain.setValueAtTime(0, now + i * 0.05);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.15, now + i * 0.05 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.15);
        });
    }

    startBGM() {
        this.stopBGM();
        
        this.bgmAudio = new Audio('95版/伟伟迷套的bgm/lawnbgm(1).mp3');
        this.bgmAudio.volume = this.bgmVolume;
        this.bgmAudio.loop = true;
        this.bgmAudio.play().catch(e => console.log('BGM play error:', e));
        
        this.bgmPlaying = true;
    }

    pauseBGM() {
        if (this.bgmAudio && this.bgmPlaying) {
            this.bgmAudio.pause();
            this.bgmPlaying = false;
        }
    }

    resumeBGM() {
        if (this.bgmAudio && !this.bgmPlaying) {
            this.bgmAudio.play().catch(e => console.log('BGM resume error:', e));
            this.bgmPlaying = true;
        }
    }

    stopBGM(callback) {
        this.bgmPlaying = false;
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio = null;
        }
        if (callback) callback();
    }
}

const audioManager = new AudioManager();
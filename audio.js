class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgmAudio = null;
        this.bgmPlaying = false;
        this.bgmVolume = 0.3;
        this.sfxVolume = 0.5;
        this.masterGain = null;
        this.reverbBuffer = null;
        this.currentBgmTrack = 'day';
        this.sfxBuffers = {};
    }

    bgmTracks = {
        day: 'sounds/bgm_day.mp3',
        night: 'sounds/bgm_night.mp3'
    };

    async loadSFX(name, url) {
        if (this.sfxBuffers[name]) return this.sfxBuffers[name];
        this.init();
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sfxBuffers[name] = audioBuffer;
            return audioBuffer;
        } catch (e) {
            return null;
        }
    }

    preloadSFX() {
        this.loadSFX('chomp_food', 'sounds/chomp_food.mp3');
        this.loadSFX('chomp_crunch', 'sounds/chomp_crunch.mp3');
        this.loadSFX('explosion', 'sounds/explosion.mp3');
        this.loadSFX('plant_deploy', 'sounds/plant_deploy.mp3');
        this.loadSFX('zombie', 'sounds/zombie.mp3');
        this.loadSFX('click', 'sounds/click.mp3');
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 1;
            this.masterGain.connect(this.audioContext.destination);
            this.createReverb();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    createReverb() {
        const ctx = this.audioContext;
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * 2.5;
        const impulse = ctx.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }

        this.reverbBuffer = impulse;
    }

    createReverbNode() {
        const ctx = this.audioContext;
        const convolver = ctx.createConvolver();
        convolver.buffer = this.reverbBuffer;
        return convolver;
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
        const buffer = this.sfxBuffers['click'];

        if (!buffer) {
            this.loadSFX('click', 'sounds/click.mp3').then(buf => {
                if (buf) this.playClick();
            });
            return;
        }

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();

        source.buffer = buffer;
        source.playbackRate.value = 0.95 + Math.random() * 0.1;

        const duration = Math.min(buffer.duration, 0.5);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, now + 0.01);
        gain.gain.setValueAtTime(this.sfxVolume * 0.6, now + duration * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.02);

        source.connect(gain);
        gain.connect(ctx.destination);

        source.start(now, 0);
        source.stop(now + duration);
    }

    playPlantDeploy() {
        this.init();
        const ctx = this.audioContext;
        const buffer = this.sfxBuffers['plant_deploy'];

        if (!buffer) {
            this.loadSFX('plant_deploy', 'sounds/plant_deploy.mp3').then(buf => {
                if (buf) this.playPlantDeploy();
            });
            return;
        }

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();

        source.buffer = buffer;
        source.playbackRate.value = 0.95 + Math.random() * 0.1;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, ctx.currentTime + 0.01);
        gain.gain.setValueAtTime(this.sfxVolume * 0.6, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        source.connect(gain);
        gain.connect(ctx.destination);

        source.start(ctx.currentTime);
        source.stop(ctx.currentTime + 0.5);
    }

    playPlantShoot() {
    }

    playChomp() {
        this.init();
        const ctx = this.audioContext;

        const playBuffer = (name, volume, offset, startTime) => {
            const buffer = this.sfxBuffers[name];
            if (!buffer) {
                this.loadSFX(name, `sounds/${name}.mp3`).then(buf => {
                    if (buf) this.playChomp();
                });
                return;
            }

            const chompDuration = 0.28;
            const source = ctx.createBufferSource();
            const gain = ctx.createGain();
            source.buffer = buffer;
            source.playbackRate.value = 0.9 + Math.random() * 0.15;

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume * this.sfxVolume, startTime + 0.008);
            gain.gain.setValueAtTime(volume * this.sfxVolume * 0.9, startTime + chompDuration * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + chompDuration);

            source.connect(gain);
            gain.connect(ctx.destination);
            source.start(startTime, offset);
            source.stop(startTime + chompDuration);
        };

        const playChompSound = (delayMs) => {
            const startTime = ctx.currentTime + delayMs / 1000;
            playBuffer('chomp_food', 0.5, 0.08, startTime);
            playBuffer('chomp_crunch', 0.35, 0.15, startTime + 0.02);
        };

        playChompSound(0);
        playChompSound(280 + Math.random() * 120);
    }

    playZombieGroan() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const buffer = this.sfxBuffers['zombie'];

        if (!buffer) {
            this.loadSFX('zombie', 'sounds/zombie.mp3').then(buf => {
                if (buf) this.playZombieGroan();
            });
            return;
        }

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        source.buffer = buffer;
        const pitch = 0.95 + Math.random() * 0.1;
        source.playbackRate.value = pitch;

        const clipDuration = 1.5 / pitch;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.45, now + 0.1);
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, now + clipDuration * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + clipDuration - 0.1);

        reverbGain.gain.value = 0.12;

        source.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        source.start(now, 0);
        source.stop(now + clipDuration);
    }

    playZombieWaveWarn() {
        this.playZombieGroan();
        setTimeout(() => {
            this.init();
            const ctx = this.audioContext;
            const buffer = this.sfxBuffers['zombie'];
            if (!buffer) return;
            const source = ctx.createBufferSource();
            const gain = ctx.createGain();
            const reverb = this.createReverbNode();
            const reverbGain = ctx.createGain();
            source.buffer = buffer;
            const pitch = 1.1;
            source.playbackRate.value = pitch;
            const clipDuration = 1.5 / pitch;
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.55, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(this.sfxVolume * 0.5, ctx.currentTime + clipDuration * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + clipDuration - 0.1);
            reverbGain.gain.value = 0.15;
            source.connect(gain);
            gain.connect(ctx.destination);
            gain.connect(reverb);
            reverb.connect(reverbGain);
            reverbGain.connect(ctx.destination);
            source.start(ctx.currentTime, 0);
            source.stop(ctx.currentTime + clipDuration);
        }, 250);
    }

    playZombieEnter() {
        this.playZombieGroan();
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
        const buffer = this.sfxBuffers['explosion'];

        if (!buffer) {
            this.loadSFX('explosion', 'sounds/explosion.mp3').then(buf => {
                if (buf) this.playExplosion();
            });
            return;
        }

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        source.buffer = buffer;
        source.playbackRate.value = 0.95 + Math.random() * 0.1;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.85, ctx.currentTime + 0.005);
        gain.gain.setValueAtTime(this.sfxVolume * 0.7, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        reverbGain.gain.value = 0.3;

        source.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        source.start(ctx.currentTime);
        source.stop(ctx.currentTime + 1.3);
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

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc3.type = 'triangle';

        osc1.frequency.setValueAtTime(523, now);
        osc1.frequency.setValueAtTime(659, now + 0.06);
        osc1.frequency.setValueAtTime(784, now + 0.12);

        osc2.frequency.setValueAtTime(1047, now);
        osc2.frequency.setValueAtTime(1319, now + 0.06);
        osc2.frequency.setValueAtTime(1568, now + 0.12);

        osc3.frequency.setValueAtTime(2093, now);
        osc3.frequency.setValueAtTime(2637, now + 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.35, now + 0.02);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        reverbGain.gain.value = 0.15;

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
        osc3.stop(now + 0.2);
    }

    startBGM(track) {
        this.init();
        if (this.bgmPlaying) {
            if (track && track !== this.currentBgmTrack) {
                this.stopBGM(() => {
                    this.startBGM(track);
                });
            }
            return;
        }

        const trackName = track || this.currentBgmTrack || 'day';
        const trackPath = this.bgmTracks[trackName] || this.bgmTracks.day;
        this.currentBgmTrack = trackName;

        this.bgmAudio = new Audio(trackPath);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0;

        const playPromise = this.bgmAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                console.log('BGM play failed, trying fallback');
            });
        }

        let fadeStartTime = Date.now();
        const fadeIn = () => {
            if (!this.bgmAudio || !this.bgmPlaying) return;
            const elapsed = Date.now() - fadeStartTime;
            const progress = Math.min(elapsed / 1500, 1);
            this.bgmAudio.volume = this.bgmVolume * progress;
            if (progress < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        this.bgmPlaying = true;
        fadeIn();
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
        if (!this.bgmPlaying) {
            if (callback) callback();
            return;
        }

        this.bgmPlaying = false;

        if (this.bgmAudio) {
            const startVolume = this.bgmAudio.volume;
            const fadeStartTime = Date.now();
            const fadeOut = () => {
                if (!this.bgmAudio) return;
                const elapsed = Date.now() - fadeStartTime;
                const progress = Math.min(elapsed / 800, 1);
                this.bgmAudio.volume = startVolume * (1 - progress);
                if (progress < 1) {
                    requestAnimationFrame(fadeOut);
                } else {
                    this.bgmAudio.pause();
                    this.bgmAudio.currentTime = 0;
                    this.bgmAudio = null;
                    if (callback) callback();
                }
            };
            fadeOut();
        } else if (callback) {
            callback();
        }
    }

    switchBGMTrack(track) {
        if (!this.bgmPlaying || track === this.currentBgmTrack) return;
        this.stopBGM(() => {
            this.startBGM(track);
        });
    }
}

const audioManager = new AudioManager();

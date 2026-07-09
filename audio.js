const AudioManager = {
    audioContext: null,
    bgmGain: null,
    bgmReverb: null,
    isPlayingBgm: false,
    bgmTimeouts: [],
    masterVolume: 0.5,
    sfxVolume: 0.5,
    bgmVolume: 0.3,
    reverbBuffer: null,
    bgmAudio: null,
    currentBgmTrack: 'day',
    sfxBuffers: {},

    bgmTracks: {
        day: 'sounds/bgm_day.mp3',
        night: 'sounds/bgm_night.mp3'
    },

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
    },

    preloadSFX() {
        this.loadSFX('chomp_food', 'sounds/chomp_food.mp3');
        this.loadSFX('chomp_crunch', 'sounds/chomp_crunch.mp3');
        this.loadSFX('explosion', 'sounds/explosion.mp3');
        this.loadSFX('plant_deploy', 'sounds/plant_deploy.mp3');
        this.loadSFX('zombie', 'sounds/zombie.mp3');
        this.loadSFX('click', 'sounds/click.mp3');
    },

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createReverb();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

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
    },

    createReverbNode() {
        const ctx = this.audioContext;
        const convolver = ctx.createConvolver();
        convolver.buffer = this.reverbBuffer;
        return convolver;
    },

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
    },

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
    },

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
    },

    startBGM(track) {
        this.init();
        if (this.isPlayingBgm) {
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
                this.startSynthBGM();
            });
        }

        let fadeStartTime = Date.now();
        const fadeIn = () => {
            if (!this.bgmAudio || !this.isPlayingBgm) return;
            const elapsed = Date.now() - fadeStartTime;
            const progress = Math.min(elapsed / 1500, 1);
            this.bgmAudio.volume = this.bgmVolume * progress;
            if (progress < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        this.isPlayingBgm = true;
        fadeIn();
    },

    stopBGM(callback) {
        if (!this.isPlayingBgm) {
            if (callback) callback();
            return;
        }

        this.isPlayingBgm = false;
        this.bgmTimeouts.forEach(t => clearTimeout(t));
        this.bgmTimeouts = [];

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
        } else if (this.bgmGain) {
            const ctx = this.audioContext;
            this.bgmGain.gain.cancelScheduledValues(ctx.currentTime);
            this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, ctx.currentTime);
            this.bgmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            setTimeout(() => {
                if (this.bgmGain) {
                    this.bgmGain.disconnect();
                    this.bgmGain = null;
                }
                if (callback) callback();
            }, 900);
        } else if (callback) {
            callback();
        }
    },

    setBGMVolume(vol) {
        this.bgmVolume = vol;
        if (this.bgmAudio) {
            this.bgmAudio.volume = vol;
        }
    },

    switchBGMTrack(track) {
        if (!this.isPlayingBgm || track === this.currentBgmTrack) return;
        this.stopBGM(() => {
            this.startBGM(track);
        });
    },

    playPlantShoot() {
    },

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
    },

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
    },

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
    },

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
};

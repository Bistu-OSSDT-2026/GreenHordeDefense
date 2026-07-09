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

    bgmTracks: {
        day: 'sounds/bgm_day.mp3',
        night: 'sounds/bgm_night.mp3'
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

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.03);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(2400, now);
        osc2.frequency.exponentialRampToValueAtTime(3600, now + 0.03);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        reverbGain.gain.value = 0.15;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
    },

    playZombieGroan() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const duration = 1.8 + Math.random() * 0.8;

        const mainGain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, now + 0.15);
        mainGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + duration * 0.4);
        mainGain.gain.setValueAtTime(this.sfxVolume * 0.5, now + duration * 0.7);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        reverbGain.gain.value = 0.3;

        mainGain.connect(ctx.destination);
        mainGain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * 0.5;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.Q.value = 0.8;
        noiseFilter.frequency.setValueAtTime(900 + Math.random() * 200, now);
        noiseFilter.frequency.linearRampToValueAtTime(700 + Math.random() * 150, now + duration * 0.5);
        noiseFilter.frequency.linearRampToValueAtTime(850 + Math.random() * 200, now + duration);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.linearRampToValueAtTime(0.45, now + duration * 0.3);
        noiseGain.gain.linearRampToValueAtTime(0.35, now + duration * 0.7);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(mainGain);

        const growlOsc = ctx.createOscillator();
        const growlLfo = ctx.createOscillator();
        const growlLfoGain = ctx.createGain();

        growlOsc.type = 'sawtooth';
        growlOsc.frequency.setValueAtTime(75 + Math.random() * 20, now);
        growlOsc.frequency.linearRampToValueAtTime(65 + Math.random() * 15, now + duration * 0.5);
        growlOsc.frequency.linearRampToValueAtTime(80 + Math.random() * 20, now + duration);

        growlLfo.frequency.value = 4 + Math.random() * 3;
        growlLfoGain.gain.value = 8 + Math.random() * 5;

        growlLfo.connect(growlLfoGain);
        growlLfoGain.connect(growlOsc.frequency);

        const growlFilter = ctx.createBiquadFilter();
        growlFilter.type = 'lowpass';
        growlFilter.frequency.setValueAtTime(1200, now);
        growlFilter.frequency.linearRampToValueAtTime(900, now + duration * 0.5);
        growlFilter.frequency.linearRampToValueAtTime(1100, now + duration);

        const growlGain = ctx.createGain();
        growlGain.gain.setValueAtTime(0.25, now);
        growlGain.gain.linearRampToValueAtTime(0.4, now + duration * 0.3);
        growlGain.gain.linearRampToValueAtTime(0.3, now + duration * 0.7);

        growlOsc.connect(growlFilter);
        growlFilter.connect(growlGain);
        growlGain.connect(mainGain);

        const formant1 = ctx.createBiquadFilter();
        formant1.type = 'bandpass';
        formant1.frequency.setValueAtTime(500 + Math.random() * 100, now);
        formant1.frequency.linearRampToValueAtTime(450 + Math.random() * 80, now + duration * 0.5);
        formant1.frequency.linearRampToValueAtTime(550 + Math.random() * 100, now + duration);
        formant1.Q.value = 4;

        const formant2 = ctx.createBiquadFilter();
        formant2.type = 'bandpass';
        formant2.frequency.setValueAtTime(1100 + Math.random() * 200, now);
        formant2.frequency.linearRampToValueAtTime(950 + Math.random() * 150, now + duration * 0.5);
        formant2.frequency.linearRampToValueAtTime(1050 + Math.random() * 200, now + duration);
        formant2.Q.value = 3;

        const formantGain = ctx.createGain();
        formantGain.gain.value = 0.35;

        const vocalOsc = ctx.createOscillator();
        vocalOsc.type = 'sawtooth';
        vocalOsc.frequency.setValueAtTime(110 + Math.random() * 20, now);
        vocalOsc.frequency.linearRampToValueAtTime(95 + Math.random() * 15, now + duration * 0.5);
        vocalOsc.frequency.linearRampToValueAtTime(105 + Math.random() * 20, now + duration);

        const vocalLfo = ctx.createOscillator();
        const vocalLfoGain = ctx.createGain();
        vocalLfo.frequency.value = 5.5 + Math.random() * 2;
        vocalLfoGain.gain.value = 6 + Math.random() * 4;
        vocalLfo.connect(vocalLfoGain);
        vocalLfoGain.connect(vocalOsc.frequency);

        vocalOsc.connect(formant1);
        vocalOsc.connect(formant2);
        formant1.connect(formantGain);
        formant2.connect(formantGain);
        formantGain.connect(mainGain);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55 + Math.random() * 10, now);
        subOsc.frequency.linearRampToValueAtTime(48 + Math.random() * 8, now + duration * 0.5);
        subOsc.frequency.linearRampToValueAtTime(58 + Math.random() * 10, now + duration);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.2, now);
        subGain.gain.linearRampToValueAtTime(0.35, now + 0.2);
        subGain.gain.linearRampToValueAtTime(0.25, now + duration * 0.7);

        subOsc.connect(subGain);
        subGain.connect(mainGain);

        noiseSource.start(now);
        growlOsc.start(now);
        growlLfo.start(now);
        vocalOsc.start(now);
        vocalLfo.start(now);
        subOsc.start(now);

        noiseSource.stop(now + duration);
        growlOsc.stop(now + duration);
        growlLfo.stop(now + duration);
        vocalOsc.stop(now + duration);
        vocalLfo.stop(now + duration);
        subOsc.stop(now + duration);
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
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(3000, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        reverbGain.gain.value = 0.1;

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        gain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.08);
        osc2.stop(now + 0.08);
    },

    playExplosion() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;
        const duration = 0.8;

        const mainGain = ctx.createGain();
        const reverb = this.createReverbNode();
        const reverbGain = ctx.createGain();

        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(this.sfxVolume * 0.9, now + 0.02);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        reverbGain.gain.value = 0.4;

        mainGain.connect(ctx.destination);
        mainGain.connect(reverb);
        reverb.connect(reverbGain);
        reverbGain.connect(ctx.destination);

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            const t = i / data.length;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.5);
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(2000, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(80, now + duration);

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.7;

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(mainGain);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(150, now);
        subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        subOsc.connect(subGain);
        subGain.connect(mainGain);

        const midOsc = ctx.createOscillator();
        midOsc.type = 'sawtooth';
        midOsc.frequency.setValueAtTime(300, now);
        midOsc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

        const midGain = ctx.createGain();
        midGain.gain.setValueAtTime(0.3, now);
        midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        midOsc.connect(midGain);
        midGain.connect(mainGain);

        noiseSource.start(now);
        subOsc.start(now);
        midOsc.start(now);
        noiseSource.stop(now + duration);
        subOsc.stop(now + 0.5);
        midOsc.stop(now + 0.4);
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

        const playSingleChomp = (delay = 0) => {
            const audio1 = new Audio('sounds/chomp_food.mp3');
            const audio2 = new Audio('sounds/chomp_crunch.mp3');

            audio1.volume = 0.45 * this.sfxVolume;
            audio2.volume = 0.3 * this.sfxVolume;

            audio1.playbackRate = 0.85 + Math.random() * 0.1;
            audio2.playbackRate = 0.85 + Math.random() * 0.1;

            if (delay > 0) {
                setTimeout(() => {
                    audio1.play().catch(() => {});
                    setTimeout(() => audio2.play().catch(() => {}), 25);
                }, delay);
            } else {
                audio1.play().catch(() => {});
                setTimeout(() => audio2.play().catch(() => {}), 25);
            }
        };

        playSingleChomp(0);
        playSingleChomp(300 + Math.random() * 100);
    }
};

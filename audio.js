const AudioManager = {
    audioContext: null,
    bgmOscillators: [],
    bgmGain: null,
    isPlayingBgm: false,
    bgmTimer: null,
    masterVolume: 0.3,
    sfxVolume: 0.4,
    bgmVolume: 0.15,

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    },

    playClick() {
        this.init();
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(this.sfxVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    },

    playZombieGroan() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / ctx.sampleRate;
            const noise = (Math.random() * 2 - 1) * 0.3;
            const growl = Math.sin(2 * Math.PI * (80 + Math.sin(t * 3) * 20) * t) * 0.5;
            const formant = Math.sin(2 * Math.PI * (600 + Math.sin(t * 2) * 100) * t) * 0.2;
            data[i] = (noise + growl + formant) * 0.4;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(500, now + 0.8);
        filter.frequency.linearRampToValueAtTime(700, now + 1.2);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, now + 0.1);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(now);
    },

    startBGM() {
        this.init();
        if (this.isPlayingBgm) return;
        this.isPlayingBgm = true;

        const ctx = this.audioContext;
        this.bgmGain = ctx.createGain();
        this.bgmGain.gain.value = this.bgmVolume;
        this.bgmGain.connect(ctx.destination);

        const notes = [
            { freq: 262, dur: 0.4 },
            { freq: 294, dur: 0.4 },
            { freq: 330, dur: 0.4 },
            { freq: 349, dur: 0.4 },
            { freq: 392, dur: 0.6 },
            { freq: 349, dur: 0.4 },
            { freq: 330, dur: 0.4 },
            { freq: 294, dur: 0.6 },
            { freq: 262, dur: 0.4 },
            { freq: 294, dur: 0.4 },
            { freq: 330, dur: 0.4 },
            { freq: 262, dur: 0.6 },
        ];

        const bassNotes = [
            { freq: 131, dur: 0.8 },
            { freq: 147, dur: 0.8 },
            { freq: 165, dur: 0.8 },
            { freq: 175, dur: 0.8 },
            { freq: 196, dur: 1.2 },
            { freq: 175, dur: 0.8 },
            { freq: 165, dur: 0.8 },
            { freq: 147, dur: 1.2 },
            { freq: 131, dur: 0.8 },
            { freq: 147, dur: 0.8 },
            { freq: 165, dur: 0.8 },
            { freq: 131, dur: 1.2 },
        ];

        let noteIndex = 0;
        let bassIndex = 0;

        const playMelodyNote = () => {
            if (!this.isPlayingBgm) return;

            const note = notes[noteIndex % notes.length];
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = note.freq;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gain.gain.linearRampToValueAtTime(0.2, now + note.dur * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

            osc.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(now);
            osc.stop(now + note.dur);

            noteIndex++;
            setTimeout(playMelodyNote, note.dur * 1000);
        };

        const playBassNote = () => {
            if (!this.isPlayingBgm) return;

            const note = bassNotes[bassIndex % bassNotes.length];
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = note.freq;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
            gain.gain.linearRampToValueAtTime(0.3, now + note.dur * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.dur);

            osc.connect(gain);
            gain.connect(this.bgmGain);

            osc.start(now);
            osc.stop(now + note.dur);

            bassIndex++;
            setTimeout(playBassNote, note.dur * 1000);
        };

        playMelodyNote();
        playBassNote();
    },

    stopBGM() {
        this.isPlayingBgm = false;
        if (this.bgmGain) {
            const ctx = this.audioContext;
            if (ctx) {
                this.bgmGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            }
            setTimeout(() => {
                if (this.bgmGain) {
                    this.bgmGain.disconnect();
                    this.bgmGain = null;
                }
            }, 600);
        }
    },

    playPlantShoot() {
        this.init();
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(this.sfxVolume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    },

    playExplosion() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(now);
    },

    playSunCollect() {
        this.init();
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    },

    playChomp() {
        this.init();
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.6;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        const gain = ctx.createGain();
        gain.gain.value = this.sfxVolume * 0.5;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(now);
    }
};

/**
 * Lightweight Web Audio API generator for calming ambient sounds and cute haptic audio feedback.
 * Does not require external audio assets and never fails due to network/CORS issues.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private catTimer: number | null = null;
  private catGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.35;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  /**
   * Cute bubble pop sound effect
   */
  public playPop(frequency: number = 440) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.8, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Gentle magical bell chime (e.g. for pulling a note or completing care items)
   */
  public playChime(freqMultiplier = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * freqMultiplier, t + idx * 0.06);

      gain.gain.setValueAtTime(0.12, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.65);
    });
  }

  /**
   * Soft calming purr generator
   */
  public playPurr() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 65; // deep purr frequency

      // Filter to keep only warm low frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;

      // Modulate purr rhythm
      lfo.frequency.value = 24; // purr flutter
      lfoGain.gain.value = 20;

      lfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      lfo.start();
      osc.start();
      lfo.stop(this.ctx.currentTime + 1.2);
      osc.stop(this.ctx.currentTime + 1.2);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Ambient warm rain toggle
   */
  public toggleRain(enable: boolean) {
    if (!enable) {
      if (this.rainNode) {
        try {
          (this.rainNode as unknown as { stop: () => void }).stop?.();
          this.rainNode.disconnect();
        } catch {}
        this.rainNode = null;
      }
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain || this.rainNode) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink noise synthesis
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      const rainGain = this.ctx.createGain();
      rainGain.gain.value = 0.12;

      whiteNoise.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(this.masterGain);

      whiteNoise.start();
      this.rainNode = whiteNoise;
    } catch {
      // Audio fallback
    }
  }
}

export const sound = new SoundEngine();

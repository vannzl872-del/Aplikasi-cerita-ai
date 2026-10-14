/**
 * Web Audio API synthesizer and audio player for cinematic sound effects,
 * ambient score, and synchronized dialogue.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambienceSource: AudioNode | null = null;
  private ambienceGain: GainNode | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private currentDialogueSource: AudioBufferSourceNode | null = null;

  public initCtx() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
    if (muted && this.currentDialogueSource) {
      try {
        this.currentDialogueSource.stop();
      } catch {}
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // Preload dialogue audio files into AudioBuffers
  public async preloadAudio(url: string): Promise<AudioBuffer | null> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }
    try {
      const ctx = this.initCtx();
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.warn(`Failed to preload audio ${url}:`, e);
      return null;
    }
  }

  // Play pre-recorded authentic dialogue line through AudioContext
  public async playDialogueClip(
    audioUrl: string,
    destinationNode?: AudioNode
  ): Promise<AudioBufferSourceNode | null> {
    if (this.isMuted) return null;
    try {
      const ctx = this.initCtx();
      const buffer = await this.preloadAudio(audioUrl);
      if (!buffer) return null;

      if (this.currentDialogueSource) {
        try {
          this.currentDialogueSource.stop();
        } catch {}
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.0, ctx.currentTime);

      source.connect(gain);
      gain.connect(destinationNode || ctx.destination);

      source.start();
      this.currentDialogueSource = source;
      return source;
    } catch (e) {
      console.warn(`Error playing dialogue clip ${audioUrl}:`, e);
      return null;
    }
  }

  // Play scene dialogue based on Scene ID and language
  public playSceneDialogue(sceneId: number, lang: 'id' | 'en' = 'id') {
    if (this.isMuted) return;

    if (sceneId === 1) {
      this.playDialogueClip(`/src/assets/audio/scene1_candra_${lang}.mp3`);
      setTimeout(() => {
        if (!this.isMuted) {
          this.playDialogueClip(`/src/assets/audio/scene1_rizki_${lang}.mp3`);
        }
      }, 3400);
    } else if (sceneId === 3) {
      setTimeout(() => {
        this.playDialogueClip(`/src/assets/audio/scene3_rana_${lang}.mp3`);
      }, 500);
    } else if (sceneId === 4) {
      setTimeout(() => {
        this.playDialogueClip(`/src/assets/audio/scene4_rana_${lang}.mp3`);
      }, 500);
    } else if (sceneId === 5) {
      setTimeout(() => {
        this.playDialogueClip(`/src/assets/audio/scene5_scouts_${lang}.mp3`);
      }, 1000);
    } else if (sceneId === 6) {
      setTimeout(() => {
        this.playDialogueClip(`/src/assets/audio/scene6_scouts_${lang}.mp3`);
      }, 1000);
    }
  }

  public playSceneAmbience(mood: string, dest?: AudioNode) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.ambienceGain) {
      this.ambienceGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, t);
    masterGain.gain.exponentialRampToValueAtTime(0.18, t + 1);
    masterGain.connect(dest || this.ctx.destination);
    this.ambienceGain = masterGain;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';

    if (mood === 'tense_rivalry' || mood === 'dramatic_pull') {
      filter.frequency.setValueAtTime(220, t);
      filter.Q.setValueAtTime(3, t);

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, t);
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.1, t);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
        } catch {}
      }, 5000);
    } else if (mood === 'magical_revelation') {
      filter.frequency.setValueAtTime(800, t);
      filter.Q.setValueAtTime(1, t);
      this.playMagicalChimes(dest);
    } else if (mood === 'heartwarming_unity') {
      filter.frequency.setValueAtTime(400, t);
      filter.Q.setValueAtTime(1.5, t);
      this.playPeacefulHarmony(dest);
    } else {
      filter.frequency.setValueAtTime(320, t);
      filter.Q.setValueAtTime(2, t);
    }

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();
    this.ambienceSource = whiteNoise;
  }

  public playTearSfx(dest?: AudioNode) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest || this.ctx.destination);
    noise.start();
  }

  public playInterruptionSting(dest?: AudioNode) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    osc.connect(gain);
    gain.connect(dest || this.ctx.destination);
    osc.start();
    osc.stop(t + 0.8);
  }

  public playMagicalChimes(dest?: AudioNode) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
    const baseTime = this.ctx.currentTime + 0.1;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = baseTime + idx * 0.14;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(dest || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  public playPeacefulHarmony(dest?: AudioNode) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [174.61, 220.0, 261.63, 329.63, 440.0];
    const t = this.ctx.currentTime;

    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06 / (i + 1), t + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 5.0);

      osc.connect(gain);
      gain.connect(dest || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 5.2);
    });
  }

  public speakDialogue(text: string, lang: 'id-ID' | 'en-US' = 'id-ID') {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public stopAll() {
    if (this.ambienceSource) {
      try {
        (this.ambienceSource as AudioScheduledSourceNode).stop();
      } catch {}
    }
    if (this.currentDialogueSource) {
      try {
        this.currentDialogueSource.stop();
      } catch {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();

import { useAppStore } from '../store';

class AudioController {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(frequency: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!useAppStore.getState().profile?.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playCorrect() {
    this.playTone(600, 'sine', 0.1);
    setTimeout(() => this.playTone(800, 'sine', 0.15), 100);
  }

  playIncorrect() {
    this.playTone(300, 'sawtooth', 0.3, 0.05);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.3, 0.05), 150);
  }

  playTap() {
    this.playTone(400, 'triangle', 0.05, 0.02);
  }

  playLevelUp() {
    this.playTone(400, 'sine', 0.1);
    setTimeout(() => this.playTone(500, 'sine', 0.1), 100);
    setTimeout(() => this.playTone(600, 'sine', 0.1), 200);
    setTimeout(() => this.playTone(800, 'sine', 0.3), 300);
  }
}

export const audio = new AudioController();

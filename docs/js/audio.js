// Sonidos sintetizados con Web Audio (sin archivos, funciona offline)
export class Sfx {
  constructor() { this.ctx = null; this.muted = false; this.last = {}; try { this.muted = localStorage.getItem('rp_muted') === '1'; } catch (e) {} }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    try { localStorage.setItem('rp_muted', m ? '1' : '0'); } catch (e) {}
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  _throttle(key, ms) {
    const now = performance.now();
    if (this.last[key] && now - this.last[key] < ms) return true;
    this.last[key] = now; return false;
  }

  _noise(dur, freq, q, gain, type = 'bandpass') {
    const c = this.ctx, t = c.currentTime;
    const src = c.createBufferSource(); src.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t, Math.random() * 0.3); src.stop(t + dur);
  }

  _tone(type, f0, f1, dur, gain, delay = 0) {
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }

  play(name) {
    if (!this.ctx || this.muted) return;
    switch (name) {
      case 'pistola': if (this._throttle('shot', 60)) return; this._noise(0.08, 1800, 1.2, 0.35); this._tone('square', 420, 120, 0.06, 0.08); break;
      case 'subfusil': if (this._throttle('shot', 70)) return; this._noise(0.05, 2400, 1.5, 0.22); break;
      case 'escopeta': this._noise(0.22, 900, 0.7, 0.6, 'lowpass'); this._tone('sawtooth', 160, 50, 0.15, 0.12); break;
      case 'hit': if (this._throttle('hit', 45)) return; this._tone('triangle', 900, 500, 0.04, 0.06); break;
      case 'down': if (this._throttle('down', 50)) return; this._tone('square', 300, 90, 0.12, 0.05); break;
      case 'gate': this._tone('triangle', 660, 660, 0.09, 0.2); this._tone('triangle', 990, 990, 0.14, 0.2, 0.08); this._tone('triangle', 1320, 1320, 0.2, 0.18, 0.16); break;
      case 'hurt': if (this._throttle('hurt', 90)) return; this._tone('sawtooth', 180, 60, 0.18, 0.22); break;
      case 'bomb': this._noise(0.7, 300, 0.5, 0.9, 'lowpass'); this._tone('sine', 120, 30, 0.6, 0.5); break;
      case 'boss': this._tone('sawtooth', 90, 45, 1.2, 0.3); this._tone('square', 140, 70, 1.0, 0.12, 0.1); break;
      case 'shout': this._tone('sawtooth', 260, 120, 0.5, 0.18); this._noise(0.4, 700, 2, 0.2); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => this._tone('triangle', f, f, 0.25, 0.22, i * 0.13)); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => this._tone('triangle', f, f * 0.98, 0.3, 0.22, i * 0.18)); break;
      case 'car': this._noise(0.3, 500, 0.8, 0.6); this._tone('square', 120, 40, 0.25, 0.15); break;
      case 'empty': this._tone('square', 200, 200, 0.05, 0.08); break;
    }
  }
}

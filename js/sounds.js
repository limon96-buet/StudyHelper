/* Shikhor ambient sounds, generated live with the Web Audio API.
   No audio files: rain, waterfall, wind, birds and the rest are synthesised. */
(function () {
  'use strict';
  const SN = window.SN;
  const rnd = (a, b) => a + Math.random() * (b - a);

  const A = {
    ctx: null, master: null, active: {}, buffers: {},
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain(); this.master.gain.value = 0.7;
        const comp = this.ctx.createDynamicsCompressor();
        this.master.connect(comp); comp.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    buffer(type) {
      if (this.buffers[type]) return this.buffers[type];
      const ctx = this.ctx, len = ctx.sampleRate * 6, N = 4096;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const x = new Float32Array(len + N);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
        for (let i = 0; i < x.length; i++) {
          const w = Math.random() * 2 - 1;
          if (type === 'white') x[i] = w * 0.5;
          else if (type === 'pink') {
            b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
            b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
            x[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
          } else { last = (last + 0.02 * w) / 1.02; x[i] = last * 3.5; }
        }
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = x[i];
        for (let i = 0; i < N; i++) { const t = i / N; d[i] = x[i] * t + x[len + i] * (1 - t); } // seamless loop
      }
      return (this.buffers[type] = buf);
    },
    src(type, out, h) { const s = this.ctx.createBufferSource(); s.buffer = this.buffer(type); s.loop = true; s.connect(out); s.start(0, Math.random() * 5); h.nodes.push(s); return s; },
    filt(type, f, q, out) { const n = this.ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q != null) n.Q.value = q; n.connect(out); return n; },
    gain(v, out) { const g = this.ctx.createGain(); g.gain.value = v; g.connect(out); return g; },
    lfo(freq, depth, param, h, type = 'sine') { const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq; const g = this.ctx.createGain(); g.gain.value = depth; o.connect(g); g.connect(param); o.start(); h.nodes.push(o); return o; },
    blip(out, freq, dur, vol, q = 3) {
      const c = this.ctx, t = c.currentTime;
      const s = c.createBufferSource(); s.buffer = this.buffer('white');
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 5, dur + 0.03);
    },
    loop(h, fn, min, max) { const go = () => { if (!h.alive) return; fn(); h.timer = setTimeout(go, rnd(min, max)); }; go(); },

    presets: {
      rain(A, out, h) {
        A.src('pink', A.filt('highpass', 380, 0.5, A.filt('lowpass', 5500, 0.4, A.gain(0.55, out))), h);
        A.src('white', A.filt('bandpass', 1800, 0.6, A.gain(0.16, out)), h);
        A.loop(h, () => A.blip(out, rnd(2500, 6000), rnd(0.01, 0.03), rnd(0.03, 0.09)), 20, 110);
      },
      waterfall(A, out, h) {
        A.src('brown', A.filt('lowpass', 900, 0.5, A.gain(0.95, out)), h);
        A.src('white', A.filt('bandpass', 1400, 0.4, A.gain(0.13, out)), h);
        A.src('pink', A.filt('highpass', 3000, 0.5, A.gain(0.06, out)), h);
      },
      stream(A, out, h) {
        const f1 = A.filt('bandpass', 700, 1.2, A.gain(0.6, out)); A.src('pink', f1, h); A.lfo(0.25, 300, f1.frequency, h);
        const f2 = A.filt('bandpass', 2200, 2, A.gain(0.22, out)); A.src('pink', f2, h); A.lfo(0.41, 600, f2.frequency, h);
        A.loop(h, () => A.blip(out, rnd(350, 900), rnd(0.04, 0.09), 0.05, 8), 150, 700);
      },
      wind(A, out, h) {
        const g = A.gain(0.45, out); const f = A.filt('bandpass', 420, 1.3, g);
        A.src('white', f, h); A.lfo(0.06, 220, f.frequency, h); A.lfo(0.09, 0.28, g.gain, h);
        A.src('brown', A.filt('lowpass', 300, 0.5, A.gain(0.35, out)), h);
      },
      ocean(A, out, h) {
        const g = A.gain(0.45, out); A.src('brown', A.filt('lowpass', 650, 0.5, g), h); A.lfo(0.085, 0.42, g.gain, h);
        const g2 = A.gain(0.05, out); A.src('white', A.filt('highpass', 2500, 0.5, g2), h); A.lfo(0.085, 0.05, g2.gain, h);
      },
      fire(A, out, h) {
        A.src('brown', A.filt('lowpass', 350, 0.5, A.gain(0.6, out)), h);
        A.loop(h, () => A.blip(out, rnd(1500, 4500), rnd(0.004, 0.015), rnd(0.08, 0.28), 1), 30, 260);
      },
      birds(A, out, h) {
        A.src('pink', A.filt('bandpass', 600, 0.8, A.gain(0.06, out)), h);
        A.loop(h, () => {
          const c = A.ctx; let t = c.currentTime + 0.02;
          const pan = c.createStereoPanner ? c.createStereoPanner() : null;
          const g = c.createGain(); g.gain.value = 0;
          if (pan) { pan.pan.value = rnd(-0.8, 0.8); g.connect(pan); pan.connect(out); } else g.connect(out);
          const o = c.createOscillator(); o.type = 'sine'; o.connect(g);
          const f0 = rnd(2200, 4800), notes = Math.floor(rnd(2, 7));
          for (let i = 0; i < notes; i++) {
            const d = rnd(0.05, 0.13);
            o.frequency.setValueAtTime(f0 * rnd(0.9, 1.1), t);
            o.frequency.exponentialRampToValueAtTime(f0 * rnd(0.7, 1.4), t + d);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.01); g.gain.linearRampToValueAtTime(0, t + d);
            t += d + rnd(0.03, 0.1);
          }
          o.start(); o.stop(t + 0.1);
        }, 700, 3000);
      },
      crickets(A, out, h) {
        [[4300, 28, 1.1], [4700, 31, 0.8]].forEach(([f, r1, r2]) => {
          const g2 = A.gain(0.5, A.gain(0.035, out)); const g1 = A.gain(0.5, g2);
          const o = A.ctx.createOscillator(); o.frequency.value = f; o.connect(g1); o.start(); h.nodes.push(o);
          A.lfo(r1, 0.5, g1.gain, h, 'square'); A.lfo(r2, 0.5, g2.gain, h, 'square');
        });
      },
      pad(A, out, h) {
        const chords = [[110, 164.81, 220, 261.63, 329.63, 493.88], [87.31, 130.81, 174.61, 220, 261.63, 329.63], [98, 146.83, 196, 246.94, 293.66, 392], [82.41, 123.47, 164.81, 196, 246.94, 329.63]];
        const lp = A.filt('lowpass', 1300, 0.6, out);
        const oscs = chords[0].map((f, i) => {
          const g = A.gain(0.035, lp); const o = A.ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine';
          o.frequency.value = f; o.connect(g); o.start(); h.nodes.push(o);
          A.lfo(rnd(0.05, 0.15), 0.02, g.gain, h); A.lfo(0.2, 3, o.detune, h); return o;
        });
        let k = 0;
        A.loop(h, () => { k = (k + 1) % chords.length; oscs.forEach((o, i) => o.frequency.setTargetAtTime(chords[k][i], A.ctx.currentTime, 2.5)); }, 14000, 18000);
      },
      brown(A, out, h) { A.src('brown', A.filt('lowpass', 900, 0.5, A.gain(0.7, out)), h); }
    },

    play(name, vol = 0.6) {
      if (!this.ensure() || !this.presets[name]) return;
      if (this.active[name]) return this.setVol(name, vol);
      const out = this.ctx.createGain(); out.gain.value = 0; out.connect(this.master);
      const h = { alive: true, nodes: [], timer: null };
      this.presets[name](this, out, h);
      out.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.6);
      this.active[name] = { h, out };
    },
    stop(name) {
      const a = this.active[name]; if (!a) return;
      delete this.active[name];
      a.h.alive = false; clearTimeout(a.h.timer);
      a.out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
      setTimeout(() => { a.h.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } }); a.out.disconnect(); }, 1500);
    },
    setVol(name, v) { const a = this.active[name]; if (a) a.out.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1); },
    setMaster(v) { if (this.ensure()) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1); },
    stopAll() { Object.keys(this.active).forEach((k) => this.stop(k)); },
    chime(times = 1) {
      if (!this.ensure()) return;
      const c = this.ctx;
      for (let r = 0; r < times; r++) {
        [659.25, 987.77].forEach((f, i) => {
          const t = c.currentTime + r * 0.9 + i * 0.18;
          const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
          const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
          o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 2);
        });
      }
    }
  };

  SN.Sound = A;
  SN.SOUNDS = [
    { key: 'rain', name: 'Rain on leaves' }, { key: 'waterfall', name: 'Waterfall' },
    { key: 'stream', name: 'Mountain stream' }, { key: 'wind', name: 'Himalayan wind' },
    { key: 'ocean', name: 'Ocean waves' }, { key: 'fire', name: 'Campfire' },
    { key: 'birds', name: 'Morning birds' }, { key: 'crickets', name: 'Night crickets' },
    { key: 'pad', name: 'Calm pad' }, { key: 'brown', name: 'Deep focus noise' }
  ];
})();

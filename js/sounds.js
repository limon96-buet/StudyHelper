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
      brown(A, out, h) { A.src('brown', A.filt('lowpass', 900, 0.5, A.gain(0.7, out)), h); },

      /* ── NEW SOUNDS ──────────────────────────────────────── */

      /* Thunderstorm: deep rolling thunder + heavy rain */
      thunder(A, out, h) {
        // heavy rain layer
        A.src('pink', A.filt('highpass', 300, 0.4, A.filt('lowpass', 6000, 0.3, A.gain(0.5, out))), h);
        A.src('white', A.filt('bandpass', 2200, 0.5, A.gain(0.12, out)), h);
        // thunder rumbles
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime;
          const dur = rnd(1.5, 3.5);
          const g = c.createGain(); g.connect(out);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(rnd(0.5, 0.9), t + 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          const s = c.createBufferSource(); s.buffer = A.buffer('brown');
          const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = rnd(120, 260);
          s.connect(lp); lp.connect(g); s.start(t, Math.random() * 4, dur);
        }, 4000, 14000);
      },

      /* Busy cafe: murmur of voices + soft clinking + espresso hiss */
      cafe(A, out, h) {
        // crowd murmur — filtered pink noise modulated slowly
        const murmur = A.gain(0.28, out);
        const mf = A.filt('bandpass', 520, 0.7, murmur); A.src('pink', mf, h);
        A.lfo(0.08, 180, mf.frequency, h);
        // mid-frequency chatter texture
        A.src('pink', A.filt('bandpass', 1100, 1.2, A.gain(0.09, out)), h);
        // random clinks (cups/cutlery)
        A.loop(h, () => A.blip(out, rnd(1800, 4200), rnd(0.02, 0.06), rnd(0.04, 0.11), 12), 800, 3500);
        // occasional espresso machine hiss
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime, dur = rnd(0.6, 1.4);
          const g = c.createGain(); g.connect(out);
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          const s = c.createBufferSource(); s.buffer = A.buffer('white');
          const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000;
          s.connect(hp); hp.connect(g); s.start(t, 0, dur + 0.1);
        }, 8000, 22000);
      },

      /* Library: deep hum + soft page turns + pen scratching */
      library(A, out, h) {
        // HVAC / building hum
        A.src('brown', A.filt('lowpass', 180, 0.5, A.gain(0.22, out)), h);
        // very soft presence noise
        A.src('pink', A.filt('bandpass', 400, 0.4, A.gain(0.04, out)), h);
        // page turns
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime, dur = rnd(0.05, 0.12);
          const g = c.createGain(); g.connect(out);
          g.gain.setValueAtTime(rnd(0.05, 0.14), t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          const s = c.createBufferSource(); s.buffer = A.buffer('white');
          const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rnd(1200, 3500); bp.Q.value = 0.8;
          s.connect(bp); bp.connect(g); s.start(t, 0, dur + 0.05);
        }, 3000, 9000);
        // pen on paper
        A.loop(h, () => {
          const c = A.ctx; let t = c.currentTime;
          const strokes = Math.floor(rnd(3, 10));
          for (let i = 0; i < strokes; i++) {
            const dur = rnd(0.04, 0.14);
            const g = c.createGain(); g.connect(out);
            g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            const s = c.createBufferSource(); s.buffer = A.buffer('white');
            const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2800;
            s.connect(hp); hp.connect(g); s.start(t, 0, dur + 0.02);
            t += dur + rnd(0.02, 0.08);
          }
        }, 2000, 7000);
      },

      /* Keyboard typing: mechanical clicky keys */
      keyboard(A, out, h) {
        A.loop(h, () => {
          const c = A.ctx; let t = c.currentTime;
          const burst = Math.floor(rnd(4, 18)); // keys in a burst
          for (let i = 0; i < burst; i++) {
            const isSpace = Math.random() < 0.08;
            const freq = isSpace ? rnd(180, 260) : rnd(600, 1800);
            const dur = isSpace ? rnd(0.04, 0.08) : rnd(0.012, 0.035);
            const vol = isSpace ? rnd(0.18, 0.28) : rnd(0.08, 0.18);
            // keydown click
            const g = c.createGain(); g.connect(out);
            g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            const s = c.createBufferSource(); s.buffer = A.buffer('white');
            const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 2;
            s.connect(bp); bp.connect(g); s.start(t, 0, dur + 0.02);
            // keyup tick (softer, slightly higher)
            const g2 = c.createGain(); g2.connect(out);
            const t2 = t + dur + rnd(0.01, 0.025);
            g2.gain.setValueAtTime(vol * 0.45, t2); g2.gain.exponentialRampToValueAtTime(0.001, t2 + dur * 0.6);
            const s2 = c.createBufferSource(); s2.buffer = A.buffer('white');
            const bp2 = c.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = freq * 1.3; bp2.Q.value = 2.5;
            s2.connect(bp2); bp2.connect(g2); s2.start(t2, 0, dur * 0.6 + 0.02);
            t += dur + rnd(0.04, 0.16);
          }
        }, 600, 2400);
      },

      /* Tibetan singing bowls: harmonic resonance that slowly evolves */
      bowls(A, out, h) {
        const NOTES = [196, 220, 261.63, 293.66, 329.63, 392, 440];
        const lp = A.filt('lowpass', 2200, 1.2, out);
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime;
          const root = NOTES[Math.floor(Math.random() * NOTES.length)];
          [1, 2.756, 5.404, 8.933].forEach((ratio, j) => { // bowl partial ratios
            const freq = root * ratio;
            if (freq > 8000) return;
            const dur = rnd(3.5, 7);
            const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
            const g = c.createGain(); g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.055 / (j + 1), t + 0.06);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + 0.1);
            h.nodes.push(o);
          });
        }, 3500, 8000);
        // subtle resonant hum between strikes
        const hum = A.gain(0.015, lp); A.src('pink', A.filt('bandpass', 220, 8, hum), h);
      },

      /* Light drizzle: softer than rain, gentle pitter-patter */
      drizzle(A, out, h) {
        A.src('pink', A.filt('highpass', 600, 0.5, A.filt('lowpass', 4000, 0.4, A.gain(0.22, out))), h);
        A.loop(h, () => A.blip(out, rnd(3000, 8000), rnd(0.005, 0.018), rnd(0.015, 0.045), 6), 15, 60);
        // occasional drip from leaves
        A.loop(h, () => A.blip(out, rnd(800, 1800), rnd(0.03, 0.07), rnd(0.04, 0.09), 14), 300, 1400);
      },

      /* Jungle at dusk: tropical birds, insects, distant frogs */
      jungle(A, out, h) {
        // insect drone base
        [[3200, 44, 1.3], [3600, 38, 0.9], [4100, 52, 0.7]].forEach(([f, r, v]) => {
          const g = A.gain(v * 0.018, out); A.src('pink', A.filt('bandpass', f, 3, g), h);
          A.lfo(r, 0.5, g.gain, h, 'square');
        });
        // tropical bird calls — higher and more melodic than morning birds
        A.loop(h, () => {
          const c = A.ctx; let t = c.currentTime + rnd(0, 0.2);
          const pan = c.createStereoPanner ? c.createStereoPanner() : null;
          const g = c.createGain(); g.gain.value = 0;
          if (pan) { pan.pan.value = rnd(-1, 1); g.connect(pan); pan.connect(out); } else g.connect(out);
          const o = c.createOscillator(); o.type = 'triangle'; o.connect(g);
          const f0 = rnd(1200, 3800), notes = Math.floor(rnd(1, 5));
          for (let i = 0; i < notes; i++) {
            const d = rnd(0.06, 0.22);
            o.frequency.setValueAtTime(f0 * rnd(0.8, 1.2), t);
            o.frequency.exponentialRampToValueAtTime(f0 * rnd(0.5, 1.8), t + d);
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08, t + 0.02); g.gain.linearRampToValueAtTime(0, t + d);
            t += d + rnd(0.04, 0.14);
          }
          o.start(); o.stop(t + 0.2);
        }, 400, 2200);
        // distant frogs
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime;
          const g = c.createGain(); g.connect(out);
          const o = c.createOscillator(); o.type = 'sine';
          const f = rnd(180, 380);
          o.frequency.setValueAtTime(f, t); o.frequency.setValueAtTime(f * 1.2, t + 0.03); o.frequency.setValueAtTime(f, t + 0.06);
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          o.connect(g); o.start(t); o.stop(t + 0.2); h.nodes.push(o);
        }, 600, 2800);
      },

      /* Train journey: rhythmic rail clacking + low rumble + occasional horn */
      train(A, out, h) {
        // low engine rumble
        const rumble = A.gain(0.55, out); A.src('brown', A.filt('lowpass', 220, 0.5, rumble), h);
        A.lfo(0.04, 0.18, rumble.gain, h);
        // rail clacking rhythm
        A.loop(h, () => {
          const c = A.ctx; let t = c.currentTime;
          const bpm = rnd(3.2, 4.8); // clacks per second (speed of train)
          const beats = Math.floor(rnd(8, 20));
          for (let i = 0; i < beats; i++) {
            // double-clack (two rails)
            [0, 0.055].forEach((offset) => {
              const g = c.createGain(); g.connect(out);
              const tt = t + offset;
              g.gain.setValueAtTime(rnd(0.18, 0.32), tt); g.gain.exponentialRampToValueAtTime(0.001, tt + 0.08);
              const s = c.createBufferSource(); s.buffer = A.buffer('white');
              const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = rnd(600, 1200);
              s.connect(lp); lp.connect(g); s.start(tt, 0, 0.1);
            });
            t += 1 / bpm;
          }
        }, 1200, 2800);
        // distant horn
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime, dur = rnd(0.8, 2.2);
          [220, 277.18, 329.63].forEach((f, j) => {
            const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
            const g = c.createGain();
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.04 - j * 0.008, t + 0.12);
            g.gain.setValueAtTime(0.04 - j * 0.008, t + dur - 0.15); g.gain.linearRampToValueAtTime(0, t + dur);
            const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
            o.connect(lp); lp.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.1); h.nodes.push(o);
          });
        }, 18000, 45000);
      },

      /* Temple bells: single bell strikes with long decay, meditative */
      temple(A, out, h) {
        const lp = A.filt('lowpass', 3500, 0.8, out);
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime;
          const root = [261.63, 293.66, 329.63, 349.23, 392][Math.floor(Math.random() * 5)];
          const dur = rnd(4, 9);
          // fundamental + harmonics of a bell
          [1, 2.756, 5.404, 8.933, 13.34].forEach((ratio, j) => {
            const freq = root * ratio; if (freq > 12000) return;
            const o = c.createOscillator(); o.type = j === 0 ? 'sine' : 'sine';
            o.frequency.value = freq;
            // slight inharmonicity via detune
            o.detune.value = rnd(-4, 4);
            const g = c.createGain();
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.08 / (j * 0.7 + 1), t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (j * 0.3 + 1));
            o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + 0.1); h.nodes.push(o);
          });
        }, 4000, 10000);
      },

      /* Lo-fi beats: slow hip-hop beat with vinyl crackle */
      lofi(A, out, h) {
        const c = A.ctx;
        // vinyl crackle
        A.src('white', A.filt('highpass', 6000, 0.3, A.gain(0.04, out)), h);
        A.src('brown', A.filt('lowpass', 200, 0.5, A.gain(0.06, out)), h);
        // slow beat pattern at ~75 BPM
        const bps = 75 / 60;
        A.loop(h, () => {
          const t = c.currentTime;
          const bar = 4 / bps; // 4 beats
          // kick drum (beats 1 and 3)
          [0, 2 / bps].forEach((offset) => {
            const g = c.createGain(); g.connect(out);
            g.gain.setValueAtTime(0.6, t + offset); g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.28);
            const o = c.createOscillator(); o.type = 'sine';
            o.frequency.setValueAtTime(160, t + offset); o.frequency.exponentialRampToValueAtTime(40, t + offset + 0.12);
            o.connect(g); o.start(t + offset); o.stop(t + offset + 0.3); h.nodes.push(o);
          });
          // snare (beats 2 and 4)
          [1 / bps, 3 / bps].forEach((offset) => {
            const g = c.createGain(); g.connect(out);
            g.gain.setValueAtTime(0.28, t + offset); g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15);
            const s = c.createBufferSource(); s.buffer = A.buffer('white');
            const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
            s.connect(bp); bp.connect(g); s.start(t + offset, 0, 0.17);
          });
          // hi-hat (every eighth note)
          for (let i = 0; i < 8; i++) {
            const off = i / (bps * 2);
            const g = c.createGain(); g.connect(out);
            const vol = i % 2 === 0 ? 0.14 : 0.07;
            g.gain.setValueAtTime(vol, t + off); g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.055);
            const s = c.createBufferSource(); s.buffer = A.buffer('white');
            const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
            s.connect(hp); hp.connect(g); s.start(t + off, 0, 0.07);
          }
          // bass note (subtle, low)
          const bass = [55, 65.41, 49, 55][Math.floor(Math.random() * 4)];
          const og = c.createGain(); og.connect(out); og.gain.value = 0.18;
          const bo = c.createOscillator(); bo.type = 'triangle'; bo.frequency.value = bass;
          bo.connect(og); bo.start(t); bo.stop(t + bar - 0.05); h.nodes.push(bo);
        }, Math.round((4 / bps) * 1000), Math.round((4 / bps) * 1000 + 10));
      },

      /* Underwater: bubbly, muffled, deep oceanic */
      underwater(A, out, h) {
        // deep muffled rumble
        A.src('brown', A.filt('lowpass', 140, 0.5, A.gain(0.7, out)), h);
        // mid water texture
        const wf = A.filt('bandpass', 320, 0.6, A.gain(0.18, out));
        A.src('pink', wf, h); A.lfo(0.04, 80, wf.frequency, h);
        // bubbles
        A.loop(h, () => {
          const c = A.ctx; let t = c.currentTime;
          const n = Math.floor(rnd(1, 5));
          for (let i = 0; i < n; i++) {
            const freq = rnd(300, 1200), dur = rnd(0.04, 0.12);
            const g = c.createGain(); g.connect(out);
            const o = c.createOscillator(); o.type = 'sine';
            o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 1.6, t + dur);
            g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
            o.connect(g); o.start(t); o.stop(t + dur + 0.02); h.nodes.push(o);
            t += rnd(0.01, 0.06);
          }
        }, 200, 1200);
        // eerie resonant hum
        const lp = A.filt('lowpass', 400, 3, A.gain(0.12, out));
        A.src('pink', lp, h); A.lfo(0.03, 120, lp.frequency, h);
      },

      /* Snowstorm: howling wind + blizzard hiss, cold and dramatic */
      snowstorm(A, out, h) {
        // main howl — wind with bigger sweeps than normal wind
        const g1 = A.gain(0.55, out);
        const f1 = A.filt('bandpass', 380, 0.9, g1); A.src('white', f1, h);
        A.lfo(0.045, 280, f1.frequency, h); A.lfo(0.07, 0.38, g1.gain, h);
        // low blizzard roar
        A.src('brown', A.filt('lowpass', 260, 0.5, A.gain(0.45, out)), h);
        // icy high hiss
        const g2 = A.gain(0.08, out); A.src('white', A.filt('highpass', 4500, 0.4, g2), h);
        A.lfo(0.12, 0.06, g2.gain, h);
        // occasional deep gust
        A.loop(h, () => {
          const c = A.ctx, t = c.currentTime, dur = rnd(0.8, 2.5);
          const g = c.createGain(); g.connect(out);
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rnd(0.35, 0.7), t + dur * 0.35);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          const s = c.createBufferSource(); s.buffer = A.buffer('white');
          const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rnd(200, 600); bp.Q.value = 0.5;
          s.connect(bp); bp.connect(g); s.start(t, 0, dur + 0.1);
        }, 2000, 7000);
      }
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
    /* nature */
    { key: 'rain',       name: 'Rain on leaves' },
    { key: 'drizzle',    name: 'Light drizzle' },
    { key: 'thunder',    name: 'Thunderstorm' },
    { key: 'snowstorm',  name: 'Blizzard' },
    { key: 'waterfall',  name: 'Waterfall' },
    { key: 'stream',     name: 'Mountain stream' },
    { key: 'ocean',      name: 'Ocean waves' },
    { key: 'wind',       name: 'Himalayan wind' },
    { key: 'underwater', name: 'Underwater' },
    /* life */
    { key: 'birds',      name: 'Morning birds' },
    { key: 'jungle',     name: 'Jungle at dusk' },
    { key: 'crickets',   name: 'Night crickets' },
    { key: 'fire',       name: 'Campfire' },
    { key: 'train',      name: 'Train journey' },
    { key: 'cafe',       name: 'Busy café' },
    { key: 'library',    name: 'Library' },
    { key: 'keyboard',   name: 'Mechanical keyboard' },
    /* music & tone */
    { key: 'bowls',      name: 'Tibetan bowls' },
    { key: 'temple',     name: 'Temple bells' },
    { key: 'lofi',       name: 'Lo-fi beats' },
    { key: 'pad',        name: 'Calm pad' },
    { key: 'brown',      name: 'Deep focus noise' }
  ];
})();

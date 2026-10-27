/* Shikhor nature scenes. Everything is painted with canvas code, so the site
   has no image files to host and works offline. */
(function () {
  'use strict';
  const SN = window.SN;
  const TAU = Math.PI * 2;

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function jag(ctrl, rough, R, depth = 6) {
    let pts = ctrl;
    for (let d = 0; d < depth; d++) {
      const np = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        np.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (R() - 0.5) * len * rough], b);
      }
      pts = np;
    }
    return pts;
  }
  function shape(ctx, pts, h) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], h);
    for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(pts[pts.length - 1][0], h); ctx.closePath();
  }
  function fillShape(ctx, pts, h, fill) { shape(ctx, pts, h); ctx.fillStyle = fill; ctx.fill(); }
  function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function sky(ctx, w, h, stops) { ctx.fillStyle = vgrad(ctx, 0, h, stops); ctx.fillRect(0, 0, w, h); }
  function glow(ctx, x, y, r, inner, outer) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, inner); g.addColorStop(1, outer);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function haze(ctx, w, h, y0, color) { ctx.fillStyle = vgrad(ctx, y0, h, [[0, 'rgba(255,255,255,0)'], [1, color]]); ctx.fillRect(0, y0, w, h - y0); }
  function snowcap(ctx, pts, w, h, line, R, color) {
    ctx.save(); shape(ctx, pts, h); ctx.clip();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0);
    for (let x = w; x >= -20; x -= w / 48) ctx.lineTo(x, line + (R() - 0.5) * h * 0.07);
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  }
  function tree(ctx, x, base, ht, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i++) {
      const tw = ht * (0.55 - i * 0.12), ty = base - ht * i * 0.27;
      ctx.beginPath(); ctx.moveTo(x - tw / 2, ty); ctx.lineTo(x, ty - ht * 0.46); ctx.lineTo(x + tw / 2, ty); ctx.closePath(); ctx.fill();
    }
    ctx.fillRect(x - ht * 0.03, base - 1, ht * 0.06, ht * 0.1);
  }
  function cloud(ctx, x, y, s, a) {
    const blobs = [[0, 0, 1], [0.7, -0.18, 0.8], [-0.7, 0.05, 0.75], [1.3, 0.12, 0.6], [-1.3, 0.14, 0.55]];
    for (const [ox, oy, k] of blobs) {
      const r = s * k * 70, cx = x + ox * s * 70, cy = y + oy * s * 70;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  }
  function stars(ctx, w, h, n, R, maxY) {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.7})`;
      const r = R() < 0.08 ? 1.6 : 0.9;
      ctx.beginPath(); ctx.arc(R() * w, R() * h * maxY, r, 0, TAU); ctx.fill();
    }
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  const SCENES = {
    himalaya: {
      name: 'Himalayan dawn', sound: 'wind', dark: false,
      swatch: 'linear-gradient(180deg,#8DB6D6,#F7D9C4 60%,#5E7C8E)',
      init(s, w, h) { s.clouds = Array.from({ length: 7 }, () => ({ x: rnd(-200, w), y: rnd(h * 0.08, h * 0.38), s: rnd(0.6, 1.4), v: rnd(6, 16), a: rnd(0.35, 0.6) })); },
      bg(b, w, h) {
        const R = rng(7);
        sky(b, w, h, [[0, '#8DB6D6'], [0.45, '#D6DDE8'], [0.68, '#F6D8C6'], [1, '#FBE9D8']]);
        glow(b, w * 0.7, h * 0.52, h * 0.55, 'rgba(255,212,170,0.6)', 'rgba(255,212,170,0)');
        const far = jag([[0, h * .6], [w * .12, h * .41], [w * .25, h * .54], [w * .4, h * .35], [w * .55, h * .5], [w * .7, h * .31], [w * .85, h * .47], [w, h * .39]], 0.28, R);
        fillShape(b, far, h, '#B6C8DA'); snowcap(b, far, w, h, h * 0.44, R, 'rgba(255,255,255,0.85)');
        haze(b, w, h, h * 0.4, 'rgba(250,228,212,0.55)');
        const mid = jag([[0, h * .7], [w * .18, h * .5], [w * .33, h * .66], [w * .5, h * .45], [w * .63, h * .61], [w * .8, h * .48], [w, h * .63]], 0.3, R);
        fillShape(b, mid, h, '#89A4BD'); snowcap(b, mid, w, h, h * 0.54, R, 'rgba(255,255,255,0.95)');
        haze(b, w, h, h * 0.55, 'rgba(250,228,212,0.45)');
        const near = jag([[0, h * .83], [w * .2, h * .69], [w * .42, h * .8], [w * .6, h * .71], [w * .85, h * .84], [w, h * .75]], 0.25, R);
        fillShape(b, near, h, '#5D7B8D');
        fillShape(b, jag([[0, h * .93], [w * .3, h * .87], [w * .6, h * .94], [w, h * .88]], 0.12, R, 5), h, '#46665A');
      },
      frame(ctx, w, h, s, dt) {
        for (const c of s.clouds) { c.x += c.v * dt; if (c.x > w + 250) { c.x = -250; c.y = rnd(h * 0.08, h * 0.38); } cloud(ctx, c.x, c.y, c.s, c.a); }
      }
    },

    everest: {
      name: 'Everest at night', sound: 'wind', dark: true,
      swatch: 'linear-gradient(180deg,#0E1A36,#3B4C74 60%,#E6ECF7)',
      init(s, w, h) {
        s.tw = Array.from({ length: 70 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.5, p: Math.random() * TAU, f: rnd(0.6, 2) }));
        s.peak = [w * 0.52, h * 0.2];
        s.plume = Array.from({ length: 50 }, () => ({ x: s.peak[0] + rnd(0, 160), y: s.peak[1] + rnd(-10, 20), life: Math.random() }));
      },
      bg(b, w, h, s) {
        const R = rng(11);
        sky(b, w, h, [[0, '#0E1A36'], [0.55, '#24365E'], [1, '#5A6C96']]);
        stars(b, w, h, 260, R, 0.65);
        glow(b, w * 0.2, h * 0.17, 90, 'rgba(230,236,255,0.35)', 'rgba(230,236,255,0)');
        b.fillStyle = '#F2F4FA'; b.beginPath(); b.arc(w * 0.2, h * 0.17, 24, 0, TAU); b.fill();
        const far = jag([[0, h * .75], [w * .15, h * .55], [w * .3, h * .66], [w * .85, h * .58], [w, h * .52]], 0.25, R);
        fillShape(b, far, h, '#2E3F66');
        const pk = s.peak;
        const m = jag([[0, h * .88], [w * .22, h * .64], [w * .4, h * .42], pk, [w * .63, h * .37], [w * .8, h * .55], [w, h * .68]], 0.2, R);
        fillShape(b, m, h, '#3B4C74');
        b.save(); shape(b, m, h); b.clip();
        b.fillStyle = 'rgba(160,178,214,0.55)';
        b.beginPath(); b.moveTo(pk[0], pk[1]); b.lineTo(w * 0.44, h); b.lineTo(0, h); b.lineTo(0, 0); b.closePath(); b.fill();
        b.restore();
        snowcap(b, m, w, h, h * 0.5, R, 'rgba(230,236,247,0.92)');
        b.save(); shape(b, m, h); b.clip();
        b.fillStyle = 'rgba(40,55,95,0.35)';
        b.beginPath(); b.moveTo(pk[0], pk[1]); b.lineTo(w * 0.62, h); b.lineTo(w, h); b.lineTo(w, 0); b.closePath(); b.fill();
        b.restore();
        fillShape(b, jag([[0, h * .9], [w * .35, h * .82], [w * .7, h * .92], [w, h * .84]], 0.15, R, 5), h, '#1C2846');
      },
      frame(ctx, w, h, s, dt, t) {
        for (const st of s.tw) { ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.75 * Math.abs(Math.sin(t * st.f + st.p))})`; ctx.fillRect(st.x, st.y, 1.6, 1.6); }
        for (const p of s.plume) {
          p.life += dt * 0.18; p.x += 26 * dt; p.y += Math.sin(t + p.x * 0.02) * 4 * dt;
          if (p.life > 1) { p.life = 0; p.x = s.peak[0] + rnd(-4, 10); p.y = s.peak[1] + rnd(-6, 8); }
          const a = Math.sin(p.life * Math.PI) * 0.22;
          glow(ctx, p.x, p.y, 16 + p.life * 30, `rgba(235,240,250,${a})`, 'rgba(235,240,250,0)');
        }
      }
    },

    rain: {
      name: 'Monsoon rain', sound: 'rain', dark: false,
      swatch: 'linear-gradient(180deg,#94A7B3,#7F9C8E 60%,#3D5C4D)',
      init(s, w, h) {
        s.drops = Array.from({ length: Math.round(w * h / 4200) }, () => ({ x: Math.random() * w, y: Math.random() * h, l: rnd(10, 24), v: rnd(520, 820) }));
        s.rip = [];
      },
      bg(b, w, h) {
        const R = rng(23);
        sky(b, w, h, [[0, '#8EA2AE'], [1, '#D3DDE1']]);
        fillShape(b, jag([[0, h * .55], [w * .3, h * .45], [w * .6, h * .53], [w, h * .44]], 0.2, R), h, '#A9BBB6');
        haze(b, w, h, h * 0.45, 'rgba(225,232,234,0.6)');
        fillShape(b, jag([[0, h * .66], [w * .25, h * .56], [w * .55, h * .65], [w * .8, h * .55], [w, h * .62]], 0.22, R), h, '#7F9C8E');
        haze(b, w, h, h * 0.58, 'rgba(220,230,230,0.45)');
        fillShape(b, jag([[0, h * .78], [w * .4, h * .68], [w * .7, h * .76], [w, h * .7]], 0.2, R), h, '#5C7D6C');
        for (let i = 0; i < 26; i++) tree(b, R() * w, h * 0.8 + R() * h * 0.04, rnd(30, 60), '#46655A');
        b.fillStyle = vgrad(b, h * 0.86, h, [[0, '#7E9A9C'], [1, '#5B7778']]); b.fillRect(0, h * 0.86, w, h * 0.14);
      },
      frame(ctx, w, h, s, dt) {
        ctx.strokeStyle = 'rgba(236,243,247,0.5)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const d of s.drops) {
          d.y += d.v * dt; d.x -= d.v * 0.12 * dt;
          if (d.y > h) { d.y = -d.l; d.x = Math.random() * w * 1.1; }
          ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * 0.12, d.y - d.l);
        }
        ctx.stroke();
        if (Math.random() < dt * 14) s.rip.push({ x: Math.random() * w, y: rnd(h * 0.88, h * 0.99), r: 1, a: 0.6 });
        ctx.lineWidth = 1;
        s.rip = s.rip.filter((r) => { r.r += 18 * dt; r.a -= 0.7 * dt; if (r.a <= 0) return false; ctx.strokeStyle = `rgba(230,240,240,${r.a})`; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, TAU); ctx.stroke(); return true; });
      }
    },

    snow: {
      name: 'Snowfall in the pines', sound: 'brown', dark: false,
      swatch: 'linear-gradient(180deg,#C9D8E4,#F2F6F9 55%,#4F6D6A)',
      init(s, w, h) { s.f = Array.from({ length: Math.round(w * h / 5500) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: rnd(0.8, 3), v: rnd(18, 55), p: Math.random() * TAU })); },
      bg(b, w, h) {
        const R = rng(31);
        sky(b, w, h, [[0, '#C3D3E0'], [1, '#F2F6F9']]);
        fillShape(b, jag([[0, h * .5], [w * .3, h * .38], [w * .55, h * .47], [w * .8, h * .36], [w, h * .45]], 0.25, R), h, '#DCE6EE');
        fillShape(b, jag([[0, h * .62], [w * .35, h * .52], [w * .7, h * .6], [w, h * .53]], 0.2, R), h, '#C8D6E0');
        for (let i = 0; i < 40; i++) tree(b, R() * w, h * 0.66 + R() * h * 0.04, rnd(30, 55), '#9DB2BB');
        fillShape(b, jag([[0, h * .72], [w * .5, h * .68], [w, h * .73]], 0.1, R, 5), h, '#EAF1F5');
        for (let i = 0; i < 18; i++) tree(b, R() * w, h * 0.8 + R() * h * 0.08, rnd(90, 170), '#4F6D6A');
        fillShape(b, jag([[0, h * .88], [w * .3, h * .84], [w * .65, h * .9], [w, h * .85]], 0.12, R, 5), h, '#F8FBFD');
      },
      frame(ctx, w, h, s, dt, t) {
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.beginPath();
        for (const f of s.f) {
          f.y += f.v * dt; f.x += Math.sin(t * 0.8 + f.p) * 14 * dt;
          if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
          ctx.moveTo(f.x + f.r, f.y); ctx.arc(f.x, f.y, f.r, 0, TAU);
        }
        ctx.fill();
      }
    },

    waterfall: {
      name: 'Hidden waterfall', sound: 'waterfall', dark: false,
      swatch: 'linear-gradient(90deg,#56665F 35%,#E8F6FA 45% 55%,#56665F 65%)',
      init(s, w, h) {
        s.x0 = w * 0.43; s.x1 = w * 0.57; s.top = h * 0.25; s.bot = h * 0.78;
        s.streaks = Array.from({ length: 140 }, () => ({ x: rnd(s.x0, s.x1), y: rnd(s.top, s.bot), l: rnd(20, 70), v: rnd(260, 420) }));
        s.mist = Array.from({ length: 40 }, () => ({ x: rnd(s.x0 - 40, s.x1 + 40), y: s.bot, life: Math.random(), vx: rnd(-20, 20) }));
      },
      bg(b, w, h, s) {
        const R = rng(41);
        sky(b, w, h, [[0, '#CFE5E9'], [1, '#EAF3EF']]);
        fillShape(b, jag([[0, h * .35], [w * .5, h * .22], [w, h * .32]], 0.2, R), h, '#A7C6B0');
        for (let i = 0; i < 30; i++) tree(b, R() * w, h * 0.3 + R() * h * 0.06, rnd(30, 50), '#7EA88C');
        const left = [[0, h * 0.2], [s.x0 - 10, s.top]].concat(jag([[s.x0, s.top], [s.x0 - 18, h * 0.5], [s.x0 + 4, s.bot]], 0.15, R, 4));
        b.beginPath(); b.moveTo(0, h); left.forEach((p) => b.lineTo(p[0], p[1])); b.lineTo(s.x0 + 4, h); b.closePath();
        b.fillStyle = vgrad(b, 0, h, [[0, '#6B7B72'], [1, '#3F4D47']]); b.fill();
        const right = jag([[s.x1, s.top], [s.x1 + 18, h * 0.52], [s.x1 - 4, s.bot]], 0.15, R, 4);
        b.beginPath(); b.moveTo(w, h); b.lineTo(w, h * 0.18); b.lineTo(s.x1 + 10, s.top); right.forEach((p) => b.lineTo(p[0], p[1])); b.lineTo(s.x1 - 4, h); b.closePath(); b.fill();
        b.strokeStyle = '#7A9A5E'; b.lineWidth = 14; b.lineCap = 'round';
        b.beginPath(); b.moveTo(0, h * 0.2); b.lineTo(s.x0 - 10, s.top); b.moveTo(w, h * 0.18); b.lineTo(s.x1 + 10, s.top); b.stroke();
        b.fillStyle = vgrad(b, s.top, s.bot, [[0, '#E8F6FA'], [1, '#BFE1EA']]); b.fillRect(s.x0, s.top, s.x1 - s.x0, s.bot - s.top);
        b.fillStyle = vgrad(b, s.bot, h, [[0, '#9BCBD4'], [1, '#5F98A6']]);
        b.beginPath(); b.ellipse(w / 2, h * 0.9, w * 0.4, h * 0.13, 0, 0, TAU); b.fill();
        for (let i = 0; i < 12; i++) { b.fillStyle = i % 2 ? '#4E7A55' : '#5F8C5F'; b.beginPath(); b.ellipse(R() * w, h * (0.92 + R() * 0.08), rnd(40, 110), rnd(20, 45), 0, 0, TAU); b.fill(); }
      },
      frame(ctx, w, h, s, dt) {
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.4; ctx.beginPath();
        for (const p of s.streaks) { p.y += p.v * dt; if (p.y > s.bot) { p.y = s.top - p.l; p.x = rnd(s.x0, s.x1); } ctx.moveTo(p.x, Math.max(s.top, p.y)); ctx.lineTo(p.x, Math.min(s.bot, p.y + p.l)); }
        ctx.stroke();
        for (const m of s.mist) {
          m.life += dt * 0.35; m.x += m.vx * dt; m.y -= 12 * dt;
          if (m.life > 1) { m.life = 0; m.x = rnd(s.x0 - 30, s.x1 + 30); m.y = s.bot + rnd(-6, 10); m.vx = rnd(-30, 30); }
          glow(ctx, m.x, m.y, 30 + m.life * 40, `rgba(255,255,255,${Math.sin(m.life * Math.PI) * 0.28})`, 'rgba(255,255,255,0)');
        }
      }
    },

    lake: {
      name: 'Sunset lake', sound: 'stream', dark: false,
      swatch: 'linear-gradient(180deg,#A9C7DE,#F5C9A9 45%,#E8B49D 62%,#6E86A3)',
      init(s, w, h) { s.hz = h * 0.62; },
      bg(b, w, h, s) {
        const R = rng(53), hz = s.hz;
        sky(b, w, hz, [[0, '#A9C7DE'], [0.6, '#F5C9A9'], [1, '#F2A88C']]);
        glow(b, w * 0.5, hz - 30, h * 0.4, 'rgba(255,226,170,0.75)', 'rgba(255,226,170,0)');
        b.fillStyle = '#FFE8BE'; b.beginPath(); b.arc(w * 0.5, hz - 34, 32, 0, TAU); b.fill();
        const far = jag([[0, hz - h * .1], [w * .25, hz - h * .2], [w * .45, hz - h * .08], [w * .7, hz - h * .22], [w, hz - h * .09]], 0.25, R);
        const near = jag([[0, hz - h * .03], [w * .2, hz - h * .1], [w * .5, hz - h * .02], [w * .8, hz - h * .12], [w, hz - h * .04]], 0.2, R);
        b.save(); b.beginPath(); b.rect(0, 0, w, hz); b.clip();
        fillShape(b, far, hz, '#8E86A6'); fillShape(b, near, hz, '#625F82'); b.restore();
        b.fillStyle = vgrad(b, hz, h, [[0, '#E8B49D'], [0.4, '#B9A3B0'], [1, '#6E86A3']]); b.fillRect(0, hz, w, h - hz);
        b.save(); b.globalAlpha = 0.28; b.translate(0, hz * 2); b.scale(1, -1);
        b.beginPath(); b.rect(0, 0, w, hz); b.clip(); fillShape(b, far, hz, '#8E86A6'); fillShape(b, near, hz, '#625F82'); b.restore();
        b.fillStyle = '#3E4A5E';
        for (let i = 0; i < 70; i++) { const x = i < 35 ? R() * w * 0.18 : w - R() * w * 0.18; const ht = rnd(40, 120); b.fillRect(x, h - ht, 2, ht); }
      },
      frame(ctx, w, h, s, dt, t) {
        for (let i = 0; i < 34; i++) {
          const y = s.hz + 8 + i * ((h - s.hz) / 38);
          const a = 0.18 + 0.22 * Math.sin(t * 1.6 + i * 1.3);
          const half = 18 + i * 3 + Math.sin(t + i) * 8;
          ctx.fillStyle = `rgba(255,236,200,${Math.max(0, a)})`;
          ctx.fillRect(w * 0.5 - half + Math.sin(t * 0.7 + i) * 6, y, half * 2, 1.6);
        }
      }
    },

    forest: {
      name: 'Firefly forest', sound: 'crickets', dark: true,
      swatch: 'linear-gradient(180deg,#2E4057,#55708A 55%,#1C2E38)',
      init(s, w, h) { s.flies = Array.from({ length: 55 }, () => ({ x: Math.random() * w, y: rnd(h * 0.45, h * 0.95), vx: rnd(-12, 12), vy: rnd(-8, 8), p: Math.random() * TAU })); },
      bg(b, w, h) {
        const R = rng(61);
        sky(b, w, h, [[0, '#2E4057'], [0.6, '#5B758D'], [1, '#93A9AB']]);
        glow(b, w * 0.75, h * 0.3, h * 0.35, 'rgba(255,220,180,0.25)', 'rgba(255,220,180,0)');
        [['#4A6274', 0.55, 40, 70], ['#33495A', 0.68, 60, 110], ['#22343F', 0.8, 90, 170]].forEach(([c, base, a, bb]) => {
          for (let i = 0; i < 34; i++) tree(b, R() * w, h * base + R() * h * 0.05, rnd(a, bb), c);
          b.fillStyle = c; b.fillRect(0, h * base + h * 0.04, w, h);
        });
        b.fillStyle = '#16242C'; b.fillRect(0, h * 0.92, w, h * 0.08);
      },
      frame(ctx, w, h, s, dt, t) {
        for (const f of s.flies) {
          f.vx += rnd(-20, 20) * dt; f.vy += rnd(-20, 20) * dt;
          f.vx = Math.max(-18, Math.min(18, f.vx)); f.vy = Math.max(-12, Math.min(12, f.vy));
          f.x = (f.x + f.vx * dt + w) % w; f.y = Math.max(h * 0.35, Math.min(h * 0.98, f.y + f.vy * dt));
          const a = Math.max(0, Math.sin(t * 1.4 + f.p)) * 0.9;
          glow(ctx, f.x, f.y, 14, `rgba(230,255,150,${a * 0.5})`, 'rgba(230,255,150,0)');
          ctx.fillStyle = `rgba(250,255,200,${a})`; ctx.fillRect(f.x - 1, f.y - 1, 2.2, 2.2);
        }
      }
    },

    aurora: {
      name: 'Northern lights', sound: 'pad', dark: true,
      swatch: 'linear-gradient(180deg,#0B1B2E,#1E7A6A 40%,#163A4A 70%,#D9E6EC)',
      init(s, w, h) {
        const strip = (c1, c2) => {
          const c = document.createElement('canvas'); c.width = 2; c.height = 200;
          const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 200);
          g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.35, c1); g.addColorStop(1, c2);
          x.fillStyle = g; x.fillRect(0, 0, 2, 200); return c;
        };
        s.strips = [strip('rgba(120,255,190,0.5)', 'rgba(60,200,160,0)'), strip('rgba(150,120,255,0.35)', 'rgba(90,200,255,0)'), strip('rgba(90,240,200,0.4)', 'rgba(40,120,140,0)')];
      },
      bg(b, w, h) {
        const R = rng(71);
        sky(b, w, h, [[0, '#0B1B2E'], [0.6, '#163A4A'], [1, '#2B5560']]);
        stars(b, w, h, 200, R, 0.6);
        const m = jag([[0, h * .72], [w * .2, h * .58], [w * .45, h * .7], [w * .7, h * .55], [w, h * .66]], 0.25, R);
        fillShape(b, m, h, '#132733'); snowcap(b, m, w, h, h * 0.62, R, 'rgba(200,220,230,0.35)');
        fillShape(b, jag([[0, h * .86], [w * .5, h * .8], [w, h * .87]], 0.1, R, 5), h, '#CFDDE4');
        for (let i = 0; i < 16; i++) tree(b, R() * w, h * 0.86 + R() * h * 0.05, rnd(50, 110), '#0E1E26');
      },
      frame(ctx, w, h, s, dt, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        s.strips.forEach((img, k) => {
          const base = h * (0.12 + k * 0.08);
          for (let x = 0; x < w; x += 5) {
            const y = base + Math.sin(x * 0.004 + t * 0.25 + k * 2) * 40 + Math.sin(x * 0.011 - t * 0.18 + k) * 18;
            const len = 120 + 60 * Math.sin(x * 0.007 + t * 0.4 + k);
            ctx.globalAlpha = 0.35 + 0.3 * Math.sin(x * 0.01 + t * 0.6 + k * 3);
            ctx.drawImage(img, x, y, 5, len);
          }
        });
        ctx.restore();
      }
    },

    blossom: {
      name: 'Spring blossoms', sound: 'birds', dark: false,
      swatch: 'linear-gradient(180deg,#DDEBF3,#FBE6EC 55%,#89B08A)',
      init(s, w, h) { s.p = Array.from({ length: 70 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: rnd(3, 6), rot: Math.random() * TAU, vr: rnd(-2, 2), vx: rnd(10, 35), vy: rnd(20, 45), ph: Math.random() * TAU })); },
      bg(b, w, h) {
        const R = rng(83);
        sky(b, w, h, [[0, '#D6E8F2'], [1, '#FBE6EC']]);
        fillShape(b, jag([[0, h * .6], [w * .4, h * .52], [w, h * .58]], 0.18, R), h, '#C9DDC4');
        fillShape(b, jag([[0, h * .72], [w * .3, h * .64], [w * .7, h * .7], [w, h * .66]], 0.18, R), h, '#A9C9A4');
        fillShape(b, jag([[0, h * .86], [w * .5, h * .8], [w, h * .85]], 0.12, R, 5), h, '#89B08A');
        const tx = w * 0.8, ty = h * 0.88;
        b.strokeStyle = '#5B4038'; b.lineCap = 'round';
        const branch = (x, y, a, len, wd, d) => {
          if (d > 5) return;
          const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
          b.lineWidth = wd; b.beginPath(); b.moveTo(x, y); b.lineTo(x2, y2); b.stroke();
          branch(x2, y2, a - rnd(0.25, 0.55), len * 0.74, wd * 0.68, d + 1);
          branch(x2, y2, a + rnd(0.25, 0.55), len * 0.74, wd * 0.68, d + 1);
        };
        branch(tx, ty, -Math.PI / 2 - 0.15, h * 0.16, 16, 0);
        const pinks = ['#F4B6C8', '#EFA0B8', '#F7CAD6', '#FADCE4'];
        for (let i = 0; i < 260; i++) {
          const a = R() * TAU, d = Math.sqrt(R()) * h * 0.22;
          b.fillStyle = pinks[i % 4]; b.globalAlpha = 0.85;
          b.beginPath(); b.arc(tx - 10 + Math.cos(a) * d * 1.3, ty - h * 0.42 + Math.sin(a) * d * 0.8, rnd(6, 16), 0, TAU); b.fill();
        }
        b.globalAlpha = 1;
      },
      frame(ctx, w, h, s, dt, t) {
        for (const p of s.p) {
          p.x -= p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
          p.x += Math.sin(t + p.ph) * 12 * dt;
          if (p.y > h + 10 || p.x < -10) { p.y = rnd(-20, h * 0.4); p.x = rnd(w * 0.6, w + 20); }
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = 'rgba(240,160,184,0.85)'; ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, TAU); ctx.fill();
          ctx.restore();
        }
      }
    },

    ocean: {
      name: 'Bay of Bengal', sound: 'ocean', dark: false,
      swatch: 'linear-gradient(180deg,#AFD6EA,#EAF4F7 50%,#7FC0D2 52%,#2E7E98)',
      init(s, w, h) { s.hz = h * 0.52; },
      bg(b, w, h, s) {
        const R = rng(97), hz = s.hz;
        sky(b, w, hz, [[0, '#A8D2E8'], [1, '#EAF4F7']]);
        glow(b, w * 0.3, hz - 60, h * 0.3, 'rgba(255,245,220,0.7)', 'rgba(255,245,220,0)');
        cloud(b, w * 0.2, hz * 0.35, 1.2, 0.5); cloud(b, w * 0.75, hz * 0.25, 1.5, 0.45);
        fillShape(b, jag([[w * .62, hz], [w * .72, hz - 22], [w * .85, hz - 10], [w * .92, hz]], 0.3, R, 4), hz + 1, '#8AA9B5');
        b.fillStyle = vgrad(b, hz, h, [[0, '#86C4D4'], [0.6, '#3E8EA6'], [1, '#2E7E98']]); b.fillRect(0, hz, w, h - hz);
        b.fillStyle = '#EADBC0'; b.beginPath(); b.moveTo(0, h); b.lineTo(0, h * 0.9);
        b.quadraticCurveTo(w * 0.5, h * 0.84, w, h * 0.93); b.lineTo(w, h); b.fill();
      },
      frame(ctx, w, h, s, dt, t) {
        ctx.lineWidth = 1.3;
        for (let i = 0; i < 16; i++) {
          const y = s.hz + 10 + Math.pow(i / 16, 1.4) * (h * 0.9 - s.hz);
          ctx.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.012})`;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 14) { const yy = y + Math.sin(x * (0.02 - i * 0.0007) + t * (0.8 + i * 0.05) + i) * (1 + i * 0.25); x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
          ctx.stroke();
        }
        const shore = h * 0.885 + Math.sin(t * 0.5) * h * 0.012;
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 16) ctx.lineTo(x, shore + Math.sin(x * 0.012 + t * 0.9) * 5 + (x / w) * h * 0.025);
        ctx.lineTo(w, h); ctx.fill();
      }
    },

    custom: {
      name: 'Your own photo', sound: null, dark: false,
      swatch: 'repeating-linear-gradient(45deg,#E4EEF1 0 8px,#F6FAFB 8px 16px)',
      init(s, w, h, eng) {
        if (!eng.custom) return;
        if (!s.img || s.src !== eng.custom) {
          s.src = eng.custom; s.img = new Image();
          s.img.onload = () => eng.redrawBg(); s.img.src = eng.custom;
        }
      },
      bg(b, w, h, s) {
        if (s.img && s.img.complete && s.img.naturalWidth) {
          const k = Math.max(w / s.img.naturalWidth, h / s.img.naturalHeight);
          const iw = s.img.naturalWidth * k, ih = s.img.naturalHeight * k;
          b.drawImage(s.img, (w - iw) / 2, (h - ih) / 2, iw, ih);
        } else SCENES.himalaya.bg(b, w, h);
      }
    }
  };

  class Scene {
    constructor(canvas) {
      this.c = canvas; this.ctx = canvas.getContext('2d');
      this.running = false; this.state = {};
      this.loop = this.loop.bind(this); this.resize = this.resize.bind(this);
      this.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    start(name, custom) {
      this.name = SCENES[name] ? name : 'himalaya';
      this.def = SCENES[this.name]; this.custom = custom || '';
      this.state = {};
      window.addEventListener('resize', this.resize);
      this.resize();
      if (!this.running) { this.running = true; this.last = performance.now(); requestAnimationFrame(this.loop); }
    }
    stop() { this.running = false; window.removeEventListener('resize', this.resize); }
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = this.c.clientWidth || innerWidth, h = this.c.clientHeight || innerHeight;
      this.w = w; this.h = h; this.dpr = dpr;
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const keepImg = this.state.img, keepSrc = this.state.src;
      this.state = { img: keepImg, src: keepSrc };
      this.def.init && this.def.init(this.state, w, h, this);
      this.redrawBg();
    }
    redrawBg() {
      const { w, h, dpr } = this;
      this.bg = document.createElement('canvas');
      this.bg.width = Math.round(w * dpr); this.bg.height = Math.round(h * dpr);
      const b = this.bg.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.def.bg(b, w, h, this.state);
      this.draw(0, performance.now() / 1000);
    }
    draw(dt, t) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.drawImage(this.bg, 0, 0, this.w, this.h);
      this.def.frame && this.def.frame(ctx, this.w, this.h, this.state, dt, t);
    }
    loop(now) {
      if (!this.running) return;
      const dt = this.reduced ? 0 : Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      if (!this.reduced || !this._drawn) { this.draw(dt, now / 1000); this._drawn = true; }
      requestAnimationFrame(this.loop);
    }
  }

  SN.Scene = Scene;
  SN.SCENES = SCENES;
})();

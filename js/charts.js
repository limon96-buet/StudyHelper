/* Shikhor charts: hand-drawn SVG, no libraries. */
(function () {
  'use strict';
  const SN = window.SN;
  const U = SN.util;
  const rid = () => 'c' + Math.random().toString(36).slice(2, 8);

  function ring(pct, o = {}) {
    const size = o.size || 132, stroke = o.stroke || 11;
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct || 0));
    return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${U.esc(o.aria || '')}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--mist)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${o.color || 'var(--pine)'}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - p)).toFixed(2)}"
        transform="rotate(-90 ${size / 2} ${size / 2})" class="ring-arc"/>
      <text x="50%" y="47%" text-anchor="middle" class="ring-main">${U.esc(o.label || '')}</text>
      <text x="50%" y="63%" text-anchor="middle" class="ring-sub">${U.esc(o.sub || '')}</text>
    </svg>`;
  }

  function niceStep(max) {
    const steps = [15, 30, 60, 120, 180, 240, 360, 480, 720];
    return steps.find((s) => max / s <= 4.5) || 1440;
  }
  const axisLabel = (v) => (v < 60 ? v + 'm' : +(v / 60).toFixed(1) + 'h');

  /* data: [{label, sub, segs:[{v,color,name}]}] (values in minutes) */
  function bars(data, o = {}) {
    const H = o.height || 220, padL = 40, padB = 38, padT = 18;
    const bw = o.barWidth || 26, gap = o.gap || 18;
    const W = padL + data.length * (bw + gap) + 6;
    const totals = data.map((d) => d.segs.reduce((s, x) => s + x.v, 0));
    let max = Math.max(o.goal || 0, ...totals, 30);
    const step = niceStep(max); max = Math.ceil(max / step) * step;
    const y = (v) => padT + (H - padT - padB) * (1 - v / max);
    const id = rid();
    let grid = '', body = '', defs = '';
    for (let v = 0; v <= max; v += step) {
      grid += `<line x1="${padL}" x2="${W}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid"/>
        <text x="${padL - 8}" y="${(y(v) + 4).toFixed(1)}" class="axis" text-anchor="end">${axisLabel(v)}</text>`;
    }
    data.forEach((d, i) => {
      const x = padL + gap / 2 + i * (bw + gap), tot = totals[i];
      if (tot > 0) {
        defs += `<clipPath id="${id}${i}"><rect x="${x}" y="${y(tot)}" width="${bw}" height="${y(0) - y(tot)}" rx="7"/></clipPath>`;
        let acc = 0, segs = '';
        d.segs.forEach((s) => {
          const y1 = y(acc + s.v), y0 = y(acc);
          segs += `<rect x="${x}" y="${y1.toFixed(1)}" width="${bw}" height="${Math.max(0, y0 - y1).toFixed(1)}" fill="${s.color}"><title>${U.esc(s.name)}: ${U.fmtMin(s.v)}</title></rect>`;
          acc += s.v;
        });
        body += `<g clip-path="url(#${id}${i})" class="bar">${segs}</g>
          <text x="${x + bw / 2}" y="${y(tot) - 6}" text-anchor="middle" class="val">${U.fmtMin(tot)}</text>`;
      } else {
        body += `<rect x="${x}" y="${y(0) - 3}" width="${bw}" height="3" rx="1.5" class="bar-empty"/>`;
      }
      body += `<text x="${x + bw / 2}" y="${H - padB + 17}" text-anchor="middle" class="axis ${d.today ? 'today' : ''}">${U.esc(d.label)}</text>`;
      if (d.sub != null) body += `<text x="${x + bw / 2}" y="${H - padB + 31}" text-anchor="middle" class="axis faint">${U.esc(d.sub)}</text>`;
    });
    let goal = '';
    if (o.goal) {
      goal = `<line x1="${padL}" x2="${W}" y1="${y(o.goal)}" y2="${y(o.goal)}" class="goal-line"/>
        <text x="${W - 2}" y="${y(o.goal) - 6}" text-anchor="end" class="goal-text">Daily goal</text>`;
    }
    return `<svg class="bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="${U.esc(o.aria || 'Study time per day')}"><defs>${defs}</defs>${grid}${goal}${body}</svg>`;
  }

  /* GitHub-style calendar of study minutes */
  function calendar(map, weeks = 26) {
    const cell = 13, step = 16, left = 30, top = 22;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - start.getDay() - (weeks - 1) * 7);
    let cells = '', months = '', lastMonth = -1;
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
        if (dt > today) continue;
        const v = map[U.dayKey(dt)] || 0;
        const lvl = v <= 0 ? 0 : v < 30 ? 1 : v < 60 ? 2 : v < 120 ? 3 : v < 240 ? 4 : 5;
        cells += `<rect x="${left + w * step}" y="${top + d * step}" width="${cell}" height="${cell}" rx="3.5" class="h${lvl}"><title>${dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}: ${v ? U.fmtMin(v) : 'no study'}</title></rect>`;
        if (d === 0 && dt.getMonth() !== lastMonth && w < weeks - 2) {
          lastMonth = dt.getMonth();
          months += `<text x="${left + w * step}" y="13" class="axis">${dt.toLocaleDateString(undefined, { month: 'short' })}</text>`;
        }
      }
    }
    const days = [[1, 'Mon'], [3, 'Wed'], [5, 'Fri']].map(([d, l]) => `<text x="0" y="${top + d * step + 10}" class="axis">${l}</text>`).join('');
    const W = left + weeks * step, H = top + 7 * step;
    return `<svg class="heat" viewBox="0 0 ${W} ${H}" role="img" aria-label="Study calendar for the last ${weeks} weeks">${months}${days}${cells}</svg>`;
  }

  /* weekday x hour heatmap */
  function hourGrid(matrix) {
    const cw = 24, ch = 20, gap = 3, left = 36, top = 20;
    const max = Math.max(1, ...matrix.flat());
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hl = (h) => (h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p');
    let out = '';
    for (let h = 0; h < 24; h += 3) out += `<text x="${left + h * (cw + gap)}" y="12" class="axis">${hl(h)}</text>`;
    matrix.forEach((row, d) => {
      out += `<text x="0" y="${top + d * (ch + gap) + 14}" class="axis">${names[d]}</text>`;
      row.forEach((v, h) => {
        const lvl = v <= 0.5 ? 0 : Math.min(5, 1 + Math.floor((v / max) * 4.99));
        out += `<rect x="${left + h * (cw + gap)}" y="${top + d * (ch + gap)}" width="${cw}" height="${ch}" rx="4" class="h${lvl}"><title>${names[d]} ${hl(h)}: ${U.fmtMin(v)} in total</title></rect>`;
      });
    });
    const W = left + 24 * (cw + gap), H = top + 7 * (ch + gap);
    return `<svg class="heat" viewBox="0 0 ${W} ${H}" role="img" aria-label="When you usually study">${out}</svg>`;
  }

  /* The syllabus climb: courses as climbers on a mountain route */
  function climb(items) {
    const route = [[70, 318], [260, 296], [200, 270], [400, 244], [340, 216], [540, 190], [490, 164], [640, 140], [600, 124], [700, 90], [720, 56]];
    const lens = []; let total = 0;
    for (let i = 1; i < route.length; i++) { const d = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); lens.push(d); total += d; }
    const at = (p) => {
      let dist = Math.max(0, Math.min(1, p)) * total;
      for (let i = 0; i < lens.length; i++) {
        if (dist <= lens[i] || i === lens.length - 1) {
          const t = Math.min(1, dist / lens[i]);
          return [route[i][0] + (route[i + 1][0] - route[i][0]) * t, route[i][1] + (route[i + 1][1] - route[i][1]) * t];
        }
        dist -= lens[i];
      }
      return route[route.length - 1];
    };
    const sorted = items.slice().sort((a, b) => a.pct - b.pct);
    let markers = '', prev = -1, flip = 0;
    sorted.forEach((c) => {
      const [x, y] = at(c.pct);
      if (prev >= 0 && c.pct - prev < 0.08) flip++; else flip = 0;
      prev = c.pct;
      const label = `${c.code} ${Math.round(c.pct * 100)}%`;
      const tw = label.length * 7.4 + 18;
      const dy = flip % 2 ? 22 : -24 - (flip > 1 ? 18 : 0);
      const lx = Math.min(1000 - tw - 6, Math.max(6, x - tw / 2));
      markers += `<g class="climber" data-act="open-course" data-id="${c.id}" tabindex="0" role="link" aria-label="${U.esc(c.code)}: ${Math.round(c.pct * 100)} percent of syllabus done">
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y + dy + (dy < 0 ? 10 : -12)}" stroke="${c.color}" stroke-width="1.5" opacity=".6"/>
        <circle cx="${x}" cy="${y}" r="10" fill="${c.color}" stroke="#fff" stroke-width="3"/>
        <rect x="${lx}" y="${y + dy - 13}" width="${tw}" height="24" rx="12" fill="#fff" stroke="${c.color}" stroke-width="1.2"/>
        <text x="${lx + tw / 2}" y="${y + dy + 3.5}" text-anchor="middle" class="climb-label">${U.esc(label)}</text>
      </g>`;
    });
    const routeD = 'M' + route.map((p) => p.join(',')).join(' L');
    return `<svg class="climb" viewBox="0 0 1000 340" role="img" aria-label="Syllabus progress drawn as a mountain climb">
      <defs>
        <linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DBBCB"/><stop offset="1" stop-color="#6F94A6"/></linearGradient>
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3E3EB"/><stop offset="1" stop-color="#E8F0F2"/></linearGradient>
      </defs>
      <path d="M0,250 L80,212 L150,232 L240,172 L320,204 L420,150 L500,188 L590,142 L880,108 L940,140 L1000,122 L1000,340 L0,340Z" fill="url(#far)"/>
      <path d="M0,340 L0,300 L90,280 L160,262 L230,240 L300,222 L360,196 L420,182 L470,160 L520,150 L560,128 L610,112 L650,88 L690,70 L720,46 L748,68 L770,62 L800,96 L840,110 L880,140 L930,150 L1000,176 L1000,340Z" fill="url(#mtn)"/>
      <path d="M720,46 L748,68 L770,62 L800,96 L840,110 L880,140 L930,150 L1000,176 L1000,340 L770,340Z" fill="#33566A" opacity=".2"/>
      <path d="M650,88 L690,70 L720,46 L748,68 L770,62 L800,96 L786,104 L766,95 L746,112 L728,98 L708,116 L690,101 L668,110Z" fill="#fff"/>
      <path d="${routeD}" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="2 7" stroke-linecap="round" opacity=".9"/>
      <line x1="720" y1="46" x2="720" y2="12" stroke="#2C4652" stroke-width="2"/>
      <path d="M720,12 L746,19 L720,27Z" fill="var(--rhodo)"/>
      <text x="754" y="24" class="climb-summit">Syllabus done</text>
      <path d="M0,340 L0,326 C180,312 380,336 560,322 C720,310 860,334 1000,318 L1000,340Z" fill="#B9D3C2"/>
      <text x="62" y="338" class="climb-base">Start</text>
      ${markers}
    </svg>`;
  }

  SN.charts = { ring, bars, calendar, hourGrid, climb };
})();

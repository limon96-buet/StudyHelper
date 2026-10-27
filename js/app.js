/* Shikhor app: pages, actions, focus room and exam room. */
(function () {
  'use strict';
  const SN = window.SN;
  const S = SN.store, U = SN.util, C = SN.calc, CH = SN.charts;
  const esc = U.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const st = () => S.state;
  const save = () => S.save();
  const now = () => Date.now();
  const nl2br = (s) => s.replace(/\n/g, '<br>');

  const ui = {
    page: '', arg: '', courseTab: 'syllabus', unlocked: false,
    focusOpen: false, focusPanel: null, focusCourse: '', readerId: null, readerUrl: null, camOn: false,
    examId: null, attemptId: null, examDraft: null, importArg: null, importData: null, importError: null,
    pageScene: null, gh: null, viewerUrl: null, shareCourses: null, shareOpts: { marks: true, progress: true, materials: true }
  };
  let focusScene = null, examScene = null;

  /* ---------- icons ---------- */
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    book: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
    exam: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    chart: '<path d="M3 21h18M6 17v-5M11 17V6M16 17v-8M21 17v-3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    camera: '<rect x="3" y="7" width="13" height="11" rx="2"/><path d="M16 11l5-3v9l-5-3"/>',
    music: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 3c.5 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2.6 1.4-4 2.4-5.8.6 1.3 1.2 2 2.1 2.3C12 7.5 12 5 12 3z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.3 3.8M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    mountain: '<path d="M2 20l7-12 4 6 3-4 6 10z"/>',
    skip: '<path d="M6 5l9 7-9 7zM18 5v14"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    open: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
  };
  const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- helpers ---------- */
  const scale = () => st().settings.scale.slice().sort((a, b) => b.min - a.min);
  const course = (id) => st().courses.find((c) => c.id === id);
  const exam = (id) => st().exams.find((e) => e.id === id);
  function sylStats(c) {
    const items = c.syllabus.filter((t) => !t.section);
    const done = items.filter((t) => t.done).length;
    return { done, total: items.length, pct: items.length ? done / items.length : 0 };
  }
  const courseMin = (id, since = 0) => st().sessions.filter((s) => s.courseId === id && s.start >= since).reduce((a, s) => a + s.min, 0);
  function weekStart() { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); }
  const liveSegMin = () => { const r = st().running; return r && r.segStart ? (now() - r.segStart) / 60000 : 0; };
  const runElapsedMs = () => { const r = st().running; return r ? r.doneMs + (r.segStart ? now() - r.segStart : 0) : 0; };
  const todayMin = () => (C.minutesByDay(st().sessions)[U.dayKey(now())] || 0) + liveSegMin();
  const totalMin = () => st().sessions.reduce((a, s) => a + s.min, 0);
  const firstName = () => (st().profile.name || '').trim().split(/\s+/)[0] || 'there';
  function greeting() { const h = new Date().getHours(); return h < 5 ? 'Hello' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  const fmtDT = (ts) => new Date(ts).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const fmtDate = (ts) => new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  function countdown(ts) {
    let d = Math.max(0, ts - now()) / 1000;
    const days = Math.floor(d / 86400); d -= days * 86400;
    const h = Math.floor(d / 3600); d -= h * 3600;
    const m = Math.floor(d / 60), s = Math.floor(d - m * 60);
    if (days) return `in ${days}d ${h}h`;
    if (h) return `in ${h}h ${m}m`;
    return `in ${m}m ${U.pad(s)}s`;
  }
  const toLocalInput = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${U.pad(d.getMonth() + 1)}-${U.pad(d.getDate())}T${U.pad(d.getHours())}:${U.pad(d.getMinutes())}`; };
  const chip = (c) => (c ? `<span class="chip" style="--c:${c.color}">${esc(c.code)}</span>` : `<span class="chip" style="--c:#8FA3AC">General</span>`);
  const mimeOf = (name) => {
    const ext = (name.split('.').pop() || '').toLowerCase();
    return ({ pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', txt: 'text/plain', md: 'text/plain', html: 'text/html', mp4: 'video/mp4', mp3: 'audio/mpeg' })[ext] || '';
  };

  /* ---------- toast, modal, confirm ---------- */
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 3400); setTimeout(() => t.remove(), 3900);
  }
  SN.toast = toast;
  let confirmResolve = null;
  function openModal(html, cls = '') {
    const card = $('#modalCard');
    card.className = 'modal-card ' + cls; card.innerHTML = html;
    $('#modal').hidden = false;
    const f = card.querySelector('[autofocus]') || card.querySelector('input:not([type=checkbox]):not([type=radio]),textarea');
    if (f) setTimeout(() => f.focus(), 40);
  }
  function closeModal() {
    $('#modal').hidden = true; $('#modalCard').innerHTML = '';
    if (ui.viewerUrl) { URL.revokeObjectURL(ui.viewerUrl); ui.viewerUrl = null; }
    if (confirmResolve) { confirmResolve(false); confirmResolve = null; }
    ui.gh = null;
  }
  function confirmBox(title, body, ok = 'Delete', danger = true) {
    return new Promise((res) => {
      openModal(`<h2>${esc(title)}</h2><p class="muted">${esc(body)}</p>
        <div class="modal-actions"><button class="btn" data-act="confirm-no">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="confirm-yes" autofocus>${esc(ok)}</button></div>`);
      confirmResolve = res;
    });
  }
  function pickFiles(accept = '', multiple = true) {
    return new Promise((res) => {
      const inp = $('#filePicker');
      inp.value = ''; inp.accept = accept; inp.multiple = multiple;
      inp.onchange = () => res(Array.from(inp.files || []));
      inp.click();
    });
  }
  function download(name, text, type = 'application/json') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function confetti(x, y, big = false) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.createElement('canvas'); cv.className = 'confetti';
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const ctx = cv.getContext('2d'); const cols = U.COLORS.concat(['#F6C85F', '#9CC27A']);
    const ps = Array.from({ length: big ? 140 : 36 }, () => ({ x, y, vx: (Math.random() - 0.5) * (big ? 900 : 420), vy: -Math.random() * (big ? 700 : 380) - 80, r: Math.random() * 5 + 3, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6 }));
    let last = performance.now(), life = 0;
    const step = (t) => {
      const dt = Math.min(0.04, (t - last) / 1000); last = t; life += dt;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => { p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += dt * 8; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = Math.max(0, 1 - life / 1.6); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore(); });
      if (life < 1.6) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  }
  async function readImage(file, max = 256, square = true) {
    const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (square) { const m = Math.min(sw, sh); sx = (sw - m) / 2; sy = (sh - m) / 2; sw = sh = m; }
    const k = Math.min(1, max / Math.max(sw, sh));
    const c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.86);
  }

  /* ---------- camera ---------- */
  const Cam = {
    stream: null, pending: null,
    start() {
      if (this.stream) return Promise.resolve(this.stream);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('unsupported'));
      if (!this.pending) {
        this.pending = navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false })
          .then((s) => { this.stream = s; this.pending = null; return s; })
          .catch((e) => { this.pending = null; throw e; });
      }
      return this.pending;
    },
    stop() { if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; } },
    async attach(box) {
      if (!box) return;
      const v = box.querySelector('video'), msg = box.querySelector('.cam-msg');
      try {
        const s = await this.start();
        if (v) { v.srcObject = s; v.play().catch(() => {}); }
        box.classList.add('live'); if (msg) msg.textContent = '';
      } catch (e) {
        box.classList.add('blocked');
        if (msg) msg.textContent = e && e.name === 'NotAllowedError' ? 'Camera blocked. Allow it from the address bar.' : 'No camera found';
      }
    }
  };

  /* ---------- focus monitor (face detection) ---------- */
  const FocusMonitor = {
    active: false, detector: null, canvas: null, ctx: null,
    absentSince: null, alertShown: false, interval: null,
    ABSENT_SECS: 20,   // seconds without a face before alerting
    CHECK_MS: 3000,    // how often to check (ms)

    async init() {
      /* FaceDetector is a Chrome/Edge API; gracefully skip if missing */
      if (!window.FaceDetector) return false;
      try { this.detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 }); return true; }
      catch (e) { return false; }
    },

    start() {
      if (this.active) return;
      this.init().then((ok) => {
        if (!ok) return; /* silently skip on Firefox / Safari */
        this.active = true;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.absentSince = null; this.alertShown = false;
        this.interval = setInterval(() => this._check(), this.CHECK_MS);
      });
    },

    stop() {
      this.active = false;
      clearInterval(this.interval); this.interval = null;
      this._hideAlert();
    },

    async _check() {
      if (!this.active || !Cam.stream) return;
      const v = $('#focusCam video') || $('#examCam video');
      if (!v || v.readyState < 2 || v.paused) return;
      try {
        this.canvas.width = v.videoWidth || 320;
        this.canvas.height = v.videoHeight || 240;
        this.ctx.drawImage(v, 0, 0);
        const faces = await this.detector.detect(this.canvas);
        if (faces.length > 0) {
          /* face seen — reset */
          this.absentSince = null; this.alertShown = false;
          this._hideAlert();
        } else {
          /* no face */
          if (!this.absentSince) this.absentSince = now();
          const secs = (now() - this.absentSince) / 1000;
          if (secs >= this.ABSENT_SECS && !this.alertShown) {
            this.alertShown = true;
            this._showAlert(Math.round(secs));
            SN.Sound.chime && SN.Sound.chime(1);
            notify('Are you still there?', 'No face detected for ' + Math.round(secs) + ' seconds. Come back and keep studying!');
          }
        }
      } catch (e) { /* frame not ready — skip */ }
    },

    _showAlert(secs) {
      let box = $('#focusAlert');
      if (!box) {
        box = document.createElement('div');
        box.id = 'focusAlert';
        box.innerHTML = `<span class="fa-ic">👀</span><div><b>Are you still there?</b><p>No face seen for <span id="faTime"></span>. Timer is still running.</p></div><button data-act="fa-dismiss">I'm back</button>`;
        const ui = $('#focusUI') || $('#examUI');
        if (ui) ui.appendChild(box);
        const btn = box.querySelector('[data-act=fa-dismiss]');
        if (btn) btn.addEventListener('click', () => { this.absentSince = null; this.alertShown = false; this._hideAlert(); });
      }
      const t = box.querySelector('#faTime');
      if (t) t.textContent = secs + 's';
      box.classList.add('visible');
    },

    _hideAlert() {
      const box = $('#focusAlert');
      if (box) box.classList.remove('visible');
    },

    setSensitivity(secs) { this.ABSENT_SECS = Math.max(5, secs); }
  };

  /* ---------- share link encoding ---------- */
  function b64url(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  async function pack(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) {
      try { const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer(); return 'z' + b64url(new Uint8Array(buf)); } catch (e) { /* fall back */ }
    }
    return 'j' + b64url(bytes);
  }
  async function unpack(str) {
    let bytes = unb64url(str.slice(1));
    if (str[0] === 'z') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  /* ---------- GitHub materials ---------- */
  function autoDetectGithub() {
    const g = st().github, host = location.hostname.toLowerCase();
    if (!g.owner && host.endsWith('.github.io')) {
      g.owner = host.split('.')[0];
      g.repo = location.pathname.split('/')[1] || host;
      save();
    }
  }
  function ghSameSite() { const g = st().github; return !!g.owner && location.hostname.toLowerCase() === g.owner.toLowerCase() + '.github.io'; }
  function ghSiteUrl(path) {
    const g = st().github;
    const userSite = g.repo.toLowerCase() === (g.owner + '.github.io').toLowerCase();
    return location.origin + '/' + (userSite ? '' : g.repo + '/') + path.split('/').map(encodeURIComponent).join('/');
  }
  async function ghList(path) {
    const g = st().github;
    if (!g.owner || !g.repo) throw new Error('Add your GitHub username and repository in Settings first.');
    const url = `https://api.github.com/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}/contents/${path.split('/').filter(Boolean).map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(g.branch || 'main')}`;
    const r = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) {
      if (r.status === 404) throw new Error(`The folder “${path || '/'}” was not found. Check the username, repository, branch and folder in Settings.`);
      if (r.status === 403) throw new Error('GitHub’s hourly limit for this network was reached. Try again in an hour.');
      throw new Error('GitHub returned an error (' + r.status + ').');
    }
    const j = await r.json();
    return (Array.isArray(j) ? j : [j]).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
  }
  function ghMaterial(item) {
    const same = ghSameSite();
    return { id: U.uid(), kind: 'github', name: item.name, size: item.size, path: item.path, url: same ? ghSiteUrl(item.path) : item.html_url, htmlUrl: item.html_url, embed: same, mime: mimeOf(item.name), addedAt: now() };
  }

  /* ---------- privacy ---------- */
  const isLocked = () => !!st().settings.pin && !ui.unlocked;
  function lockedBox() {
    return `<div class="locked">${icon('lock')}<p>These charts are private. Enter your PIN to see them.</p>
      <div class="pin-row"><input type="password" inputmode="numeric" maxlength="8" placeholder="PIN" data-enter="unlock" aria-label="PIN">
      <button class="btn btn-primary sm" data-act="unlock">Unlock</button></div></div>`;
  }
  const privateBlock = (html) => (isLocked() ? lockedBox() : `<div class="sensitive ${st().settings.blurStats ? 'is-blurred' : ''}">${html}</div>`);

  /* ---------- study data ---------- */
  function lastDays(n, courseId) {
    const by = {};
    const list = st().sessions.slice();
    const r = st().running;
    if (r && r.segStart) list.push({ courseId: r.courseId, start: r.segStart, min: liveSegMin() });
    for (const s of list) {
      if (courseId && s.courseId !== courseId) continue;
      const k = U.dayKey(s.start); by[k] = by[k] || {};
      const key = s.courseId || '_';
      by[k][key] = (by[k][key] || 0) + s.min;
    }
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
      const row = by[U.dayKey(d)] || {};
      const segs = Object.entries(row).map(([cid, v]) => { const c = course(cid); return { v, color: c ? c.color : '#A9B8BF', name: c ? c.code : 'General' }; });
      days.push({ label: i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' }), sub: n > 7 ? d.getDate() : null, segs, today: i === 0 });
    }
    return days;
  }
  function addSession(courseId, start, end, kind = 'study') {
    if (end - start < 30000) return;
    st().sessions.push({ id: U.uid(), courseId: courseId || '', start, end, min: (end - start) / 60000, kind });
  }

  /* ---------- badges ---------- */
  const BADGES = [
    { id: 'first', name: 'First steps', desc: 'Finish your first study session', ic: 'sparkle' },
    { id: 'deep', name: 'Deep dive', desc: 'Study 90 minutes without pausing', ic: 'open' },
    { id: 'streak3', name: 'Three in a row', desc: 'Study three days in a row', ic: 'flame' },
    { id: 'streak7', name: 'Week of focus', desc: 'Study seven days in a row', ic: 'flame' },
    { id: 'h10', name: 'Ten hours', desc: 'Log 10 hours in total', ic: 'clock' },
    { id: 'h50', name: 'Fifty hours', desc: 'Log 50 hours in total', ic: 'clock' },
    { id: 'summit', name: 'Summit', desc: 'Finish a whole syllabus', ic: 'mountain' },
    { id: 'exam', name: 'Exam ready', desc: 'Complete a mock exam', ic: 'exam' },
    { id: 'early', name: 'Early bird', desc: 'Start studying between 4 and 7 am', ic: 'sun' },
    { id: 'owl', name: 'Night owl', desc: 'Study after 11 pm', ic: 'moon' }
  ];
  function earnedBadges() {
    const s = st(), tot = totalMin(), str = C.streak(s.sessions);
    const hrs = s.sessions.map((x) => new Date(x.start).getHours());
    const got = {
      first: s.sessions.length > 0, deep: s.sessions.some((x) => x.min >= 90),
      streak3: str >= 3, streak7: str >= 7, h10: tot >= 600, h50: tot >= 3000,
      summit: s.courses.some((c) => { const k = sylStats(c); return k.total > 0 && k.done === k.total; }),
      exam: s.exams.some((e) => e.attempts.some((a) => a.status === 'done')),
      early: hrs.some((h) => h >= 4 && h < 7), owl: hrs.some((h) => h >= 23)
    };
    return BADGES.filter((b) => got[b.id]).map((b) => b.id);
  }
  function checkBadges() {
    const earned = earnedBadges(), seen = st().badgesSeen;
    const fresh = earned.filter((id) => !seen.includes(id));
    if (fresh.length) { toast((fresh.length > 1 ? 'New badges: ' : 'New badge: ') + fresh.map((id) => BADGES.find((x) => x.id === id).name).join(', ')); seen.push(...fresh); }
    save();
  }

  /* ---------- chrome (sidebar, mobile bars) ---------- */
  const NAV = [['dashboard', 'Home', 'home'], ['courses', 'Courses', 'book'], ['exams', 'Exams', 'exam'], ['analytics', 'Progress', 'chart'], ['profile', 'Profile', 'user'], ['settings', 'Settings', 'sliders']];
  const brand = `<a class="brand" href="#/dashboard" aria-label="Shikhor home"><svg viewBox="0 0 40 28" aria-hidden="true"><path d="M2 26L15 6l6 9 4-5 13 16z" fill="var(--pine)"/><path d="M12 10.6L15 6l3 4.5-1.6 1.4-1.4-1.6-1.6 1.6z" fill="#fff"/></svg><span>Shikhor</span></a>`;
  function buildChrome() {
    $('#sidebar').innerHTML = `${brand}
      <nav class="nav" aria-label="Main">${NAV.map(([p, l, i]) => `<a href="#/${p}" data-nav="${p}">${icon(i)}<span>${l}</span></a>`).join('')}</nav>
      <button class="btn btn-primary focus-launch" data-act="focus-open">${icon('play')} Study now</button>
      <div class="side-foot"><button class="run-pill" id="runPill" data-act="focus-open" hidden></button><a class="me-chip" id="meChip" href="#/profile"></a></div>`;
    $('#topbar').innerHTML = `${brand}<div class="top-right"><button class="run-pill" id="runPill2" data-act="focus-open" hidden></button><a href="#/settings" class="icon-btn" aria-label="Settings">${icon('sliders')}</a><a class="me-chip mini" id="meChip2" href="#/profile"></a></div>`;
    $('#tabbar').innerHTML = [['dashboard', 'Home', 'home'], ['courses', 'Courses', 'book']].map(([p, l, i]) => `<a href="#/${p}" data-nav="${p}">${icon(i)}<span>${l}</span></a>`).join('') +
      `<button class="tab-focus" data-act="focus-open" aria-label="Study now">${icon('play')}</button>` +
      [['exams', 'Exams', 'exam'], ['analytics', 'Progress', 'chart']].map(([p, l, i]) => `<a href="#/${p}" data-nav="${p}">${icon(i)}<span>${l}</span></a>`).join('');
  }
  function avatarHtml(p, size = 36) {
    if (p.avatar) return `<img class="avatar" src="${p.avatar}" alt="" width="${size}" height="${size}">`;
    const ini = (p.name || '?').trim().split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase() || '?';
    return `<span class="avatar ph" style="width:${size}px;height:${size}px">${esc(ini)}</span>`;
  }
  function updateChrome() {
    $$('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === ui.page || (ui.page === 'course' && a.dataset.nav === 'courses') || (ui.page === 'exam' && a.dataset.nav === 'exams')));
    const p = st().profile;
    $('#meChip').innerHTML = `${avatarHtml(p, 36)}<span><b>${esc(p.name || 'Your profile')}</b><small>${esc([p.department, p.level].filter(Boolean).join(', ') || 'Add your details')}</small></span>`;
    $('#meChip2').innerHTML = avatarHtml(p, 32);
    updateRunPill();
  }
  function updateRunPill() {
    const r = st().running;
    ['#runPill', '#runPill2'].forEach((sel) => {
      const el = $(sel); if (!el) return;
      el.hidden = !r || ui.focusOpen;
      if (r) { const c = course(r.courseId); el.innerHTML = `<i class="${r.segStart ? 'pulse' : ''}"></i>${U.fmtClock(runElapsedMs() / 1000)} ${esc(c ? c.code : '')}`; }
    });
  }

  /* ================= PAGES ================= */
  const pages = {}, after = {};

  pages.dashboard = () => {
    const s = st(), p = s.profile;
    if (!p.name) return onboarding();
    const tm = todayMin(), goal = +p.dailyGoal || 120, streak = C.streak(s.sessions);
    const week = s.sessions.filter((x) => x.start >= weekStart()).reduce((a, x) => a + x.min, 0) + liveSegMin();
    const live = s.exams.filter((e) => e.startAt + e.duration * 60000 > now()).sort((a, b) => a.startAt - b.startAt).slice(0, 3);
    const items = s.courses.map((c) => ({ id: c.id, code: c.code, color: c.color, pct: sylStats(c).pct }));
    const allTopics = s.courses.reduce((a, c) => { const k = sylStats(c); a.d += k.done; a.t += k.total; return a; }, { d: 0, t: 0 });
    const earned = earnedBadges();
    return `
    <section class="greet">
      <div><h1>${greeting()}, ${esc(firstName())}</h1>
      <p class="muted">${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}. ${tm >= goal ? 'You reached today’s goal. Anything more is a bonus.' : tm > 0 ? `${U.fmtMin(goal - tm)} left to reach today’s goal.` : 'Pick a course and start a calm session.'}</p></div>
      <button class="btn btn-primary btn-lg" data-act="focus-open">${icon('play')} Study now</button>
    </section>

    <section class="climb-panel">
      <div class="climb-head"><h2>Syllabus climb</h2>
      <p>${allTopics.t ? `${allTopics.d} of ${allTopics.t} topics finished across ${s.courses.length} course${s.courses.length > 1 ? 's' : ''}. Each finished topic moves a course up the route.` : 'Add your courses and their syllabus topics. Every topic you finish moves that course up the mountain.'}</p></div>
      ${s.courses.length ? `<div class="climb-scroll">${CH.climb(items)}</div>` : `<div class="climb-empty">${CH.climb([])}<button class="btn btn-primary" data-act="course-new">${icon('plus')} Add your first course</button></div>`}
    </section>

    <section class="dash-grid">
      <div class="panel today-panel">
        <h3>Today</h3>
        ${privateBlock(`<div class="today-ring">${CH.ring(tm / goal, { label: U.fmtMin(tm), sub: 'of ' + U.fmtMin(goal), color: tm >= goal ? 'var(--lichen-deep)' : 'var(--pine)', aria: 'Today ' + U.fmtMin(tm) })}
          <ul class="mini-stats"><li>${icon('flame')}<b>${streak}</b> day streak</li><li>${icon('clock')}<b>${U.fmtMin(week)}</b> this week</li></ul></div>`)}
      </div>
      <div class="panel week-panel">
        <div class="row-head"><h3>Last 7 days</h3><a href="#/analytics" class="link">All progress</a></div>
        ${privateBlock(CH.bars(lastDays(7), { height: 190, goal, barWidth: 24, gap: 16 }))}
      </div>
      <div class="panel exams-panel">
        <div class="row-head"><h3>Coming up</h3><a href="#/exams" class="link">Exams</a></div>
        ${live.length ? `<ul class="up-list">${live.map((e) => `<li><a href="#/exams">${chip(course(e.courseId))}<span><b>${esc(e.title)}</b><small>${fmtDT(e.startAt)}</small></span><em data-countdown="${e.startAt}">${e.startAt > now() ? countdown(e.startAt) : 'Live now'}</em></a></li>`).join('')}</ul>`
          : `<p class="muted small">No exams scheduled. Set up a mock test and Shikhor will open the exam room when it starts.</p><button class="btn sm" data-act="exam-new">${icon('plus')} Schedule a mock exam</button>`}
      </div>
    </section>

    <section class="panel">
      <div class="row-head"><h2>Courses and targets</h2><a href="#/courses" class="link">Manage courses</a></div>
      ${s.courses.length ? `<div class="course-rows">${s.courses.map(courseRow).join('')}</div>` : `<p class="muted">Your courses will appear here with syllabus progress and the marks you need in the final.</p>`}
    </section>

    <section class="badges-strip" aria-label="Badges">
      ${BADGES.map((b) => `<div class="badge ${earned.includes(b.id) ? 'got' : ''}" title="${esc(b.desc)}">${icon(b.ic)}<span>${esc(b.name)}</span></div>`).join('')}
    </section>`;
  };

  function targetLine(c) {
    const m = C.courseMarks(c, scale()), tg = st().profile.targetGrade || 'A+';
    const row = m.rows.find((r) => r.g === tg) || m.rows[0];
    if (row.state === 'secured') return `<b>${esc(tg)}</b> is already secured`;
    if (row.state === 'open') return `<b>${esc(tg)}</b> needs ${row.needMarks} of ${m.finalFull} in the final`;
    const best = m.rows.find((r) => r.state !== 'out');
    return best ? `${esc(tg)} is out of reach. <b>${esc(best.g)}</b> needs ${best.needMarks} of ${m.finalFull}` : 'Add marks to see targets';
  }
  function courseRow(c) {
    const k = sylStats(c);
    return `<a class="course-row" href="#/course/${c.id}" style="--c:${c.color}">
      <span class="cr-code">${esc(c.code)}</span>
      <span class="cr-title">${esc(c.title)}<small>${c.credit} credit${c.credit == 1 ? '' : 's'}, ${U.fmtMin(courseMin(c.id, weekStart()))} this week</small></span>
      <span class="cr-prog"><span class="bar"><i style="width:${(k.pct * 100).toFixed(1)}%"></i></span><small>${k.done} of ${k.total} topics</small></span>
      <span class="cr-target">${targetLine(c)}</span></a>`;
  }

  function onboarding() {
    return `<section class="welcome">
      <canvas id="welcomeCanvas" class="welcome-canvas" aria-hidden="true"></canvas>
      <div class="welcome-card glass">
        <h1>Welcome to Shikhor</h1>
        <p>A calm place to track your syllabus, time your study, plan for an A+ and sit mock exams. Everything stays in this browser unless you share it.</p>
        <label class="field"><span>Your name</span><input id="obName" autocomplete="name" placeholder="e.g. Limon Hossain" data-enter="ob-start"></label>
        <label class="field"><span>University <em>optional</em></span><input id="obUni" placeholder="e.g. BUET"></label>
        <div class="btn-row"><button class="btn btn-primary" data-act="ob-start">Get started</button><button class="btn" data-act="ob-sample">Explore with sample courses</button></div>
      </div></section>`;
  }
  after.dashboard = () => {
    const cv = $('#welcomeCanvas');
    if (cv) { ui.pageScene = new SN.Scene(cv); ui.pageScene.start('himalaya'); }
  };

  /* ----- courses ----- */
  pages.courses = () => {
    const cs = st().courses;
    return `<header class="page-head"><div><h1>Courses</h1><p class="muted">${cs.length ? `${cs.length} course${cs.length > 1 ? 's' : ''} this term` : 'Start by adding the courses you are taking this term.'}</p></div>
      <div class="btn-row">${cs.length ? `<button class="btn" data-act="share-open">${icon('share')} Share courses</button>` : ''}<button class="btn" data-act="courses-import">${icon('upload')} Import</button><button class="btn btn-primary" data-act="course-new">${icon('plus')} Add course</button></div></header>
      ${cs.length ? `<div class="course-grid">${cs.map((c) => {
        const k = sylStats(c);
        return `<a class="course-tile" href="#/course/${c.id}" style="--c:${c.color}">
          <div class="tile-top"><span class="cr-code">${esc(c.code)}</span>${CH.ring(k.pct, { size: 64, stroke: 7, label: Math.round(k.pct * 100) + '%', color: c.color, aria: 'Syllabus ' + Math.round(k.pct * 100) + ' percent' })}</div>
          <h3>${esc(c.title)}</h3>
          <p class="small">${targetLine(c)}</p>
          <p class="tile-meta">${k.done}/${k.total} topics, ${c.materials.length} material${c.materials.length === 1 ? '' : 's'}, ${U.fmtMin(courseMin(c.id))} studied</p></a>`;
      }).join('')}</div>` : emptyState('book', 'No courses yet', 'Add a course with its syllabus topics. You can paste a whole syllabus at once.', `<button class="btn btn-primary" data-act="course-new">${icon('plus')} Add course</button>`)}`;
  };
  const emptyState = (ic, title, body, cta = '') => `<div class="empty">${icon(ic)}<h3>${title}</h3><p class="muted">${body}</p>${cta}</div>`;

  function courseForm(c) {
    const isNew = !c; c = c || { code: '', title: '', credit: 3, color: U.COLORS[st().courses.length % U.COLORS.length] };
    return `<h2>${isNew ? 'Add a course' : 'Edit course'}</h2>
      <div class="form-grid">
        <label class="field"><span>Course code</span><input id="cfCode" value="${esc(c.code)}" placeholder="e.g. IPE 301" autofocus></label>
        <label class="field"><span>Credits</span><input id="cfCredit" type="number" min="0.5" step="0.25" value="${c.credit}"></label>
        <label class="field span2"><span>Course title</span><input id="cfTitle" value="${esc(c.title)}" placeholder="e.g. Operations Research"></label>
        <fieldset class="field span2"><legend>Colour</legend><div class="swatches">${U.COLORS.map((col) => `<label class="sw"><input type="radio" name="cfColor" value="${col}" ${col === c.color ? 'checked' : ''}><i style="background:${col}"></i><span class="sr">${col}</span></label>`).join('')}</div></fieldset>
        ${isNew ? `<label class="field span2"><span>Syllabus topics <em>one per line, start a line with # for a chapter heading</em></span><textarea id="cfSyl" rows="7" placeholder="# Linear programming&#10;Graphical method&#10;Simplex method&#10;Duality"></textarea></label>` : ''}
      </div>
      <div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-act="course-save" data-id="${isNew ? '' : c.id}">${isNew ? 'Add course' : 'Save changes'}</button></div>`;
  }
  const parseTopics = (txt) => txt.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => ({ id: U.uid(), title: l.replace(/^#+\s*/, '').replace(/^[-*•]\s*/, ''), section: /^#/.test(l), done: false, doneAt: null }));

  pages.course = (id) => {
    const c = course(id);
    if (!c) return emptyState('book', 'Course not found', 'It may have been removed.', `<a class="btn" href="#/courses">Back to courses</a>`);
    const k = sylStats(c);
    const tabs = [['syllabus', 'Syllabus'], ['marks', 'Marks and targets'], ['materials', 'Materials'], ['log', 'Study log']];
    const body = { syllabus: syllabusTab, marks: marksTab, materials: materialsTab, log: logTab }[ui.courseTab] || syllabusTab;
    return `<header class="course-hero" style="--c:${c.color}">
      <a href="#/courses" class="back">Courses</a>
      <div class="hero-row"><div><span class="cr-code big">${esc(c.code)}</span><h1>${esc(c.title)}</h1>
        <p class="muted">${c.credit} credits. ${k.done} of ${k.total} topics done. ${U.fmtMin(courseMin(c.id))} studied in total.</p></div>
        <div class="btn-row"><button class="btn btn-primary" data-act="focus-open" data-course="${c.id}">${icon('play')} Study this</button>
        <button class="icon-btn" data-act="share-open" data-id="${c.id}" aria-label="Share course" title="Share">${icon('share')}</button>
        <button class="icon-btn" data-act="course-edit" data-id="${c.id}" aria-label="Edit course" title="Edit">${icon('edit')}</button>
        <button class="icon-btn" data-act="course-del" data-id="${c.id}" aria-label="Delete course" title="Delete">${icon('trash')}</button></div></div>
      <div class="hero-bar"><span class="bar thick"><i style="width:${(k.pct * 100).toFixed(1)}%"></i></span><b>${Math.round(k.pct * 100)}%</b></div>
    </header>
    <nav class="tabs" role="tablist">${tabs.map(([t, l]) => `<button role="tab" aria-selected="${ui.courseTab === t}" class="${ui.courseTab === t ? 'on' : ''}" data-act="course-tab" data-t="${t}">${l}</button>`).join('')}</nav>
    <div class="tab-body">${body(c)}</div>`;
  };

  function syllabusTab(c) {
    return `<div class="add-row"><input id="topicIn" placeholder="Add a topic and press Enter" data-enter="topic-add" aria-label="New topic"><button class="btn btn-primary" data-act="topic-add">${icon('plus')} Add</button><button class="btn" data-act="topic-bulk">Paste many</button></div>
      ${c.syllabus.length ? `<ul class="topics">${c.syllabus.map((t, i) => t.section
        ? `<li class="topic section"><span class="sec-title">${esc(t.title)}</span><span class="topic-tools">${topicTools(t, i, c)}</span></li>`
        : `<li class="topic ${t.done ? 'done' : ''}"><button class="check" data-act="topic-toggle" data-id="${t.id}" aria-pressed="${t.done}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}: ${esc(t.title)}">${icon('check')}</button>
            <span class="topic-title">${esc(t.title)}</span>${t.doneAt ? `<small class="muted">${fmtDate(t.doneAt)}</small>` : ''}<span class="topic-tools">${topicTools(t, i, c)}</span></li>`).join('')}</ul>`
        : emptyState('open', 'No topics yet', 'Add topics one by one or paste the whole syllabus. Ticking them off moves this course up the climb on your home page.')}`;
  }
  const topicTools = (t, i, c) => `${i > 0 ? `<button class="icon-btn sm" data-act="topic-up" data-id="${t.id}" aria-label="Move up">${icon('up')}</button>` : ''}<button class="icon-btn sm" data-act="topic-edit" data-id="${t.id}" aria-label="Rename">${icon('edit')}</button><button class="icon-btn sm" data-act="topic-del" data-id="${t.id}" aria-label="Delete">${icon('trash')}</button>`;

  function marksTab(c) {
    const m = c.marks, anyCt = m.cts.some((t) => t.got !== '' && t.got != null);
    return `<div class="marks-grid">
      <div class="panel">
        <div class="field"><span class="lbl">Attendance <output id="attOut">${m.attendance}%</output></span><input type="range" min="0" max="100" value="${m.attendance}" data-input="mk-att" aria-label="Attendance percent"></div>
        <h3>Class tests</h3>
        <div class="ct-list">${m.cts.length ? m.cts.map((t, i) => `<div class="ct-row"><input value="${esc(t.label)}" data-input="mk-ct" data-i="${i}" data-f="label" aria-label="Test name">
          <input type="number" inputmode="decimal" min="0" step="0.5" value="${t.got ?? ''}" placeholder="Score" data-input="mk-ct" data-change="mk-commit" data-i="${i}" data-f="got" aria-label="Score">
          <span class="muted">of</span><input type="number" min="1" value="${t.max}" data-input="mk-ct" data-i="${i}" data-f="max" aria-label="Full marks">
          <button class="icon-btn sm" data-act="ct-del" data-i="${i}" aria-label="Remove test">${icon('trash')}</button></div>`).join('') : '<p class="muted small">No class tests added yet.</p>'}</div>
        <div class="btn-row"><button class="btn sm" data-act="ct-add">${icon('plus')} Add class test</button>
          <label class="inline-sel">Count the best <select data-change="mk-best">${[1, 2, 3, 4, 5, 6].map((n) => `<option ${+m.ctBest === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
        ${anyCt ? '' : `<div class="field"><span class="lbl">Expected class test average <output id="ctgOut">${m.ctGuess}%</output></span><input type="range" min="0" max="100" value="${m.ctGuess}" data-input="mk-ctguess" aria-label="Expected class test average"></div>`}
        <details class="weights"><summary>Mark distribution</summary>
          <div class="w-row">${[['att', 'Attendance'], ['ct', 'Class tests'], ['final', 'Term final']].map(([f, l]) => `<label class="field"><span>${l} %</span><input type="number" min="0" max="100" value="${m.weights[f]}" data-input="mk-w" data-f="${f}"></label>`).join('')}</div>
          <p class="small muted">BUET theory courses use 10% attendance, 20% class tests and 70% term final, so a 3 credit final is out of 210. Change these if your course is different. The grade scale is in Settings.</p>
        </details>
      </div>
      <div class="panel target-panel">
        <div id="targetBox">${targetBox(c)}</div>
        <div class="whatif"><span class="lbl">What if I score <output id="expOut">${m.expectedFinal}%</output> in the final?</span>
          <input type="range" min="0" max="100" value="${m.expectedFinal}" data-input="mk-exp" aria-label="Expected final percent">
          <div id="whatifRes">${whatifRes(c)}</div></div>
      </div></div>`;
  }
  function targetBox(c) {
    const r = C.courseMarks(c, scale()), tg = st().profile.targetGrade || 'A+';
    const row = r.rows.find((x) => x.g === tg) || r.rows[0];
    let head;
    if (row.state === 'secured') head = `<p class="target-kicker">${esc(tg)} target</p><p class="target-big">Secured</p><p class="muted">Your attendance and class tests already cover ${esc(tg)}. Keep going for a strong final.</p>`;
    else if (row.state === 'open') head = `<p class="target-kicker">To get ${esc(tg)} you need</p><p class="target-big"><span>${row.needMarks}</span><small> / ${r.finalFull}</small></p><p class="muted">in the term final, which is ${Math.max(0, row.needPct).toFixed(1)}% of the paper.</p>`;
    else { const best = r.rows.find((x) => x.state !== 'out'); head = `<p class="target-kicker">${esc(tg)} target</p><p class="target-big small-big">Out of reach</p><p class="muted">${esc(tg)} would need more than full marks in the final. ${best ? `${esc(best.g)} is your best reachable grade and needs ${best.needMarks} of ${r.finalFull}.` : ''}</p>`; }
    return `${head}
      <p class="secured">So far: <b>${r.secured.toFixed(1)}</b> of ${(r.wa + r.wc).toFixed(0)} from attendance and class tests${r.ctAssumed ? ', using your expected class test average' : r.ctCount > (+c.marks.ctBest || 0) ? `, best ${c.marks.ctBest} of ${r.ctCount} tests` : ''}.</p>
      <table class="grade-table"><thead><tr><th>Grade</th><th>Needed in final</th><th>GP</th></tr></thead><tbody>
      ${r.rows.filter((x) => x.min > 0).map((x) => `<tr class="${x.state} ${x.g === tg ? 'is-target' : ''}"><td><b>${esc(x.g)}</b></td><td>${x.state === 'secured' ? 'Secured' : x.state === 'out' ? 'Not reachable' : `${x.needMarks} / ${r.finalFull}`}</td><td>${(+x.gp).toFixed(2)}</td></tr>`).join('')}
      </tbody></table>`;
  }
  function whatifRes(c) {
    const r = C.courseMarks(c, scale());
    return `<p>That is ${Math.round(c.marks.expectedFinal / 100 * r.finalFull)} of ${r.finalFull}. You would finish with <b>${r.total.toFixed(1)}%</b> and a <span class="grade-pill">${esc(r.grade)}</span> (GP ${(+r.gp).toFixed(2)}).</p>`;
  }
  function refreshMarks(c) {
    const tb = $('#targetBox'); if (tb) tb.innerHTML = targetBox(c);
    const wr = $('#whatifRes'); if (wr) wr.innerHTML = whatifRes(c);
  }

  function materialsTab(c) {
    const g = st().github;
    return `<div class="btn-row"><button class="btn btn-primary" data-act="mat-upload">${icon('upload')} Upload files</button>
      <button class="btn" data-act="gh-browse">${icon('folder')} Add from GitHub</button><button class="btn" data-act="mat-link">${icon('link')} Add a link</button></div>
      <div class="dropzone" data-drop="${c.id}">${icon('upload')}<span>Drop PDFs, slides or notes here</span></div>
      ${c.materials.length ? `<ul class="mats">${c.materials.map((m) => `<li class="mat">
        <span class="mat-ic ${m.kind}">${icon(m.kind === 'file' ? 'file' : m.kind === 'github' ? 'folder' : 'link')}</span>
        <span class="mat-name"><b>${esc(m.name)}</b><small>${m.kind === 'file' ? 'Saved on this device' : m.kind === 'github' ? 'In your GitHub repository' : esc(m.url)}${m.size ? ', ' + U.fmtSize(m.size) : ''}</small></span>
        <span class="mat-tools"><button class="btn sm" data-act="mat-open" data-id="${m.id}">Open</button><button class="btn sm" data-act="mat-read" data-id="${m.id}">${icon('open')} Read in focus</button><button class="icon-btn sm" data-act="mat-del" data-id="${m.id}" aria-label="Remove">${icon('trash')}</button></span></li>`).join('')}</ul>`
        : emptyState('folder', 'No materials yet', 'Upload lecture slides and notes, or link the files you keep in GitHub.')}
      <p class="hint">${icon('folder')} <span>Uploaded files stay in this browser. To have them on every device, put them in your repository under <code>materials/${esc(c.code.replace(/\s+/g, ''))}/</code> and use “Add from GitHub”${g.owner ? ` (connected to <b>${esc(g.owner)}/${esc(g.repo)}</b>)` : '. Set your repository in Settings first'}.</span></p>`;
  }

  function logTab(c) {
    const ss = st().sessions.filter((s) => s.courseId === c.id).sort((a, b) => b.start - a.start);
    const tot = ss.reduce((a, s) => a + s.min, 0);
    return `<div class="stat-strip"><div><b>${U.fmtMin(tot)}</b><span>in total</span></div><div><b>${U.fmtMin(courseMin(c.id, weekStart()))}</b><span>this week</span></div><div><b>${ss.length}</b><span>sessions</span></div><div><b>${ss.length ? U.fmtMin(tot / ss.length) : '0m'}</b><span>average session</span></div></div>
      <div class="panel">${privateBlock(CH.bars(lastDays(14, c.id), { height: 210, aria: 'Study time for this course over 14 days' }))}</div>
      ${ss.length ? `<ul class="log-list">${ss.slice(0, 15).map((s) => `<li><span>${fmtDT(s.start)}</span><span class="muted">${s.kind === 'exam' ? 'Exam' : 'Study'}</span><b>${U.fmtMin(s.min)}</b></li>`).join('')}</ul>` : ''}`;
  }

  /* ----- exams ----- */
  const examEnd = (e) => e.startAt + e.duration * 60000;
  pages.exams = () => {
    const ex = st().exams.slice().sort((a, b) => a.startAt - b.startAt);
    const live = ex.filter((e) => e.startAt <= now() && examEnd(e) > now());
    const up = ex.filter((e) => e.startAt > now());
    const doneList = ex.filter((e) => examEnd(e) <= now()).sort((a, b) => b.startAt - a.startAt);
    return `<header class="page-head"><div><h1>Exams</h1><p class="muted">When a scheduled exam begins, Shikhor opens the exam room, turns on your camera and starts the clock. Keep this tab open.</p></div>
      <button class="btn btn-primary" data-act="exam-new">${icon('plus')} Schedule an exam</button></header>
      ${live.length ? `<h2 class="sec-h">Live now</h2><div class="exam-list">${live.map(examCard).join('')}</div>` : ''}
      <h2 class="sec-h">Upcoming</h2>
      ${up.length ? `<div class="exam-list">${up.map(examCard).join('')}</div>` : `<p class="muted">Nothing scheduled.</p>`}
      ${doneList.length ? `<h2 class="sec-h">Finished</h2><div class="exam-list">${doneList.map(examCard).join('')}</div>` : ''}`;
  };
  function examCard(e) {
    const c = course(e.courseId), done = e.attempts.filter((a) => a.status === 'done');
    const isLive = e.startAt <= now() && examEnd(e) > now(), isUp = e.startAt > now();
    const totalMarks = e.questions.reduce((a, q) => a + (+q.marks || 0), 0);
    const last = done[done.length - 1];
    return `<article class="exam-card ${isLive ? 'live' : ''}">
      <div class="ec-main">${chip(c)}<div><h3>${esc(e.title)}</h3><p class="muted small">${fmtDT(e.startAt)}, ${e.duration} min, ${e.questions.length ? `${e.questions.length} question${e.questions.length > 1 ? 's' : ''}, ${totalMarks} marks` : 'answer sheet only'}${e.camera ? ', camera on' : ''}</p></div></div>
      <div class="ec-side">${isUp ? `<em class="cd" data-countdown="${e.startAt}">${countdown(e.startAt)}</em>` : isLive ? '<em class="cd live">Live now</em>' : ''}
        ${last ? `<span class="score">${last.score != null ? `${+last.score.toFixed(2)} / ${last.total}` : 'Submitted'}</span>` : ''}
        <div class="btn-row">${last ? `<button class="btn sm" data-act="exam-review" data-id="${e.id}">Review</button>` : ''}
        <button class="btn sm ${isLive ? 'btn-primary' : ''}" data-act="exam-start" data-id="${e.id}">${isLive ? 'Enter exam room' : 'Practice now'}</button>
        <a class="icon-btn sm" href="#/exam/${e.id}" aria-label="Edit exam">${icon('edit')}</a><button class="icon-btn sm" data-act="exam-del" data-id="${e.id}" aria-label="Delete exam">${icon('trash')}</button></div></div></article>`;
  }

  function newDraft(courseId) {
    const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1);
    return { id: U.uid(), title: '', courseId: courseId || '', startAt: d.getTime(), duration: 60, instructions: '', camera: true, materialId: '', questions: [], attempts: [], createdAt: now(), isNew: true };
  }
  pages.exam = (id) => {
    if (!ui.examDraft || ui.examDraft.id !== id) {
      const e = exam(id);
      if (!e) return emptyState('exam', 'Exam not found', 'It may have been deleted.', `<a class="btn" href="#/exams">Back to exams</a>`);
      ui.examDraft = JSON.parse(JSON.stringify(e));
    }
    const d = ui.examDraft, c = course(d.courseId);
    const total = d.questions.reduce((a, q) => a + (+q.marks || 0), 0);
    return `<header class="page-head"><div><a href="#/exams" class="back">Exams</a><h1>${d.isNew ? 'Schedule an exam' : 'Edit exam'}</h1></div>
      <div class="btn-row"><a class="btn" href="#/exams">Cancel</a><button class="btn btn-primary" data-act="exam-save">Save exam</button></div></header>
      <section class="panel form-grid">
        <label class="field span2"><span>Title</span><input value="${esc(d.title)}" data-input="ex-f" data-f="title" placeholder="e.g. Mock CT 3: Simplex method"></label>
        <label class="field"><span>Course</span><select data-change="ex-course"><option value="">General</option>${st().courses.map((x) => `<option value="${x.id}" ${x.id === d.courseId ? 'selected' : ''}>${esc(x.code)} ${esc(x.title)}</option>`).join('')}</select></label>
        <label class="field"><span>Starts at</span><input type="datetime-local" value="${toLocalInput(d.startAt)}" data-change="ex-start"></label>
        <label class="field"><span>Duration in minutes</span><input type="number" min="1" value="${d.duration}" data-input="ex-f" data-f="duration"></label>
        <label class="field"><span>Question paper from materials <em>optional</em></span><select data-change="ex-mat"><option value="">None</option>${(c ? c.materials : []).map((m) => `<option value="${m.id}" ${m.id === d.materialId ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
        <label class="field span2"><span>Instructions <em>optional</em></span><textarea rows="2" data-input="ex-f" data-f="instructions" placeholder="e.g. Answer any four. Show all steps.">${esc(d.instructions)}</textarea></label>
        <label class="check-line span2"><input type="checkbox" ${d.camera ? 'checked' : ''} data-change="ex-cam"> Turn on my camera during this exam</label>
      </section>
      <div class="row-head"><h2>Questions <small class="muted">${d.questions.length} question${d.questions.length === 1 ? '' : 's'}, ${total} marks</small></h2>
        <div class="btn-row"><button class="btn sm" data-act="q-add" data-t="mcq">${icon('plus')} Multiple choice</button><button class="btn sm" data-act="q-add" data-t="text">${icon('plus')} Written</button><button class="btn sm" data-act="q-bulk">Paste questions</button></div></div>
      ${d.questions.length ? d.questions.map(qEditor).join('') : `<p class="muted panel">No questions yet. You can still run the exam with a question paper from your materials and a blank answer sheet.</p>`}`;
  };
  function qEditor(q, i) {
    return `<article class="q-edit panel">
      <div class="q-edit-head"><b>Question ${i + 1}</b>
        <div class="seg" role="group" aria-label="Question type"><button class="${q.type === 'mcq' ? 'on' : ''}" data-act="q-type" data-q="${i}" data-t="mcq">Multiple choice</button><button class="${q.type === 'text' ? 'on' : ''}" data-act="q-type" data-q="${i}" data-t="text">Written</button></div>
        <label class="marks-in">Marks <input type="number" min="0" step="0.5" value="${q.marks}" data-input="q-f" data-q="${i}" data-f="marks"></label>
        <button class="icon-btn sm" data-act="q-del" data-q="${i}" aria-label="Remove question">${icon('trash')}</button></div>
      <textarea rows="2" placeholder="Write the question" data-input="q-f" data-q="${i}" data-f="text" aria-label="Question text">${esc(q.text)}</textarea>
      ${q.type === 'mcq' ? `<div class="opts">${q.options.map((o, j) => `<div class="opt-edit"><input type="radio" name="corr${q.id}" ${q.answer === j ? 'checked' : ''} data-change="q-correct" data-q="${i}" data-o="${j}" aria-label="Mark option ${j + 1} correct">
          <input value="${esc(o)}" placeholder="Option ${j + 1}" data-input="q-opt" data-q="${i}" data-o="${j}" aria-label="Option ${j + 1}"><button class="icon-btn sm" data-act="q-opt-del" data-q="${i}" data-o="${j}" aria-label="Remove option">${icon('x')}</button></div>`).join('')}
        <button class="btn sm ghost" data-act="q-opt-add" data-q="${i}">${icon('plus')} Add option</button><p class="small muted">Choose the circle beside the correct answer.</p></div>` : `<p class="small muted">You mark written answers yourself after submitting.</p>`}
    </article>`;
  }
  function parseQuestions(txt) {
    return txt.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      let text = lines.shift(), marks = 1;
      const mm = text.match(/\((\d+(?:\.\d+)?)\)\s*$/); if (mm) { marks = +mm[1]; text = text.replace(mm[0], '').trim(); }
      const opts = lines.filter((l) => /^[-*•]|^[a-hA-H][).]\s/.test(l));
      if (!opts.length) return { id: U.uid(), type: 'text', text: [text].concat(lines).join('\n'), marks: mm ? marks : 5, options: [], answer: null };
      let answer = 0;
      const options = opts.map((o, j) => { let t = o.replace(/^[-•]\s*|^\*\s+|^[a-hA-H][).]\s*/, '').trim(); if (/\*\s*$/.test(t)) { answer = j; t = t.replace(/\*\s*$/, '').trim(); } return t; });
      return { id: U.uid(), type: 'mcq', text, marks, options, answer };
    });
  }

  /* ----- analytics ----- */
  pages.analytics = () => {
    const s = st(), p = s.profile;
    if (isLocked()) return `<header class="page-head"><h1>Progress</h1></header><div class="panel">${lockedBox()}</div>`;
    const map = C.minutesByDay(s.sessions), tot = totalMin(), goal = +p.dailyGoal || 120;
    const last14 = lastDays(14), avg14 = last14.reduce((a, d) => a + d.segs.reduce((x, y) => x + y.v, 0), 0) / 14;
    const best = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    const sc = scale();
    const fc = s.courses.map((c) => ({ c, m: C.courseMarks(c, sc) }));
    const cr = fc.reduce((a, x) => a + (+x.c.credit || 0), 0);
    const gpa = cr ? fc.reduce((a, x) => a + x.m.gp * (+x.c.credit || 0), 0) / cr : 0;
    const cg = parseFloat(p.cgpa), cc = parseFloat(p.credits);
    const newCg = cr && cg >= 0 && cc > 0 ? (cg * cc + gpa * cr) / (cc + cr) : null;
    const byCourse = s.courses.map((c) => ({ c, v: courseMin(c.id) })).sort((a, b) => b.v - a.v);
    const maxC = Math.max(1, ...byCourse.map((x) => x.v));
    const legend = s.courses.map((c) => `<span><i style="background:${c.color}"></i>${esc(c.code)}</span>`).join('');
    return `<header class="page-head"><div><h1>Progress</h1><p class="private-tag">${icon('lock')} Only you can see this page. Study data never leaves this browser.</p></div>
      <div class="btn-row"><button class="btn" data-act="toggle-blur">${icon(s.settings.blurStats ? 'eye' : 'eyeoff')} ${s.settings.blurStats ? 'Show numbers' : 'Hide numbers'}</button>${s.settings.pin ? `<button class="btn" data-act="lock-now">${icon('lock')} Lock</button>` : ''}</div></header>
      <div class="${s.settings.blurStats ? 'is-blurred' : ''} sensitive">
      <div class="stat-strip"><div><b>${U.fmtMin(tot)}</b><span>studied in total</span></div><div><b>${U.fmtMin(s.sessions.filter((x) => x.start >= weekStart()).reduce((a, x) => a + x.min, 0))}</b><span>this week</span></div>
        <div><b>${U.fmtMin(avg14)}</b><span>daily average, 14 days</span></div><div><b>${C.streak(s.sessions)}</b><span>day streak</span></div><div><b>${best ? U.fmtMin(best[1]) : '0m'}</b><span>best day${best ? ', ' + fmtDate(best[0] + 'T12:00') : ''}</span></div></div>
      <section class="panel"><div class="row-head"><h2>Last 14 days</h2><div class="legend">${legend}</div></div><div class="scroll-x">${CH.bars(last14, { height: 240, goal })}</div></section>
      <section class="panel"><div class="row-head"><h2>Study calendar</h2><div class="heat-legend">Less <i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i><i class="h5"></i> More</div></div><div class="scroll-x">${CH.calendar(map, 52)}</div></section>
      <section class="panel"><div class="row-head"><h2>When you study</h2><span class="small muted">Darker squares are the hours you study most</span></div><div class="scroll-x">${CH.hourGrid(C.hourMatrix(s.sessions))}</div></section>
      <div class="two-col">
        <section class="panel"><h2>Time by course</h2>${byCourse.length ? `<ul class="hbars">${byCourse.map((x) => `<li><span>${esc(x.c.code)}</span><span class="bar"><i style="width:${(x.v / maxC * 100).toFixed(1)}%;background:${x.c.color}"></i></span><b>${U.fmtMin(x.v)}</b></li>`).join('')}</ul>` : '<p class="muted">No courses yet.</p>'}
</section>
        <section class="panel"><h2>Syllabus by course</h2>${s.courses.length ? `<ul class="hbars">${s.courses.map((c) => { const k = sylStats(c); return `<li><span>${esc(c.code)}</span><span class="bar"><i style="width:${(k.pct * 100).toFixed(1)}%;background:${c.color}"></i></span><b>${Math.round(k.pct * 100)}%</b></li>`; }).join('')}</ul>` : ''}</section>
      </div>
      <section class="panel"><div class="row-head"><h2>Grade forecast</h2><a class="link" href="#/courses">Update marks</a></div>
        ${fc.length ? `<div class="scroll-x"><table class="forecast"><thead><tr><th>Course</th><th>Credits</th><th>Expected final</th><th>Projected total</th><th>Grade</th><th>GP</th></tr></thead><tbody>
          ${fc.map(({ c, m }) => `<tr><td>${chip(c)} ${esc(c.title)}</td><td>${c.credit}</td><td>${c.marks.expectedFinal}%</td><td>${m.total.toFixed(1)}%</td><td><span class="grade-pill">${esc(m.grade)}</span></td><td>${(+m.gp).toFixed(2)}</td></tr>`).join('')}
          </tbody></table></div>
          <div class="gpa-row"><div><span>Projected term GPA</span><b>${gpa.toFixed(2)}</b></div>${newCg != null ? `<div><span>Projected CGPA after this term</span><b>${newCg.toFixed(2)}</b></div>` : `<p class="small muted">Add your current CGPA and completed credits in your profile to project your CGPA.</p>`}</div>
          <p class="small muted">Each course uses the “what if” final score you set in its Marks tab.</p>` : '<p class="muted">Add courses to see a forecast.</p>'}
      </section></div>`;
  };

  /* ----- profile ----- */
  pages.profile = () => {
    const p = st().profile;
    const bind = (k, label, ph = '', type = 'text', extra = '') => `<label class="field"><span>${label}</span><input type="${type}" value="${esc(p[k])}" placeholder="${ph}" data-bind="profile.${k}" ${type === 'number' ? 'data-num' : ''} ${extra}></label>`;
    return `<header class="page-head"><h1>Profile</h1></header>
      <section class="profile-hero panel">
        <button class="avatar-btn" data-act="avatar-pick" aria-label="Change photo">${avatarHtml(p, 104)}<span>Change photo</span></button>
        <div><h2>${esc(p.name || 'Your name')}</h2><p class="muted">${esc([p.university, p.department, p.level].filter(Boolean).join(', ') || 'Add your university and department below.')}</p>${p.avatar ? `<button class="link" data-act="avatar-remove">Remove photo</button>` : ''}</div>
      </section>
      <section class="panel form-grid">
        ${bind('name', 'Name', 'Your full name', 'text', 'data-live')}${bind('university', 'University', 'e.g. BUET')}
        ${bind('department', 'Department', 'e.g. Industrial and Production Engineering')}${bind('level', 'Level and term', 'e.g. Level 3, Term I')}
        ${bind('dailyGoal', 'Daily study goal in minutes', '120', 'number', 'min="10" step="10"')}
        <label class="field"><span>Target grade</span><select data-bind="profile.targetGrade" data-rerender>${scale().filter((s) => s.min > 0).map((s) => `<option ${s.g === p.targetGrade ? 'selected' : ''}>${esc(s.g)}</option>`).join('')}</select></label>
        ${bind('cgpa', 'Current CGPA', 'e.g. 3.50', 'number', 'step="0.01" min="0" max="4"')}${bind('credits', 'Credits completed', 'e.g. 80', 'number', 'step="0.25" min="0"')}
        <label class="field span2"><span>About you <em>optional</em></span><textarea rows="3" data-bind="profile.bio" placeholder="What are you working towards this term?">${esc(p.bio)}</textarea></label>
      </section>
      <section class="panel"><div class="row-head"><h2>Profiles on this device</h2><button class="btn sm" data-act="profile-add">${icon('plus')} Add profile</button></div>
        <p class="small muted">Share this laptop with a friend or sibling? Each profile has its own courses, timers and exams.</p>
        <ul class="profiles">${S.profiles.map((x) => `<li>${avatarHtml(x, 36)}<b>${esc(x.name || 'Unnamed')}</b>${x.id === S.activeId ? '<span class="tag">Active</span>' : `<button class="btn sm" data-act="profile-switch" data-id="${x.id}">Switch</button>`}${S.profiles.length > 1 ? `<button class="icon-btn sm" data-act="profile-del" data-id="${x.id}" aria-label="Delete profile">${icon('trash')}</button>` : ''}</li>`).join('')}</ul>
      </section>`;
  };

  /* ----- settings ----- */
  pages.settings = () => {
    const s = st(), g = s.github, set = s.settings;
    return `<header class="page-head"><h1>Settings</h1></header>
      <section class="panel"><h2>GitHub materials</h2>
        <p class="muted small">Keep course files in your repository's <code>materials</code> folder, one subfolder per course code. Shikhor reads the list of files from GitHub, so public repositories work without any login.</p>
        <div class="form-grid four">
          <label class="field"><span>GitHub username</span><input value="${esc(g.owner)}" data-bind="github.owner" placeholder="your-username"></label>
          <label class="field"><span>Repository</span><input value="${esc(g.repo)}" data-bind="github.repo" placeholder="shikhor"></label>
          <label class="field"><span>Branch</span><input value="${esc(g.branch)}" data-bind="github.branch" placeholder="main"></label>
          <label class="field"><span>Folder</span><input value="${esc(g.path)}" data-bind="github.path" placeholder="materials"></label></div>
        <div class="btn-row"><button class="btn" data-act="gh-test">Check connection</button><span id="ghStatus" class="small muted"></span></div>
      </section>
      <section class="panel"><h2>Focus room</h2>
        <label class="check-line"><input type="checkbox" ${set.camInFocus ? 'checked' : ''} data-bind="settings.camInFocus"> Turn the camera on beside the timer when I start studying</label>
        <label class="check-line"><input type="checkbox" ${set.focusMonitor !== false ? 'checked' : ''} data-bind="settings.focusMonitor"> Alert me if I leave the camera view (face detection)</label>
        ${set.focusMonitor !== false ? `<div class="field" style="max-width:320px;margin-left:28px"><span class="lbl">Alert after being away for <output id="fmOut">${set.focusDelay || 20}s</output></span><input type="range" min="5" max="60" step="5" value="${set.focusDelay || 20}" data-input="fm-delay" aria-label="Absent seconds before alert"></div>` : ''}
        <div class="form-grid four">
          <label class="field"><span>Pomodoro study minutes</span><input type="number" min="5" value="${set.work}" data-bind="settings.work" data-num></label>
          <label class="field"><span>Break minutes</span><input type="number" min="1" value="${set.brk}" data-bind="settings.brk" data-num></label>
          <label class="field span2"><span>Your own background photo <em>image link, used by the “Your own photo” scene</em></span><input value="${esc(set.customBg)}" data-bind="settings.customBg" placeholder="https://…/photo.jpg"></label></div>
      </section>
      <section class="panel"><h2>Privacy</h2>
        <p class="muted small">Your progress charts are only stored here. A PIN keeps them hidden from anyone using this browser.</p>
        <div class="btn-row">${set.pin ? `<span class="tag">${icon('lock')} PIN is on</span><button class="btn" data-act="pin-clear">Remove PIN</button>` : `<input type="password" inputmode="numeric" maxlength="8" id="pinNew" placeholder="4 to 8 digits" aria-label="New PIN" data-enter="pin-set"><button class="btn" data-act="pin-set">Set PIN</button>`}</div>
        <label class="check-line"><input type="checkbox" ${set.blurStats ? 'checked' : ''} data-bind="settings.blurStats"> Blur numbers on charts until I hover over them</label>
      </section>
      <section class="panel"><div class="row-head"><h2>Grade scale</h2><button class="btn sm" data-act="scale-reset">Use BUET scale</button></div>
        <div class="scroll-x"><table class="scale-table"><thead><tr><th>Grade</th><th>From %</th><th>Grade point</th></tr></thead><tbody>
        ${scale().map((x, i) => `<tr><td><input value="${esc(x.g)}" data-change="scale" data-i="${i}" data-f="g" aria-label="Grade"></td><td><input type="number" value="${x.min}" data-change="scale" data-i="${i}" data-f="min" aria-label="Minimum percent"></td><td><input type="number" step="0.01" value="${x.gp}" data-change="scale" data-i="${i}" data-f="gp" aria-label="Grade point"></td></tr>`).join('')}
        </tbody></table></div></section>
      <section class="panel"><h2>Your data</h2>
        <p class="muted small">Download a backup before clearing your browser or moving to a new laptop. Uploaded files are not inside the backup; keep important files in GitHub.</p>
        <div class="btn-row"><button class="btn" data-act="backup-export">${icon('download')} Download backup</button><button class="btn" data-act="backup-import">${icon('upload')} Restore backup</button>
        ${s.courses.some((c) => c.sample) ? `<button class="btn" data-act="sample-remove">Remove sample data</button>` : ''}<button class="btn btn-danger" data-act="erase-all">Erase this profile’s data</button></div>
      </section>
      <section class="panel about"><h2>About Shikhor</h2><p class="muted small">Free and open source under the MIT licence. Fork it, translate it, give it to your classmates. Version 1.0.</p></section>`;
  };

  /* ----- import ----- */
  pages.import = (arg) => {
    if (ui.importArg !== arg) {
      ui.importArg = arg; ui.importData = null; ui.importError = null;
      if (arg !== 'file') {
        unpack(arg).then((d) => { if (!d || d.app !== 'shikhor' || !Array.isArray(d.courses)) throw new Error('bad'); ui.importData = d; })
          .catch(() => { ui.importError = 'This share link is broken or incomplete. Ask your friend to send it again.'; })
          .finally(() => { if (ui.page === 'import') render(); });
      }
    }
    if (ui.importError) return emptyState('link', 'Could not open this link', ui.importError, `<a class="btn" href="#/dashboard">Go home</a>`);
    const d = ui.importData;
    if (!d) return `<p class="muted">Opening shared courses…</p>`;
    return `<header class="page-head"><div><h1>Shared with you</h1><p class="muted">${d.from ? esc(d.from) + ' shared ' : ''}${d.courses.length} course${d.courses.length > 1 ? 's' : ''}. Adding them copies the syllabus${d.courses.some((c) => c.marks) ? ', marks' : ''} and links into your own Shikhor.</p></div></header>
      <div class="course-grid">${d.courses.map((c) => `<div class="course-tile" style="--c:${esc(c.color || '#4C97B8')}"><span class="cr-code">${esc(c.code)}</span><h3>${esc(c.title)}</h3><p class="tile-meta">${(c.syllabus || []).filter((t) => !t.s).length} topics, ${(c.materials || []).length} materials${c.marks ? ', with marks' : ''}</p></div>`).join('')}</div>
      <div class="btn-row"><a class="btn" href="#/dashboard">Not now</a><button class="btn btn-primary" data-act="import-accept">${icon('plus')} Add to my courses</button></div>`;
  };

  /* ---------- render ---------- */
  function parseHash() {
    const h = (location.hash || '').replace(/^#\/?/, '');
    const i = h.indexOf('/');
    return i < 0 ? { page: h || 'dashboard', arg: '' } : { page: h.slice(0, i), arg: h.slice(i + 1) };
  }
  function render() {
    const { page, arg } = parseHash();
    const changed = page !== ui.page || arg !== ui.arg;
    if (changed && ui.page === 'exam' && page !== 'exam') ui.examDraft = null;
    if (page === 'course' && arg !== ui.arg) ui.courseTab = 'syllabus';
    ui.page = pages[page] ? page : 'dashboard'; ui.arg = arg;
    if (ui.pageScene) { ui.pageScene.stop(); ui.pageScene = null; }
    $('#view').innerHTML = pages[ui.page](arg);
    after[ui.page] && after[ui.page](arg);
    updateChrome();
    if (changed) { window.scrollTo(0, 0); $('#view').focus({ preventScroll: true }); }
  }

  /* ================= FOCUS ROOM ================= */
  function openFocus(courseId) {
    if (ui.examId) return;
    const r = st().running;
    ui.focusCourse = r ? r.courseId : (courseId != null ? courseId : (ui.focusCourse || (st().courses[0] ? st().courses[0].id : '')));
    ui.focusOpen = true; ui.camOn = !!st().settings.camInFocus;
    $('#focus').hidden = false; document.body.classList.add('no-scroll');
    focusScene = focusScene || new SN.Scene($('#focusCanvas'));
    focusScene.start(st().settings.scene, st().settings.customBg);
    $('#focusUI').innerHTML = `<header class="focus-top"><button class="glass-btn" data-act="focus-close">${icon('x')} Leave</button><div class="focus-tools" id="focusTools"></div></header>
      <div class="focus-stage" id="focusStage"><section class="clock-card glass" id="clockCard"></section><section class="reader glass" id="readerBox" hidden></section></div>
      <aside class="drawer glass" id="drawer" aria-label="Scene and sound settings"></aside>`;
    applyFocusTheme(); renderTools(); renderClock(); renderDrawer();
    Object.entries(st().settings.sounds).forEach(([k, v]) => SN.Sound.play(k, v));
    SN.Sound.setMaster(st().settings.master);
    if (ui.camOn && st().settings.focusMonitor !== false) FocusMonitor.start();
    updateRunPill();
  }
  function closeFocus() {
    ui.focusOpen = false; $('#focus').hidden = true; document.body.classList.remove('no-scroll');
    if (focusScene) focusScene.stop();
    FocusMonitor.stop();
    Cam.stop(); SN.Sound.stopAll();
    ui.focusPanel = null; ui.readerId = null;
    if (ui.readerUrl) { URL.revokeObjectURL(ui.readerUrl); ui.readerUrl = null; }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (ui.page === 'dashboard' || ui.page === 'analytics' || ui.page === 'course') render(); else updateChrome();
  }
  function applyFocusTheme() { const d = SN.SCENES[st().settings.scene]; $('#focusUI').classList.toggle('on-dark', !!(d && d.dark)); }
  function renderTools() {
    const b = (p, ic, l) => `<button class="glass-btn ${ui.focusPanel === p ? 'on' : ''}" data-act="focus-panel" data-p="${p}" aria-expanded="${ui.focusPanel === p}">${icon(ic)}<span>${l}</span></button>`;
    $('#focusTools').innerHTML = b('scenes', 'image', 'Scenes') + b('sounds', 'music', 'Sounds') + b('reader', 'open', 'Read') +
      `<button class="glass-btn ${ui.camOn ? 'on' : ''}" data-act="focus-cam">${icon('camera')}<span>${ui.camOn ? 'Camera on' : 'Camera off'}</span></button>
       <button class="glass-btn" data-act="fullscreen" aria-label="Full screen">${icon('expand')}</button>`;
  }
  function renderClock() {
    const r = st().running, set = st().settings, pomo = set.pomodoro;
    const playing = r && r.segStart;
    const inBreak = r && r.phase === 'break';
    $('#clockCard').innerHTML = `<div class="clock-row">
        <div class="cam-bubble ${ui.camOn ? '' : 'off'}" id="focusCam">${ui.camOn ? '<video playsinline muted autoplay></video><span class="cam-msg">Starting camera</span><i class="live-dot"></i>' : `<button class="cam-off" data-act="focus-cam">${icon('camera')}<span>Camera off</span></button>`}</div>
        <div class="clock-col"><div class="clock-label" id="focusLabel"></div><div class="big-clock" id="focusClock" role="timer">00:00</div><div class="clock-sub" id="focusSub"></div></div></div>
      <div class="focus-controls">
        <select data-change="focus-course" ${r ? 'disabled' : ''} aria-label="Course to study"><option value="">General study</option>${st().courses.map((c) => `<option value="${c.id}" ${c.id === ui.focusCourse ? 'selected' : ''}>${esc(c.code)} ${esc(c.title)}</option>`).join('')}</select>
        <button class="round-btn primary" data-act="focus-toggle" aria-label="${playing ? 'Pause' : 'Start'}">${icon(playing ? 'pause' : 'play')}</button>
        <button class="round-btn" data-act="focus-stop" ${r ? '' : 'disabled'} aria-label="Finish and save">${icon('stop')}</button>
        ${inBreak ? `<button class="glass-btn" data-act="focus-skip">${icon('skip')} Skip break</button>` : ''}
        <label class="toggle"><input type="checkbox" data-change="focus-pomo" ${pomo ? 'checked' : ''}><span>Pomodoro ${set.work}/${set.brk}</span></label>
      </div>`;
    if (ui.camOn) Cam.attach($('#focusCam')); else Cam.stop();
    updateFocusClock();
  }
  function updateFocusClock() {
    if (!ui.focusOpen) return;
    const r = st().running, set = st().settings, el = $('#focusClock'); if (!el) return;
    const c = course(r ? r.courseId : ui.focusCourse), name = c ? c.code : 'general study';
    const goal = +st().profile.dailyGoal || 120, tm = todayMin();
    let big = '00:00', label = `Ready for ${name}`, sub = `Today ${U.fmtMin(tm)} of your ${U.fmtMin(goal)} goal`;
    if (r) {
      const el2 = runElapsedMs();
      if (r.phase === 'break') { big = U.fmtClock((set.brk * 60000 - (now() - r.breakStart)) / 1000); label = 'Break. Stand up, drink some water'; sub = `Session so far ${U.fmtClock(el2 / 1000)}`; }
      else if (set.pomodoro) { big = U.fmtClock((set.work * 60000 - (el2 - r.phaseOffset)) / 1000); label = r.segStart ? `Focusing on ${name}` : 'Paused'; sub = `Session so far ${U.fmtClock(el2 / 1000)}. Today ${U.fmtMin(tm)}`; }
      else { big = U.fmtClock(el2 / 1000); label = r.segStart ? `Studying ${name}` : 'Paused'; }
    } else if (set.pomodoro) big = U.fmtClock(set.work * 60);
    el.textContent = big;
    $('#focusLabel').textContent = label; $('#focusSub').textContent = sub;
  }
  function renderDrawer() {
    const d = $('#drawer'), p = ui.focusPanel;
    d.classList.toggle('open', !!p); d.setAttribute('aria-hidden', String(!p));
    if (!p) { d.innerHTML = ''; return; }
    const head = (t) => `<div class="drawer-head"><h3>${t}</h3><button class="icon-btn sm" data-act="focus-panel" data-p="${p}" aria-label="Close">${icon('x')}</button></div>`;
    if (p === 'scenes') {
      d.innerHTML = head('Scenes') + `<div class="scene-grid">${Object.entries(SN.SCENES).map(([k, v]) => `<button class="scene-tile ${st().settings.scene === k ? 'on' : ''}" data-act="scene" data-s="${k}"><i style="background:${v.swatch}"></i><span>${esc(v.name)}</span></button>`).join('')}</div>
        <p class="small">Scenes bring a matching sound when nothing else is playing. “Your own photo” uses the image link from Settings.</p>`;
    } else if (p === 'sounds') {
      const on = st().settings.sounds;
      d.innerHTML = head('Sounds') + `<div class="field"><span class="lbl">Master volume</span><input type="range" min="0" max="1" step="0.01" value="${st().settings.master}" data-input="snd-master" aria-label="Master volume"></div>
        <ul class="sound-list">${SN.SOUNDS.map((s) => `<li class="${on[s.key] != null ? 'on' : ''}"><button class="snd-toggle" data-act="sound" data-s="${s.key}" aria-pressed="${on[s.key] != null}">${icon(on[s.key] != null ? 'pause' : 'play')}<span>${s.name}</span></button>
          <input type="range" min="0" max="1" step="0.01" value="${on[s.key] != null ? on[s.key] : 0.6}" data-input="snd-vol" data-s="${s.key}" aria-label="${s.name} volume" ${on[s.key] != null ? '' : 'disabled'}></li>`).join('')}</ul>
        <p class="small">Mix several, like rain with a calm pad. Every sound is generated live, so it never loops awkwardly.</p>`;
    } else if (p === 'reader') {
      const c = course(ui.focusCourse);
      d.innerHTML = head('Read while you study') + (c && c.materials.length ? `<ul class="read-list">${c.materials.map((m) => `<li><button class="${ui.readerId === m.id ? 'on' : ''}" data-act="reader-open" data-id="${m.id}">${icon(m.kind === 'link' ? 'link' : 'file')}<span>${esc(m.name)}</span></button></li>`).join('')}</ul>`
        : `<p class="small">${c ? `No materials in ${esc(c.code)} yet. Add them from the course page.` : 'Pick a course first to see its materials.'}</p>`);
    }
  }
  async function renderReader() {
    const box = $('#readerBox'); if (!box) return;
    if (ui.readerUrl) { URL.revokeObjectURL(ui.readerUrl); ui.readerUrl = null; }
    const c = course(ui.focusCourse), m = c && c.materials.find((x) => x.id === ui.readerId);
    $('#focusStage').classList.toggle('with-reader', !!m);
    if (!m) { box.hidden = true; box.innerHTML = ''; return; }
    let url = m.url, note = '';
    if (m.kind === 'file') { const rec = await SN.files.get(m.fileId); if (!rec) { toast('That file is not on this device.'); return; } url = ui.readerUrl = URL.createObjectURL(rec.blob); }
    else if (!(m.kind === 'github' && m.embed)) note = '<p class="small reader-note">Some websites refuse to open inside other pages. If this stays blank, use “Open in new tab”.</p>';
    box.hidden = false;
    box.innerHTML = `<div class="reader-head"><b>${esc(m.name)}</b><div class="btn-row"><a class="glass-btn" href="${url}" target="_blank" rel="noopener">${icon('external')} Open in new tab</a><button class="icon-btn sm" data-act="reader-close" aria-label="Close reader">${icon('x')}</button></div></div>${note}<iframe src="${url}" title="${esc(m.name)}"></iframe>`;
  }

  /* timer engine */
  function startTimer() {
    const s = st(); let r = s.running;
    if (!r) r = s.running = { courseId: ui.focusCourse || '', runStart: now(), segStart: now(), doneMs: 0, phase: 'work', phaseOffset: 0, breakStart: null, beat: now() };
    else if (!r.segStart && r.phase === 'work') r.segStart = now();
    save();
  }
  function pauseTimer() {
    const r = st().running;
    if (r && r.segStart) { addSession(r.courseId, r.segStart, now()); r.doneMs += now() - r.segStart; r.segStart = null; save(); }
  }
  function stopTimer() {
    const r = st().running; if (!r) return;
    pauseTimer();
    const total = r.doneMs; st().running = null; save();
    const c = course(r.courseId);
    if (total >= 30000) { toast(`Saved ${U.fmtMin(total / 60000)}${c ? ' to ' + c.code : ''}. Well done.`); checkBadges(); }
    else toast('Sessions under 30 seconds are not saved.');
  }
  function pomoTick() {
    const r = st().running, set = st().settings;
    if (!r || !set.pomodoro) return;
    if (r.phase === 'work' && r.segStart && runElapsedMs() - r.phaseOffset >= set.work * 60000) {
      pauseTimer(); r.phase = 'break'; r.breakStart = now(); save();
      SN.Sound.chime(2); toast('Time for a break.'); notify('Break time', `${set.brk} minutes. Stretch and rest your eyes.`);
      if (ui.focusOpen) renderClock();
    } else if (r.phase === 'break' && now() - r.breakStart >= set.brk * 60000) endBreak();
  }
  function endBreak() {
    const r = st().running; if (!r) return;
    r.phase = 'work'; r.phaseOffset = runElapsedMs(); r.breakStart = null; r.segStart = now(); save();
    SN.Sound.chime(1); toast('Back to it.');
    if (ui.focusOpen) renderClock();
  }
  function recoverRunning() {
    const r = st().running;
    if (r && r.segStart && r.beat && now() - r.beat > 120000) {
      addSession(r.courseId, r.segStart, r.beat); r.doneMs += r.beat - r.segStart; r.segStart = null; save();
      setTimeout(() => toast('Your timer was paused when the page closed. Open the study room to continue.'), 600);
    }
  }
  function notify(title, body) {
    try { if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification(title, { body }); } catch (e) { /* ignore */ }
  }

  /* ================= EXAM ROOM ================= */
  const attempt = () => { const e = exam(ui.examId); return e && e.attempts.find((a) => a.id === ui.attemptId); };
  function launchExam(id, scheduled) {
    const e = exam(id); if (!e) return;
    if (ui.focusOpen) { pauseTimer(); closeFocus(); }
    closeModal();
    let a = e.attempts.find((x) => x.status === 'running');
    if (!a) {
      a = { id: U.uid(), startedAt: now(), endsAt: scheduled ? examEnd(e) : now() + e.duration * 60000, answers: {}, selfMarks: {}, switches: 0, status: 'running', scheduled: !!scheduled };
      e.attempts.push(a); save();
    }
    if (scheduled) { e.launchedFor = e.startAt; save(); }
    ui.examId = id; ui.attemptId = a.id;
    $('#examRoom').hidden = false; document.body.classList.add('no-scroll');
    examScene = examScene || new SN.Scene($('#examCanvas'));
    examScene.start(st().settings.scene === 'custom' ? 'snow' : st().settings.scene, st().settings.customBg);
    renderExamUI();
    if (e.camera) { Cam.attach($('#examCam')); if (st().settings.focusMonitor !== false) FocusMonitor.start(); }
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().catch(() => {});
    SN.Sound.chime(1);
    notify('Exam started', e.title);
  }
  function renderExamUI() {
    const e = exam(ui.examId), a = attempt(), c = course(e.courseId);
    const dark = SN.SCENES[st().settings.scene] && SN.SCENES[st().settings.scene].dark;
    const qs = e.questions;
    $('#examUI').className = 'exam-ui' + (dark ? ' on-dark' : '');
    $('#examUI').innerHTML = `<header class="exam-bar glass">
        <div class="exam-id">${chip(c)}<div><b>${esc(e.title)}</b><small id="examProgress"></small></div></div>
        <div class="exam-center">${e.camera ? `<div class="cam-bubble small" id="examCam"><video playsinline muted autoplay></video><span class="cam-msg">Starting camera</span><i class="live-dot"></i></div>` : ''}
          <div><div class="exam-clock" id="examClock" role="timer">--:--</div><small class="clock-cap">time left</small></div></div>
        <div class="exam-side"><span class="integrity" id="examSwitches">${a.switches} tab switch${a.switches === 1 ? '' : 'es'}</span><button class="btn btn-primary" data-act="exam-submit">Submit answers</button></div>
      </header>
      <main class="exam-paper glass" tabindex="-1">
        ${e.instructions ? `<div class="exam-instr">${nl2br(esc(e.instructions))}</div>` : ''}
        ${e.materialId ? `<button class="btn" data-act="exam-paper">${icon('open')} Open question paper</button>` : ''}
        ${qs.length ? qs.map((q, i) => `<article class="q"><div class="q-head"><b>Question ${i + 1}</b><small>${q.marks} mark${q.marks == 1 ? '' : 's'}</small></div><p class="q-text">${nl2br(esc(q.text))}</p>
          ${q.type === 'mcq' ? `<div class="q-opts" role="radiogroup">${q.options.map((o, j) => `<label class="q-opt"><input type="radio" name="a${q.id}" value="${j}" ${a.answers[q.id] === j ? 'checked' : ''} data-change="ans-mcq" data-q="${q.id}"><span>${esc(o)}</span></label>`).join('')}</div>`
            : `<textarea rows="6" data-input="ans" data-q="${q.id}" placeholder="Write your answer" aria-label="Answer to question ${i + 1}">${esc(a.answers[q.id] || '')}</textarea>`}</article>`).join('')
          : `<article class="q"><div class="q-head"><b>Answer sheet</b></div><textarea rows="18" data-input="ans" data-q="sheet" placeholder="Write your answers here" aria-label="Answer sheet">${esc(a.answers.sheet || '')}</textarea></article>`}
        <div class="exam-end"><button class="btn btn-primary btn-lg" data-act="exam-submit">Submit answers</button></div>
      </main>`;
    updateExamProgress();
  }
  function updateExamProgress() {
    const e = exam(ui.examId), a = attempt(), el = $('#examProgress'); if (!e || !a || !el) return;
    const n = e.questions.length;
    el.textContent = n ? `${e.questions.filter((q) => a.answers[q.id] != null && a.answers[q.id] !== '').length} of ${n} answered` : 'Answer sheet';
  }
  function updateExamClock() {
    const a = attempt(), el = $('#examClock'); if (!a || !el) return;
    const left = a.endsAt - now();
    el.textContent = U.fmtClock(left / 1000);
    el.classList.toggle('low', left < 5 * 60000);
    if (left <= 0) submitExam(true);
  }
  function gradeAttempt(e, a) {
    let score = 0, total = 0;
    e.questions.forEach((q) => {
      total += +q.marks || 0;
      if (q.type === 'mcq') { if (a.answers[q.id] === q.answer) score += +q.marks || 0; }
      else if (a.selfMarks[q.id] != null) score += Math.min(+q.marks || 0, +a.selfMarks[q.id] || 0);
    });
    a.score = e.questions.length ? score : null; a.total = total;
  }
  function submitExam(auto) {
    const e = exam(ui.examId), a = attempt(); if (!e || !a) return;
    a.status = 'done'; a.submittedAt = Math.min(now(), a.endsAt);
    gradeAttempt(e, a);
    addSession(e.courseId, a.startedAt, a.submittedAt, 'exam');
    save(); S.flush();
    ui.examId = null; ui.attemptId = null;
    $('#examRoom').hidden = true; document.body.classList.remove('no-scroll');
    if (examScene) examScene.stop();
    FocusMonitor.stop();
    Cam.stop();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    SN.Sound.chime(auto ? 2 : 1);
    checkBadges();
    location.hash = '#/exams'; render();
    reviewModal(e, a, auto);
  }
  function reviewModal(e, a, auto) {
    const written = e.questions.filter((q) => q.type === 'text');
    openModal(`<h2>${auto ? 'Time is up' : 'Submitted'}: ${esc(e.title)}</h2>
      <p class="muted">${a.score != null ? `Score <b>${+a.score.toFixed(2)} of ${a.total}</b>.` : 'Your answer sheet is saved.'} Time used ${U.fmtMin((a.submittedAt - a.startedAt) / 60000)}. ${a.switches ? `You left the exam tab ${a.switches} time${a.switches > 1 ? 's' : ''}.` : 'You stayed on the exam tab the whole time.'}</p>
      <div class="review">${e.questions.map((q, i) => {
        if (q.type === 'mcq') { const ok = a.answers[q.id] === q.answer; return `<div class="rv ${ok ? 'right' : 'wrong'}"><b>Q${i + 1}.</b> ${esc(q.text)}<p class="small">${a.answers[q.id] != null ? `Your answer: ${esc(q.options[a.answers[q.id]] || '')}. ` : 'Not answered. '}${ok ? 'Correct.' : `Correct answer: ${esc(q.options[q.answer] || '')}.`}</p></div>`; }
        return `<div class="rv"><b>Q${i + 1}.</b> ${esc(q.text)}<blockquote>${nl2br(esc(a.answers[q.id] || 'Not answered'))}</blockquote>
          <label class="inline-sel">Your mark <input type="number" min="0" max="${q.marks}" step="0.5" value="${a.selfMarks[q.id] ?? ''}" data-change="self-mark" data-e="${e.id}" data-a="${a.id}" data-q="${q.id}"> of ${q.marks}</label></div>`;
      }).join('')}${!e.questions.length ? `<blockquote>${nl2br(esc(a.answers.sheet || 'Empty'))}</blockquote>` : ''}</div>
      ${written.length ? '<p class="small muted">Mark your written answers honestly against your notes. The score updates as you go.</p>' : ''}
      <div class="modal-actions"><button class="btn btn-primary" data-act="modal-close">Done</button></div>`, 'wide');
  }
  function examScheduler() {
    if (ui.examId) return;
    const t = now();
    for (const e of st().exams) {
      const running = e.attempts.find((a) => a.status === 'running');
      if (running) { if (running.endsAt > t) { launchExam(e.id, running.scheduled); return; } ui.examId = e.id; ui.attemptId = running.id; submitExam(true); return; }
      if (!e.warned && e.startAt - t < 5 * 60000 && e.startAt > t) { e.warned = true; save(); toast(`${e.title} starts in 5 minutes.`); notify('Exam in 5 minutes', e.title); }
      if (t >= e.startAt && t < examEnd(e) && e.launchedFor !== e.startAt) { launchExam(e.id, true); return; }
    }
  }

  /* ================= SHARING ================= */
  function shareModal(ids) {
    ui.shareCourses = ids;
    const o = ui.shareOpts, list = ids.map(course).filter(Boolean);
    openModal(`<h2>Share ${list.length === 1 ? esc(list[0].code) : list.length + ' courses'}</h2>
      <p class="muted small">Anyone with the link can copy these into their own Shikhor. Your study time and exams are never included.</p>
      <label class="check-line"><input type="checkbox" ${o.marks ? 'checked' : ''} data-change="share-opt" data-f="marks"> Include my marks</label>
      <label class="check-line"><input type="checkbox" ${o.progress ? 'checked' : ''} data-change="share-opt" data-f="progress"> Include which topics I finished</label>
      <label class="check-line"><input type="checkbox" ${o.materials ? 'checked' : ''} data-change="share-opt" data-f="materials"> Include material links <em class="muted">(files saved only on this device can't be shared)</em></label>
      <div id="shareOut"></div>
      <div class="modal-actions"><button class="btn" data-act="share-download">${icon('download')} Download file</button><button class="btn btn-primary" data-act="share-make">${icon('link')} Create link</button></div>`);
  }
  function sharePayload() {
    const o = ui.shareOpts;
    return {
      app: 'shikhor', v: 1, type: 'courses', from: st().profile.name || '',
      courses: ui.shareCourses.map(course).filter(Boolean).map((c) => ({
        code: c.code, title: c.title, credit: c.credit, color: c.color,
        syllabus: c.syllabus.map((t) => (t.section ? { t: t.title, s: 1 } : o.progress && t.done ? { t: t.title, d: 1 } : { t: t.title })),
        marks: o.marks ? c.marks : undefined,
        materials: o.materials ? c.materials.filter((m) => m.kind !== 'file').map((m) => ({ name: m.name, kind: m.kind, url: m.kind === 'github' ? m.htmlUrl : m.url })) : []
      }))
    };
  }
  function importCourses(d) {
    d.courses.forEach((x, i) => {
      st().courses.push({
        id: U.uid(), code: String(x.code || 'NEW').slice(0, 20), title: String(x.title || 'Shared course').slice(0, 120), credit: +x.credit || 3,
        color: /^#[0-9a-f]{6}$/i.test(x.color) ? x.color : U.COLORS[i % U.COLORS.length],
        syllabus: (x.syllabus || []).map((t) => ({ id: U.uid(), title: String(t.t || ''), section: !!t.s, done: !!t.d, doneAt: t.d ? now() : null })),
        marks: U.deepMerge(C.defaultMarks(), x.marks || {}),
        materials: (x.materials || []).filter((m) => /^https?:\/\//.test(m.url || '')).map((m) => ({ id: U.uid(), kind: 'link', name: String(m.name || m.url), url: m.url, addedAt: now() })),
        createdAt: now()
      });
    });
    save();
  }

  /* ================= SAMPLE DATA ================= */
  function loadSample() {
    const s = st(); const ct = (l, g, m) => ({ id: U.uid(), label: l, got: g, max: m });
    const mk = (code, title, color, topics, doneN, cts) => {
      const syl = topics.map((t) => ({ id: U.uid(), title: t.replace(/^#\s*/, ''), section: t.startsWith('#'), done: false, doneAt: null }));
      let n = 0; syl.forEach((t) => { if (!t.section && n < doneN) { t.done = true; t.doneAt = now() - Math.random() * 20 * 864e5; n++; } });
      return { id: U.uid(), code, title, credit: 3, color, sample: true, syllabus: syl, marks: { ...C.defaultMarks(), cts }, materials: [], createdAt: now() };
    };
    const c1 = mk('OR 101', 'Operations Research', U.COLORS[0], ['# Linear programming', 'Formulating LP models', 'Graphical method', 'Simplex method', 'Duality', 'Sensitivity analysis', '# Networks', 'Transportation problem', 'Assignment problem', 'Shortest path', 'CPM and PERT', '# Decisions', 'Decision trees', 'Game theory basics', 'Queueing models'], 7, [ct('CT 1', 17, 20), ct('CT 2', 14, 20), ct('CT 3', 18, 20)]);
    const c2 = mk('QC 102', 'Quality Control', U.COLORS[2], ['# Foundations', 'Quality dimensions', 'Cost of quality', '# Statistical process control', 'Control charts for variables', 'Control charts for attributes', 'Process capability', '# Acceptance sampling', 'Single sampling plans', 'OC curves', '# Improvement', 'Six Sigma and DMAIC', 'Design of experiments'], 4, [ct('CT 1', 15, 20), ct('CT 2', 16, 20)]);
    const c3 = mk('DS 103', 'Data Science for Engineers', U.COLORS[5], ['Python refresher', 'Data cleaning', 'Exploratory analysis', 'Regression', 'Classification', 'Model evaluation', 'Clustering', 'Time series', 'Explainability with SHAP'], 6, [ct('CT 1', 19, 20)]);
    c2.marks.expectedFinal = 62; c3.marks.expectedFinal = 78;
    s.courses.push(c1, c2, c3);
    const hours = [6, 9, 10, 14, 16, 20, 21, 22, 23];
    for (let d = 45; d >= 1; d--) {
      if (Math.random() > 0.72) continue;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const st0 = new Date(); st0.setDate(st0.getDate() - d); st0.setHours(hours[Math.floor(Math.random() * hours.length)], Math.floor(Math.random() * 50), 0, 0);
        const min = 20 + Math.random() * 90, cc = [c1, c2, c3][Math.floor(Math.random() * 3)];
        s.sessions.push({ id: U.uid(), courseId: cc.id, start: st0.getTime(), end: st0.getTime() + min * 60000, min, kind: 'study', sample: true });
      }
    }
    const ex = newDraft(c1.id); delete ex.isNew;
    const dd = new Date(); dd.setDate(dd.getDate() + 2); dd.setHours(10, 0, 0, 0);
    Object.assign(ex, { title: 'Mock CT 4: Duality', startAt: dd.getTime(), duration: 30, sample: true, instructions: 'Answer all questions. Multiple choice is marked automatically.',
      questions: [
        { id: U.uid(), type: 'mcq', text: 'The dual of a maximisation problem with ≤ constraints is', options: ['A minimisation problem with ≥ constraints', 'A maximisation problem with ≥ constraints', 'A minimisation problem with ≤ constraints', 'Always infeasible'], answer: 0, marks: 1 },
        { id: U.uid(), type: 'mcq', text: 'If the primal has an unbounded objective, the dual is', options: ['Unbounded', 'Infeasible', 'Degenerate', 'Optimal at the origin'], answer: 1, marks: 1 },
        { id: U.uid(), type: 'mcq', text: 'The shadow price of a constraint equals', options: ['Its slack value', 'The optimal value of the matching dual variable', 'Its right-hand side', 'The reduced cost of the entering variable'], answer: 1, marks: 1 },
        { id: U.uid(), type: 'text', text: 'Explain, with a small example, why the simplex method moves between adjacent corner points.', options: [], answer: null, marks: 5 }
      ] });
    s.exams.push(ex);
    s.badgesSeen = Array.from(new Set(s.badgesSeen.concat(earnedBadges())));
    save();
  }

  /* ================= ACTIONS ================= */
  const A = {};
  A['open-course'] = (el) => { ui.courseTab = 'syllabus'; location.hash = '#/course/' + el.dataset.id; };
  A['modal-close'] = closeModal;
  A['confirm-yes'] = () => { const r = confirmResolve; confirmResolve = null; closeModal(); r && r(true); };
  A['confirm-no'] = () => closeModal();
  A['ob-start'] = () => {
    const n = $('#obName').value.trim(); if (!n) { $('#obName').focus(); toast('Add your name to begin.'); return; }
    st().profile.name = n; st().profile.university = $('#obUni').value.trim(); save(); S.flush(); render();
  };
  A['ob-sample'] = () => { st().profile.name = ($('#obName').value.trim()) || 'Student'; st().profile.university = $('#obUni').value.trim(); loadSample(); S.flush(); render(); toast('Sample courses added. Remove them any time in Settings.'); };

  /* courses */
  A['course-new'] = () => openModal(courseForm(null));
  A['course-edit'] = (el) => openModal(courseForm(course(el.dataset.id)));
  A['course-save'] = (el) => {
    const code = $('#cfCode').value.trim(), title = $('#cfTitle').value.trim();
    if (!code) { $('#cfCode').focus(); toast('Add a course code.'); return; }
    const color = ($('input[name=cfColor]:checked') || {}).value || U.COLORS[0], credit = parseFloat($('#cfCredit').value) || 3;
    if (el.dataset.id) Object.assign(course(el.dataset.id), { code, title, color, credit });
    else {
      const c = { id: U.uid(), code, title: title || code, credit, color, syllabus: parseTopics($('#cfSyl').value), marks: C.defaultMarks(), materials: [], createdAt: now() };
      st().courses.push(c); ui.courseTab = 'syllabus'; location.hash = '#/course/' + c.id;
    }
    save(); closeModal(); render();
  };
  A['course-del'] = async (el) => {
    const c = course(el.dataset.id);
    if (!(await confirmBox(`Delete ${c.code}?`, 'Its syllabus, marks and materials will be removed. Your study time stays in your history.'))) return;
    c.materials.filter((m) => m.kind === 'file').forEach((m) => SN.files.del(m.fileId).catch(() => {}));
    st().courses = st().courses.filter((x) => x.id !== c.id); save(); location.hash = '#/courses';
  };
  A['course-tab'] = (el) => { ui.courseTab = el.dataset.t; render(); };
  A['topic-add'] = () => {
    const inp = $('#topicIn'), v = inp.value.trim(); if (!v) return;
    course(ui.arg).syllabus.push(...parseTopics(v)); save(); render(); setTimeout(() => $('#topicIn') && $('#topicIn').focus(), 0);
  };
  A['topic-bulk'] = () => openModal(`<h2>Paste your syllabus</h2><p class="muted small">One topic per line. Start a line with # for a chapter heading.</p><textarea id="bulkTopics" rows="12" placeholder="# Chapter 1&#10;Topic one&#10;Topic two"></textarea><div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-act="topic-bulk-save">Add topics</button></div>`);
  A['topic-bulk-save'] = () => { const t = parseTopics($('#bulkTopics').value); course(ui.arg).syllabus.push(...t); save(); closeModal(); render(); toast(`${t.filter((x) => !x.section).length} topics added.`); };
  A['topic-toggle'] = (el) => {
    const c = course(ui.arg), t = c.syllabus.find((x) => x.id === el.dataset.id);
    t.done = !t.done; t.doneAt = t.done ? now() : null; save();
    if (t.done) {
      const r = el.getBoundingClientRect(), k = sylStats(c);
      if (k.done === k.total) { confetti(innerWidth / 2, innerHeight / 3, true); toast(`Summit reached. ${c.code} syllabus finished.`); checkBadges(); }
      else confetti(r.left + r.width / 2, r.top + r.height / 2);
    }
    render();
  };
  A['topic-edit'] = (el) => { const t = course(ui.arg).syllabus.find((x) => x.id === el.dataset.id); openModal(`<h2>Rename</h2><input id="topicName" value="${esc(t.title)}" data-enter="topic-edit-save" data-id="${t.id}"><div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-act="topic-edit-save" data-id="${t.id}">Save</button></div>`); };
  A['topic-edit-save'] = (el) => { const t = course(ui.arg).syllabus.find((x) => x.id === el.dataset.id); const v = $('#topicName').value.trim(); if (v) t.title = v; save(); closeModal(); render(); };
  A['topic-del'] = (el) => { const c = course(ui.arg); c.syllabus = c.syllabus.filter((x) => x.id !== el.dataset.id); save(); render(); };
  A['topic-up'] = (el) => { const s = course(ui.arg).syllabus, i = s.findIndex((x) => x.id === el.dataset.id); if (i > 0) { [s[i - 1], s[i]] = [s[i], s[i - 1]]; save(); render(); } };
  A['ct-add'] = () => { const m = course(ui.arg).marks; m.cts.push({ id: U.uid(), label: 'CT ' + (m.cts.length + 1), got: '', max: 20 }); save(); render(); };
  A['ct-del'] = (el) => { course(ui.arg).marks.cts.splice(+el.dataset.i, 1); save(); render(); };

  /* materials */
  async function addFiles(courseId, list) {
    const c = course(courseId); if (!c || !list.length) return;
    let n = 0;
    for (const f of list) {
      const id = U.uid();
      try { await SN.files.put({ id, name: f.name, blob: f }); c.materials.push({ id: U.uid(), kind: 'file', name: f.name, size: f.size, mime: f.type, fileId: id, addedAt: now() }); n++; }
      catch (e) { toast(`Could not save ${f.name}. The browser may be out of space.`); }
    }
    save(); render(); if (n) toast(`${n} file${n > 1 ? 's' : ''} added.`);
  }
  A['mat-upload'] = async () => addFiles(ui.arg, await pickFiles());
  A['mat-link'] = () => openModal(`<h2>Add a link</h2><label class="field"><span>Name</span><input id="lnName" placeholder="e.g. Lecture 5 slides (Google Drive)"></label><label class="field"><span>Link</span><input id="lnUrl" placeholder="https://" data-enter="mat-link-save"></label><div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-act="mat-link-save">Add link</button></div>`);
  A['mat-link-save'] = () => {
    let url = $('#lnUrl').value.trim(); if (!url) return; if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    course(ui.arg).materials.push({ id: U.uid(), kind: 'link', name: $('#lnName').value.trim() || url, url, addedAt: now() }); save(); closeModal(); render();
  };
  A['mat-open'] = async (el) => {
    const m = course(ui.arg).materials.find((x) => x.id === el.dataset.id);
    if (m.kind === 'file') {
      const rec = await SN.files.get(m.fileId); if (!rec) { toast('This file is not on this device.'); return; }
      viewer(m.name, URL.createObjectURL(rec.blob), true, rec.blob.type || m.mime);
    } else if (m.kind === 'github' && m.embed) viewer(m.name, m.url, false, m.mime);
    else window.open(m.htmlUrl || m.url, '_blank', 'noopener');
  };
  function viewer(title, url, isBlob, mime) {
    if (isBlob) ui.viewerUrl = url;
    const canEmbed = !mime || /pdf|image|text|video|audio/.test(mime);
    openModal(`<div class="viewer-head"><h2>${esc(title)}</h2><div class="btn-row"><a class="btn sm" href="${url}" ${isBlob ? `download="${esc(title)}"` : 'target="_blank" rel="noopener"'}>${icon(isBlob ? 'download' : 'external')} ${isBlob ? 'Download' : 'Open in new tab'}</a><button class="icon-btn" data-act="modal-close" aria-label="Close">${icon('x')}</button></div></div>
      ${canEmbed ? `<iframe class="viewer-frame" src="${url}" title="${esc(title)}"></iframe>` : `<p class="muted">This file type can’t be previewed in the browser. Download it to open.</p>`}`, 'wide viewer');
  }
  A['mat-read'] = (el) => { const id = el.dataset.id; openFocus(ui.arg); ui.readerId = id; ui.focusPanel = null; renderDrawer(); renderTools(); renderReader(); };
  A['mat-del'] = (el) => {
    const c = course(ui.arg), m = c.materials.find((x) => x.id === el.dataset.id);
    if (m.kind === 'file') SN.files.del(m.fileId).catch(() => {});
    c.materials = c.materials.filter((x) => x.id !== m.id); save(); render();
  };

  /* GitHub browser */
  async function ghLoad(path) {
    ui.gh.path = path; ui.gh.loading = true; ui.gh.error = null; ghRender();
    try { ui.gh.items = await ghList(path); } catch (e) { ui.gh.error = e.message; ui.gh.items = []; }
    ui.gh.loading = false; ghRender();
  }
  function ghRender() {
    const g = ui.gh; if (!g) return;
    const c = course(g.courseId), have = new Set(c.materials.map((m) => m.path));
    const files = (g.items || []).filter((i) => i.type === 'file');
    openModal(`<div class="viewer-head"><h2>Add from GitHub</h2><button class="icon-btn" data-act="modal-close" aria-label="Close">${icon('x')}</button></div>
      <p class="crumbs">${icon('folder')} <b>${esc(st().github.owner)}/${esc(st().github.repo)}</b> / ${esc(g.path || '')} ${g.path ? `<button class="link" data-act="gh-up">Up one folder</button>` : ''}</p>
      ${g.loading ? '<p class="muted">Loading files…</p>' : g.error ? `<p class="error">${esc(g.error)}</p><a class="btn sm" href="#/settings" data-act="modal-close">Open Settings</a>` :
        `<ul class="gh-list">${g.items.map((it) => it.type === 'dir'
          ? `<li><button class="gh-dir" data-act="gh-enter" data-p="${esc(it.path)}">${icon('folder')}<span>${esc(it.name)}</span></button></li>`
          : `<li><span class="gh-file">${icon('file')}<span>${esc(it.name)}<small>${U.fmtSize(it.size)}</small></span></span>${have.has(it.path) ? '<span class="tag">Added</span>' : `<button class="btn sm" data-act="gh-add" data-p="${esc(it.path)}">Add</button>`}</li>`).join('') || '<li class="muted">This folder is empty.</li>'}</ul>
        ${files.length ? `<div class="modal-actions"><button class="btn btn-primary" data-act="gh-add-all">Add all ${files.length} files here</button></div>` : ''}`}`, 'wide');
  }
  A['gh-browse'] = async () => {
    const c = course(ui.arg), g = st().github;
    ui.gh = { courseId: c.id, path: '', items: null };
    const sub = (g.path || '').replace(/\/+$/, '') + '/' + c.code.replace(/\s+/g, '');
    ui.gh.path = sub; ui.gh.loading = true; ghRender();
    try { ui.gh.items = await ghList(sub); ui.gh.loading = false; ghRender(); }
    catch (e) { if (ui.gh) ghLoad((g.path || '').replace(/\/+$/, '')); }
  };
  A['gh-enter'] = (el) => ghLoad(el.dataset.p);
  A['gh-up'] = () => ghLoad(ui.gh.path.split('/').slice(0, -1).join('/'));
  A['gh-add'] = (el) => { const it = ui.gh.items.find((i) => i.path === el.dataset.p); course(ui.gh.courseId).materials.push(ghMaterial(it)); save(); ghRender(); };
  A['gh-add-all'] = () => {
    const c = course(ui.gh.courseId), have = new Set(c.materials.map((m) => m.path));
    const add = ui.gh.items.filter((i) => i.type === 'file' && !have.has(i.path));
    add.forEach((it) => c.materials.push(ghMaterial(it))); save(); closeModal(); render(); toast(`${add.length} file${add.length === 1 ? '' : 's'} added from GitHub.`);
  };
  A['gh-test'] = async () => {
    const out = $('#ghStatus'); out.textContent = 'Checking…'; S.flush();
    try { const items = await ghList(st().github.path || ''); out.textContent = `Connected. Found ${items.length} item${items.length === 1 ? '' : 's'} in “${st().github.path || '/'}”.`; out.className = 'small ok'; }
    catch (e) { out.textContent = e.message; out.className = 'small error'; }
  };

  /* sharing */
  A['share-open'] = (el) => shareModal(el.dataset.id ? [el.dataset.id] : st().courses.map((c) => c.id));
  A['share-make'] = async () => {
    const link = location.origin + location.pathname + '#/import/' + (await pack(sharePayload()));
    $('#shareOut').innerHTML = `<label class="field"><span>Share link</span><textarea id="shareLink" rows="3" readonly>${esc(link)}</textarea></label>
      <div class="btn-row"><button class="btn sm" data-act="copy-link">${icon('copy')} Copy link</button>${navigator.share ? `<button class="btn sm" data-act="share-native">${icon('share')} Send</button>` : ''}</div>
      ${link.length > 8000 ? '<p class="small muted">This link is long. Some chat apps cut long links, so “Download file” may be safer.</p>' : ''}`;
  };
  A['copy-link'] = async () => { const t = $('#shareLink'); try { await navigator.clipboard.writeText(t.value); toast('Link copied.'); } catch (e) { t.select(); document.execCommand('copy'); toast('Link copied.'); } };
  A['share-native'] = () => navigator.share({ title: 'Shikhor courses', url: $('#shareLink').value }).catch(() => {});
  A['share-download'] = () => { const p = sharePayload(); download(`shikhor-${p.courses.map((c) => c.code.replace(/\s+/g, '')).join('-').slice(0, 40)}.json`, JSON.stringify(p, null, 1)); };
  A['courses-import'] = async () => {
    const [f] = await pickFiles('.json,application/json', false); if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (d.app === 'shikhor' && d.type === 'courses') { ui.importArg = 'file'; ui.importData = d; ui.importError = null; location.hash = '#/import/file'; render(); }
      else if (d.app === 'shikhor' && d.type === 'backup') toast('That is a full backup. Restore it from Settings.');
      else throw new Error();
    } catch (e) { toast('That file is not a Shikhor course file.'); }
  };
  A['import-accept'] = () => { const n = ui.importData.courses.length; importCourses(ui.importData); ui.importData = null; ui.importArg = null; location.hash = '#/courses'; toast(`${n} course${n > 1 ? 's' : ''} added.`); };

  /* focus room */
  A['focus-open'] = (el) => openFocus(el.dataset.course != null ? el.dataset.course : undefined);
  A['focus-close'] = closeFocus;
  A['focus-panel'] = (el) => { ui.focusPanel = ui.focusPanel === el.dataset.p ? null : el.dataset.p; renderTools(); renderDrawer(); };
  A['focus-toggle'] = () => {
    const r = st().running;
    if (r && r.phase === 'break') { endBreak(); return; }
    if (r && r.segStart) pauseTimer(); else { startTimer(); SN.Sound.ensure(); }
    renderClock(); updateRunPill();
  };
  A['focus-stop'] = () => { stopTimer(); renderClock(); };
  A['focus-skip'] = endBreak;
  A['focus-cam'] = () => {
    ui.camOn = !ui.camOn; renderTools(); renderClock();
    if (ui.camOn && st().settings.focusMonitor !== false) FocusMonitor.start();
    else FocusMonitor.stop();
  };
  A['fullscreen'] = () => { if (document.fullscreenElement) document.exitFullscreen(); else $('#focus').requestFullscreen && $('#focus').requestFullscreen().catch(() => toast('Full screen is not available here.')); };
  A['scene'] = (el) => {
    const k = el.dataset.s, set = st().settings;
    if (k === 'custom' && !set.customBg) { toast('Add an image link in Settings first, under Focus room.'); }
    set.scene = k; save(); focusScene.start(k, set.customBg); applyFocusTheme(); renderDrawer();
    const snd = SN.SCENES[k].sound;
    if (snd && !Object.keys(set.sounds).length) { set.sounds[snd] = 0.6; SN.Sound.play(snd, 0.6); save(); }
  };
  A['sound'] = (el) => {
    const k = el.dataset.s, on = st().settings.sounds;
    if (on[k] != null) { SN.Sound.stop(k); delete on[k]; } else { on[k] = 0.6; SN.Sound.play(k, 0.6); }
    save(); renderDrawer();
  };
  A['reader-open'] = (el) => { ui.readerId = el.dataset.id; renderDrawer(); renderReader(); };
  A['reader-close'] = () => { ui.readerId = null; renderReader(); if (ui.focusPanel === 'reader') renderDrawer(); };

  /* exams */
  A['exam-new'] = () => { ui.examDraft = newDraft(ui.page === 'course' ? ui.arg : ''); location.hash = '#/exam/' + ui.examDraft.id; };
  A['q-add'] = (el) => { ui.examDraft.questions.push(el.dataset.t === 'mcq' ? { id: U.uid(), type: 'mcq', text: '', options: ['', '', '', ''], answer: 0, marks: 1 } : { id: U.uid(), type: 'text', text: '', options: [], answer: null, marks: 5 }); render(); };
  A['q-del'] = (el) => { ui.examDraft.questions.splice(+el.dataset.q, 1); render(); };
  A['q-type'] = (el) => { const q = ui.examDraft.questions[+el.dataset.q]; q.type = el.dataset.t; if (q.type === 'mcq' && !q.options.length) { q.options = ['', '', '', '']; q.answer = 0; } render(); };
  A['q-opt-add'] = (el) => { ui.examDraft.questions[+el.dataset.q].options.push(''); render(); };
  A['q-opt-del'] = (el) => { const q = ui.examDraft.questions[+el.dataset.q], j = +el.dataset.o; q.options.splice(j, 1); if (q.answer >= q.options.length) q.answer = Math.max(0, q.options.length - 1); render(); };
  A['q-bulk'] = () => openModal(`<h2>Paste questions</h2><p class="muted small">Leave a blank line between questions. Start options with a dash and put * after the correct one. Add marks in brackets at the end of a question. Questions without options become written questions.</p>
    <textarea id="bulkQ" rows="12" placeholder="Which method solves LP problems with many variables? (2)&#10;- Graphical method&#10;- Simplex method *&#10;- Trial and error&#10;&#10;Explain duality with an example. (5)"></textarea>
    <div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-act="q-bulk-save">Add questions</button></div>`, 'wide');
  A['q-bulk-save'] = () => { const qs = parseQuestions($('#bulkQ').value); ui.examDraft.questions.push(...qs); closeModal(); render(); toast(`${qs.length} question${qs.length === 1 ? '' : 's'} added.`); };
  A['exam-save'] = () => {
    const d = ui.examDraft;
    if (!d.title.trim()) { toast('Give the exam a title.'); return; }
    if (!(d.duration > 0)) { toast('Set a duration of at least 1 minute.'); return; }
    const bad = d.questions.findIndex((q) => !q.text.trim() || (q.type === 'mcq' && q.options.filter((o) => o.trim()).length < 2));
    if (bad >= 0) { toast(`Question ${bad + 1} needs text${d.questions[bad].type === 'mcq' ? ' and at least two options' : ''}.`); return; }
    d.questions.forEach((q) => { if (q.type === 'mcq') { const keep = q.options.map((o, j) => [o.trim(), j]).filter(([o]) => o); const ans = keep.findIndex(([, j]) => j === q.answer); q.options = keep.map(([o]) => o); q.answer = Math.max(0, ans); } });
    const isNew = d.isNew; delete d.isNew; d.warned = d.startAt - now() < 5 * 60000 ? d.warned : false;
    const i = st().exams.findIndex((e) => e.id === d.id);
    if (i >= 0) st().exams[i] = d; else st().exams.push(d);
    save(); ui.examDraft = null;
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
    toast(isNew ? `Scheduled for ${fmtDT(d.startAt)}.` : 'Exam saved.');
    location.hash = '#/exams';
  };
  A['exam-del'] = async (el) => { const e = exam(el.dataset.id); if (await confirmBox(`Delete “${e.title}”?`, 'Its questions and past attempts will be removed.')) { st().exams = st().exams.filter((x) => x.id !== e.id); save(); render(); } };
  A['exam-start'] = (el) => { const e = exam(el.dataset.id); const live = e.startAt <= now() && examEnd(e) > now() && e.launchedFor !== e.startAt; launchExam(e.id, live); };
  A['exam-submit'] = async () => {
    const e = exam(ui.examId), a = attempt();
    const left = e.questions.filter((q) => a.answers[q.id] == null || a.answers[q.id] === '').length;
    if (!(await confirmBox('Submit your answers?', left ? `${left} question${left > 1 ? 's are' : ' is'} still unanswered.` : 'You cannot change them after submitting.', 'Submit', false))) return;
    submitExam(false);
  };
  A['exam-paper'] = async () => {
    const e = exam(ui.examId), c = course(e.courseId), m = c && c.materials.find((x) => x.id === e.materialId);
    if (!m) { toast('The question paper was removed from the course.'); return; }
    if (m.kind === 'file') { const rec = await SN.files.get(m.fileId); if (rec) viewer(m.name, URL.createObjectURL(rec.blob), true, rec.blob.type || m.mime); }
    else if (m.kind === 'github' && m.embed) viewer(m.name, m.url, false, m.mime); else window.open(m.htmlUrl || m.url, '_blank', 'noopener');
  };
  A['exam-review'] = (el) => { const e = exam(el.dataset.id); const a = e.attempts.filter((x) => x.status === 'done').pop(); reviewModal(e, a, false); };

  /* privacy */
  A['unlock'] = (el) => {
    const inp = el.closest('.locked').querySelector('input');
    if (inp.value === st().settings.pin) { ui.unlocked = true; render(); } else { inp.value = ''; inp.focus(); toast('That PIN is not right.'); }
  };
  A['lock-now'] = () => { ui.unlocked = false; render(); };
  A['toggle-blur'] = () => { st().settings.blurStats = !st().settings.blurStats; save(); render(); };
  A['pin-set'] = () => { const v = $('#pinNew').value.trim(); if (!/^\d{4,8}$/.test(v)) { toast('Use 4 to 8 digits.'); return; } st().settings.pin = v; ui.unlocked = true; save(); render(); toast('PIN set. Your charts lock when you reload the page.'); };
  A['pin-clear'] = async () => { if (await confirmBox('Remove your PIN?', 'Anyone using this browser will be able to see your charts.', 'Remove PIN')) { st().settings.pin = ''; save(); render(); } };

  /* profile */
  A['avatar-pick'] = async () => { const [f] = await pickFiles('image/*', false); if (!f) return; try { st().profile.avatar = await readImage(f, 256); save(); S.flush(); render(); } catch (e) { toast('That image could not be read.'); } };
  A['avatar-remove'] = () => { st().profile.avatar = ''; save(); render(); };
  A['profile-add'] = () => openModal(`<h2>Add a profile</h2><label class="field"><span>Name</span><input id="newProf" data-enter="profile-add-save"></label><div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn btn-primary" data-act="profile-add-save">Add and switch</button></div>`);
  A['profile-add-save'] = () => { const n = $('#newProf').value.trim(); if (!n) return; if (st().running) stopTimer(); S.addProfile(n); closeModal(); ui.unlocked = false; location.hash = '#/dashboard'; render(); };
  A['profile-switch'] = (el) => { if (st().running) stopTimer(); S.switchTo(el.dataset.id); ui.unlocked = false; location.hash = '#/dashboard'; render(); };
  A['profile-del'] = async (el) => { const p = S.profiles.find((x) => x.id === el.dataset.id); if (await confirmBox(`Delete ${p.name || 'this profile'}?`, 'All of its courses, study history and exams on this device will be erased.')) { S.deleteProfile(p.id); render(); } };

  /* settings */
  A['scale-reset'] = () => { st().settings.scale = U.BUET_SCALE.map((s) => ({ ...s })); save(); render(); };
  A['backup-export'] = () => { S.flush(); download(`shikhor-backup-${U.dayKey(now())}.json`, JSON.stringify({ app: 'shikhor', type: 'backup', v: 1, exportedAt: new Date().toISOString(), data: st() })); };
  A['backup-import'] = async () => {
    const [f] = await pickFiles('.json,application/json', false); if (!f) return;
    try {
      const d = JSON.parse(await f.text()); if (d.app !== 'shikhor' || d.type !== 'backup') throw new Error();
      if (await confirmBox('Restore this backup?', 'It replaces everything in the current profile.', 'Restore', false)) { S.replace(d.data); autoDetectGithub(); render(); toast('Backup restored.'); }
    } catch (e) { toast('That file is not a Shikhor backup.'); }
  };
  A['sample-remove'] = () => { const s = st(), ids = new Set(s.courses.filter((c) => c.sample).map((c) => c.id)); s.courses = s.courses.filter((c) => !c.sample); s.sessions = s.sessions.filter((x) => !x.sample && !ids.has(x.courseId)); s.exams = s.exams.filter((e) => !e.sample); save(); render(); toast('Sample data removed.'); };
  A['erase-all'] = async () => {
    if (!(await confirmBox('Erase everything in this profile?', 'Courses, study history, exams and settings will be deleted. Download a backup first if you might need it.', 'Erase'))) return;
    st().courses.forEach((c) => c.materials.filter((m) => m.kind === 'file').forEach((m) => SN.files.del(m.fileId).catch(() => {})));
    const name = st().profile.name; S.reset(); st().profile.name = name; autoDetectGithub(); S.flush(); location.hash = '#/dashboard'; render();
  };

  /* ---------- input & change handlers ---------- */
  const IN = {
    'mk-att': (el) => { const c = course(ui.arg); c.marks.attendance = +el.value; $('#attOut').textContent = el.value + '%'; save(); refreshMarks(c); },
    'mk-ctguess': (el) => { const c = course(ui.arg); c.marks.ctGuess = +el.value; $('#ctgOut').textContent = el.value + '%'; save(); refreshMarks(c); },
    'mk-exp': (el) => { const c = course(ui.arg); c.marks.expectedFinal = +el.value; $('#expOut').textContent = el.value + '%'; save(); refreshMarks(c); },
    'mk-ct': (el) => { const c = course(ui.arg), t = c.marks.cts[+el.dataset.i], f = el.dataset.f; t[f] = f === 'label' ? el.value : el.value === '' ? '' : +el.value; save(); refreshMarks(c); },
    'mk-w': (el) => { const c = course(ui.arg); c.marks.weights[el.dataset.f] = +el.value || 0; save(); refreshMarks(c); },
    'ex-f': (el) => { const f = el.dataset.f; ui.examDraft[f] = f === 'duration' ? +el.value : el.value; },
    'q-f': (el) => { const q = ui.examDraft.questions[+el.dataset.q]; q[el.dataset.f] = el.dataset.f === 'marks' ? +el.value : el.value; },
    'q-opt': (el) => { ui.examDraft.questions[+el.dataset.q].options[+el.dataset.o] = el.value; },
    'ans': (el) => { const a = attempt(); if (!a) return; a.answers[el.dataset.q] = el.value; save(); updateExamProgress(); },
    'snd-master': (el) => { st().settings.master = +el.value; SN.Sound.setMaster(+el.value); save(); },
    'snd-vol': (el) => { st().settings.sounds[el.dataset.s] = +el.value; SN.Sound.setVol(el.dataset.s, +el.value); save(); },
    'fm-delay': (el) => { st().settings.focusDelay = +el.value; FocusMonitor.setSensitivity(+el.value); const o = $('#fmOut'); if (o) o.textContent = el.value + 's'; save(); }
  };
  const CHG = {
    'mk-commit': () => render(),
    'mk-best': (el) => { course(ui.arg).marks.ctBest = +el.value; save(); refreshMarks(course(ui.arg)); },
    'ex-course': (el) => { ui.examDraft.courseId = el.value; ui.examDraft.materialId = ''; render(); },
    'ex-start': (el) => { const t = new Date(el.value).getTime(); if (!isNaN(t)) ui.examDraft.startAt = t; },
    'ex-mat': (el) => { ui.examDraft.materialId = el.value; },
    'ex-cam': (el) => { ui.examDraft.camera = el.checked; },
    'q-correct': (el) => { ui.examDraft.questions[+el.dataset.q].answer = +el.dataset.o; },
    'ans-mcq': (el) => { const a = attempt(); if (!a) return; a.answers[el.dataset.q] = +el.value; save(); updateExamProgress(); },
    'self-mark': (el) => { const e = exam(el.dataset.e), a = e.attempts.find((x) => x.id === el.dataset.a); a.selfMarks[el.dataset.q] = el.value === '' ? null : +el.value; gradeAttempt(e, a); save(); if (ui.page === 'exams') render(); },
    'focus-course': (el) => { ui.focusCourse = el.value; if (ui.focusPanel === 'reader') renderDrawer(); updateFocusClock(); },
    'focus-pomo': (el) => { const r = st().running; st().settings.pomodoro = el.checked; if (r) { r.phaseOffset = runElapsedMs(); if (!el.checked && r.phase === 'break') { r.phase = 'work'; r.breakStart = null; } } save(); renderClock(); },
    'share-opt': (el) => { ui.shareOpts[el.dataset.f] = el.checked; const o = $('#shareOut'); if (o) o.innerHTML = ''; },
    'scale': (el) => { const sc = scale(), row = sc[+el.dataset.i]; row[el.dataset.f] = el.dataset.f === 'g' ? el.value.trim() : +el.value; st().settings.scale = sc; save(); }
  };
  function setBind(el) {
    const path = el.dataset.bind.split('.');
    let o = st(); for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
    const k = path[path.length - 1];
    o[k] = el.type === 'checkbox' ? el.checked : el.hasAttribute('data-num') ? (el.value === '' ? '' : +el.value) : el.value.trim();
    save(); updateChrome();
    if (el.hasAttribute('data-rerender') || el.type === 'checkbox') render();
  }

  function onClick(e) {
    if (e.target === $('#modal')) { closeModal(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const fn = A[el.dataset.act]; if (!fn) return;
    if (el.tagName === 'A' && el.dataset.act !== 'modal-close') e.preventDefault();
    fn(el, e);
  }
  function onKey(e) {
    const t = e.target;
    if (e.key === 'Enter' && t.dataset && t.dataset.enter && !e.shiftKey) { e.preventDefault(); A[t.dataset.enter] && A[t.dataset.enter](t); return; }
    if (e.key === 'Enter' && t.classList && t.classList.contains('climber')) { A['open-course'](t); return; }
    if (e.key === 'Escape') {
      if (!$('#modal').hidden) { closeModal(); return; }
      if (ui.focusOpen && ui.focusPanel) { ui.focusPanel = null; renderTools(); renderDrawer(); return; }
    }
    const typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable;
    if (typing || !$('#modal').hidden || ui.examId) return;
    if (ui.focusOpen && e.code === 'Space' && t.tagName !== 'BUTTON') { e.preventDefault(); A['focus-toggle'](); }
    else if (!ui.focusOpen && e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) openFocus();
  }
  function onVis() {
    if (ui.examId && document.hidden) {
      const a = attempt(); if (!a) return;
      a.switches++; save();
      const el = $('#examSwitches'); if (el) el.textContent = `${a.switches} tab switch${a.switches === 1 ? '' : 'es'}`;
      setTimeout(() => toast('Leaving the exam tab was recorded.'), 300);
    }
  }
  function setupDrop() {
    document.addEventListener('dragover', (e) => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
    document.addEventListener('dragleave', (e) => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) z.classList.remove('over'); });
    document.addEventListener('drop', (e) => { const z = e.target.closest && e.target.closest('[data-drop]'); if (!z) return; e.preventDefault(); z.classList.remove('over'); addFiles(z.dataset.drop, Array.from(e.dataTransfer.files || [])); });
  }

  let beatAt = 0, schedAt = 0;
  function tick() {
    const t = now();
    if (st().running) {
      updateRunPill(); updateFocusClock(); pomoTick();
      if (t - beatAt > 15000 && st().running && st().running.segStart) { beatAt = t; st().running.beat = t; save(); }
    }
    if (ui.examId) updateExamClock();
    $$('[data-countdown]').forEach((el) => { const ts = +el.dataset.countdown; el.textContent = ts > t ? countdown(ts) : 'Live now'; });
    if (t - schedAt > 1000) { schedAt = t; examScheduler(); }
  }

  /* ---------- boot ---------- */
  function init() {
    S.init(); autoDetectGithub(); buildChrome(); recoverRunning();
    window.addEventListener('hashchange', render);
    document.addEventListener('click', onClick);
    document.addEventListener('input', (e) => { const k = e.target.dataset && e.target.dataset.input; if (k && IN[k]) IN[k](e.target); if (e.target.hasAttribute && e.target.hasAttribute('data-live')) setBind(e.target); });
    document.addEventListener('change', (e) => { const t = e.target; if (t.dataset && t.dataset.bind) setBind(t); const k = t.dataset && t.dataset.change; if (k && CHG[k]) CHG[k](t); });
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', (e) => { const r = st().running; if (r && r.segStart) r.beat = now(); S.flush(); if (ui.examId) { e.preventDefault(); e.returnValue = ''; } });
    setupDrop();
    render();
    setInterval(tick, 500);
  }
  init();
})();

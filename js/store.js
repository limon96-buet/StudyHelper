/* Shikhor data layer.
   Everything is saved in this browser (localStorage + IndexedDB for files).
   Nothing is sent anywhere unless the user creates a share link. */
(function () {
  'use strict';
  const SN = (window.SN = window.SN || {});

  /* ---------- small utilities ---------- */
  const BUET_SCALE = [
    { g: 'A+', min: 80, gp: 4.0 }, { g: 'A', min: 75, gp: 3.75 }, { g: 'A-', min: 70, gp: 3.5 },
    { g: 'B+', min: 65, gp: 3.25 }, { g: 'B', min: 60, gp: 3.0 }, { g: 'B-', min: 55, gp: 2.75 },
    { g: 'C+', min: 50, gp: 2.5 }, { g: 'C', min: 45, gp: 2.25 }, { g: 'D', min: 40, gp: 2.0 },
    { g: 'F', min: 0, gp: 0 }
  ];
  const COLORS = ['#4C97B8', '#2E6B5E', '#D95D7A', '#D29A2E', '#7B6CC4', '#4FA58F', '#C9783F', '#5E7FA8'];

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const dayKey = (d) => { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  function fmtMin(m) {
    const t = Math.round(m || 0);
    const h = Math.floor(t / 60), mm = t % 60;
    if (!h) return mm + 'm';
    return mm ? h + 'h ' + mm + 'm' : h + 'h';
  }
  function fmtClock(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(s);
  }
  function fmtSize(b) {
    if (!b && b !== 0) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  /* ---------- defaults ---------- */
  function defaultMarks() {
    return { attendance: 100, cts: [], ctBest: 3, ctGuess: 75, weights: { att: 10, ct: 20, final: 70 }, expectedFinal: 70 };
  }
  function defaults() {
    return {
      version: 1,
      profile: { name: '', university: '', department: '', level: '', bio: '', avatar: '', dailyGoal: 120, targetGrade: 'A+', cgpa: '', credits: '' },
      courses: [], sessions: [], exams: [], running: null,
      settings: {
        scene: 'himalaya', sounds: {}, master: 0.7, pin: '', blurStats: false,
        camInFocus: true, pomodoro: false, work: 50, brk: 10,
        scale: BUET_SCALE.map((s) => ({ ...s })), customBg: ''
      },
      github: { owner: '', repo: '', branch: 'main', path: 'materials' },
      badgesSeen: [],
      createdAt: Date.now()
    };
  }

  function deepMerge(base, obj) {
    if (!obj || typeof obj !== 'object') return base;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        base[k] = deepMerge(base[k], v);
      } else base[k] = v;
    }
    return base;
  }
  const readJSON = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
  function writeJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { console.warn(e); SN.toast && SN.toast('Browser storage is full. Export a backup and remove some large images.'); return false; }
  }

  /* ---------- store with multiple profiles ---------- */
  const PROFILES = 'shikhor.profiles', ACTIVE = 'shikhor.active', DATA = 'shikhor.data.';
  const store = {
    profiles: [], activeId: null, state: null,
    init() {
      this.profiles = readJSON(PROFILES, []);
      this.activeId = localStorage.getItem(ACTIVE);
      if (!this.profiles.length) {
        const id = uid();
        this.profiles = [{ id, name: '', avatar: '' }];
        writeJSON(PROFILES, this.profiles);
      }
      if (!this.activeId || !this.profiles.find((p) => p.id === this.activeId)) this.activeId = this.profiles[0].id;
      localStorage.setItem(ACTIVE, this.activeId);
      this.load();
    },
    load() {
      this.state = deepMerge(defaults(), readJSON(DATA + this.activeId, {}));
      this.state.courses.forEach((c) => {
        c.marks = deepMerge(defaultMarks(), c.marks || {});
        c.syllabus = c.syllabus || []; c.materials = c.materials || [];
      });
      this.state.exams.forEach((e) => { e.attempts = e.attempts || []; e.questions = e.questions || []; });
    },
    save() { clearTimeout(this._t); this._t = setTimeout(() => this.flush(), 200); },
    flush() {
      clearTimeout(this._t);
      writeJSON(DATA + this.activeId, this.state);
      const p = this.profiles.find((x) => x.id === this.activeId);
      if (p) { p.name = this.state.profile.name; p.avatar = this.state.profile.avatar; writeJSON(PROFILES, this.profiles); }
    },
    addProfile(name) {
      this.flush();
      const id = uid();
      this.profiles.push({ id, name, avatar: '' });
      writeJSON(PROFILES, this.profiles);
      this.switchTo(id);
      this.state.profile.name = name;
      this.flush();
    },
    switchTo(id) {
      this.flush();
      this.activeId = id;
      localStorage.setItem(ACTIVE, id);
      this.load();
    },
    deleteProfile(id) {
      localStorage.removeItem(DATA + id);
      this.profiles = this.profiles.filter((p) => p.id !== id);
      if (!this.profiles.length) this.profiles.push({ id: uid(), name: '', avatar: '' });
      writeJSON(PROFILES, this.profiles);
      if (id === this.activeId) { this.activeId = this.profiles[0].id; localStorage.setItem(ACTIVE, this.activeId); this.load(); }
    },
    replace(data) { this.state = deepMerge(defaults(), data); this.flush(); this.load(); },
    reset() { this.state = defaults(); this.flush(); }
  };

  /* ---------- IndexedDB for uploaded files ---------- */
  const files = {
    db: null,
    open() {
      if (this.db) return Promise.resolve(this.db);
      return new Promise((res, rej) => {
        const r = indexedDB.open('shikhor-files', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('files', { keyPath: 'id' });
        r.onsuccess = () => { this.db = r.result; res(this.db); };
        r.onerror = () => rej(r.error);
      });
    },
    async tx(mode, fn) {
      const db = await this.open();
      return new Promise((res, rej) => {
        const t = db.transaction('files', mode);
        const req = fn(t.objectStore('files'));
        t.oncomplete = () => res(req && req.result);
        t.onerror = () => rej(t.error);
      });
    },
    put(rec) { return this.tx('readwrite', (s) => s.put(rec)); },
    get(id) { return this.tx('readonly', (s) => s.get(id)); },
    del(id) { return this.tx('readwrite', (s) => s.delete(id)); }
  };

  /* ---------- calculations ---------- */
  function gradeFor(total, scale) {
    const sorted = scale.slice().sort((a, b) => b.min - a.min);
    return sorted.find((s) => total >= s.min - 1e-9) || sorted[sorted.length - 1];
  }
  function courseMarks(c, scale) {
    const m = c.marks, w = m.weights;
    const sum = (+w.att || 0) + (+w.ct || 0) + (+w.final || 0) || 100;
    const k = 100 / sum;
    const wa = (+w.att || 0) * k, wc = (+w.ct || 0) * k, wf = (+w.final || 0) * k;
    const entered = m.cts.filter((t) => t.got !== '' && t.got != null && !isNaN(+t.got) && +t.max > 0)
      .map((t) => Math.max(0, Math.min(1, +t.got / +t.max)));
    const bestN = Math.max(1, +m.ctBest || entered.length || 1);
    const best = entered.slice().sort((a, b) => b - a).slice(0, bestN);
    const ctAssumed = best.length === 0;
    const ctPct = ctAssumed ? (+m.ctGuess || 0) / 100 : best.reduce((s, x) => s + x, 0) / best.length;
    const attPct = Math.max(0, Math.min(100, +m.attendance || 0)) / 100;
    const secured = attPct * wa + ctPct * wc;
    const finalFull = Math.round((+c.credit || 3) * wf);
    const sorted = scale.slice().sort((a, b) => b.min - a.min);
    const rows = sorted.map((s) => {
      const need = wf > 0 ? (s.min - secured) / wf : Infinity;
      return { ...s, needPct: need * 100, needMarks: Math.max(0, Math.ceil(need * finalFull - 1e-9)), state: need <= 0 ? 'secured' : need > 1 ? 'out' : 'open' };
    });
    const total = secured + (Math.max(0, Math.min(100, +m.expectedFinal || 0)) / 100) * wf;
    const g = gradeFor(total, scale);
    return { wa, wc, wf, attPct, ctPct, ctAssumed, ctCount: entered.length, secured, finalFull, rows, total, grade: g.g, gp: g.gp };
  }
  function minutesByDay(sessions) {
    const map = {};
    for (const s of sessions) { const k = dayKey(s.start); map[k] = (map[k] || 0) + (s.min || 0); }
    return map;
  }
  function streak(sessions) {
    const map = minutesByDay(sessions);
    const d = new Date(); let n = 0;
    if (!map[dayKey(d)]) d.setDate(d.getDate() - 1);
    while ((map[dayKey(d)] || 0) >= 1) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function hourMatrix(sessions) {
    const m = Array.from({ length: 7 }, () => Array(24).fill(0));
    for (const s of sessions) {
      let t = s.start; const end = s.end || s.start + s.min * 60000; let guard = 0;
      while (t < end && guard++ < 300) {
        const d = new Date(t); const next = new Date(d);
        next.setMinutes(0, 0, 0); next.setHours(d.getHours() + 1);
        const seg = Math.min(end, next.getTime()) - t;
        m[(d.getDay() + 6) % 7][d.getHours()] += seg / 60000;
        t += seg;
      }
    }
    return m;
  }

  SN.util = { uid, pad, esc, dayKey, fmtMin, fmtClock, fmtSize, COLORS, BUET_SCALE, deepMerge, defaults };
  SN.calc = { defaultMarks, courseMarks, gradeFor, minutesByDay, streak, hourMatrix };
  SN.store = store;
  SN.files = files;
})();

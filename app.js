/* ─────────────────────────────────────────────────────────────────
   Keyboard Visualizer — app.js
   Detects: keyboard events, mouse clicks, touch presses
   ───────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────────────────── */
  let totalPresses = 0;
  let activeKeys   = new Set();  // currently held codes
  const MAX_HISTORY = 18;

  /* ── DOM refs ──────────────────────────────────────────────────── */
  const historyTrack = document.getElementById('history-track');
  const totalEl      = document.getElementById('total-count');
  const activeEl     = document.getElementById('active-count');
  const lastKeyEl    = document.getElementById('last-key');

  /* ── Build code → element map ──────────────────────────────────── */
  const keyMap = {};
  document.querySelectorAll('.key[data-code]').forEach(el => {
    keyMap[el.dataset.code] = el;
  });

  /* ── Audio context (lazy) ──────────────────────────────────────── */
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume suspended context (required after user gesture)
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playClick() {
    try {
      const ctx    = getAudioCtx();
      const dur    = 0.055;
      const buf    = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data   = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const t = i / data.length;
        // white noise envelope — sharp attack, quick decay
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 5) * 0.3;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      // add a tiny pitch filter for a softer "click"
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2800;
      filter.Q.value = 0.8;

      const gain = ctx.createGain();
      gain.gain.value = 0.7;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    } catch (_) { /* silence audio errors */ }
  }

  /* ── Ripple effect ─────────────────────────────────────────────── */
  function spawnRipple(el, clientX, clientY) {
    const rect = el.getBoundingClientRect();
    const r    = document.createElement('span');
    r.className = 'ripple';
    const cx   = (clientX !== undefined ? clientX - rect.left : rect.width  / 2) - 4;
    const cy   = (clientY !== undefined ? clientY - rect.top  : rect.height / 2) - 4;
    r.style.left = cx + 'px';
    r.style.top  = cy + 'px';
    el.appendChild(r);
    r.addEventListener('animationend', () => r.remove(), { once: true });
  }

  /* ── History ───────────────────────────────────────────────────── */
  function getLabelForCode(code) {
    const el = keyMap[code];
    if (!el) return code.replace(/^(Key|Digit|Arrow)/, '');
    // get text content, stripping sub-labels
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.bot').forEach(n => n.remove());
    const raw = clone.textContent.trim();
    // map arrow chars to words
    const arrows = { '↑': 'UP', '↓': 'DN', '←': 'LT', '→': 'RT' };
    return arrows[raw] || raw || code;
  }

  function addHistory(code) {
    // Prune overflow
    while (historyTrack.children.length >= MAX_HISTORY) {
      historyTrack.removeChild(historyTrack.lastChild);
    }
    const pill = document.createElement('span');
    pill.className  = 'h-pill fresh';
    pill.textContent = getLabelForCode(code);
    historyTrack.insertBefore(pill, historyTrack.firstChild);

    // Remove "fresh" accent after a moment
    setTimeout(() => pill.classList.remove('fresh'), 400);
  }

  /* ── Stats update ──────────────────────────────────────────────── */
  function updateStats(lastCode) {
    totalEl.textContent  = totalPresses;
    activeEl.textContent = activeKeys.size;
    if (lastCode) lastKeyEl.textContent = getLabelForCode(lastCode);
  }

  /* ── Activate / Deactivate ─────────────────────────────────────── */
  function activateKey(code, clientX, clientY) {
    const el = keyMap[code];
    if (!el) return; // unknown key — ignore safely

    if (!activeKeys.has(code)) {
      activeKeys.add(code);
      totalPresses++;
      el.classList.add('pressed');
      spawnRipple(el, clientX, clientY);
      playClick();
      addHistory(code);
      updateStats(code);
    }
  }

  function deactivateKey(code) {
    const el = keyMap[code];
    activeKeys.delete(code);
    if (el) el.classList.remove('pressed');
    updateStats(null);
  }

  function deactivateAll() {
    activeKeys.forEach(code => deactivateKey(code));
    activeKeys.clear();
    updateStats(null);
  }

  /* ── Keyboard Events ───────────────────────────────────────────── */
  document.addEventListener('keydown', e => {
    // Allow F5 / F12 / Ctrl+* to still work in browser
    if (e.code === 'F5' || e.code === 'F12') return;
    e.preventDefault();
    activateKey(e.code);
  });

  document.addEventListener('keyup', e => {
    deactivateKey(e.code);
  });

  // If focus lost (tab switch, etc.) release all keys
  window.addEventListener('blur', deactivateAll);

  /* ── Mouse Events on rendered keys ────────────────────────────── */
  document.querySelectorAll('.key[data-code]').forEach(el => {
    const code = el.dataset.code;

    el.addEventListener('mousedown', e => {
      e.preventDefault();
      activateKey(code, e.clientX, e.clientY);
    });

    el.addEventListener('mouseup', () => deactivateKey(code));
    el.addEventListener('mouseleave', () => deactivateKey(code));

    /* ── Touch Events ──────────────────────────────────────────────
       Each touch point is tracked independently so multi-finger
       presses (e.g. Shift + A) all register simultaneously.
    ─────────────────────────────────────────────────────────────── */
    el.addEventListener('touchstart', e => {
      e.preventDefault(); // prevent ghost mouse events
      for (const touch of e.changedTouches) {
        activateKey(code, touch.clientX, touch.clientY);
      }
    }, { passive: false });

    el.addEventListener('touchend', e => {
      e.preventDefault();
      deactivateKey(code);
    }, { passive: false });

    el.addEventListener('touchcancel', e => {
      e.preventDefault();
      deactivateKey(code);
    }, { passive: false });
  });

  /* ── Global touch: release keys if finger leaves keyboard area ── */
  document.addEventListener('touchend', e => {
    // If touch ends outside any key, clear stragglers
    for (const touch of e.changedTouches) {
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!target || !target.closest('.key[data-code]')) {
        // Find which key this touch was associated with and release it
        // (handled per-element above; this is the safety net)
      }
    }
  }, { passive: true });

  /* ── Init stats ────────────────────────────────────────────────── */
  updateStats(null);

})();

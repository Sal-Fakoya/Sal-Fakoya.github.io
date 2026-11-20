/* Scene engine, serious anime edition.
   A wind-gust chapter transition, entry gate, contents menu, chapter labels. The cat, thread, girl,
   seasons and rain live in garden.js (load it first).
   Needs gsap.min.js + ScrollTrigger.min.js.
   Usage: SceneKit.init({ root, onToggleMode }) */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  function seeded(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var Sound = window.SFSound || { set: function () {}, meow: function () {}, on: false };

  var wrap = '';
  for (var i = 0; i < 9; i++) { var x = 500 + i * 10.5; wrap += 'M' + x + ' 12.5 L' + (x + 10.5) + ' 25.5 M' + (x + 10.5) + ' 12.5 L' + x + ' 25.5 '; }
  var KATANA = '<svg viewBox="0 0 600 40"><defs>' +
    '<linearGradient id="kBlade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f8fa"/><stop offset=".42" stop-color="#cfd5dc"/><stop offset=".58" stop-color="#8f99a5"/><stop offset="1" stop-color="#e3e7eb"/></linearGradient>' +
    '<linearGradient id="kGleam" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
    '<path d="M0 20 Q5 14.6 16 14.2 L478 13 L478 25 L16 24.4 Q5 24 0 20 Z" fill="url(#kBlade)"/>' +
    '<path d="M16 21.6 Q42 19.8 68 21.6 T120 21.6 T172 21.6 T224 21.6 T276 21.6 T328 21.6 T380 21.6 T432 21.6 L478 21.6" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".9"/>' +
    '<rect class="gleam" x="-60" y="13" width="60" height="5" fill="url(#kGleam)" opacity="0"/>' +
    '<rect x="478" y="12" width="10" height="14" rx="1" fill="#c8a24a"/>' +
    '<ellipse cx="493" cy="19" rx="5" ry="17" fill="#17110f" stroke="#6b5a3a" stroke-width="1.2"/>' +
    '<rect x="498" y="12.5" width="98" height="13" rx="3" fill="#141012"/><path d="' + wrap + '" stroke="#d9cbb0" stroke-opacity=".55" stroke-width="1.1"/>' +
    '<rect x="595" y="12" width="5" height="14" rx="1" fill="#c8a24a"/></svg>';
  var SAYA = '<svg viewBox="0 0 500 40"><path d="M0 14 Q-6 19.5 0 25 L488 26 L488 13 Z" fill="#100b0a" stroke="#2a1d16" stroke-width="1"/>' +
    '<path d="M10 16 L486 15" stroke="#ffffff" stroke-opacity=".12" stroke-width="1.4"/><rect x="486" y="11.5" width="14" height="16" rx="1.5" fill="#c8a24a"/>' +
    '<path d="M440 26 C446 38 470 38 476 27" fill="none" stroke="#a8241b" stroke-width="2.4" stroke-linecap="round"/></svg>';
  var SLASH = '<svg viewBox="0 0 900 26"><defs><linearGradient id="slG" x1="0" x2="1"><stop offset="0" stop-color="#ff6a2a" stop-opacity="0"/><stop offset=".6" stop-color="#ff8a3d" stop-opacity=".7"/><stop offset=".92" stop-color="#ffe2b8" stop-opacity="1"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>' +
    '<path d="M0 13 L860 8.5 Q896 12 900 13 Q896 14 860 17.5 Z" fill="url(#slG)"/><path d="M300 13 L895 12.6" stroke="#fff" stroke-width="1.2" stroke-opacity=".9"/></svg>';

  /* ---------- Landing atmosphere ---------- */
  function decorateLanding(panel) {
    var deco = el('div', 'sc-deco');
    deco.appendChild(el('div', 'sc-lantern'));
    [[10, -10, 46], [40, 30, 62], [65, -20, 54]].forEach(function (f, i) {
      var fg = el('div', 'sc-fog'); fg.style.top = f[0] + '%'; fg.style.left = f[1] + '%';
      fg.style.animationDuration = f[2] + 's'; fg.style.animationDelay = (-i * 9) + 's'; deco.appendChild(fg);
    });
    var r = seeded(9);
    for (var i = 0; i < 46; i++) {
      var s = el('span', 'sc-star'); s.style.left = (r() * 100) + '%'; s.style.top = (r() * 58) + '%';
      s.style.setProperty('--d', (3 + r() * 4).toFixed(2) + 's'); s.style.setProperty('--dl', (-r() * 6).toFixed(2) + 's'); deco.appendChild(s);
    }
    deco.appendChild(el('div', 'sc-horizon')); deco.appendChild(el('div', 'sc-shine')); deco.appendChild(el('div', 'sc-grain'));
    if (panel.dataset.kanji) { var k = el('div', 'sc-kanji jp'); k.textContent = panel.dataset.kanji; k.setAttribute('aria-hidden', 'true'); deco.appendChild(k); }
    panel.insertBefore(deco, panel.firstChild);
  }

  /* ---------- Torn paper ---------- */
  function tearGeo(W, H, kind) {
    var S = kind === 1 ? { x: W, y: H * .86 } : { x: W, y: H * .74 };
    var E = kind === 1 ? { x: 0, y: H * .16 } : { x: 0, y: H * .3 };
    var r = seeded(kind === 1 ? 77 : 133), N = Math.max(30, Math.round(W / 26)), pts = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, x = S.x + (E.x - S.x) * t, y = S.y + (E.y - S.y) * t;
      if (i > 0 && i < N) { x += (r() - .5) * 10; y += (r() - .5) * 16; }
      pts.push([x, y]);
    }
    return { S: S, E: E, pts: pts, W: W, H: H };
  }
  function poly(list) { return 'polygon(' + list.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')'; }
  function applyClips(tear, g) {
    var off = function (d) { return g.pts.map(function (p) { return [p[0], p[1] + d]; }); };
    var up = [[0, 0], [g.W, 0]].concat(off(0)), upE = [[0, 0], [g.W, 0]].concat(off(3));
    var lo = off(-1.5).concat([[0, g.H], [g.W, g.H]]), loE = off(-4.5).concat([[0, g.H], [g.W, g.H]]);
    var sh = tear.querySelectorAll('.shard');
    sh[0].querySelector('.shard-inner').style.clipPath = poly(up); sh[0].querySelector('.shard-edge').style.clipPath = poly(upE);
    sh[1].querySelector('.shard-inner').style.clipPath = poly(lo); sh[1].querySelector('.shard-edge').style.clipPath = poly(loE);
  }
  function makeTear(panel, cls) {
    var tear = el('div', 'tear ' + cls);
    for (var i = 0; i < 2; i++) {
      var sh = el('div', 'shard ' + (i ? 'lower' : 'upper'));
      sh.appendChild(el('div', 'shard-edge'));
      var inner = el('div', 'shard-inner'), c = panel.cloneNode(true);
      if (i) c.setAttribute('aria-hidden', 'true');
      inner.appendChild(c); sh.appendChild(inner); tear.appendChild(sh);
    }
    panel.parentNode.replaceChild(tear, panel);
    return tear;
  }

  /* ---------- Gate, contents, toggles ---------- */
  function setupChrome(scene, opts, api) {
    var gate = scene.querySelector('.sc-gate');
    function go(withSound) {
      if (gate) gate.classList.add('gone');
      scene.classList.add('sc-go');
      if (withSound) { Sound.set(true); setTimeout(function () { if (window.Garden && window.Garden._api) window.Garden._api.meow(); else Sound.meow(); }, 1100); }
      try { sessionStorage.setItem('sf-entered', '1'); } catch (e) {}
      atmo.locate();
    }
    var entered = false; try { entered = sessionStorage.getItem('sf-entered') === '1'; } catch (e) {}
    var atmo = atmosphere(scene, opts, api);
    if (!gate || entered) {
      if (gate) gate.classList.add('gone');
      scene.classList.add('sc-go'); atmo.locate();
      if (store('sf-sound') === '1') {
        var arm = function () { Sound.set(true); window.removeEventListener('pointerdown', arm); };
        window.addEventListener('pointerdown', arm);
      }
      document.querySelectorAll('[data-sound-label]').forEach(function (b) { b.textContent = store('sf-sound') === '1' ? 'Sound on' : 'Sound off'; });
    } else {
      gate.querySelector('[data-enter-silent]').addEventListener('click', function () { go(false); });
      gate.querySelector('[data-enter-sound]').addEventListener('click', function () { go(true); });
    }
    document.querySelectorAll('[data-mode-toggle]').forEach(function (b) {
      function label() { b.textContent = scene.getAttribute('data-mode') === 'day' ? 'Night' : 'Day'; }
      label(); new MutationObserver(label).observe(scene, { attributes: true, attributeFilter: ['data-mode'] });
      b.addEventListener('click', function (e) { e.stopPropagation(); if (opts.onToggleMode) opts.onToggleMode(); });
    });
    var contents = scene.querySelector('.sc-contents');
    if (contents) {
      var menuBtns = document.querySelectorAll('[data-contents-open]');
      function setOpen(o) {
        contents.classList.toggle('open', o); document.documentElement.classList.toggle('sc-menu-open', o);
        menuBtns.forEach(function (b) { b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
      }
      menuBtns.forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!contents.classList.contains('open')); }); });
      new MutationObserver(function () { var o = contents.classList.contains('open'); if (document.documentElement.classList.contains('sc-menu-open') !== o) setOpen(o); }).observe(contents, { attributes: true, attributeFilter: ['class'] });
      contents.addEventListener('click', function (e) {
        var g = e.target.closest('[data-go]');
        if (g) { e.preventDefault(); contents.classList.remove('open'); api.scrollTo(parseFloat(g.dataset.go)); return; }
        if (e.target.closest('[data-season-cycle], [data-garden-toggle], [data-mode-toggle]')) return;
        if (e.target.closest('.x') || e.target === contents || e.target.closest('a')) contents.classList.remove('open');
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') contents.classList.remove('open'); });
    }
  }

  /* ---------- Main ---------- */
  function init(opts) {
    var scene = opts.root, stage = scene.querySelector('.scene-stage');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var landing = stage.querySelector('.sc-landing'), now = stage.querySelector('.sc-now');
    var chapterLabel = scene.querySelector('.sc-ui .tc');
    decorateLanding(landing);
    setupHearts(scene);
    var garden = window.Garden ? window.Garden.init({ controls: false, composition: opts.composition || 'left' }) : null;
    if (window.Garden) window.Garden._api = garden;

    var fx = el('div', 'scene-fx'), gust = el('div', 'sc-gust');
    var GP = '<svg viewBox="0 0 20 20"><path class="pp" d="M10 1 C15 4 18 10 15 16 L12.5 14 L11 18 C5 18 2 12 4 7 C5 4 7 2 10 1Z"/>' +
      '<path class="pl" d="M2 10 Q10 1 18 10 Q10 19 2 10 Z M2 10 L18 10"/><circle class="ps" cx="10" cy="10" r="5"/></svg>';
    var gr = seeded(57), parts = [];
    for (var i = 0; i < 54; i++) {
      var sp = el('span', 'gp' + (i % 4), GP); gust.appendChild(sp);
      parts.push({ el: sp, y: gr() * 100, d: gr() * .38, ph: gr() * 6.28, sz: 8 + gr() * 14, rot: (gr() < .5 ? -1 : 1) * (360 + gr() * 540), amp: 14 + gr() * 40 });
    }
    for (var j = 0; j < 9; j++) {
      var st = el('i', 'gs'); gust.appendChild(st);
      parts.push({ el: st, streak: true, y: 8 + gr() * 80, d: gr() * .3, w: 140 + gr() * 260, amp: 6 + gr() * 10, ph: gr() * 6.28 });
    }
    fx.appendChild(gust); scene.appendChild(fx);
    var api = { scrollTo: function () {} };

    if (reduce || !window.gsap || !window.ScrollTrigger) {
      scene.classList.add('scene--static');
      api.scrollTo = function (p) { var t = p < .5 ? stage.querySelector('.sc-now') : stage.querySelector('.sc-projects'); if (t) t.scrollIntoView({ behavior: 'smooth' }); };
      setupChrome(scene, opts, api);
      return api;
    }

    var gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
    var vh = function () { return stage.clientHeight; }, vw = function () { return stage.clientWidth; };

    /* A gust of wind: season petals, leaves or snow sweep right to left with wind streaks,
       carrying the current chapter away. Driven by scroll, so it reverses on the way back. */
    function placeGust(p) {
      var W = vw(), H = vh();
      gust.style.opacity = p > .001 && p < .999 ? 1 : 0;
      parts.forEach(function (o) {
        var q = clamp((p - o.d) / .62, 0, 1), e = q * q * (3 - 2 * q);
        var x = W * 1.12 - e * W * 1.4, y = o.y / 100 * H + Math.sin(e * Math.PI * 2 + o.ph) * o.amp - e * 50;
        var vis = q > 0 && q < 1;
        if (o.streak) { o.el.style.width = o.w + 'px'; o.el.style.opacity = vis ? Math.sin(q * Math.PI) * .7 : 0; o.el.style.transform = 'translate(' + x + 'px,' + y + 'px)'; return; }
        o.el.style.opacity = vis ? 1 : 0;
        o.el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (o.rot * e) + 'deg) scale(' + (o.sz / 14) + ')';
      });
    }
    var g1 = { p: 0 }, g2 = { p: 0 };
    function gustBreeze(o) {
      if (o.p > .12 && o.p < .6 && !o.fired) { o.fired = true; if (garden && garden.breeze) garden.breeze(1); }
      if (o.p < .04 || o.p > .96) o.fired = false;
    }
    var landInner = landing.querySelector('.sc-landing-inner'), nowSec = now.querySelector('.sc-section');
    var nowItems = now.querySelectorAll('.sc-reveal'), projItems = scene.querySelectorAll('.sc-projects .sc-reveal');
    var labels = chapterLabel ? JSON.parse(chapterLabel.dataset.labels || '[]') : [];

    /* The thinker straightens up, turns, and walks off to the left with the first gust. */
    var thinker = landing.querySelector('.sc-thinker'), walk = { p: 0 }, thFar = 0, thReact = 0;
    if (thinker) thinker.querySelectorAll('.th-arm, .th-fore').forEach(function (n) { n.style.transition = 'none'; });
    function placeThinker(p) {
      if (!thinker) return;
      var wk = thinker.querySelector('.th-walk'), all = thinker.querySelector('.th-all'),
          A = thinker.querySelector('.th-legA'), B = thinker.querySelector('.th-legB'), dots = thinker.querySelector('.th-dots');
      if ((!thFar || p === 0) && thinker.offsetHeight) { var r = thinker.getBoundingClientRect(); thFar = (r.right + 80) / (r.height / 214); }
      if (!thFar) thFar = 500;
      var lean = Math.max(0, 1 - p / .14), k = Math.min(1, Math.max(0, (p - .14) / .86));
      var dist = k * k * .35 * thFar + k * .65 * thFar, ph = dist / 8, ramp = Math.min(1, Math.max(0, (p - .14) / .06));
      var sw = Math.sin(ph) * 22 * ramp, bob = -Math.abs(Math.sin(ph)) * 1.8 * ramp, dir = p > .15 ? -1 : 1;
      all.setAttribute('transform', 'rotate(' + (5 * lean).toFixed(2) + ' 50 196)');
      A.setAttribute('transform', 'rotate(' + sw.toFixed(2) + ' 50.5 138)');
      B.setAttribute('transform', 'rotate(' + (p > .14 ? -sw : 13 * lean).toFixed(2) + ' 60.5 138)');
      wk.setAttribute('transform', 'translate(' + (-dist).toFixed(1) + ' ' + bob.toFixed(2) + ') translate(55 0) scale(' + dir + ' 1) translate(-55 0)');
      if (dots) dots.style.opacity = lean;
      document.documentElement.setAttribute('data-thinker', p < .03 ? 'here' : 'gone');
      /* her hand leaves her chin as she straightens; then both arms hang and swing with her steps */
      var a = Math.max(thReact, Math.min(1, Math.max(0, (p - .03) / .08))), swing = p > .14 ? Math.sin(ph) * 10 * ramp : 0;
      var arm = thinker.querySelector('.th-arm'), front = thinker.querySelector('.th-armfront'), back = thinker.querySelector('.th-armback'), cross = thinker.querySelector('.th-cross');
      var holding = thinker.classList.contains('umb-up');   /* in the rain she keeps the umbrella up, even while walking */
      var armA = holding ? 0 : a;
      arm.setAttribute('visibility', armA < 1 ? 'visible' : 'hidden'); arm.style.opacity = 1 - armA;
      cross.setAttribute('visibility', a < 1 ? 'visible' : 'hidden'); cross.style.opacity = 1 - a;
      front.setAttribute('visibility', armA > 0 ? 'visible' : 'hidden'); front.style.opacity = armA;
      back.setAttribute('visibility', a > 0 ? 'visible' : 'hidden'); back.style.opacity = a;
      front.setAttribute('transform', 'rotate(' + (-swing).toFixed(1) + ' 60 59)');
      thinker.querySelector('.th-fore').setAttribute('transform', holding ? 'rotate(14 71 87)' : '');
      back.setAttribute('transform', 'rotate(' + swing.toFixed(1) + ' 47 61)');
    }
    placeThinker(0);
    /* When the rain starts she reacts: "oops...", opens her umbrella, looks left and right,
       looks back at the text and nods to the girl in the garden, then goes back to thinking. */
    var reactId = 0, wasRaining = false;
    function easeReact(to, ms) {
      var from = thReact, t0 = performance.now();
      (function step(t) { var k = Math.min(1, (t - t0) / ms); thReact = from + (to - from) * k; placeThinker(walk.p); if (k < 1) requestAnimationFrame(step); })(t0);
    }
    function lookTo(side) {
      var tf = side === 'left' ? 'translate(112 0) scale(-1 1)' : '';
      if (walk.p > .15) return;
      /* both head groups (face and the hijab drape) turn around the neck */
      thinker.querySelector('.th-look').setAttribute('transform', side === 'left' ? 'scale(-1 1)' : '');
      thinker.querySelector('.th-look2').setAttribute('transform', side === 'left' ? 'scale(-1 1)' : '');
    }
    /* a little speech bubble for her, the same style as the cat's */
    var thSay = null;
    function thSpeak(text, ms) {
      var h = thinker.closest('.sc-title'); if (!h) return;
      if (!thSay) { thSay = document.createElement('span'); thSay.className = 'g-say th-say'; h.appendChild(thSay); }
      var r = thinker.getBoundingClientRect(), hr = h.getBoundingClientRect();
      thSay.textContent = text;
      thSay.style.setProperty('--sx', Math.round(r.left - hr.left + r.width * .58) + 'px');
      thSay.style.setProperty('--sy', Math.round(r.top - hr.top + r.height * .07) + 'px');
      thSay.classList.remove('on'); void thSay.offsetWidth; thSay.classList.add('on');
      clearTimeout(thSay._t); thSay._t = setTimeout(function () { thSay.classList.remove('on'); }, ms || 1800);
    }
    function rainReaction() {
      var id = ++reactId, here = walk.p < .03;
      function at(ms, fn) { setTimeout(function () { if (id === reactId) fn(); }, ms); }
      if (!here) { thinker.classList.add('umb-up'); placeThinker(walk.p); return; }
      thinker.classList.add('react', 'startle'); easeReact(1, 220); thSpeak('oops...', 1500);
      at(420, function () { thinker.classList.remove('startle'); });
      at(900, function () { thinker.classList.add('umb-up'); easeReact(0, 300); });
      at(1300, function () { thinker.classList.remove('oops'); });
      at(1700, function () { lookTo('left'); });
      at(2700, function () { lookTo('right'); });
      at(3200, function () { lookTo('left'); });
      at(3900, function () { lookTo('right'); });
      at(4400, function () {
        thinker.classList.remove('nod'); void thinker.getBoundingClientRect(); thinker.classList.add('nod');
        at(1200, function () { thinker.classList.remove('nod'); });
        try { document.dispatchEvent(new CustomEvent('sf:nod', { detail: { who: 'garden' } })); } catch (e) {}
      });
      at(5600, function () { thinker.classList.remove('react'); });
    }
    if (thinker) {
      document.addEventListener('sf:weather', function (e) {
        var r = !!(e.detail && e.detail.raining);
        if (r && !wasRaining) rainReaction();
        if (!r && wasRaining) { reactId++; thinker.classList.remove('umb-up', 'oops', 'react', 'startle'); lookTo('right'); easeReact(0, 300); }
        wasRaining = r;
      });
    }
    /* breeze and nods from the garden */
    if (thinker) {
      document.addEventListener('sf:breeze', function () { thinker.classList.add('windy'); clearTimeout(thinker._w); thinker._w = setTimeout(function () { thinker.classList.remove('windy'); }, 2800); });
      document.addEventListener('sf:nod', function (e) {
        if (!e.detail || e.detail.who !== 'thinker') return;
        thinker.classList.remove('nod'); void thinker.getBoundingClientRect(); thinker.classList.add('nod');
        clearTimeout(thinker._n); thinker._n = setTimeout(function () { thinker.classList.remove('nod'); }, 1200);
      });
    }

    /* On phones and portrait tablets the two chapters scroll normally (more room, easier to read);
       only the landing keeps its pinned gust transition. */
    var flowMQ = window.matchMedia('(max-width: 860px)'), flow = flowMQ.matches;
    /* Crossing the small-screen size (resizing a window, rotating a tablet) needs a fresh layout:
       remember where the reader was, then reload. */
    function onFlowChange() {
      try { sessionStorage.setItem('sf-scroll', String(window.scrollY / Math.max(1, document.documentElement.scrollHeight))); } catch (e) {}
      location.reload();
    }
    if (flowMQ.addEventListener) flowMQ.addEventListener('change', onFlowChange); else if (flowMQ.addListener) flowMQ.addListener(onFlowChange);
    setTimeout(function () {
      var f = null; try { f = sessionStorage.getItem('sf-scroll'); sessionStorage.removeItem('sf-scroll'); } catch (e) {}
      if (f !== null) window.scrollTo(0, parseFloat(f) * document.documentElement.scrollHeight);
    }, 400);
    var projSec = scene.querySelector('.sc-projects .sc-section'), after = scene.querySelector('.scene-after');
    if (flow && after && nowSec && projSec) {
      var wrapNow = document.createElement('div'), wrapProj = document.createElement('div');
      wrapNow.className = 'sc-flow sc-flow-now'; wrapProj.className = 'sc-flow sc-flow-proj';
      wrapNow.appendChild(nowSec); wrapProj.appendChild(projSec);
      after.insertBefore(wrapProj, after.firstChild); after.insertBefore(wrapNow, wrapProj);
      scene.classList.add('sc-flowing');
    }
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage, start: 'top top', end: function () { return '+=' + Math.round(vh() * (flow ? .85 : 4.2)); },
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: function (self) {
          if (garden) garden.story(self.progress);
          if (labels.length && !flow) { var i = self.progress < .3 ? 0 : self.progress < .64 ? 1 : 2; if (chapterLabel.textContent !== labels[i]) chapterLabel.textContent = labels[i]; }
        },
        onLeave: function () { fx.classList.add('hidden'); if (!flow && labels[3]) chapterLabel.textContent = labels[3]; },
        onEnterBack: function () { fx.classList.remove('hidden'); if (flow && labels[0]) chapterLabel.textContent = labels[0]; }
      }
    });
    // autoAlpha hides a faded panel completely, so it no longer sits on top catching clicks
    tl.to(g1, { p: 1, duration: 1.3, onUpdate: function () { placeGust(g1.p); gustBreeze(g1); } }, 0)
      .to(walk, { p: 1, duration: .95, onUpdate: function () { placeThinker(walk.p); } }, 0)
      .to(landInner, { x: function () { return -vw() * .1; }, y: -24, autoAlpha: 0, filter: 'blur(12px)', duration: .7, ease: 'power1.in' }, .3);
    if (!flow) {
      tl.to(landing, { autoAlpha: 0, duration: .45 }, .7)
        .from(nowItems, { x: 70, opacity: 0, filter: 'blur(10px)', stagger: .1, duration: .6, ease: 'power2.out' }, .85)
        .to(g2, { p: 1, duration: 1.3, onUpdate: function () { placeGust(g2.p); gustBreeze(g2); } }, 2.0)
        .to(nowSec, { x: function () { return -vw() * .1; }, y: -24, autoAlpha: 0, filter: 'blur(12px)', duration: .7, ease: 'power1.in' }, 2.3)
        .to(now, { autoAlpha: 0, duration: .45 }, 2.7)
        .from(projItems, { x: 70, opacity: 0, filter: 'blur(10px)', stagger: .1, duration: .6, ease: 'power2.out' }, 2.85)
        .to({}, { duration: .6 });
    } else {
      tl.to({}, { duration: .3 });
      // chapter label follows the sections as they scroll by
      [[nowSec, 1], [projSec, 2], [projSec && projSec.parentNode.nextElementSibling, 3]].forEach(function (pr) {
        if (!pr[0] || !labels[pr[1]]) return;
        window.ScrollTrigger.create({ trigger: pr[0], start: 'top 60%',
          onEnter: function () { chapterLabel.textContent = labels[pr[1]]; },
          onLeaveBack: function () { chapterLabel.textContent = labels[pr[1] - 1]; } });
      });
    }

    scene.querySelectorAll('.scene-after .sc-reveal').forEach(function (n) {
      gsap.from(n, { y: 40, opacity: 0, filter: 'blur(6px)', duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: n, start: 'top 92%', toggleActions: 'play none none reverse' } });
    });
    /* Keep every pinned panel's content above the garden band. If a panel is still too
       tall for the screen (small phones, short laptops), shrink it gently to fit. */
    var fitEls = (flow ? [landInner] : [landInner, nowSec, projSec]).filter(Boolean);
    function fitPanels() {
      var small = window.innerWidth <= 860;
      fitEls.forEach(function (el) {
        if (!small) {   /* laptops keep their size; if a panel is taller than the screen, start it below the top bar instead of centring it under it */
          el.style.scale = ''; var pn = el.closest('.sc-panel'); if (!pn) return;
          var pcs = getComputedStyle(pn), av = pn.clientHeight - parseFloat(pcs.paddingTop) - parseFloat(pcs.paddingBottom);
          pn.style.alignItems = el.offsetHeight > av ? 'flex-start' : ''; return;
        }
        var panel = el.closest('.sc-panel'); if (!panel) return;
        var cs = getComputedStyle(panel), avail = panel.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        el.style.scale = ''; var hgt = el.offsetHeight;
        var k = hgt > avail && avail > 0 ? Math.max(.55, avail / hgt) : 1;
        el.style.transformOrigin = '50% 0'; el.style.scale = k < 1 ? k.toFixed(3) : '';
      });
    }
    fitPanels();
    document.addEventListener('sf:garden-layout', function () { setTimeout(fitPanels, 30); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPanels);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { thFar = 0; fitPanels(); window.ScrollTrigger.refresh(); }, 150); });

    api.scrollTo = function (p) {
      var st = tl.scrollTrigger;
      if (flow) {   // phones: jump to the real sections
        var tgt = p <= 0 ? null : p < .6 ? nowSec : projSec;
        var y = tgt ? tgt.getBoundingClientRect().top + window.scrollY - 70 : 0;
        window.scrollTo({ top: y, behavior: 'smooth' }); return;
      }
      window.scrollTo({ top: p >= 1 ? st.end + 2 : st.start + (st.end - st.start) * p, behavior: 'smooth' });
    };
    setupChrome(scene, opts, api);
    if (window.Garden && garden) garden.bind();
    sealDisperse(scene);
    weatherWord(scene, garden);
    return api;
  }

  /* The garden matches the visitor's season, time of day and real weather.
     It starts with Texas (Dallas) right away, then, if the visitor allows location,
     switches to where they are. Weather comes from Open-Meteo (free, no key). */
  function atmosphere(scene, opts, api) {
    var TX = { lat: 32.78, lon: -96.8, tz: 'America/Chicago' }, applied = null, shownTip = false;
    function seasonFor(month, lat) {            // month 1..12
      var m = lat < 0 ? ((month + 5) % 12) + 1 : month;
      return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'fall' : 'winter';
    }
    function clockIn(tz) {
      try {
        var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23', month: 'numeric' }).formatToParts(new Date()), o = {};
        f.forEach(function (x) { o[x.type] = +x.value; }); return { hour: o.hour, month: o.month };
      } catch (e) { var d = new Date(); return { hour: d.getHours(), month: d.getMonth() + 1 }; }
    }
    function guessDay(hour, month) { var dusk = month >= 4 && month <= 9 ? 20 : 18; return hour >= 7 && hour < dusk; }
    function setMode(day) {
      var want = day ? 'day' : 'night';
      if (scene.getAttribute('data-mode') !== want && opts.onToggleMode) opts.onToggleMode();
    }
    function apply(info) {
      applied = info;
      var g = window.Garden && window.Garden._api;
      if (g && g.setSeason) g.setSeason(info.season);
      setMode(info.day);
      if (info.rain && g && g.realRain) g.realRain();
      if (!shownTip && scene.classList.contains('sc-go')) { shownTip = true; setTimeout(function () { tip(info); }, 2600); }
    }
    function weather(lat, lon, where, fallback) {
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(1) + '&longitude=' + lon.toFixed(1) + '&current=weather_code,is_day&timezone=auto';
      var done = false, to = setTimeout(function () { if (!done) { done = true; apply(fallback); } }, 4000);
      fetch(url).then(function (r) { return r.json(); }).then(function (j) {
        if (done) return; done = true; clearTimeout(to);
        var cur = j.current || {}, month = cur.time ? +cur.time.slice(5, 7) : fallback.month, code = cur.weather_code;
        var snow = (code >= 71 && code <= 77) || code === 85 || code === 86;
        var rain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
        apply({ season: snow ? 'winter' : seasonFor(month, lat), day: cur.is_day === 1, rain: rain, where: where, month: month });
      }).catch(function () { if (!done) { done = true; clearTimeout(to); apply(fallback); } });
    }
    function texas() {
      var k = clockIn(TX.tz), info = { season: seasonFor(k.month, TX.lat), day: guessDay(k.hour, k.month), rain: false, where: 'tx', month: k.month };
      return info;
    }
    // apply Texas straight away so there is no flash, then refine
    var tx = texas(); applied = tx;
    setTimeout(function () { var g = window.Garden && window.Garden._api; if (g && g.setSeason) g.setSeason(tx.season); setMode(tx.day); }, 0);
    function tip(info) {
      var ui = scene.querySelector('.sc-ui'); if (!ui) return;
      var names = { spring: 'spring', summer: 'summer', fall: 'fall', winter: 'winter' };
      var small = window.innerWidth < 860;
      var lead = 'Right now it is a ' + (info.rain ? 'rainy ' : '') + names[info.season] + ' ' + (info.day ? 'day' : 'night') + (info.where === 'you' ? ' where you are' : ' in Texas') + ', so the garden is too.';
      var t = document.createElement('div'); t.className = 'sc-tip';
      t.innerHTML = '<span class="ar" aria-hidden="true">&#8599;</span>' + lead + ' ' + (small ? 'Change the season or day and night from Contents, top right.' : 'Change the season or switch day and night up here.') + '<button type="button" aria-label="Close tip">&times;</button>';
      ui.appendChild(t);
      var btns = ui.querySelectorAll('.tr [data-season-cycle], .tr [data-mode-toggle]');
      btns.forEach(function (b) { b.classList.add('sc-pulse'); });
      requestAnimationFrame(function () { t.classList.add('on'); });
      function close() { t.classList.remove('on'); btns.forEach(function (b) { b.classList.remove('sc-pulse'); }); setTimeout(function () { t.remove(); }, 600); }
      t.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); close(); });
      setTimeout(close, 11000);
    }
    return {
      locate: function () {
        if (this._did) return; this._did = true;
        var fb = texas();
        if (!navigator.geolocation) { weather(TX.lat, TX.lon, 'tx', fb); return; }
        navigator.geolocation.getCurrentPosition(function (pos) {
          var lat = pos.coords.latitude, lon = pos.coords.longitude, d = new Date();
          weather(lat, lon, 'you', { season: seasonFor(d.getMonth() + 1, lat), day: guessDay(d.getHours(), d.getMonth() + 1), rain: false, where: 'you', month: d.getMonth() + 1 });
        }, function () { weather(TX.lat, TX.lon, 'tx', fb); }, { timeout: 8000, maximumAge: 3600000 });
      }
    };
  }

  /* Hover the SF seal and it breaks into drifting embers, then gathers back (like the thinker on Philos). */
  function sealDisperse(scene) {
    var seal = scene.querySelector('.sc-landing .sc-seal'); if (!seal || !seal.offsetWidth) return;
    var svg = seal.querySelector('svg'); if (!svg) return;
    var cv = document.createElement('canvas'); cv.className = 'sc-seal-cv'; seal.appendChild(cv);
    var halo = document.createElement('canvas'); halo.width = halo.height = 64; (function () { var h = halo.getContext('2d'), gr = h.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,170,80,.9)'); gr.addColorStop(.4, 'rgba(255,130,50,.35)'); gr.addColorStop(1, 'rgba(255,110,40,0)'); h.fillStyle = gr; h.fillRect(0, 0, 64, 64); })();
    var ctx = cv.getContext('2d'), parts = [], d = 0, target = 0, running = false, size = 0, pad = 0;
    function build() {
      size = Math.round(seal.clientWidth); pad = Math.round(size * .9);
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = (size + pad * 2) * dpr; cv.height = (size + pad * 2) * dpr; cv.style.width = cv.style.height = (size + pad * 2) + 'px';
      cv.style.left = cv.style.top = (-pad) + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var xml = new XMLSerializer().serializeToString(svg);
      if (xml.indexOf('xmlns=') < 0) xml = xml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      var img = new Image();
      img.onload = function () {
        var off = document.createElement('canvas'); off.width = off.height = size; var oc = off.getContext('2d');
        oc.drawImage(img, 0, 0, size, size);
        var data = oc.getImageData(0, 0, size, size).data, step = Math.max(2, Math.round(size / 70)); parts = [];
        for (var y = 0; y < size; y += step) for (var x = 0; x < size; x += step) {
          var i = (y * size + x) * 4; if (data[i + 3] < 90) continue;
          var a = Math.random() * 6.283;
          parts.push({ hx: x, hy: y, r: data[i], g: data[i + 1], b: data[i + 2], a: a, dist: .35 + Math.random() * 1.1, ph: Math.random() * 6.283, sp: .6 + Math.random() * 1.4, s: step * .62 });
        }
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    }
    var sheds = [];
    function shed(t) {
      if (parts.length && sheds.length < 26 && Math.random() < .35) {
        var p = parts[Math.floor(Math.random() * parts.length)], cx = size / 2;
        if (Math.hypot(p.hx - cx, p.hy - cx) > size * .36) sheds.push({ x: pad + p.hx, y: pad + p.hy, vx: (p.hx - cx) * .004 + (Math.random() - .5) * .25, vy: -.25 - Math.random() * .45, life: 1, s: 1 + Math.random() * 1.6, ph: Math.random() * 6.3 });
      }
      for (var i = sheds.length - 1; i >= 0; i--) {
        var q = sheds[i]; q.x += q.vx + Math.sin(t / 500 + q.ph) * .25; q.y += q.vy; q.life -= .009;
        if (q.life <= 0) { sheds.splice(i, 1); continue; }
        ctx.globalAlpha = q.life * .9; ctx.fillStyle = q.life > .6 ? '#ffd9a0' : '#ff8a3d';
        ctx.fillRect(q.x, q.y, q.s, q.s);
      }
      ctx.globalAlpha = 1;
    }
    var lt = 0;
    function frame(t) {
      /* slow breath: about 2.8s to breathe out (scatter), 3.4s to breathe back in */
      var dt = Math.min(.05, (t - (lt || t)) / 1000); lt = t;
      if (target > d) d = Math.min(target, d + dt / 2.8); else if (target < d) d = Math.max(target, d - dt / 3.4);
      ctx.clearRect(0, 0, size + pad * 2, size + pad * 2);
      shed(t);
      seal.style.setProperty('--sd', (.5 - .5 * Math.cos(Math.PI * d)).toFixed(3));
      if (d < .004 && target === 0) { svg.style.opacity = 1; cv.style.opacity = 1; requestAnimationFrame(frame); return; }
      var c = size / 2, R = size * .9, e = (.5 - .5 * Math.cos(Math.PI * d)) * (1 + .09 * Math.sin(t / 4200 * 6.283) * d);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], wob = Math.sin(t / 1300 * p.sp + p.ph) * 7 * e;
        var x = pad + p.hx + Math.cos(p.a) * p.dist * R * e + wob, y = pad + p.hy + Math.sin(p.a) * p.dist * R * e * .7 - e * e * 46 * p.sp + Math.cos(t / 1600 * p.sp + p.ph) * 5 * e;
        var rr = Math.round(p.r + (255 - p.r) * e * .6), gg = Math.round(p.g + (150 - p.g) * e * .7), bb = Math.round(p.b + (60 - p.b) * e * .7);
        ctx.globalAlpha = 1 - e * .45; ctx.fillStyle = 'rgb(' + rr + ',' + gg + ',' + bb + ')';
        ctx.fillRect(x - p.s / 2, y - p.s / 2, p.s * (1 - e * .35), p.s * (1 - e * .35));
        if (i % 11 === 0 && e > .01) { var hs = size * .16; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .16 * e; ctx.drawImage(halo, x - hs / 2, y - hs / 2, hs, hs); ctx.globalCompositeOperation = 'source-over'; }
      }
      ctx.globalAlpha = 1;
      svg.style.opacity = 0; cv.style.opacity = 1;
      requestAnimationFrame(frame);
    }
    function go(v) { target = v; }
    build(); requestAnimationFrame(frame);
    seal.addEventListener('mouseenter', function () { go(1); });
    seal.addEventListener('mouseleave', function () { go(0); });
    seal.addEventListener('click', function (e) { e.stopPropagation(); go(target ? 0 : 1); });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 200); });
  }

  /* "You seem... cool." The last word follows the season and the rain, with its own colour.
     It keeps its cat ears, tail and blinking letters. */
  var WORDS = {
    'spring-day': ['lovely', [1, 3]], 'spring-night': ['dreamy', [2, 3]],
    'summer-day': ['sunny', [1, 4]], 'summer-night': ['starry', [2]],
    'fall-day': ['cozy', [1]], 'fall-night': ['mellow', [1, 4]],
    'winter-day': ['frosty', [2]], 'winter-night': ['cool', [1, 2]],
    'rain-day': ['calm', [1]], 'rain-night': ['quiet', [0, 3]]
  };
  function buildWord(el, key) {
    var w = WORDS[key] || WORDS['winter-night'], cw = el.querySelector('.cw'), html = '';
    for (var i = 0; i < w[0].length; i++) html += w[1].indexOf(i) >= 0 ? '<span class="o">' + w[0][i] + '</span>' : '<span class="l">' + w[0][i] + '</span>';
    cw.innerHTML = html;
    var letters = cw.children, last = letters[letters.length - 1], e2 = el.querySelector('.e2');
    if (e2 && last) e2.style.left = (last.offsetLeft + last.offsetWidth * .3) + 'px';
  }
  function weatherWord(scene, garden) {
    var title = scene.querySelector('.sc-landing .sc-title'); if (!title) return;
    var el = title.querySelector('.cool'); if (!el) return;
    function apply(d) {
      var key = (d.raining ? 'rain' : d.season) + '-' + (d.mode === 'day' ? 'day' : 'night');
      if (title.getAttribute('data-w') === key) return;
      var first = !title.getAttribute('data-w');
      title.setAttribute('data-w', key); var li = title.closest('.sc-landing-inner'); if (li) li.setAttribute('data-w', key);
      if (first) { buildWord(el, key); return; }
      el.classList.add('swap');
      setTimeout(function () { buildWord(el, key); el.classList.remove('swap'); }, 420);
    }
    document.addEventListener('sf:weather', function (e) { apply(e.detail); });
    if (garden && garden.announce) garden.announce();
    else apply({ season: 'winter', raining: false, mode: 'night' });
  }

  function setupHearts(scene) {
    scene.querySelectorAll('.sc-heart').forEach(function (btn) {
      var key = btn.dataset.key, label = btn.querySelector('.lbl'), on = store(key) === '1';
      function paint() { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on); label.textContent = on ? 'Thank you' : 'Give it a heart'; }
      paint();
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); on = !on; paint();
        if (on) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
        store(key, on ? '1' : '0');
      });
    });
  }

  window.SceneKit = { init: init };
})();

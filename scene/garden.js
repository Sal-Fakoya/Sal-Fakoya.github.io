/* SFPaint: paints anime-style scenery on canvas.
   Painterly trees made of brush dabs, cumulus clouds, a hazy tree line,
   a meadow with a path, light shafts, and night versions.
   Seasons: spring, summer, fall, winter. Original artwork, generated in code. */
(function () {
  'use strict';
  if (window.SFPaint) return;
  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  var TAU = Math.PI * 2;

  var PAL = {
    spring: { sky: ['#93bfe3', '#c9d2ea', '#efdbe7', '#fae6ea'], cloudL: '#ffffff', cloudS: '#e3d4e4', far: '#cdb4cf', far2: '#e2cfdc',
      ground: ['#d9dcb9', '#c1cd9c', '#a8bc86'], path: '#efe6d4', grass: ['#7fa36a', '#94b878', '#6a915a', '#a9c98a'], litter: ['#f5c2d2', '#fbdbe5'], night: '#2f2c5e' },
    summer: { sky: ['#2b98df', '#5fbcee', '#a9dcf3', '#dff3f4'], cloudL: '#ffffff', cloudS: '#bfd6e9', far: '#7fb39b', far2: '#a7cdb6',
      ground: ['#b6d38d', '#94bf6c', '#78a858'], path: '#ece4cc', grass: ['#4f8a43', '#6aa452', '#3d7a39', '#86bb5c'], litter: [], night: '#1d3157' },
    fall: { sky: ['#3573c9', '#7fb3e6', '#cfe0ee', '#f2dcc0'], cloudL: '#ffffff', cloudS: '#d2dbe8', far: '#c99a68', far2: '#e0bb8c',
      ground: ['#c99e5c', '#b0803f', '#8f6a36'], path: '#eadbbd', grass: ['#9a6b2d', '#b8783a', '#7f5a2a', '#c99a4a'], litter: ['#d0602a', '#e3962f', '#a8321e', '#c8582a'], night: '#3a2c4c' },
    winter: { sky: ['#6880ab', '#9fadcb', '#cdd3e3', '#e8e6ef'], cloudL: '#f4f5fa', cloudS: '#b7bfd3', far: '#9eabc5', far2: '#c3cbdc',
      ground: ['#eef2f8', '#dde4ef', '#cbd5e5'], path: '#f7f9fc', grass: ['#c7cfdd', '#aeb9cc', '#dfe5ee'], litter: [], night: '#26345e' }
  };
  var LEAF = {
    spring: { s: ['#b9789a', '#a96a8e', '#c2849f'], m: ['#e6a3bd', '#eeb6ca', '#df98b4', '#f2c0d0'], l: ['#fbe1ea', '#fff3f7', '#f8d0de', '#ffffff'] },
    summer: { s: ['#2c5a33', '#25502e', '#356538'], m: ['#4c8742', '#5a984a', '#447c3c', '#62a050'], l: ['#9ccd68', '#b6db78', '#84c05a', '#cde98f'] },
    fall: { s: ['#7f2a1a', '#702517', '#8f3e1d'], m: ['#cc5c28', '#de772c', '#c24c23', '#d8682a'], l: ['#f4b648', '#f9cf62', '#eda03a', '#ffe08a'] }
  };

  function dab(c, x, y, rx, ry, rot, col, a) { c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill(); }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function gauss(r) { return (r() + r() + r() - 1.5) / 1.5; }

  /* A tree: tapered trunk, recursive branches, foliage clusters of dabs. */
  function paintTree(c, x, y, h, season, r, o) {
    o = o || {};
    var trunkW = o.trunkW || h * .055, lean = o.lean || 0, maxD = o.depth || 5, k = Math.max(.45, Math.min(1.7, h / 520));
    var segs = [], tips = [];
    function grow(x0, y0, ang, len, w, d) {
      var bend = (r() - .5) * .5, x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
      segs.push({ x0: x0, y0: y0, x1: x1, y1: y1, cx: x0 + Math.cos(ang + bend) * len * .55, cy: y0 + Math.sin(ang + bend) * len * .55, w0: w, w1: w * .66, d: d, ang: ang });
      if (d >= maxD) { tips.push([x1, y1, len]); return; }
      var n = d === 0 ? 3 : (r() < .55 ? 2 : 3);
      for (var i = 0; i < n; i++) {
        var a = ang + (i - (n - 1) / 2) * (d === 0 ? .62 : .58) + (r() - .5) * .4;
        if (a > -.15) a = -.15 - r() * .2; if (a < -Math.PI + .15) a = -Math.PI + .15 + r() * .2;
        grow(x1, y1, a, len * (.66 + r() * .14), w * .64, d + 1);
      }
      if (d >= 2 && r() < .45) tips.push([x1, y1, len * 1.1]);
    }
    grow(x, y, -Math.PI / 2 + lean, h * .3, trunkW, 0);

    var bark = season === 'winter' ? '#2a2321' : '#3b2b23', barkL = season === 'winter' ? '#6f6762' : '#7c6353';
    c.lineCap = 'round'; c.lineJoin = 'round';
    segs.forEach(function (s) {
      if (s.d <= 1) {
        var nx = -Math.sin(s.ang), ny = Math.cos(s.ang), flare = s.d === 0 ? s.w0 * .55 : 0;
        c.globalAlpha = 1; c.fillStyle = bark; c.beginPath();
        c.moveTo(s.x0 - nx * (s.w0 / 2 + flare), s.y0 - ny * (s.w0 / 2));
        c.quadraticCurveTo(s.cx - nx * s.w0 * .42, s.cy - ny * s.w0 * .42, s.x1 - nx * s.w1 / 2, s.y1 - ny * s.w1 / 2);
        c.lineTo(s.x1 + nx * s.w1 / 2, s.y1 + ny * s.w1 / 2);
        c.quadraticCurveTo(s.cx + nx * s.w0 * .42, s.cy + ny * s.w0 * .42, s.x0 + nx * (s.w0 / 2 + flare), s.y0 + ny * (s.w0 / 2));
        c.closePath(); c.fill();
        // light side and bark texture
        c.strokeStyle = barkL; c.globalAlpha = .45; c.lineWidth = s.w0 * .16; c.beginPath();
        c.moveTo(s.x0 + nx * s.w0 * .28, s.y0 + ny * s.w0 * .28); c.quadraticCurveTo(s.cx + nx * s.w0 * .26, s.cy + ny * s.w0 * .26, s.x1 + nx * s.w1 * .26, s.y1 + ny * s.w1 * .26); c.stroke();
        for (var t = 0; t < s.w0 * 1.6; t++) {
          var q = r(), px = s.x0 + (s.x1 - s.x0) * q + nx * (r() - .5) * s.w0 * .8, py = s.y0 + (s.y1 - s.y0) * q + ny * (r() - .5) * s.w0 * .8;
          c.globalAlpha = .25; c.strokeStyle = r() < .5 ? '#1c1411' : barkL; c.lineWidth = 1 + r() * 1.5;
          c.beginPath(); c.moveTo(px, py); c.lineTo(px + (s.x1 - s.x0) * .04, py + (s.y1 - s.y0) * .06); c.stroke();
        }
      } else {
        c.globalAlpha = 1; c.strokeStyle = bark; c.lineWidth = s.w0; c.beginPath(); c.moveTo(s.x0, s.y0); c.quadraticCurveTo(s.cx, s.cy, s.x1, s.y1); c.stroke();
      }
    });

    if (season === 'winter') {
      c.strokeStyle = bark; c.globalAlpha = .9;
      segs.forEach(function (s) {
        if (s.d < maxD - 1) return;
        for (var i = 0; i < 3; i++) {
          var tp = [s.x1, s.y1, Math.hypot(s.x1 - s.x0, s.y1 - s.y0)], a = s.ang + (r() - .5) * 1.1, L = tp[2] * (.3 + r() * .3);
          c.lineWidth = Math.max(.6, 1.4 * k); c.beginPath(); c.moveTo(tp[0], tp[1]); c.lineTo(tp[0] + Math.cos(a) * L, tp[1] + Math.sin(a) * L); c.stroke();
        }
      });
      segs.forEach(function (s) {
        var horiz = Math.abs(Math.cos(s.ang)); if (horiz < .35 || s.w0 < 2) return;
        c.strokeStyle = '#f7f9fd'; c.globalAlpha = .92; c.lineWidth = Math.max(1.2, s.w0 * .42);
        c.beginPath(); c.moveTo(s.x0, s.y0 - s.w0 * .42); c.quadraticCurveTo(s.cx, s.cy - s.w0 * .45, s.x1, s.y1 - s.w1 * .45); c.stroke();
      });
      tips.forEach(function (tp) { for (var i = 0; i < 6; i++) dab(c, tp[0] + gauss(r) * 8 * k, tp[1] + gauss(r) * 5 * k, (1.5 + r() * 2.5) * k, (1 + r() * 1.5) * k, 0, '#f7f9fd', .8); });
    } else {
      var c0 = c; c = o.leafCtx || c;
      var L = LEAF[season], lr = o.leafR || h * .11, lx = .55, ly = -.75;
      var clusters = tips.map(function (tp) { return [tp[0], tp[1], lr * (.7 + r() * .6)]; });
      [['s', .95, .38, .14], ['m', 1, .42, 0], ['l', .45, .2, -.18]].forEach(function (pass) {
        clusters.forEach(function (cl) {
          var R = cl[2], n = Math.min(520, Math.round(R * R * .2 * pass[1]));
          for (var i = 0; i < n; i++) {
            var ox = gauss(r) * R, oy = gauss(r) * R * .78, side = (ox * lx + oy * ly) / R;
            if ((ox * ox) / (R * R) + (oy * oy) / (R * R * .61) > 1.05) continue;
            var col = pass[0] === 's' ? pick(r, L.s) : pass[0] === 'm' ? (side > .55 ? pick(r, L.l) : pick(r, L.m)) : pick(r, L.l);
            var px = cl[0] + ox + pass[3] * R * (pass[0] === 'l' ? -lx * -1 : 1), py = cl[1] + oy + pass[3] * R * (pass[0] === 'l' ? -1 : 1);
            if (pass[0] === 'l' && side < -.1) continue;
            var rx = (2.2 + r() * 4.2) * k, ry = rx * (.45 + r() * .4);
            dab(c, px, py, rx, ry, r() * TAU, col, pass[0] === 's' ? .55 + r() * .3 : .7 + r() * .3);
          }
        });
      });
      if (season === 'spring') clusters.forEach(function (cl) { for (var i = 0; i < 26; i++) dab(c, cl[0] + gauss(r) * cl[2] * .45, cl[1] + gauss(r) * cl[2] * .32, 1.2 * k, 1.2 * k, 0, '#ffffff', .85); });
      c.globalAlpha = 1; c = c0;
    }
    c.globalAlpha = 1;
    return tips;
  }

  function cloud(c, cx, cy, w, hgt, r, P, alpha) {
    var puffs = [], n = Math.max(6, Math.round(w / 22));
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), top = Math.sin(t * Math.PI), rad = hgt * (.32 + .68 * top) * (.65 + .45 * r());
      puffs.push([cx - w / 2 + t * w + (r() - .5) * w * .06, cy - rad * .55 * top - hgt * .1 * r(), rad]);
    }
    for (var j = 0; j < n * .6; j++) { var t2 = .2 + r() * .6; puffs.push([cx - w / 2 + t2 * w, cy - hgt * (.6 + r() * .5), hgt * (.35 + r() * .35)]); }
    c.save(); c.beginPath(); c.rect(cx - w, cy - hgt * 4, w * 2, hgt * 4 + hgt * .22); c.clip();
    c.globalAlpha = alpha;
    puffs.forEach(function (p) { c.fillStyle = P.cloudS; c.beginPath(); c.arc(p[0] + p[2] * .06, p[1] + p[2] * .14, p[2], 0, TAU); c.fill(); });
    puffs.forEach(function (p) {
      var g = c.createRadialGradient(p[0] - p[2] * .3, p[1] - p[2] * .35, p[2] * .1, p[0], p[1], p[2]);
      g.addColorStop(0, P.cloudL); g.addColorStop(.7, P.cloudL); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.beginPath(); c.arc(p[0] - p[2] * .05, p[1] - p[2] * .1, p[2] * .9, 0, TAU); c.fill();
    });
    c.restore(); c.globalAlpha = 1;
  }

  /* Distant houses: hazy walls, coloured roofs, chimneys, snow caps in winter.
     Returns the window rectangles that should be lit at night. */
  function paintHouses(c, W, H, hz, season, mode, comp, r, P) {
    var lit = [], night = mode === 'night';
    var walls = ['#e2d6c4', '#d6c7b2', '#ece2d2', '#cdbfae', '#e6dccf'];
    var roofs = ['#8c4a3c', '#5e5a6e', '#7d5a3e', '#4d6476', '#9a5e44', '#6b4b5a'];
    var clusters = comp === 'frame'
      ? [[.5, 7, .1], [.22, 3, .05], [.8, 4, .06]]
      : [[.62, 7, .1], [.86, 5, .08], [.3, 3, .05]];
    var houses = [];
    clusters.forEach(function (cl) {
      for (var i = 0; i < cl[1]; i++) {
        var hh = H * (.022 + r() * .022), x = W * (cl[0] + (r() - .5) * cl[2] * 2);
        houses.push({ x: x, h: hh, w: hh * (1.1 + r() * .9), y: hz + 2 - r() * H * .006, two: r() < .3, wall: pick(r, walls), roof: pick(r, roofs), chim: r() < .6, hip: r() < .3 });
      }
    });
    houses.sort(function (a, b) { return a.y - b.y || b.h - a.h; });
    houses.forEach(function (o) {
      var bh = o.two ? o.h * 1.25 : o.h, x0 = o.x - o.w / 2, top = o.y - bh, rh = o.h * .62, ov = o.w * .08;
      // body
      c.globalAlpha = 1; c.fillStyle = o.wall; c.fillRect(x0, top, o.w, bh);
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(x0 + o.w * .62, top, o.w * .38, bh);          // shaded side
      // chimney
      if (o.chim) { c.fillStyle = '#6a5a52'; c.fillRect(x0 + o.w * .68, top - rh * .95, o.w * .09, rh * .7); }
      // roof
      c.fillStyle = o.roof; c.beginPath();
      if (o.hip) { c.moveTo(x0 - ov, top); c.lineTo(x0 + o.w * .22, top - rh); c.lineTo(x0 + o.w * .78, top - rh); c.lineTo(x0 + o.w + ov, top); }
      else { c.moveTo(x0 - ov, top); c.lineTo(o.x, top - rh); c.lineTo(x0 + o.w + ov, top); }
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath();
      if (o.hip) { c.moveTo(o.x + o.w * .28, top - rh); c.lineTo(x0 + o.w * .78, top - rh); c.lineTo(x0 + o.w + ov, top); c.lineTo(o.x + o.w * .1, top); }
      else { c.moveTo(o.x, top - rh); c.lineTo(x0 + o.w + ov, top); c.lineTo(o.x + o.w * .05, top); }
      c.closePath(); c.fill();
      if (season === 'winter') {                                                            // snow on the roof
        c.fillStyle = '#f4f6fb'; c.beginPath();
        if (o.hip) { c.moveTo(x0 - ov, top + 1); c.lineTo(x0 + o.w * .22, top - rh); c.lineTo(x0 + o.w * .78, top - rh); c.lineTo(x0 + o.w + ov, top + 1); c.lineTo(x0 + o.w * .74, top - rh * .62); c.lineTo(x0 + o.w * .26, top - rh * .62); }
        else { c.moveTo(x0 - ov, top + 1); c.lineTo(o.x, top - rh); c.lineTo(x0 + o.w + ov, top + 1); c.lineTo(o.x, top - rh * .55); }
        c.closePath(); c.fill();
      }
      // windows and a door
      var ww = Math.max(2, o.w * .14), wh = Math.max(2, bh * (o.two ? .2 : .3)), rows = o.two ? 2 : 1;
      for (var rw = 0; rw < rows; rw++) for (var k = 0; k < 2; k++) {
        var wx = x0 + o.w * (k ? .62 : .2), wy = top + bh * (rows === 2 ? (rw ? .58 : .18) : .28);
        if (rw === rows - 1 && k === 0 && r() < .5) { c.fillStyle = 'rgba(60,40,32,.75)'; c.fillRect(x0 + o.w * .22, o.y - bh * .5, ww * 1.1, bh * .5); continue; }
        c.fillStyle = 'rgba(52,58,72,.7)'; c.fillRect(wx, wy, ww, wh);
        if (night && r() < .72) lit.push([wx, wy, ww, wh, r() < .4]);
      }
      // a thread of chimney smoke
      if (o.chim && (season === 'winter' || season === 'fall' || r() < .35)) {
        for (var sm = 0; sm < 6; sm++) dab(c, x0 + o.w * .72 + sm * o.w * .1 + (r() - .5) * 3, top - rh * .95 - sm * o.h * .28, o.h * (.1 + sm * .05), o.h * (.07 + sm * .03), 0, night ? '#aab0c4' : '#eef0f4', .3 - sm * .04);
      }
    });
    // atmospheric haze so they sit in the distance
    c.globalAlpha = .22; c.fillStyle = P.far2;
    houses.forEach(function (o) { var bh = o.two ? o.h * 1.25 : o.h; c.fillRect(o.x - o.w * .62, o.y - bh - o.h * .7, o.w * 1.24, bh + o.h * .7); });
    c.globalAlpha = 1;
    return lit;
  }

  function paintScene(canvas, W, H, season, mode, comp) {
    var c = canvas.getContext('2d'); canvas.width = W; canvas.height = H;
    var r = seeded(season.length * 977 + (comp === 'frame' ? 71 : 13)), P = PAL[season], hz = H * .63;
    // sky
    var g = c.createLinearGradient(0, 0, 0, hz + 4); P.sky.forEach(function (col, i) { g.addColorStop(i / (P.sky.length - 1), col); });
    c.fillStyle = g; c.fillRect(0, 0, W, hz + 4);
    var sun = c.createRadialGradient(W * .8, H * .08, 0, W * .8, H * .08, W * .55);
    sun.addColorStop(0, 'rgba(255,252,238,.75)'); sun.addColorStop(.35, 'rgba(255,248,230,.25)'); sun.addColorStop(1, 'rgba(255,248,230,0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, hz);
    // clouds
    if (season === 'winter') {
      for (var i = 0; i < 7; i++) cloud(c, r() * W, H * (.12 + r() * .35), W * (.35 + r() * .3), H * (.06 + r() * .05), r, P, .75);
    } else {
      var nC = season === 'summer' ? 4 : 5;
      for (var j = 0; j < nC; j++) {
        var big = season === 'summer' && j < 2;
        cloud(c, W * (.15 + r() * .8), hz - H * (big ? .02 : .1 + r() * .35), W * (big ? .32 : .14 + r() * .14), H * (big ? .17 : .05 + r() * .05), r, P, season === 'spring' ? .75 : .95);
      }
      if (season === 'summer') { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(W * .25, H * .08); c.lineTo(W * .72, H * .28); c.stroke(); }
    }
    // far tree line, two layers of haze
    [[P.far2, .06, 14, .75], [P.far, .035, 20, .9]].forEach(function (layer) {
      for (var x = -20; x < W + 20; x += 7 + r() * 9) {
        var rad = layer[2] * (.6 + r() * .9);
        dab(c, x, hz - r() * H * layer[1] - rad * .2, rad, rad * .85, 0, layer[0], layer[3]);
      }
    });
    // a little village in the distance, where the path ends
    var lit = paintHouses(c, W, H, hz, season, mode, comp, r, P);
    // ground
    var gg = c.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, P.ground[0]); gg.addColorStop(.5, P.ground[1]); gg.addColorStop(1, P.ground[2]);
    c.fillStyle = gg; c.fillRect(0, hz - 2, W, H - hz + 2);
    // path leading into the distance
    var pc = comp === 'frame' ? .5 : .62;
    c.globalAlpha = .55; c.fillStyle = P.path; c.beginPath();
    c.moveTo(W * (pc - .2), H); c.quadraticCurveTo(W * (pc - .06), hz + (H - hz) * .45, W * (pc - .015), hz + 2);
    c.lineTo(W * (pc + .015), hz + 2); c.quadraticCurveTo(W * (pc + .08), hz + (H - hz) * .45, W * (pc + .22), H); c.closePath(); c.fill();
    // ground texture, grass and litter
    for (var t = 0; t < 1400; t++) {
      var gy = hz + Math.pow(r(), .7) * (H - hz), sc = .3 + (gy - hz) / (H - hz) * 1.4;
      dab(c, r() * W, gy, (3 + r() * 6) * sc, (.8 + r() * 1.4) * sc, 0, pick(r, P.ground), .35);
    }
    c.lineCap = 'round';
    for (var s = 0; s < 900; s++) {
      var y0 = hz + Math.pow(r(), .55) * (H - hz), sc2 = .3 + (y0 - hz) / (H - hz) * 1.6, x0 = r() * W;
      c.strokeStyle = pick(r, P.grass); c.globalAlpha = .55; c.lineWidth = (.8 + r()) * sc2;
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + (r() - .5) * 4 * sc2, y0 - 5 * sc2, x0 + (r() - .5) * 6 * sc2, y0 - (6 + r() * 7) * sc2); c.stroke();
    }
    if (P.litter.length) for (var l = 0; l < (season === 'fall' ? 900 : 350); l++) {
      var ly = hz + Math.pow(r(), .5) * (H - hz), lsc = .3 + (ly - hz) / (H - hz) * 1.3;
      dab(c, r() * W, ly, (1.6 + r() * 2.6) * lsc, (1 + r() * 1.4) * lsc, r() * TAU, pick(r, P.litter), .75);
    }
    if (season === 'winter') for (var d = 0; d < 40; d++) dab(c, r() * W, hz + r() * (H - hz), 30 + r() * 90, 3 + r() * 7, 0, r() < .5 ? '#ffffff' : '#c9d3e6', .18);
    // trees
    if (comp === 'frame') {
      paintTree(c, W * .62, hz + H * .02, H * .26, season, r, { trunkW: 5, depth: 4 });
      paintTree(c, W * .36, hz + H * .03, H * .3, season, r, { trunkW: 6, depth: 4 });
      paintTree(c, W * .03, H * 1.02, H * 1.15, season, r, { lean: .22, trunkW: Math.max(40, W * .034), leafR: H * .13 });
      paintTree(c, W * .98, H * 1.02, H * 1.05, season, r, { lean: -.24, trunkW: Math.max(36, W * .03), leafR: H * .12 });
    } else {
      paintTree(c, W * .48, hz + H * .025, H * .28, season, r, { trunkW: 6, depth: 4 });
      paintTree(c, W * .72, hz + H * .02, H * .22, season, r, { trunkW: 5, depth: 4 });
      paintTree(c, W * .1, H * 1.04, H * 1.22, season, r, { lean: .14, trunkW: Math.max(46, W * .04), leafR: H * .14 });
    }
    // light shafts and dappled light (day)
    if (mode !== 'night' && season !== 'winter') {
      c.globalCompositeOperation = 'screen';
      for (var b = 0; b < 5; b++) {
        var bx = W * (.45 + b * .12), sg = c.createLinearGradient(W * .9, 0, bx - W * .3, H);
        sg.addColorStop(0, 'rgba(255,250,230,.1)'); sg.addColorStop(1, 'rgba(255,250,230,0)');
        c.fillStyle = sg; c.beginPath(); c.moveTo(W * .88, -10); c.lineTo(W * .92, -10); c.lineTo(bx - W * .2 + W * .03, H); c.lineTo(bx - W * .2 - W * .05, H); c.closePath(); c.fill();
      }
      for (var dl = 0; dl < 90; dl++) dab(c, r() * W, hz + (H - hz) * (.3 + r() * .7), 8 + r() * 26, 3 + r() * 8, 0, 'rgba(255,248,220,1)', .1);
      c.globalCompositeOperation = 'source-over';
    }
    if (mode === 'night') {
      c.globalCompositeOperation = 'multiply'; c.globalAlpha = 1; c.fillStyle = P.night; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'screen';
      var mg = c.createRadialGradient(W * .78, H * .14, 0, W * .78, H * .14, W * .35);
      mg.addColorStop(0, 'rgba(210,220,255,.55)'); mg.addColorStop(1, 'rgba(210,220,255,0)'); c.fillStyle = mg; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'source-over';
      // windows glow warm at night (drawn after the night tint so they stay bright)
      lit.forEach(function (wn) {
        var wg = c.createRadialGradient(wn[0] + wn[2] / 2, wn[1] + wn[3] / 2, 0, wn[0] + wn[2] / 2, wn[1] + wn[3] / 2, wn[2] * 3.2);
        wg.addColorStop(0, 'rgba(255,190,110,.35)'); wg.addColorStop(1, 'rgba(255,190,110,0)');
        c.globalAlpha = 1; c.fillStyle = wg; c.fillRect(wn[0] - wn[2] * 3, wn[1] - wn[2] * 3, wn[2] * 7, wn[2] * 7);
        c.fillStyle = wn[4] ? '#ffd58a' : '#ffc070'; c.globalAlpha = .95; c.fillRect(wn[0], wn[1], wn[2], wn[3]);
      });
      c.fillStyle = '#f4f1e2'; c.globalAlpha = .95; c.beginPath(); c.arc(W * .78, H * .14, Math.max(16, W * .018), 0, TAU); c.fill();
      for (var st = 0; st < 260; st++) { var sy = Math.pow(r(), 1.4) * hz * .85; dab(c, r() * W, sy, .6 + r() * 1.2, .6 + r() * 1.2, 0, '#ffffff', .25 + r() * .6); }
      if (season === 'spring') { c.globalCompositeOperation = 'screen'; var pg = c.createLinearGradient(0, hz - H * .2, 0, hz + H * .1); pg.addColorStop(0, 'rgba(255,150,190,0)'); pg.addColorStop(1, 'rgba(255,150,190,.18)'); c.fillStyle = pg; c.fillRect(0, hz - H * .2, W, H * .3); c.globalCompositeOperation = 'source-over'; }
    }
    // paper grain
    var n = document.createElement('canvas'); n.width = n.height = 96; var nc = n.getContext('2d'), id = nc.createImageData(96, 96);
    for (var p = 0; p < id.data.length; p += 4) { var v = Math.random() * 255; id.data[p] = id.data[p + 1] = id.data[p + 2] = v; id.data[p + 3] = 14; }
    nc.putImageData(id, 0, 0); c.globalAlpha = 1; c.fillStyle = c.createPattern(n, 'repeat'); c.fillRect(0, 0, W, H);
    return { horizon: hz };
  }

  /* A single tree on its own canvas (for the garden), night-tinted when needed. */
  function paintGardenTree(canvas, leafCanvas, season, mode, seed) {
    var W = 480, H = 520, c = canvas.getContext('2d'), lc = leafCanvas.getContext('2d');
    canvas.width = leafCanvas.width = W; canvas.height = leafCanvas.height = H; c.clearRect(0, 0, W, H); lc.clearRect(0, 0, W, H);
    var tips = paintTree(c, W / 2, H - 2, 330, season, seeded(seed || 41), { trunkW: 20, depth: 5, leafR: 44, leafCtx: lc });
    if (mode === 'night') [c, lc].forEach(function (x) {
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(28,34,78,.55)'; x.fillRect(0, 0, W, H);
      var rim = x.createLinearGradient(W, 0, W * .3, H * .6); rim.addColorStop(0, 'rgba(200,215,255,.16)'); rim.addColorStop(1, 'rgba(200,215,255,0)');
      x.fillStyle = rim; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
    });
    var top = tips.reduce(function (a, b) { return b[1] < a[1] ? b : a; }, tips[0]);
    return { tips: tips, top: top, w: W, h: H };
  }

  window.SFPaint = { paintScene: paintScene, paintTree: paintTree, paintGardenTree: paintGardenTree, PAL: PAL };
})();
/* The garden: a cherry tree, a bench, a girl with a red umbrella,
   a black cat, and a ball of red thread visitors can play with.
   Four seasons (spring, summer, fall, winter), day and night.
   Click the background for rain. Works on any page.
   Usage: Garden.init({ controls: true|false, scale })            */
(function () {
  'use strict';
  if (window.Garden) return;
  var H = 280, GY = 266, BR = 11;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function seeded(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Sound (shared with the scene) ---------- */
  var Sound = window.SFSound || {
    ctx: null, master: null, on: false, amb: null, rainG: null,
    ensure: function () {
      if (this.ctx) return true;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0; this.master.connect(this.ctx.destination);
      return true;
    },
    noise: function (seconds, brown) {
      var c = this.ctx, len = c.sampleRate * seconds, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.2; } else d[i] = w * .5; }
      var s = c.createBufferSource(); s.buffer = buf; s.loop = true; return s;
    },
    set: function (v) {
      if (!this.ensure()) return;
      this.on = v; if (v) this.ctx.resume();
      this.master.gain.setTargetAtTime(v ? 1 : 0, this.ctx.currentTime, .4);
      if (v && !this.amb) this.ambient(); else if (v && this.resumePiano) this.resumePiano();
      store('sf-sound', v ? '1' : '0');
      document.querySelectorAll('[data-sound-label]').forEach(function (b) { b.textContent = v ? 'Sound on' : 'Sound off'; });
    },
    ambient: function () {
      // Calm lo-fi piano with soft beats. Everything runs on a steady tempo: chords change on the
      // bar line, the old chord fades out as the new one starts, and the melody only uses notes
      // from the chord underneath, so nothing clashes. Each season has its own key, pace and beat.
      var c = this.ctx, self = this;
      var len = c.sampleRate * 2.6, imp = c.createBuffer(2, len, c.sampleRate);
      for (var ch = 0; ch < 2; ch++) { var d = imp.getChannelData(ch); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      var verb = c.createConvolver(); verb.buffer = imp; var wet = c.createGain(); wet.gain.value = .3; verb.connect(wet); wet.connect(this.master);
      var dry = c.createGain(); dry.gain.value = .7; dry.connect(this.master);
      var bus = c.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 2600; bus.connect(dry); bus.connect(verb);
      var drums = c.createBiquadFilter(); drums.type = 'lowpass'; drums.frequency.value = 5200;
      var dg = c.createGain(); dg.gain.value = .55; drums.connect(dg); dg.connect(this.master);
      var nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0); for (var k = 0; k < nd.length; k++) nd[k] = Math.random() * 2 - 1;
      this.bus = bus; this.amb = true;
      // chords: [bass, voicing, chord tones (pitch classes) for the melody]
      var STY = {
        spring: { sc: [0, 2, 4, 7, 9], bpm: 76, mel: .42, cut: 2600, ch: [[36, [55, 60, 64, 67], [0, 4, 7]], [33, [57, 60, 64, 69], [9, 0, 4]], [29, [57, 60, 65, 69], [5, 9, 0]], [31, [55, 59, 62, 67], [7, 11, 2]]],
          kick: [0, 5], snare: [4], hat: [0, 1, 2, 3, 4, 5, 6, 7], hv: .05 },
        summer: { sc: [2, 4, 6, 9, 11], bpm: 84, mel: .5, cut: 3000, ch: [[38, [57, 62, 66, 69], [2, 6, 9]], [35, [59, 62, 66, 71], [11, 2, 6]], [31, [59, 62, 67, 71], [7, 11, 2]], [33, [57, 61, 64, 69], [9, 1, 4]]],
          kick: [0, 3, 5], snare: [4], hat: [0, 1, 2, 3, 4, 5, 6, 7], hv: .06 },
        fall: { sc: [9, 0, 2, 4, 7], bpm: 70, mel: .36, cut: 2100, ch: [[33, [57, 60, 64, 69], [9, 0, 4]], [29, [57, 60, 65, 69], [5, 9, 0]], [36, [55, 60, 64, 67], [0, 4, 7]], [28, [55, 59, 64, 67], [4, 7, 11]]],
          kick: [0, 6], snare: [4], hat: [0, 2, 4, 6], hv: .045 },
        winter: { sc: [3, 5, 7, 10, 0], bpm: 62, mel: .28, cut: 3200, ch: [[39, [58, 63, 67, 70], [3, 7, 10]], [36, [55, 60, 63, 67], [0, 3, 7]], [32, [56, 60, 63, 68], [8, 0, 3]], [34, [58, 62, 65, 70], [10, 2, 5]]],
          kick: [0], snare: [4], hat: [2, 6], hv: .035, soft: true }
      };
      var sty = STY[self.seasonKey] || STY.spring, pending = null, t = c.currentTime + .25, step = 0, bar = 0, held = [], mi = -1, dir = 1, rhythm = [0, 3, 4, 6];
      bus.frequency.value = sty.cut;
      this.setSeason = function (sn) { var n = STY[sn]; if (n && n !== sty) pending = n; };
      function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
      function key(m, at, vel, dur, keep) {
        var g = c.createGain(), f = hz(m);
        g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vel, at + .008);
        g.gain.setTargetAtTime(vel * .35, at + .01, .25); g.gain.setTargetAtTime(0, at + dur, .3);
        [[1, 1], [2, .32], [3, .1], [4, .04]].forEach(function (h) {
          var o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = f * h[0]; og.gain.value = h[1];
          o.connect(og); og.connect(g); o.start(at); o.stop(at + dur + 1.6);
        });
        g.connect(bus); if (keep) held.push(g);
      }
      function kick(at, v) {
        var o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
        o.frequency.setValueAtTime(120, at); o.frequency.exponentialRampToValueAtTime(42, at + .14);
        g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(.001, at + .38);
        o.connect(g); g.connect(drums); o.start(at); o.stop(at + .4);
      }
      function noise(at, v, type, freq, q, dur) {
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = nb;
        f.type = type; f.frequency.value = freq; f.Q.value = q;
        g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(.001, at + dur);
        s.connect(f); f.connect(g); g.connect(drums); s.start(at, Math.random() * .5); s.stop(at + dur + .02);
      }
      function schedule() {
        if (!self.on) return;
        while (t < c.currentTime + 1.2) {
          var e8 = 30 / sty.bpm, s8 = step % 8, at = t + (s8 % 2 ? e8 * .16 : 0);   // a little swing
          // melody notes: the season's pentatonic scale between E4 and C6
          function scaleNotes() { var a = []; for (var m = 64; m <= 84; m++) if (sty.sc.indexOf(m % 12) >= 0) a.push(m); return a; }
          if (s8 === 0) {
            if (pending) { sty = pending; pending = null; bar = 0; mi = -1; bus.frequency.setTargetAtTime(sty.cut, t, 1); e8 = 30 / sty.bpm; }
            held.forEach(function (g) { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, .12); }); held = [];
            var chd = sty.ch[bar % 4];
            key(chd[0], t, .19, e8 * 8, true);                                              // bass on the one
            chd[1].forEach(function (m, n) { key(m, t + n * .028, .075, e8 * 8, true); });  // gently strummed chord
            // a new rhythm for this bar's melody (some bars just breathe)
            var R = [[0, 3, 4, 6], [0, 2, 4, 5, 7], [1, 2, 4, 6], [0, 3, 6], [2, 3, 4, 7], [0, 1, 2, 4], [0, 4, 6, 7]];
            rhythm = Math.random() < (1 - sty.mel) * .45 ? [] : R[Math.floor(Math.random() * R.length)];
          }
          var chd2 = sty.ch[bar % 4];
          if (s8 === 4) key(chd2[0] + 7, at, .085, e8 * 4, true);                           // fifth on beat three
          if (s8 === 3 || s8 === 6) chd2[1].slice(1).forEach(function (m, n) { key(m, at + n * .02, .04, e8 * 2, true); });  // soft off-beat comp
          if (rhythm.indexOf(s8) >= 0) {
            var notes = scaleNotes();
            if (mi < 0) mi = Math.floor(notes.length / 2);
            if (s8 === rhythm[0]) {
              // strong note: land on a chord tone near where the melody is
              var best = mi, bd = 99;
              notes.forEach(function (m, k) { if (chd2[2].indexOf(m % 12) >= 0 && Math.abs(k - mi) < bd && k !== mi) { bd = Math.abs(k - mi); best = k; } });
              mi = best;
            } else {
              if (Math.random() < .25) dir = -dir;
              var stp = [1, 1, 1, 2][Math.floor(Math.random() * 4)] * dir;
              if (mi + stp < 0 || mi + stp >= notes.length) { dir = -dir; stp = -stp; }
              mi += stp;
            }
            var nx = rhythm[rhythm.indexOf(s8) + 1], len = (nx === undefined ? 8 - s8 : nx - s8) + 1;
            key(notes[mi], at, (s8 === rhythm[0] ? .12 : .09) + Math.random() * .025, e8 * len, true);
          }
          var v = sty.soft ? .5 : 1;
          if (sty.kick.indexOf(s8) >= 0) kick(at, .5 * v);
          if (sty.snare.indexOf(s8) >= 0) { noise(at, .12 * v, 'bandpass', 1900, .8, .14); }
          if (sty.hat.indexOf(s8) >= 0) noise(at, sty.hv * (s8 % 2 ? .7 : 1), 'highpass', 7500, .7, .045);
          t += e8; step++; if (step % 8 === 0) bar++;
        }
      }
      this.pianoTimer = setInterval(schedule, 250); schedule();
      this.resumePiano = function () { if (t < c.currentTime) t = c.currentTime + .2; };
    },
    rain: function () {},
    meow: function (soft) {
      return; // the cat speaks in words only now
      if (!this.on || !this.ctx) return;
      var c = this.ctx, t = c.currentTime + .02, dur = soft ? .9 : .75, p = soft ? .8 : rand(.95, 1.12);
      var o = c.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(430 * p, t); o.frequency.linearRampToValueAtTime(820 * p, t + dur * .22);
      o.frequency.linearRampToValueAtTime(720 * p, t + dur * .55); o.frequency.exponentialRampToValueAtTime(360 * p, t + dur);
      var vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 7; vg.gain.value = 9; vib.connect(vg); vg.connect(o.frequency);
      var f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 4;
      f1.frequency.setValueAtTime(500, t); f1.frequency.linearRampToValueAtTime(1500, t + dur * .3); f1.frequency.linearRampToValueAtTime(900, t + dur);
      var f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 6; f2.frequency.value = 2600;
      var g2 = c.createGain(), g = c.createGain(), peak = soft ? .16 : .28; g2.gain.value = .35;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .06); g.gain.setValueAtTime(peak, t + dur * .6); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
      o.connect(f1); o.connect(f2); f2.connect(g2); f1.connect(g); g2.connect(g); g.connect(this.master);
      o.start(t); vib.start(t); o.stop(t + dur + .05); vib.stop(t + dur + .05);
    }
  };
  window.SFSound = Sound;

  var SEASONS = ['spring', 'summer', 'fall', 'winter'];
  var INFO = {
    spring: { name: 'Spring', sub: 'The meeting', sway: .8, wind: .25 },
    summer: { name: 'Summer', sub: 'The shade', sway: .45, wind: .08 },
    fall: { name: 'Fall', sub: 'The chase', sway: 1.6, wind: .5 },
    winter: { name: 'Winter', sub: 'The lap', sway: .9, wind: .3 }
  };
  function defaultSeason() { var m = new Date().getMonth(); return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'fall' : 'winter'; }

  /* ---------- Drawings ---------- */
  var HEAD = '<path class="sil" d="M26 40 L23 18 L38 32 L46 31 L58 17 L57 40 C60 47 59 56 52 62 C46 67 36 67 30 63 C23 58 22 47 26 40 Z"/>' +
    '<g class="blink"><path class="eye" d="M29 47 C31 44.5 35 44.5 37 47 C35 49 31 49 29 47 Z"/></g><path class="lid" d="M29 47 q4 2.5 8 0"/>';
  var CAT =
    '<svg class="p-stand" viewBox="0 0 170 120">' +
      '<g class="tail-stand"><path class="tailrim" d="M132 68 C154 62 162 44 156 28 C153 20 146 19 144 26"/><path class="tailp" d="M132 68 C154 62 162 44 156 28 C153 20 146 19 144 26"/></g>' +
      '<g class="leg b"><path class="sil" d="M60 82 L58 110 L64 110 L68 84 Z"/></g><g class="leg a"><path class="sil" d="M122 80 L126 110 L132 110 L130 78 Z"/></g>' +
      '<g class="bodyg"><path class="sil" d="M26 40 L23 18 L38 32 L46 31 L58 17 L57 40 C59 46 62 50 68 52 C80 48 96 47 108 48 C124 49 137 56 135 72 C133 84 120 89 102 89 L68 89 C58 89 52 84 50 76 C47 70 46 66 44 64 C37 66 29 64 25 58 C21 52 22 45 26 40 Z"/>' +
      '<g class="blink"><path class="eye" d="M29 47 C31 44.5 35 44.5 37 47 C35 49 31 49 29 47 Z"/></g></g>' +
      '<g class="leg a"><path class="sil" d="M52 82 L48 111 L54 111 L60 86 Z"/></g><g class="leg b"><path class="sil" d="M112 84 L114 111 L120 111 L121 82 Z"/></g></svg>' +
    '<svg class="p-sit" viewBox="0 0 170 120">' +
      '<g class="tail-sit"><path class="tailrim" d="M112 108 C130 112 144 104 142 90"/><path class="tailp" d="M112 108 C130 112 144 104 142 90"/></g>' +
      '<g class="breath"><path class="sil" d="M58 50 C50 60 48 80 50 96 L50 111 L60 111 L61 98 C66 104 74 108 84 110 L112 111 C122 108 124 92 116 80 C108 66 90 56 72 52 Z"/></g>' +
      '<path class="paw sil" d="M58 92 C54 80 56 66 62 58 L67 60 C62 68 61 80 63 92 Z"/>' +
      '<g class="headg" transform="translate(20 -10)">' + HEAD + '<ellipse class="mouth" cx="36" cy="58" rx="3.5" ry="5"/></g></svg>' +
    '<svg class="p-loaf" viewBox="0 0 170 120">' +
      '<path class="tailrim" d="M134 104 C128 114 96 116 70 112"/><path class="tailp" d="M134 104 C128 114 96 116 70 112"/>' +
      '<g class="breath"><path class="sil" d="M52 84 C60 72 84 68 106 70 C126 72 138 84 136 98 C134 108 124 111 106 111 L58 111 C48 111 46 96 52 84 Z"/></g>' +
      '<path class="sil k1" d="M38 111 C38 105 47 105 47 111 Z"/><path class="sil k2" d="M48 111 C48 105 57 105 57 111 Z"/>' +
      '<g class="headg" transform="translate(6 30)">' + HEAD + '</g></svg>' +
    '<svg class="p-curl" viewBox="0 0 170 120">' +
      '<g class="breath"><path class="sil" d="M58 104 C54 84 76 72 100 74 C124 76 136 92 130 106 C126 112 112 112 96 112 L66 112 C60 112 58 108 58 104 Z"/></g>' +
      '<g transform="translate(22 46) rotate(22 40 45)"><path class="sil" d="M26 40 L23 18 L38 32 L46 31 L58 17 L57 40 C60 47 59 56 52 62 C46 67 36 67 30 63 C23 58 22 47 26 40 Z"/><path class="lid" style="opacity:1" d="M29 47 q4 2.5 8 0"/></g>' +
      '<path class="tailrim" d="M130 104 C120 118 80 120 54 110"/><path class="tailp" d="M130 104 C120 118 80 120 54 110"/></svg>' +
    '<svg class="p-stretch" viewBox="0 0 170 120">' +
      '<path class="tailrim" d="M136 62 C152 42 150 22 140 16"/><path class="tailp" d="M136 62 C152 42 150 22 140 16"/>' +
      '<path class="sil" d="M118 80 L120 111 L127 111 L128 78 Z"/><path class="sil" d="M128 76 L131 111 L138 111 L136 70 Z"/>' +
      '<path class="sil" d="M50 96 C56 88 80 72 108 58 C124 50 138 54 138 68 C138 78 130 84 120 86 L72 104 C62 108 50 106 50 96 Z"/>' +
      '<path class="sil" d="M50 101 L8 106 L8 111 L54 111 Z"/>' +
      '<g transform="translate(-4 38)">' + HEAD + '</g></svg>';

  var CAT_STARE = '<svg class="p-stare" viewBox="0 0 120 160">' +
    '<g class="tail-sit"><path class="tailrim" d="M88 152 C112 148 120 122 106 104"/><path class="tailp" d="M88 152 C112 148 120 122 106 104"/></g>' +
    '<g class="breath"><path class="sil" d="M60 60 C80 62 92 84 94 108 C96 130 93 146 91 156 L31 156 C28 146 24 130 26 108 C28 84 40 62 60 60 Z"/></g>' +
    '<g class="headg"><path class="sil" d="M42 34 L38 8 L54 25 C58 24 62 24 66 25 L82 8 L78 34 C81 38 82 42 82 47 C82 59 72 67 60 67 C48 67 38 59 38 47 C38 42 39 38 42 34 Z"/>' +
    '<g class="blink"><path class="eye" d="M47 45 C49 42 54 42 56 45 C54 47.5 49 47.5 47 45 Z"/><path class="eye" d="M64 45 C66 42 71 42 73 45 C71 47.5 66 47.5 64 45 Z"/></g>' +
    '<path class="lid" d="M47 45 q4.5 2.5 9 0 M64 45 q4.5 2.5 9 0"/>' +
    '<path class="brow" d="M45 38.5 L56.5 42.5 M75 38.5 L63.5 42.5"/><path class="frown" d="M54 62 q6 -4 12 0"/>' +
    '<ellipse class="mouth" cx="60" cy="58" rx="4.5" ry="6"/></g></svg>';
  var GIRL = '<svg viewBox="0 0 70 130" aria-hidden="true">' +
    '<g class="g-umb-closed"><path d="M24 70 L19 128" stroke="var(--g-umb)" stroke-width="2.2" stroke-linecap="round"/><path class="umb" d="M21.5 82 L15.5 121 L22.5 121 Z"/></g>' +
    '<g class="g-legs-stand"><g class="gl a"><path class="legs" d="M29 84 L28 124 L32.5 124 L34 84 Z"/><path class="shoe" d="M27 123 h7 v3.5 h-8.5 z"/></g>' +
      '<g class="gl b"><path class="legs" d="M36 84 L36 124 L40.5 124 L41 84 Z"/><path class="shoe" d="M35.5 123 h7 v3.5 h-8 z"/></g></g>' +
    '<g class="g-legs-sit"><path class="legs" d="M28 100 L52 100 L52 105.5 L28 105.5 Z"/><path class="legs" d="M47.5 103 L49 124 L53.5 124 L53 103 Z"/><path class="shoe" d="M48 123 h8 v3.5 h-8.5 z"/></g>' +
    '<g class="g-body">' +
      '<path class="coat" d="M27 38 C22 52 20 70 18 86 L48 86 C46 70 44 52 41 38 Z"/><path class="shade" d="M27 38 C24 52 23 70 22 86 L28 86 C28 70 29 52 30 40 Z"/>' +
      '<g class="g-arm-back"><path class="coat" d="M28 42 C25 52 23 62 23 70 L27.5 70.5 C28 62 30 52 32 44 Z"/><circle class="skin" cx="25" cy="72" r="2.8"/></g>' +
      '<path class="skin" d="M31.5 30 h6 v9 h-6 z"/>' +
      '<g class="g-scarf"><g class="g-scarf-fly"><path class="scarf" d="M29 39 C24 41 19 40 13 42 L14 45.5 C20 44 25 44.5 30 42.5 Z"/></g><g class="g-scarf-fly fly-r"><path class="scarf" d="M41 39 C46 41 51 40 57 42 L56 45.5 C50 44 45 44.5 40 42.5 Z"/></g><path class="scarf" d="M28 35.5 C32 39.5 38 39.5 42 35.5 L42 41 C38 44 32 44 28 41 Z"/><g class="g-scarf-tail"><path class="scarf" d="M30 41 L27 58 L32 58 L34 42 Z"/><path class="scarf" d="M27.2 57.6 l.6 2.6 M29.6 57.8 l.2 2.8 M31.6 57.6 l-.2 2.6" stroke="var(--g-scarf)" stroke-width=".8" fill="none"/></g></g>' +
      '<g class="g-head"><circle class="skin" cx="35" cy="22" r="10.5"/>' +
        '<path class="hair" d="M23.5 25 C22 12 30 7.5 36 8 C44 8.5 48 14 47 22 C47 27 46 31 44.5 33 L44 24 C41 20 36 18.5 31 19 C29 22 28 26 27 33 C25 32 23.8 29 23.5 25 Z"/>' +
        '<path class="hair" d="M30 17 C34 13.5 41 13.5 45.5 19 C42 18 38.5 18.5 36.5 21.5 C34.5 19 32.5 18.5 30 19 Z"/>' +
        '<path class="eye" d="M40.5 23 c1 -1.2 2.6 -1.2 3.4 0 c-.8 1 -2.4 1 -3.4 0 z"/><ellipse class="blush" cx="41.5" cy="27.4" rx="2.6" ry="1.4"/><path class="mouth" d="M42.6 30 q1 .6 2 0"/></g>' +
      '<g class="g-arm-front"><path class="coat" d="M38 42 C41 52 43 60 44 68 L39.5 69 C38.5 61 36 52 34 44 Z"/><circle class="skin" cx="42" cy="70" r="2.8"/>' +
        '<g class="g-bowl-hand"><path class="bowl" d="M37 66 h11 c0 4 -2.5 6 -5.5 6 c-3 0 -5.5 -2 -5.5 -6z"/></g>' +
        '<rect class="book" x="39" y="60" width="9" height="11" rx="1"/>' +
        '<g class="g-umb-open"><g class="g-umb-sway"><line class="handle" x1="42" y1="70" x2="40" y2="-2"/><g class="g-canopy"><g class="g-canopy-in">' +
          '<path class="umb" d="M2 6 Q40 -30 78 6 Q68 1 59 6 Q50 1 40 6 Q30 1 21 6 Q12 1 2 6 Z"/>' +
          '<path class="umb-rib" d="M40 -12 L21 6 M40 -12 L40 6 M40 -12 L59 6"/>' +
          '<g class="g-drips"><circle cx="2.5" cy="6.5" r="1"/><circle cx="21" cy="6.5" r=".9"/><circle cx="40" cy="6.5" r="1"/><circle cx="59" cy="6.5" r=".9"/><circle cx="77.5" cy="6.5" r="1"/></g>' +
          '</g></g></g></g></g>' +
    '</g></svg>';
  /* The hijabi girl for phones: same body as the garden girl, with a hijab and glasses. */
  var HIJABI = GIRL.replace('<path class="hair" d="M23.5 25 C22 12 30 7.5 36 8 C44 8.5 48 14 47 22 C47 27 46 31 44.5 33 L44 24 C41 20 36 18.5 31 19 C29 22 28 26 27 33 C25 32 23.8 29 23.5 25 Z"/>', '<path class="hj" d="M35 9.5 C27 9.5 23.5 15 23.5 22 C23.5 28.5 25.2 32.5 24 39 L45.5 39 C44.8 33 46.5 28.5 46.5 22 C46.5 15 43 9.5 35 9.5 Z"/>' +
      '<ellipse class="skin" cx="38.6" cy="23.2" rx="6.8" ry="8.2"/>' +
      '<path class="hj" d="M31.6 22 C31.6 15.5 35 13 39 13 C43.6 13 46.2 16 46.2 20.6 C44.2 17.6 41.6 16.6 39 16.6 C35.6 16.6 33.2 18.6 32.8 22.6 Z"/>' +
      '<g class="hj-glass"><circle cx="42.2" cy="23" r="2.3"/><path d="M39.9 22.6 L33.8 21.8"/></g>')
    .replace('<path class="hair" d="M30 17 C34 13.5 41 13.5 45.5 19 C42 18 38.5 18.5 36.5 21.5 C34.5 19 32.5 18.5 30 19 Z"/>', '');
  var BENCH = '<svg viewBox="0 0 120 60" aria-hidden="true">' +
    '<rect class="iron" x="10" y="8" width="3" height="52"/><rect class="iron" x="107" y="8" width="3" height="52"/>' +
    '<rect class="wood" x="2" y="10" width="116" height="4" rx="1"/><rect class="wood" x="2" y="18" width="116" height="4" rx="1"/>' +
    '<rect class="wood" x="0" y="34" width="120" height="4.5" rx="1"/><rect class="iron" x="16" y="38" width="2.5" height="22"/><rect class="iron" x="101" y="38" width="2.5" height="22"/>' +
    '<path class="snowcap" d="M0 34 C10 30 30 31 60 30 C90 31 110 30 120 34 Z"/><path class="snowcap sb" d="M2 10 C20 7 50 8 60 7 C80 8 100 7 118 10 Z"/></svg>';
  var LAMP = '<svg viewBox="0 0 40 210" aria-hidden="true"><rect class="post" x="18" y="44" width="4" height="166"/><rect class="post" x="14" y="200" width="12" height="10" rx="2"/>' +
    '<path class="post" d="M10 22 L30 22 L26 16 L14 16 Z"/><rect class="glass" x="12" y="22" width="16" height="20"/><path class="post" d="M11 22 h18 v2 h-18z M11 41 h18 v3 h-18z M19.5 22 v20"/><path class="snowcap" d="M12 16 C15 12 25 12 28 16 Z"/></svg>';
  var BALL = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#7d1717"/><path d="M2.5 5.5 C6 8 10 4 13.5 6.5 M2 9.5 C6 12 11 8 14.5 10.5 M5 2.2 C7.5 6.5 6.5 11.5 8.5 14.2 M10 1.6 C11.6 5.5 11.5 10.5 12.6 13" fill="none" stroke="#c23a32" stroke-width=".8" stroke-linecap="round"/></svg>';
  var BOWL = '<svg viewBox="0 0 18 10"><ellipse class="f" cx="9" cy="2.5" rx="7" ry="1.8"/><path class="b" d="M1 2.5 h16 c0 4.5 -3.5 7 -8 7 c-4.5 0 -8 -2.5 -8 -7z"/></svg>';

  function treeSVG() {
    var r = seeded(21), s = '<svg viewBox="0 0 260 260" aria-hidden="true"><g class="sway">';
    var branches = [
      ['M130 260 C134 220 122 190 128 150', 15], ['M128 160 C110 140 86 126 58 112', 8], ['M128 154 C150 130 176 112 210 100', 8],
      ['M128 150 C126 124 132 96 126 66', 7], ['M90 132 C80 112 74 96 70 78', 4.5], ['M170 118 C182 100 196 84 206 70', 4.5],
      ['M127 96 C112 82 100 70 92 52', 3.5], ['M128 90 C146 74 158 60 170 44', 3.5], ['M60 112 C46 108 34 110 24 116', 3], ['M208 100 C222 104 232 112 240 122', 3]
    ];
    var caps = '';
    branches.forEach(function (b, i) {
      s += '<path class="' + (i ? 'branch' : 'trunk') + '" d="' + b[0] + '" stroke-width="' + b[1] + '"/>';
      if (i) caps += '<path class="snowcap" d="' + b[0] + '" stroke-width="' + Math.max(1.4, b[1] * .38) + '" transform="translate(0 -' + (b[1] * .45).toFixed(1) + ')"/>';
    });
    s += caps;
    var clusters = [[58, 104, 34], [92, 60, 30], [126, 50, 36], [168, 44, 30], [208, 82, 34], [238, 112, 22], [26, 110, 22], [150, 96, 30], [100, 104, 28], [130, 82, 32]];
    var circles = '';
    clusters.forEach(function (c) {
      for (var i = 0; i < 16; i++) {
        var a = r() * 6.28, d = r() * c[2] * .85, cr = 5 + r() * 8, cls = ['c1', 'c2', 'c1', 'c3'][Math.floor(r() * 4)];
        circles += '<circle class="' + cls + '" cx="' + (c[0] + Math.cos(a) * d).toFixed(1) + '" cy="' + (c[1] + Math.sin(a) * d * .7).toFixed(1) + '" r="' + cr.toFixed(1) + '"/>';
      }
    });
    s += '<g class="canopy">' + circles + '</g><circle class="bud" cx="170" cy="44" r="3.4"/></g></svg>';
    return s;
  }

  /* ---------- The garden ---------- */
  var G = null;
  function init(opts) {
    if (G) return G.api;
    opts = opts || {};
    var root = el('div', 'garden'), world = el('div', 'g-world');
    root.setAttribute('aria-hidden', 'false');
    var sky = el('div', 'g-sky'), tree = el('div', 'g-tree'), bench = el('div', 'g-bench', BENCH), lamp = el('div', 'g-lamp', LAMP);
    var treeCv = el('canvas', 'g-tree-cv'), leafCv = el('canvas', 'g-leaf-cv'), bud = el('div', 'g-bud'); tree.appendChild(treeCv); tree.appendChild(leafCv); tree.appendChild(bud);
    var ground = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); ground.setAttribute('class', 'g-ground');
    var girl = el('div', 'g-girl', GIRL), cat = el('div', 'g-cat', CAT + CAT_STARE), ballEl = el('div', 'g-ball', BALL), bowl = el('div', 'g-bowl', BOWL);
    var rope = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); rope.setAttribute('class', 'g-rope');
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); rope.appendChild(line);
    var endH = el('div', 'g-end'), zzz = el('div', 'g-zzz', 'z'), say = el('div', 'g-say'), title = el('div', 'g-title');
    cat.setAttribute('role', 'button'); cat.setAttribute('aria-label', 'The cat. Click and it stretches.'); cat.setAttribute('tabindex', '0');
    ballEl.setAttribute('aria-label', 'Ball of red thread. Drag or flick it.'); ballEl.setAttribute('role', 'button');
    [sky, ground, lamp, tree, bench, bowl, girl, cat, rope, ballEl, endH, zzz, say, title].forEach(function (n) { world.appendChild(n); });
    /* On phones the hijabi girl lives in the garden: she sits on the bench, waves, wanders a little,
       and pets the cat when it comes to her. */
    var hj = null, Hj = null, bench2 = null;
    if (window.innerWidth <= 600 && !opts.small) {
      bench2 = el('div', 'g-bench', BENCH); world.insertBefore(bench2, girl);      // her own bench
      hj = el('div', 'g-girl g-hijabi', HIJABI); world.insertBefore(hj, cat);
      Hj = { x: null, target: 0, mode: 'sit', until: 0, face: 1, waveUntil: 0, nod: false, purred: 0, awayFrom: null };
    }
    var HJ_COL = { 'spring-day': '#c2557a', 'spring-night': '#d7a8ef', 'summer-day': '#b07a06', 'summer-night': '#f5d77a', 'fall-day': '#b5531c', 'fall-night': '#f0a05a',
      'winter-day': '#1f4fa8', 'winter-night': '#8fb8ff', 'rain-day': '#3e6f8a', 'rain-night': '#a9c9dc' };
    var HJ_UMB = { spring: '#d4789a', summer: '#e0a83a', fall: '#c0582c', winter: '#5a74b0' };
    function hjColors() {
      if (!hj) return;
      hj.style.setProperty('--hj-g', HJ_COL[(S.raining ? 'rain' : S.season) + '-' + (S.mode === 'day' ? 'day' : 'night')] || '#8fb8ff');
      hj.style.setProperty('--g-umb', HJ_UMB[S.season] || '#a8241b');
    }
    function updateHj(dt, now) {
      if (!Hj) return;
      // she stays on her own bench: pets the cat when it comes over, waves to the visitor every 2 minutes
      var seat = S.bench2X + 18;
      if (Hj.x === null) { Hj.x = seat; Hj.nextWave = now + 25000; hjColors(); }
      Hj.x = seat;
      if (now > Hj.nextWave) { Hj.waveUntil = now + 1600; Hj.nextWave = now + 120000; }
      var catNear = Math.abs(C.x - Hj.x) < 58 && C.h <= 0 && !C.jump && C.pose !== 'lap' && C.pose !== 'curl';
      var petting = catNear && !S.raining && !Hj.toss;
      if (petting && now - Hj.purred > 20000) { Hj.purred = now; speak('Purr...', 1800); }
      var face = petting && C.x < Hj.x ? -1 : 1;
      var cls = 'g-girl g-hijabi sitting' + (face < 0 ? ' left' : '') + (S.raining ? ' umbrella' : '') + (Hj.toss ? ' toss' : (petting ? ' pet' : '')) +
        (now < Hj.waveUntil && !petting && !Hj.toss ? ' wave' : '') + (Hj.nod ? ' nod' : '');
      if (hj.className !== cls) hj.className = cls;
      hj.style.transform = 'translateX(' + (Hj.x - 50.75) + 'px)';
    }

    /* Every 5 minutes one of the girls (they take turns) pulls the thread over and tosses it for the cat. */
    var THROWERS = [];
    function updateThrow(dt, now) {
      if (!S.nextThrow) S.nextThrow = now + 45000;
      var F = S.fetch;
      if (!F) {
        if (now < S.nextThrow || ball.held || S.story.active || C.pose === 'lap' || S.hidden) return;
        THROWERS = Hj ? ['gi', 'hj'] : ['gi'];
        S.throwTurn = ((S.throwTurn || 0) + 1) % THROWERS.length;
        S.fetch = F = { who: THROWERS[S.throwTurn], phase: 'pull', t: now };
      }
      var gx = F.who === 'hj' ? Hj.x : Gi.x, side = F.who === 'hj' ? 1 : (Gi.face || 1), hand = gx + side * 20;
      if (S.story.active || ball.held) { endToss(now, false); return; }
      ball.owned = now;                      // so nobody else grabs it meanwhile
      if (F.phase === 'pull') {              // she tugs the thread and the ball rolls to her
        var dx = hand - ball.x;
        if (Math.abs(dx) < 10 || now - F.t > 7000) { F.phase = 'hold'; F.t = now; ball.vx = 0; ball.vh = 0; }
        else { ball.vx = Math.sign(dx) * Math.min(240, Math.abs(dx) * 3 + 50); if (ball.h > 0) ball.vh = Math.min(ball.vh, 0); }
      } else if (F.phase === 'hold') {       // picks it up...
        setToss(F.who, true); ball.x += (hand - ball.x) * Math.min(1, 8 * dt); ball.h += (46 - ball.h) * Math.min(1, 8 * dt); ball.vh = 0; ball.vx = 0;
        if (now - F.t > 650) {               // ...and throws it toward the open side
          var dir = gx < S.W / 2 ? 1 : -1;
          ball.vx = dir * rand(230, 300); ball.vh = rand(230, 290); ball.h = 46;
          C.chaseUntil = now + 6000; speak('Yay, human!!!', 2200);
          endToss(now, true);
        }
      }
    }
    function setToss(who, on) { if (who === 'hj' && Hj) Hj.toss = on; else Gi.toss = on; }
    function endToss(now, done) {
      if (S.fetch) setToss(S.fetch.who, false);
      S.fetch = null; S.nextThrow = now + (done ? 300000 : 20000);
    }

    root.appendChild(world); document.body.appendChild(root);
    var canvas = el('canvas', 'g-weather'); document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var S = {
      s: 1, W: 1000, season: store('sf-season') || defaultSeason(), mode: 'night', hidden: store('sf-garden') === 'off',
      treeX: 96, benchX: 300, wind: 0, gust: 0, rainUntil: 0, raining: false, snow: 0, prints: [],
      story: { p: 0, last: -1e9, active: false }, director: 0
    };
    if (SEASONS.indexOf(S.season) < 0) S.season = defaultSeason();
    var ball = { x: 0, h: 0, vx: 0, vh: 0, rot: 0, held: false, owned: 0, restT: 0 };
    var R = [], NSEG = 16, SEG = 10, endDrag = false, endTarget = null;
    var C = { x: 0, h: 0, face: 1, pose: 'sit', act: null, actUntil: 0, jump: null, dir: null, still: performance.now(), dist: 0, idleNext: 0, clickSeq: null, cool: 0 };
    var Gi = { x: 0, target: 0, face: 1, sitting: true, umbrella: false, shelter: false, blush: false, offer: false, reading: true, picking: 0 };

    function getMode() {
      var sc = document.querySelector('.scene');
      if (sc && sc.getAttribute('data-mode')) return sc.getAttribute('data-mode');
      return document.body.classList.contains('quarto-light') ? 'day' : 'night';
    }
    function announce() { if (typeof hjColors === 'function') hjColors(); Sound.seasonKey = S.season; if (Sound.setSeason) Sound.setSeason(S.season); try { document.dispatchEvent(new CustomEvent('sf:weather', { detail: { season: S.season, raining: S.raining, mode: S.mode } })); } catch (e) {} }
    function syncMode() { var m = getMode(); if (m === S.mode && S._painted) return; S.mode = m; root.setAttribute('data-mode', S.mode); if (S._ready) { paintTreeNow(); scheduleBg(); announce(); } }
    syncMode();
    new MutationObserver(syncMode).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: false });
    var scEl = document.querySelector('.scene'); if (scEl) new MutationObserver(syncMode).observe(scEl, { attributes: true, attributeFilter: ['data-mode'] });

    function layout() {
      var w = window.innerWidth, h = window.innerHeight;
      S.s = opts.scale || (w < 700 ? (h < 760 ? .5 : .56) : w < 1000 ? .7 : h < 760 ? .74 : .92) * (opts.small ? .82 : 1);
      S.W = w / S.s;
      world.style.width = S.W + 'px'; world.style.transform = 'scale(' + S.s + ')';
      root.style.height = (H * S.s) + 'px';
      document.documentElement.style.setProperty('--garden-h', Math.round(H * S.s) + 'px');
      root.style.setProperty('--gs', S.s);
      try { document.dispatchEvent(new CustomEvent('sf:garden-layout')); } catch (e) {}
      S.treeX = S.W - (w < 700 ? 120 : 170); S.benchX = S.treeX - 250; S.lampX = S.benchX - 135; S.homeX = Math.max(60, S.benchX - 240); S.shadeX = S.treeX - 80;
      tree.style.transform = 'translateX(' + (S.treeX - 180) + 'px)';
      bench.style.transform = 'translateX(' + (S.benchX - 87) + 'px)';
      S.bench2X = Math.max(92, S.lampX - 100);
      if (bench2) bench2.style.transform = 'translateX(' + (S.bench2X - 87) + 'px)';
      lamp.style.transform = 'translateX(' + (S.lampX - 20) + 'px)';
      scheduleBg();
      var dpr = Math.min(1.25, window.devicePixelRatio || 1);
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGround();
    }
    /* Painted tree + painted page background for the current season and time of day */
    function paintTreeNow() {
      if (!window.SFPaint) return;
      var info = SFPaint.paintGardenTree(treeCv, leafCv, S.season, S.mode, 41);
      var top = info.top; bud.style.left = (top[0] * .75) + 'px'; bud.style.top = (top[1] * .75) + 'px';
      S._painted = true;
    }
    var bgTimer = null, bgCache = {};
    function scheduleBg() { clearTimeout(bgTimer); bgTimer = setTimeout(paintBg, 60); }
    function paintBg() {
      if (!window.SFPaint || opts.background === false) return;
      var w = Math.min(1920, Math.max(640, window.innerWidth)), h = Math.min(1200, Math.max(560, window.innerHeight));
      w = Math.round(w / 80) * 80; h = Math.round(h / 80) * 80;
      var key = [S.season, S.mode, opts.composition || 'left', w, h].join('|');
      function apply(url) {
        document.documentElement.style.setProperty('--sf-bg', 'url("' + url + '")');
        document.documentElement.classList.add('has-bg');
        document.documentElement.setAttribute('data-sky', S.mode);
      }
      S.bgKey = key;
      if (bgCache[key]) return apply(bgCache[key]);
      var cv = document.createElement('canvas');
      SFPaint.paintScene(cv, w, h, S.season, S.mode, opts.composition || 'left');
      cv.toBlob(function (b) { if (!b) return; var u = URL.createObjectURL(b); bgCache[key] = u; if (S.bgKey === key) apply(u); }, 'image/jpeg', .9);
    }
    var tufts = '';
    function drawGround() {
      var W = S.W, r = seeded(3); tufts = '';
      for (var x = 8; x < W; x += 14 + r() * 26) {
        var hh = 4 + r() * 7;
        tufts += 'M' + x.toFixed(0) + ' 26 q' + (r() * 3 - 1).toFixed(1) + ' -' + hh.toFixed(1) + ' ' + (r() * 4 - 2).toFixed(1) + ' -' + (hh + 2).toFixed(1) + ' ';
      }
      ground.setAttribute('viewBox', '0 0 ' + W + ' 40'); ground.setAttribute('preserveAspectRatio', 'none');
      renderGround();
    }
    function renderGround() {
      var W = S.W, sd = S.season === 'winter' ? S.snow : 0;
      var html = '<path class="tuft" d="' + tufts + '"/>';
      if (sd > .3) html += '<path class="snowbank" d="M0 ' + (26 - sd) + ' Q' + (W * .25) + ' ' + (26 - sd * 1.3) + ' ' + (W * .5) + ' ' + (26 - sd) + ' T' + W + ' ' + (26 - sd) + ' L' + W + ' 30 L0 30 Z"/>';
      S.prints.forEach(function (p) { html += '<ellipse class="print" cx="' + p.x.toFixed(1) + '" cy="' + (26 - sd + 1.5).toFixed(1) + '" rx="1.6" ry=".9" opacity="' + p.o.toFixed(2) + '"/>'; });
      ground.innerHTML = html;
      var bs = world.querySelectorAll('.g-bench .snowcap');   /* both benches */
      bs.forEach(function (b) { b.style.opacity = S.season === 'winter' ? Math.min(1, S.snow / 6) : 0; b.style.transform = 'scaleY(' + (.4 + Math.min(1.2, S.snow / 8)) + ')'; b.style.transformOrigin = '50% 100%'; b.style.transformBox = 'fill-box'; });
    }

    function setSeason(sn, quiet) {
      S.season = sn; store('sf-season', sn); Sound.seasonKey = sn; if (Sound.setSeason) Sound.setSeason(sn); root.setAttribute('data-season', sn); document.documentElement.setAttribute('data-season', sn);
      var inf = INFO[sn];
      tree.style.setProperty('--sway', inf.sway + 'deg'); tree.style.setProperty('--sway-t', sn === 'fall' ? '3.4s' : '5s');
      S.snow = 0; S.prints = []; renderGround(); particles.length = 0; if (S._ready) { paintTreeNow(); scheduleBg(); }
      document.querySelectorAll('[data-season-cycle]').forEach(function (b) { b.textContent = inf.name; });
      announce();
      if (!quiet) {
        title.innerHTML = inf.name + ' &middot; ' + inf.sub;
        title.classList.add('on'); clearTimeout(title._t); title._t = setTimeout(function () { title.classList.remove('on'); }, 3800);
      }
      startDirector();
    }
    function setHidden(h) {
      S.hidden = h; store('sf-garden', h ? 'off' : 'on');
      root.classList.toggle('hidden', h); canvas.classList.toggle('hidden', h);
      document.querySelectorAll('[data-garden-toggle]').forEach(function (b) { b.textContent = h ? 'Show garden' : 'Hide garden'; });
    }

    /* ---------- Pointer: ball, thread end, cat, girl ---------- */
    function toWorld(e) { return { x: e.clientX / S.s, y: H - (window.innerHeight - e.clientY) / S.s }; }
    var drag = null, dragMoved = false;
    function startDrag(kind, e) {
      e.preventDefault(); e.stopPropagation(); dragMoved = false;
      drag = { kind: kind, hist: [] }; e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
      if (kind === 'ball') { ball.held = true; ball.owned = performance.now(); }
      if (kind === 'end') { endDrag = true; }
      document.addEventListener('pointermove', moveDrag); document.addEventListener('pointerup', endDragFn); document.addEventListener('pointercancel', endDragFn);
    }
    function moveDrag(e) {
      if (!drag) return; dragMoved = true; var p = toWorld(e), t = performance.now();
      drag.hist.push({ x: p.x, y: p.y, t: t }); if (drag.hist.length > 6) drag.hist.shift();
      if (drag.kind === 'ball') { ball.x = clamp(p.x, 8, S.W - 8); ball.h = clamp(GY - BR - p.y, 0, 400); }
      else { endTarget = p; ball.owned = t; }
    }
    function endDragFn() {
      if (!drag) return;
      var hs = drag.hist;
      if (drag.kind === 'ball') {
        ball.held = false; ball.owned = performance.now();
        if (hs.length > 1) { var a = hs[0], b = hs[hs.length - 1], dt = Math.max(.016, (b.t - a.t) / 1000); ball.vx = clamp((b.x - a.x) / dt, -900, 900); ball.vh = clamp(-(b.y - a.y) / dt, -200, 600); }
      } else { endDrag = false; endTarget = null; }
      drag = null; document.removeEventListener('pointermove', moveDrag); document.removeEventListener('pointerup', endDragFn);
      setTimeout(function () { dragMoved = false; }, 50);
    }
    ballEl.addEventListener('pointerdown', function (e) { startDrag('ball', e); });
    endH.addEventListener('pointerdown', function (e) { startDrag('end', e); });
    cat.addEventListener('click', function (e) { e.stopPropagation(); catClicked(); });
    cat.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); catClicked(); } });
    girl.style.pointerEvents = 'auto'; girl.style.cursor = 'pointer';
    girl.addEventListener('click', function (e) {
      e.stopPropagation(); Gi.blush = true; girl.classList.add('wave');
      setTimeout(function () { girl.classList.remove('wave'); }, 1600); setTimeout(function () { Gi.blush = false; }, 2600);
    });

    var LINES = {
      any: ['Meow.', 'Have you seen my red thread?', 'Scroll slowly. I am old and wise.', 'Click the sky. I dare you.', 'She reads. I nap. We are a team.',
        'Salamot built this place. I just live here.', 'Mrrp?', 'Tell the recruiters I approve.', 'Pull the thread. Go on.', 'I knocked a model off the table once. It overfit.',
        'Nine lives, zero bugs.', 'Pet me first. Then read the projects.'],
      spring: ['The petals keep landing on my nose.', 'She brought food. I am thinking about it.'],
      summer: ['Too warm. Shade, please.', 'Fireflies are just tiny lanterns that run away.'],
      fall: ['Leaves are slow mice.', 'The wind stole my thread again.'],
      winter: ['Her lap is the warmest place on this website.', 'Snow is cold rain that thinks it is special.'],
      night: ['I see better than you right now.', 'Night shift. Very important cat business.']
    };
    var clicks = 0, lastLine = '';
    function pickLine() {
      var pool = LINES.any.concat(LINES[S.season] || [], S.mode === 'night' ? LINES.night : []), t;
      do { t = pool[Math.floor(Math.random() * pool.length)]; } while (t === lastLine && pool.length > 1);
      lastLine = t; return t;
    }
    var pets = [], scowlUntil = 0;
    var GRUMPY = ['Okay. That is enough petting.', 'Hands off. I am a professional.', 'I said ONE pat.', 'You are ruffling my fur.', 'Do I look like a stress ball?'];
    function catClicked() {
      var tnow = performance.now();
      if (tnow < scowlUntil) { speak('Hmph.', 1400); scowlUntil = tnow + 2500; C.scowl = true; C.clickSeq = [{ pose: 'stare', ms: 2500 }]; C.clickStart = tnow; return; }
      pets.push(tnow); pets = pets.filter(function (x) { return tnow - x < 60000; });
      var rapid = pets.filter(function (x) { return tnow - x < 8000; }).length >= 5 || pets.length >= 9;
      if (rapid && !C.jump && C.h <= 0 && C.pose !== 'lap') {
        pets = []; scowlUntil = tnow + 4200; C.scowl = true;
        clearTimeout(cat._sc); cat._sc = setTimeout(function () { if (performance.now() >= scowlUntil - 50) C.scowl = false; else setTimeout(function () { C.scowl = false; }, scowlUntil - performance.now()); }, 4200);
        speak(GRUMPY[Math.floor(Math.random() * GRUMPY.length)], 3600);
        C.clickSeq = [{ pose: 'stare', ms: 4200 }]; C.clickStart = tnow; return;
      }
      clicks++;
      var line = clicks === 1 ? 'Oh. Hello.' : pickLine();
      speak(line, 3200);
      if (C.jump || C.h > 0 || C.pose === 'lap') return;
      if (clicks % 3 === 0) { C.clickSeq = [{ pose: 'stretch', ms: 1700 }, { pose: 'stareyawn', ms: 2300 }, { pose: 'stare', ms: 1500 }]; C.clickStart = performance.now(); }
      else { C.clickSeq = [{ pose: 'stare', ms: 3000 }]; C.clickStart = performance.now(); }
    }
    /* the speech bubble rides along with the cat while it is showing */
    function placeSay() {
      var half = (say.offsetWidth || 0) / 2 + 8;   /* keep the bubble on screen near the edges */
      var sx = Math.round(clamp(C.x - 10, half, Math.max(half, S.W - half))), sy = Math.round(GY - 126 - C.h);
      if (sx !== say._sx) { say.style.setProperty('--sx', sx + 'px'); say._sx = sx; }
      if (sy !== say._sy) { say.style.setProperty('--sy', sy + 'px'); say._sy = sy; }
    }
    function speak(t, ms) {
      say.textContent = t; say.style.left = '0'; say.style.top = '0'; placeSay();
      say.classList.toggle('long', t.length > 8);
      say.classList.remove('on'); void say.offsetWidth; say.classList.add('on');
      clearTimeout(say._t); say._t = setTimeout(function () { say.classList.remove('on'); }, ms || 1800);
    }

    /* Click the background for rain */
    document.addEventListener('click', function (e) {
      if (S.hidden || dragMoved) return;
      var t = e.target;
      if (t.closest('a, button, input, select, textarea, label, dialog, summary, [role="button"], [data-open], .g-ball, .g-end, .g-cat, .g-girl, .sc-ui, .sc-contents, .sc-gate, .g-controls, nav, header, p, li, h1, h2, h3, h4, h5, h6, pre, code, table, img, figure, .sc-card, .sc-entry, .all-card, .tl')) return;
      if (window.getSelection && String(window.getSelection()).length) return;
      startRain();
    });

    /* ---------- Weather particles ---------- */
    var particles = [];
    function glowSprite(rgb) { var s = document.createElement('canvas'); s.width = s.height = 32; var x = s.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(.25, 'rgba(' + rgb + ',.8)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return s; }
    var FLY = glowSprite('214,255,140'), EMBER = glowSprite('255,160,70');
    var LEAF_COLORS = { spring: ['#f5b8c8', '#fbd5df', '#fff1f4'], summer: ['#4a8a3e', '#6aa452', '#3a6e33'], fall: ['#c8582a', '#e3962f', '#a8321e', '#8a5a2a'], winter: ['#ffffff'] };
    function spawn(type, x, y) {
      var p = { t: type, x: x, y: y, vx: 0, vy: 0, r: 1, rot: rand(0, 6.28), vr: rand(-2, 2), ph: rand(0, 6.28), life: 1, rest: 0 };
      if (type === 'petal') { p.r = rand(3, 5); p.vy = rand(20, 40); p.c = LEAF_COLORS.spring[Math.floor(rand(0, 3))]; }
      else if (type === 'leaf') { var cs = LEAF_COLORS[S.season === 'winter' ? 'fall' : S.season]; p.r = rand(3.5, 6); p.vy = rand(28, 55); p.c = cs[Math.floor(rand(0, cs.length))]; }
      else if (type === 'snow') { p.r = rand(.8, 2.6); p.vy = rand(18, 42); }
      else if (type === 'fly') { p.r = rand(1.4, 2.4); p.vx = rand(-12, 12); p.vy = rand(-8, 8); p.y = rand(window.innerHeight * .45, window.innerHeight - 40); }
      else if (type === 'ember') { p.r = rand(.7, 1.8); p.vy = -rand(10, 30); p.y = window.innerHeight + 5; }
      else if (type === 'rain') { p.vy = rand(700, 900); p.len = rand(12, 22); p.y = rand(-60, -10); }
      else if (type === 'splash') { p.life = 1; p.r = rand(1.5, 3); }
      particles.push(p); return p;
    }
    var spawnAcc = {};
    function rate(type, perSec, dt, fn) { spawnAcc[type] = (spawnAcc[type] || 0) + perSec * dt; while (spawnAcc[type] >= 1) { spawnAcc[type]--; fn(); } }
    function treeScreen() { var rr = tree.getBoundingClientRect(); return { x: rr.left, y: rr.top, w: rr.width, h: rr.height * .5 }; }
    function updateWeather(dt, now) {
      var w = window.innerWidth, h = window.innerHeight, sn = S.season, night = S.mode === 'night', groundSY = h - (H - GY) * S.s;
      if (particles.length < 200) {
        if (sn === 'spring') { rate('petal', 3, dt, function () { spawn('petal', rand(-40, w), -10); }); rate('tp', 1.6, dt, function () { var t = treeScreen(); spawn('petal', t.x + rand(0, t.w), t.y + rand(10, t.h)); }); }
        if (sn === 'fall') { rate('leaf', 2.2 + S.gust * 6, dt, function () { spawn('leaf', rand(-40, w), -10); }); rate('tl', 1.4 + S.gust * 5, dt, function () { var t = treeScreen(); spawn('leaf', t.x + rand(0, t.w), t.y + rand(10, t.h)); }); }
        if (sn === 'summer') { if (night) rate('fly', 2, dt, function () { if (particles.filter(function (p) { return p.t === 'fly'; }).length < 26) spawn('fly', rand(0, w), 0); }); else rate('leaf', .3, dt, function () { var t = treeScreen(); spawn('leaf', t.x + rand(0, t.w), t.y + rand(10, t.h)); }); }
        if (sn === 'winter') rate('snow', 9, dt, function () { spawn('snow', rand(-40, w + 40), -6); });
        if (night && sn !== 'summer') rate('ember', .8, dt, function () { spawn('ember', rand(0, w), h); });
        if (S.raining) {
          rate('rain', sn === 'winter' ? 90 : 140, dt, function () { spawn('rain', rand(-60, w + 60), 0); });
          if (sn !== 'winter') rate('rl', 3.5, dt, function () { var t = treeScreen(); spawn(sn === 'spring' ? 'petal' : 'leaf', t.x + rand(0, t.w), t.y + rand(10, t.h)).vy = rand(70, 110); });
        }
      }
      ctx.clearRect(0, 0, w, h);
      var windPx = (S.wind - S.gust * 1.6) * 60;
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        if (p.t === 'rain') {
          p.x += (windPx * 2 - 40) * dt; p.y += p.vy * dt;
          if (p.y > groundSY - rand(0, 6)) { if (Math.random() < .35) { var sp = spawn('splash', p.x, groundSY); } particles.splice(i, 1); continue; }
          ctx.strokeStyle = sn === 'winter' ? (night ? 'rgba(235,240,255,.7)' : 'rgba(120,135,160,.6)') : (night ? 'rgba(170,190,225,.45)' : 'rgba(60,70,95,.35)');
          ctx.lineWidth = sn === 'winter' ? 1.6 : 1; ctx.beginPath(); ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (windPx * 2 - 40) * .02, p.y - (sn === 'winter' ? p.len * .5 : p.len)); ctx.stroke(); continue;
        }
        if (p.t === 'splash') {
          p.life -= dt * 3.5; if (p.life <= 0) { particles.splice(i, 1); continue; }
          ctx.strokeStyle = night ? 'rgba(170,190,225,' + (.5 * p.life) + ')' : 'rgba(60,70,95,' + (.4 * p.life) + ')'; ctx.lineWidth = .8;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * (2 - p.life) * 1.4, p.r * (2 - p.life) * .4, 0, Math.PI, 0); ctx.stroke(); continue;
        }
        if (p.t === 'fly') {
          p.ph += dt; p.vx += rand(-20, 20) * dt; p.vy += rand(-20, 20) * dt; p.vx = clamp(p.vx, -18, 18); p.vy = clamp(p.vy, -14, 14);
          p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > groundSY - 6) p.vy = -Math.abs(p.vy);
          if (p.x < -20 || p.x > w + 20 || p.y < h * .3) { particles.splice(i, 1); continue; }
          var gl = .5 + .5 * Math.sin(now / 400 + p.ph * 5);
          ctx.globalAlpha = .3 + .7 * gl; ctx.drawImage(FLY, p.x - 9, p.y - 9, 18, 18); ctx.globalAlpha = 1; continue;
        }
        if (p.t === 'ember') {
          p.ph += dt * 2; p.x += Math.sin(p.ph) * 12 * dt + windPx * .3 * dt; p.y += p.vy * dt;
          if (p.y < -10) { particles.splice(i, 1); continue; }
          var fl = .55 + .45 * Math.sin(now / 300 + p.ph * 3);
          ctx.globalAlpha = .75 * fl; ctx.drawImage(EMBER, p.x - 6 * p.r, p.y - 6 * p.r, 12 * p.r, 12 * p.r); ctx.globalAlpha = 1; continue;
        }
        // petals, leaves, snow: drift down, rest on the ground, fade
        if (p.rest > 0) {
          p.rest -= dt; p.life = clamp(p.rest / 2.5, 0, 1); if (p.rest <= 0) { particles.splice(i, 1); continue; }
          if (p.t !== 'snow') { p.x += windPx * .5 * dt; p.rot += windPx * .01 * dt; }
        }
        else {
          p.ph += dt * (p.t === 'snow' ? 1.2 : 2.6);
          var flutter = p.t === 'snow' ? 10 : 26;
          p.x += (Math.sin(p.ph) * flutter + windPx * (p.t === 'snow' ? .6 : 1) + (p.vx || 0)) * dt; if (p.vx) p.vx *= (1 - .25 * dt);
          p.y += (p.vy + (S.raining && p.t !== 'snow' ? 40 : 0)) * dt; p.rot += p.vr * dt;
          if (p.y >= groundSY - 2) { p.y = groundSY - rand(0, 2); p.rest = p.t === 'snow' ? .8 : rand(3, 5.5); }
          if (p.x > w + 50 || p.x < -80) { particles.splice(i, 1); continue; }
        }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = p.life;
        if (p.t === 'snow') {
          ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 6.283);
          ctx.fillStyle = night ? 'rgba(240,244,255,.9)' : 'rgba(255,255,255,.95)'; ctx.fill();
          if (!night) { ctx.strokeStyle = 'rgba(90,100,125,.35)'; ctx.lineWidth = .6; ctx.stroke(); }
        } else {
          var sx = p.t === 'leaf' ? Math.cos(p.ph * 1.3) : 1;
          ctx.scale(sx || .1, 1); ctx.beginPath();
          if (p.t === 'petal') { ctx.ellipse(0, 0, p.r, p.r * .62, 0, 0, 6.283); }
          else { ctx.moveTo(-p.r, 0); ctx.quadraticCurveTo(0, -p.r * .8, p.r, 0); ctx.quadraticCurveTo(0, p.r * .8, -p.r, 0); }
          ctx.fillStyle = p.c; ctx.globalAlpha = p.life * (night ? .8 : .9); ctx.fill();
        }
        ctx.restore();
      }
    }

    /* ---------- Rain ---------- */
    function shakeCat() {
      C.shake = true;
      clearTimeout(cat._sh); cat._sh = setTimeout(function () { C.shake = false; }, 900);
      for (var i = 0; i < 10; i++) {
        var d = document.createElement('i'); d.className = 'g-drop';
        var a = -Math.PI * (.1 + Math.random() * .8);
        d.style.setProperty('--dx', (Math.cos(a) * (25 + Math.random() * 30)).toFixed(1) + 'px');
        d.style.setProperty('--dy', (Math.sin(a) * (20 + Math.random() * 25)).toFixed(1) + 'px');
        d.style.left = (40 + Math.random() * 60) + 'px'; d.style.bottom = (30 + Math.random() * 30) + 'px';
        d.style.animationDelay = (Math.random() * .3).toFixed(2) + 's';
        cat.appendChild(d); setTimeout(function (n) { return function () { n.remove(); }; }(d), 1300);
      }
      if (Math.random() < .5) speak(['Brrr.', 'Wet. Rude.', 'Who ordered this rain?'][Math.floor(Math.random() * 3)], 2000);
    }
    document.addEventListener('sf:nod', function (e) {
      if (e.detail && e.detail.who === 'garden') setTimeout(function () { Gi.nod = true; setTimeout(function () { Gi.nod = false; }, 1150); }, 700);
    });
    function windy(ms) { Gi.windy = true; clearTimeout(girl._w); girl._w = setTimeout(function () { Gi.windy = false; }, ms); }
    function breeze(strength) {
      windy(2800); try { document.dispatchEvent(new CustomEvent('sf:breeze')); } catch (e) {}
      S.gust = Math.max(S.gust, strength || .45); tree.classList.add('gust');
      clearTimeout(tree._b); tree._b = setTimeout(function () { tree.classList.remove('gust'); }, 2600);
      var n = { spring: 12, summer: 7, fall: 16, winter: 9 }[S.season], t = treeScreen();
      for (var i = 0; i < n; i++) (function (i) {
        setTimeout(function () {
          var type = S.season === 'spring' ? 'petal' : S.season === 'winter' ? 'snow' : 'leaf';
          var p = spawn(type, t.x + t.w * (.2 + Math.random() * .7), t.y + t.h * (.2 + Math.random() * .8));
          p.vy = type === 'snow' ? 30 : rand(18, 34); p.vr = rand(-3, 3); p.vx = -rand(45, 110) * (strength || .45) * 2; if (type === 'snow') p.r = rand(1.6, 3.2);
        }, i * rand(90, 260));
      })(i);
    }
    /* real rain from the visitor's actual weather: keeps raining for a good while */
    function realRain() {
      var now = performance.now(); document.documentElement.classList.add('raining');
      S.rainUntil = Math.max(S.rainUntil || 0, now + 8 * 60000);
      if (!S.raining) { S.raining = true; tree.classList.add('rain'); Sound.rain(true); announce(); rainScript(); }
    }
    function startRain() {
      var now = performance.now(); document.documentElement.classList.add('raining');
      S.rainUntil = Math.min(now + 15000, Math.max(S.rainUntil, now) + 6500);
      if (!S.raining) { S.raining = true; tree.classList.add('rain'); Sound.rain(true); announce(); rainScript(); }
    }

    /* ---------- Director: the season stories ---------- */
    function sleep(ms, id) { return new Promise(function (res, rej) { setTimeout(function () { id === S.director ? res() : rej('cancel'); }, ms); }); }
    function waitFor(fn, id, timeout) {
      var t0 = performance.now();
      return new Promise(function (res, rej) {
        (function check() {
          if (id !== S.director) return rej('cancel');
          if (fn() || performance.now() - t0 > (timeout || 15000)) return res();
          setTimeout(check, 120);
        })();
      });
    }
    var seatX = function () { return S.benchX + 18; };
    function girlTo(x, id) { Gi.sitting = false; Gi.reading = false; Gi.target = clamp(x, 30, S.W - 30); return waitFor(function () { return Math.abs(Gi.x - Gi.target) < 2; }, id, 20000); }
    async function sitBench(id, reading) { await girlTo(seatX(), id); Gi.face = -1; Gi.sitting = true; Gi.reading = !!reading; await sleep(400, id); }
    function catGo(x, act, opt) { C.dir = Object.assign({ x: clamp(x, 30, S.W - 30), act: act || 'sit' }, opt || {}); }
    function catAt() { return C.dir && Math.abs(C.x - C.dir.x) < 5 && !C.jump; }
    function placeBowl(x, water) { bowl.classList.toggle('water', !!water); bowl.style.transform = 'translateX(' + (x - 9) + 'px)'; bowl.classList.add('on'); S.bowlX = x; }
    function removeBowl() { bowl.classList.remove('on'); S.bowlX = null; }
    function toward(a, b) { return b >= a ? 1 : -1; }

    var BEATS = {
      spring: async function (id) {
        await sitBench(id, true); catGo(S.homeX, 'idle');
        await sleep(9000, id);
        var off = toward(Gi.x, C.x);
        await girlTo(C.x - off * 70, id); Gi.face = off; Gi.offer = true; await sleep(700, id);
        placeBowl(Gi.x + off * 26); Gi.offer = false;
        catGo(S.bowlX - off * 48, 'eat', { pre: 'stretch', hesitate: 1600 });
        await waitFor(catAt, id, 14000); await sleep(600, id); Gi.blush = true;
        await sleep(4200, id); catGo(C.x, 'idle'); removeBowl();
        await sleep(1500, id); Gi.blush = false;
        await sitBench(id, true); catGo(S.benchX - 80, 'idle'); await sleep(10000, id);
      },
      summer: async function (id) {
        await sitBench(id, true); catGo(S.shadeX, 'curl');
        await sleep(9000, id);
        await girlTo(C.x - 56, id); Gi.face = 1; Gi.offer = true; await sleep(700, id);
        placeBowl(Gi.x + 26, true); Gi.offer = false; Gi.blush = true;
        await sitBench(id, true); await sleep(4000, id); Gi.blush = false;
        catGo(S.bowlX + 48, 'eat', { pre: 'stretch' }); await waitFor(catAt, id, 12000); await sleep(4000, id); removeBowl();
        catGo(S.benchX - 70, 'idle'); await sleep(14000, id);
      },
      fall: async function (id) {
        await sitBench(id, true); catGo(S.homeX, 'idle');
        await sleep(7000, id);
        S.gust = 1; tree.classList.add('gust'); ball.vx -= 260; ball.vh = 120; ball.owned = 0;
        setTimeout(function () { tree.classList.remove('gust'); }, 2600);
        await sleep(900, id); Gi.target = ball.x; Gi.sitting = false; Gi.reading = false;
        await waitFor(function () { return Math.abs(Gi.x - ball.x) < 30 && Math.abs(ball.vx) < 20; }, id, 9000);
        await sleep(2400, id);
        await sitBench(id, true); await sleep(9000, id);
      },
      winter: async function (id) {
        await sitBench(id, false); catGo(S.homeX, 'idle');
        await sleep(6000, id);
        Gi.offer = true; Gi.face = -1; await sleep(800, id); placeBowl(S.benchX - 52); Gi.offer = false;
        catGo(S.bowlX - 48, 'eat'); await waitFor(catAt, id, 14000); await sleep(4500, id); removeBowl();
        catGo(Gi.x - 7, 'lap'); await waitFor(function () { return C.pose === 'lap'; }, id, 12000);
        Gi.blush = true; await sleep(16000, id); Gi.blush = false;
        catGo(S.benchX - 90, 'idle'); await sleep(8000, id);
      }
    };
    function startDirector() {
      var id = ++S.director; C.dir = null; removeBowl(); Gi.offer = false; Gi.blush = false; Gi.umbrella = false; Gi.shelter = false;
      (async function () { try { while (true) await BEATS[S.season](id); } catch (e) {} })();
    }
    async function rainScript() {
      var id = ++S.director; removeBowl(); Gi.offer = false;
      try {
        Gi.sitting = false; Gi.reading = false; await sleep(500, id);
        Gi.umbrella = true; await sleep(500, id);
        var side = C.x >= Gi.x ? 1 : -1;
        await girlTo(C.x - side * 26, id); Gi.face = side; Gi.shelter = true;
        catGo(Gi.x + side * 52, 'idle', { shelter: true });
        while (performance.now() < S.rainUntil) await sleep(300, id);
        S.raining = false; tree.classList.remove('rain'); Sound.rain(false); document.documentElement.classList.remove('raining'); announce();
        await sleep(1600, id); Gi.shelter = false; Gi.umbrella = false; C.dir = null;
        await sleep(800, id); startDirector();
      } catch (e) {}
    }

    /* ---------- Cat ---------- */
    var IDLE = { spring: ['stare', 'stare', 'sit', 'groom', 'loaf', 'knead', 'stretch', 'wander', 'bat'], summer: ['stare', 'loaf', 'curl', 'groom', 'stare', 'sit', 'stretch', 'bat'],
      fall: ['stare', 'sit', 'leaf', 'leaf', 'groom', 'bat', 'wander', 'stare'], winter: ['stare', 'loaf', 'knead', 'curl', 'stare', 'groom', 'sit'] };
    var DUR = { sit: [5, 9], groom: [3, 5], loaf: [8, 14], yawn: [2.2, 2.2], knead: [3, 5], stretch: [1.7, 1.7], curl: [12, 20], stare: [5, 9] };
    function setPose(p, mods) {
      var svg = { walk: 'stand', run: 'stand', stand: 'stand', crouch: 'stand', wiggle: 'stand', eat: 'stand', pounce: 'stand', sit: 'sit', groom: 'sit', yawn: 'sit',
        loaf: 'loaf', knead: 'loaf', curl: 'curl', sleep: 'curl', lap: 'curl', stretch: 'stretch', stare: 'stare', stareyawn: 'stare' }[p] || 'sit';
      C.pose = p; cat.setAttribute('data-svg', svg);
      var cls = 'g-cat ' + ({ walk: 'walk', run: 'run', crouch: 'crouch', wiggle: 'crouch wiggle', eat: 'crouch eat', pounce: 'pounce', groom: 'groom', yawn: 'yawn', knead: 'knead', curl: 'sleep', sleep: 'sleep', lap: 'sleep', stareyawn: 'yawn' }[p] || '');
      if (mods) cls += ' ' + mods; if (C.scowl) cls += ' scowl'; if (C.shake) cls += ' shake'; cat.className = cls;
    }
    function moveTo(tx, speed, dt) {
      var dx = tx - C.x; if (Math.abs(dx) < 5) return false;
      var st = Math.sign(dx) * Math.min(Math.abs(dx), speed * dt); C.x += st;
      var want = st < 0 ? 1 : -1, tn = performance.now();
      if (want !== C.face && tn - (C.faceT || 0) > 220) { C.face = want; C.faceT = tn; }
      C.dist += Math.abs(st); if (S.season === 'winter' && C.h === 0 && C.dist > 9) { C.dist = 0; S.prints.push({ x: C.x + rand(-2, 2), o: .9 }); if (S.prints.length > 70) S.prints.shift(); }
      return true;
    }
    function jumpTo(tx, peak, dur, land) { C.jump = { x0: C.x, x1: tx, h0: C.h, h1: land || 0, peak: peak, t0: performance.now(), dur: dur }; C.face = tx < C.x ? 1 : -1; }
    function updateCat(dt, now) {
      var still = true;
      var ballMoving = !ball.held && (Math.abs(ball.vx) > 45 || ball.h > 3) && now - ball.owned < 6000;
      if (ballMoving) C.chaseUntil = now + 900;
      var busy = (endDrag && endTarget && endTarget.y > GY - 160) || (!ball.held && now < (C.chaseUntil || 0)) || S.story.active;
      if (!C.jump && C.h > .5 && (busy || !(C.dir && C.dir.act === 'lap'))) {
        C.lapping = false; jumpTo(C.x + (S.homeX < C.x ? -80 : 80), 30, 480, 0);
      }
      if (C.jump) {
        var q = clamp((now - C.jump.t0) / C.jump.dur, 0, 1);
        C.x = C.jump.x0 + (C.jump.x1 - C.jump.x0) * q; C.h = C.jump.h0 + (C.jump.h1 - C.jump.h0) * q + Math.sin(q * Math.PI) * C.jump.peak;
        setPose('pounce'); if (q >= 1) { C.h = C.jump.h1; C.x = C.jump.x1; C.jump = null; C.cool = now + 500; } still = false;
      } else if (C.clickSeq) {
        var el2 = now - C.clickStart, acc = 0, cur = null;
        for (var i = 0; i < C.clickSeq.length; i++) { acc += C.clickSeq[i].ms; if (el2 < acc) { cur = C.clickSeq[i]; break; } }
        if (!cur) { C.clickSeq = null; }
        else { if (!cur.done && cur.fn) { cur.done = true; cur.fn(); } setPose(cur.pose); }
      } else if (endDrag && endTarget && endTarget.y > GY - 330 && endTarget.y < GY - 75) {
        var hx = endTarget.x, high = GY - endTarget.y, ux = hx + (C.x > hx ? 26 : -26);
        if (Math.abs(C.x - ux) > 10 && now > C.cool) { C.crouchT = 0; moveTo(ux, 210, dt); setPose('run'); still = false; }
        else if (now > C.cool) {
          if (!C.crouchT) C.crouchT = now; setPose('crouch'); C.face = hx < C.x ? 1 : -1;
          if (now - C.crouchT > 380) { C.crouchT = 0; jumpTo(hx, Math.min(175, high - 30), 560); Math.random() < .4 && Sound.meow(true); }
        } else setPose('sit');
      } else if (endDrag && endTarget && endTarget.y > GY - 160) {
        var ex = endTarget.x, tx = ex + (C.x > ex ? 62 : -62);
        if (Math.abs(C.x - tx) > 6 && now > C.cool) { moveTo(tx, 190, dt); setPose('run'); still = false; }
        else if (now > C.cool) {
          if (!C.crouchT) C.crouchT = now; setPose('wiggle'); C.face = ex < C.x ? 1 : -1;
          if (now - C.crouchT > 650) { C.crouchT = 0; jumpTo(ex + (C.x > ex ? 20 : -20), 40, 460); }
        } else setPose('sit');
      } else if (!ball.held && now < (C.chaseUntil || 0)) {
        C.crouchT = 0;
        var bx = ball.x + (ball.vx > 0 ? -58 : 58);
        if (ball.h > 55 && Math.abs(C.x - ball.x) < 110 && now > C.cool) { jumpTo(ball.x, Math.min(165, ball.h), 520); }
        else if (moveTo(bx, 210, dt)) { setPose('run'); still = false; } else setPose('crouch');
      } else if (S.story.active && !ball.held) {
        var sx = ball.x + (S.story.dir > 0 ? 74 : -74);
        if (moveTo(sx, 160, dt)) { setPose(Math.abs(sx - C.x) > 40 ? 'run' : 'walk'); still = false; } else setPose('sit');
      } else if (C.dir) {
        var d = C.dir;
        if (d.act === 'lap') {
          if (C.pose !== 'lap') {
            var side = C.x < d.x ? -1 : 1; if (Math.abs(C.x - (d.x + side * 40)) > 6 && C.h === 0 && !C.lapping) { moveTo(d.x + side * 40, 80, dt); setPose('walk'); still = false; }
            else if (C.h === 0 && !C.lapping) { jumpTo(d.x, 34, 600, 40); C.lapping = true; }
            if (C.lapping && !C.jump && C.h > 30) { C.lapping = false; C.x = d.x; C.h = 40; C.face = 1; setPose('lap'); }
          } else setPose('lap');
        } else {
          if (d.pre && !d.preDone) {
            if (!d.preT) { d.preT = now + (d.hesitate || 0); }
            if (now < d.preT) { setPose('sit'); C.face = d.x < C.x ? 1 : -1; }
            else if (now < d.preT + 1700) setPose('stretch');
            else d.preDone = true;
          } else if (!d.shelter && now < (C.pauseUntil || 0) && Math.abs(C.x - d.x) > 8) { setPose(C.pauseStare ? 'stare' : 'stand'); }
          else if (moveTo(d.x, d.shelter ? 140 : 70, dt)) {
            setPose(d.shelter ? 'run' : 'walk'); still = false;
            if (!d.shelter && Math.random() < dt * .35) { C.pauseUntil = now + rand(700, 1700); C.pauseStare = Math.random() < .6; }
          }
          else {
            if (d.act === 'eat') { setPose('eat'); C.face = S.bowlX != null && S.bowlX < C.x ? 1 : -1; }
            else if (d.act === 'curl') setPose('curl');
            else if (d.act === 'sit' || d.shelter) setPose('sit');
            else idle(now);
          }
        }
      } else idle(now);
      if (!still) C.still = now;
      var sitFamily = C.pose === 'sit' || C.pose === 'groom' || C.pose === 'yawn' || C.pose === 'stare' || C.pose === 'stareyawn';
      cat.classList.toggle('swish', sitFamily && now - C.still >= 120000);
      cat.classList.toggle('right', C.face < 0);
      cat.style.transform = 'translate(' + (C.x - 69) + 'px,' + (-C.h) + 'px)';
      zzz.classList.toggle('on', C.pose === 'curl' || C.pose === 'lap' || C.pose === 'stareyawn');
      zzz.style.transform = 'translate(' + (C.x + 14) + 'px,' + (GY - 104 - C.h) + 'px)';
    }
    function idle(now) {
      if (!C.idleAct || now > C.idleUntil) {
        var list = IDLE[S.season], a = list[Math.floor(Math.random() * list.length)];
        if (a === 'bat' && Math.abs(ball.x - C.x) > 140) a = 'sit';
        C.idleAct = a; var d = DUR[a] || [3, 5]; C.idleUntil = now + rand(d[0], d[1]) * 1000; C.stareYawnAt = 0; C.stareYawned = 0; if (a === 'stare' && Math.random() < .5) C.stareYawnAt = now + 1e9;
        if (a === 'yawn' && Math.random() < .5) { Sound.meow(true); }
        if (a === 'wander') { C.wanderX = clamp(C.x + rand(-140, 140), 50, S.benchX - 70); C.idleUntil = now + 6000; }
        if (a === 'leaf') { C.leafPhase = 0; C.leafX = clamp(C.x + rand(-140, 140), 60, S.benchX - 90); C.idleUntil = now + 2500; }
        if (a === 'bat') { C.batPhase = 0; C.idleUntil = now + 4000; }
      }
      var act = C.idleAct;
      if (act === 'wander') {
        if (now < (C.pauseUntil || 0)) setPose(C.pauseStare ? 'stare' : 'stand');
        else if (moveTo(C.wanderX, 55, 1 / 60)) { setPose('walk'); C.still = now; if (Math.random() < .008) { C.pauseUntil = now + rand(700, 1700); C.pauseStare = Math.random() < .6; } }
        else setPose('sit');
      }
      else if (act === 'leaf') {
        if (C.leafPhase === 0) { setPose('wiggle'); C.face = C.leafX < C.x ? 1 : -1; if (C.idleUntil - now < 1900) { C.leafPhase = 1; jumpTo(C.leafX, 42, 480); } }
        else setPose('sit');
      } else if (act === 'stare') {
        if (!C.stareYawnAt) C.stareYawnAt = now + rand(1500, 3500);
        if (now > C.stareYawnAt && now < C.stareYawnAt + 2300) { if (!C.stareYawned) { C.stareYawned = 1; if (Math.random() < .6) Sound.meow(true); } setPose('stareyawn'); }
        else setPose('stare');
      } else if (act === 'bat') {
        var tx = ball.x + (C.x > ball.x ? 54 : -54);
        if (moveTo(tx, 80, 1 / 60)) { setPose('walk'); C.still = now; }
        else if (C.batPhase < 2 && Math.random() < .02) { C.batPhase++; setPose('crouch'); ball.vx += (ball.x > C.x ? 1 : -1) * rand(90, 160); ball.vh = rand(40, 90); ball.owned = now; }
        else setPose('crouch');
      } else setPose(act);
    }

    /* ---------- Girl ---------- */
    function updateGirl(dt, now) {
      var walking = false;
      if (Hj && S.bench2X) { var mn = S.bench2X + 120; if (Gi.target < mn) Gi.target = mn; if (Gi.x < mn) Gi.x = Math.min(mn, Gi.x + 60 * dt); }
      if (!Gi.sitting && Math.abs(Gi.target - Gi.x) > 1.5) {
        var dx = Gi.target - Gi.x, sp = (Gi.umbrella ? 60 : 46) * dt;
        Gi.x += Math.sign(dx) * Math.min(Math.abs(dx), sp); Gi.face = dx > 0 ? 1 : -1; walking = true; S._g = [dt, dx, sp, Gi.x];
      }
      // Pick up a resting ball near her feet and roll it back to the cat
      if (!Gi.sitting && !walking && !Gi.umbrella && !ball.held && ball.h === 0 && Math.abs(ball.vx) < 8 && Math.abs(ball.x - Gi.x) < 34 && now > Gi.picking && now - ball.owned > 1500) {
        Gi.picking = now + 5000; Gi.offer = true;
        setTimeout(function () { Gi.offer = false; var dir = C.x > ball.x ? 1 : -1; ball.vx = dir * rand(150, 220); ball.vh = 60; ball.owned = performance.now(); }, 700);
      }
      var cls = 'g-girl' + (Gi.sitting ? ' sitting' : '') + (walking ? ' walking' : '') + (Gi.face < 0 ? ' left' : '') + (Gi.blush ? ' blush' : '') +
        (Gi.offer ? ' offer' : (Gi.umbrella ? ' umbrella' + (Gi.shelter ? ' shelter' : '') : (Gi.reading && Gi.sitting ? ' reading' : '')));
      if (Gi.windy) cls += ' windy'; if (Gi.nod) cls += ' nod'; if (Gi.toss) cls += ' toss';
      if (girl.className.replace(' wave', '') !== cls) girl.className = cls + (girl.classList.contains('wave') ? ' wave' : '');
      girl.style.transform = 'translateX(' + (Gi.x - 50.75) + 'px)';
    }

    /* ---------- Ball + thread ---------- */
    function ropeInit() { R = []; for (var i = 0; i <= NSEG; i++) R.push({ x: ball.x - i * SEG, y: GY - 1, px: ball.x - i * SEG, py: GY - 1 }); }
    function updateBall(dt, now) {
      if (!ball.held) {
        if (S.story.active && now - ball.owned > 800) {
          var tx = S.story.x, prev = ball.x; ball.x += (tx - ball.x) * Math.min(1, 3.2 * dt); ball.vx = (ball.x - prev) / Math.max(dt, .001);
          ball.h = Math.max(0, ball.h - 200 * dt);
        } else {
          ball.vh -= 900 * dt; ball.h += ball.vh * dt;
          if (ball.h <= 0) { ball.h = 0; ball.vh = ball.vh < -80 ? -ball.vh * .42 : 0; }
          if (ball.h === 0) ball.vx *= Math.max(0, 1 - 1.8 * dt);
          ball.vx += (S.wind - S.gust * 2.2) * (S.season === 'fall' ? 50 : 14) * dt;
          ball.x += ball.vx * dt;
          if (ball.x < 8) { ball.x = 8; ball.vx = Math.abs(ball.vx) * .5; }
          if (ball.x > S.W - 8) { ball.x = S.W - 8; ball.vx = -Math.abs(ball.vx) * .5; }
        }
      }
      ball.rot += (ball.vx * dt) / BR;
      ballEl.style.transform = 'translate(' + (ball.x - BR) + 'px,' + (GY - BR * 2 - ball.h) + 'px) rotate(' + ball.rot + 'rad)';
      // rope: verlet
      var bx = ball.x, by = GY - BR - ball.h, g = 900 * dt * dt, wind = (S.wind - S.gust * 2) * (S.season === 'fall' ? 2.2 : .6) * dt * 6;
      for (var i = 1; i < R.length; i++) {
        var p = R[i], vx = (p.x - p.px) * .97, vy = (p.y - p.py) * .97;
        p.px = p.x; p.py = p.y; p.x += vx + wind; p.y += vy + g;
      }
      for (var k = 0; k < 8; k++) {
        R[0].x = bx; R[0].y = by;
        if (endDrag && endTarget) { R[NSEG].x = endTarget.x; R[NSEG].y = endTarget.y; }
        for (var j = 0; j < NSEG; j++) {
          var a = R[j], b = R[j + 1], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .001, diff = (d - SEG) / d;
          var fa = j === 0 ? 0 : .5, fb = (j + 1 === NSEG && endDrag) ? 0 : .5; if (j === 0) fb = 1; if (j + 1 === NSEG && endDrag && j === 0) fb = 0;
          if (fa + fb === 0) continue; var tot = fa + fb; fa /= tot; fb /= tot;
          a.x += dx * diff * fa; a.y += dy * diff * fa; b.x -= dx * diff * fb; b.y -= dy * diff * fb;
        }
        for (var m = 1; m < R.length; m++) if (R[m].y > GY - 1) { R[m].y = GY - 1; R[m].px = R[m].x - (R[m].x - R[m].px) * .5; }
      }
      if (endDrag && endTarget && !ball.held) {
        var ddx = endTarget.x - bx, dd = Math.hypot(ddx, endTarget.y - by), maxL = NSEG * SEG;
        if (dd > maxL) { var pull = (dd - maxL) * (ddx / dd); ball.x += pull * .6; ball.vx = pull * 8; ball.owned = now; }
      }
      line.setAttribute('points', R.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' '));
      var e = R[NSEG]; endH.style.transform = 'translate(' + e.x + 'px,' + e.y + 'px)';
    }

    /* ---------- Main loop ---------- */
    var last = performance.now(), snowT = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      var dt = Math.min(.1, (now - last) / 1000); last = now;
      try { step(dt, now); } catch (err) { if (!S._errLogged) { S._errLogged = 1; console.error('garden', err && err.stack || err); } }
    }
    function step(dt, now) {
      S._frames = (S._frames || 0) + 1;
      if (!S.hidden) {
        var base = INFO[S.season].wind;
        S.wind = -base * (.6 + .4 * Math.sin(now / 4000));
        if (S.season === 'fall' && Math.random() < dt / 9 && S.gust < .1) { S.gust = rand(.6, 1); tree.classList.add('gust'); setTimeout(function () { tree.classList.remove('gust'); }, 2400); }
        S.gust = Math.max(0, S.gust - dt * .45);
        S.story.active = now - S.story.last < 1400;
        if (!S.nextBreeze) S.nextBreeze = now + rand(4000, 8000);
        if (now > S.nextBreeze) { breeze(S.season === 'fall' ? .7 : .45); S.nextBreeze = now + rand(7000, 13000); }
        /* The cat says something on its own: once 20s after load, then every 2 minutes */
        if (!S.nextTalk) S.nextTalk = now + 20000;
        if (now > S.nextTalk) {
          S.nextTalk = now + 45000;
          if (!S.hidden) { var tl = pickLine(); Sound.meow(tl.length < 8); speak(tl, 3600); S.nextMeow = Math.max(S.nextMeow || 0, now + 8000); }
        }
        if (!S.nextMeow) S.nextMeow = now + rand(12000, 22000);
        if (now > S.nextMeow) {
          S.nextMeow = now + rand(20000, 42000);
          /* no more meows; the cat only talks */
        }
        if (S.raining && !S.nextShake) S.nextShake = now + rand(3500, 6000);
        if (S.nextShake && now > S.nextShake) {
          S.nextShake = S.raining ? now + rand(7000, 11000) : 0;
          if (C.pose !== 'lap' && C.pose !== 'curl' && !C.jump && C.h <= 0) shakeCat();
        }
        /* now and then the two girls nod to each other (only while the thinker is on screen) */
        if (!S.nextNod) S.nextNod = now + rand(9000, 15000);
        if (now > S.nextNod) {
          S.nextNod = now + rand(22000, 38000);
          if (!S.hidden && Hj && Hj.x !== null) {
            var hFirst = Math.random() < .5;
            setTimeout(function () { Gi.nod = true; setTimeout(function () { Gi.nod = false; }, 1150); }, hFirst ? 0 : 1300);
            setTimeout(function () { Hj.nod = true; setTimeout(function () { Hj.nod = false; }, 1150); }, hFirst ? 1300 : 0);
          } else if (!S.hidden && document.documentElement.getAttribute('data-thinker') === 'here' && document.querySelector('.sc-thinker')) {
            var gFirst = Math.random() < .5;
            setTimeout(function () { Gi.nod = true; setTimeout(function () { Gi.nod = false; }, 1150); }, gFirst ? 0 : 1300);
            setTimeout(function () { try { document.dispatchEvent(new CustomEvent('sf:nod', { detail: { who: 'thinker' } })); } catch (e) {} }, gFirst ? 1300 : 0);
          }
        }
        if (!S.nextBlink) S.nextBlink = now + rand(2500, 6000);
        if (now > S.nextBlink) { S.nextBlink = now + rand(2500, 6500); cat.classList.add('blinknow'); setTimeout(function () { cat.classList.remove('blinknow'); }, 170); }
        if (S.raining && now > S.rainUntil + 4000) { S.nextShake = now + 1500; document.documentElement.classList.remove('raining'); S.raining = false; announce(); tree.classList.remove('rain'); Sound.rain(false); Gi.umbrella = false; Gi.shelter = false; }
        updateBall(dt, now); updateCat(dt, now); if (say.classList.contains('on')) placeSay(); updateGirl(dt, now); updateHj(dt, now); updateThrow(dt, now); updateWeather(dt, now);
        snowT += dt;
        if (snowT > .5) {
          snowT = 0;
          if (S.season === 'winter') S.snow = Math.min(9, S.snow + (S.raining ? .12 : .06));
          S.prints.forEach(function (p) { p.o -= .012; }); S.prints = S.prints.filter(function (p) { return p.o > 0; });
          renderGround();
        }
      }
    }

    /* ---------- Controls ---------- */
    function cycle() { setSeason(SEASONS[(SEASONS.indexOf(S.season) + 1) % 4]); }
    function bindButtons() {
      document.querySelectorAll('[data-season-cycle]').forEach(function (b) { if (b._g) return; b._g = 1; b.textContent = INFO[S.season].name; b.addEventListener('click', function (e) { e.stopPropagation(); cycle(); }); });
      document.querySelectorAll('[data-garden-toggle]').forEach(function (b) { if (b._g) return; b._g = 1; b.textContent = S.hidden ? 'Show garden' : 'Hide garden'; b.addEventListener('click', function (e) { e.stopPropagation(); setHidden(!S.hidden); }); });
      document.querySelectorAll('[data-sound-toggle]').forEach(function (b) { if (b._g || b.hasAttribute('data-scene-owned')) return; b._g = 1; b.addEventListener('click', function (e) { e.stopPropagation(); Sound.set(!Sound.on); if (Sound.on) Sound.meow(true); }); });
    }
    if (opts.controls) {
      var bar = el('div', 'g-controls', '<button type="button" data-season-cycle>Season</button><button type="button" data-sound-toggle data-sound-label>Sound off</button><button type="button" data-garden-toggle>Hide garden</button>');
      document.body.appendChild(bar);
      if (store('sf-sound') === '1') {
        var arm = function () { Sound.set(true); window.removeEventListener('pointerdown', arm); };
        window.addEventListener('pointerdown', arm);
        bar.querySelector('[data-sound-label]').textContent = 'Sound on';
      }
    }

    layout();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 120); });
    Gi.x = Gi.target = seatX(); Gi.face = -1; C.x = S.homeX; ball.x = clamp(S.benchX - 90, 40, S.W - 30); ropeInit();
    setPose('sit');
    root.setAttribute('data-season', S.season);
    setSeason(S.season, true);
    setHidden(S.hidden);
    S._ready = true; paintTreeNow(); scheduleBg();
    bindButtons();
    requestAnimationFrame(frame);

    var api = {
      story: function (p) {
        var startX = S.benchX - 90, endX = 110;
        S.story.dir = p > S.story.p ? 1 : -1; S.story.p = p; S.story.last = performance.now(); windy(1400);
        S.story.x = startX + (endX - startX) * p;
      },
      realRain: realRain,
      breeze: function (s) { breeze(s || .9); }, setSeason: setSeason, cycle: cycle, setHidden: setHidden, bind: bindButtons,
      meow: function () {},
      announce: announce,
      debug: function () { return { x: C.x, h: C.h, pose: C.pose, dir: C.dir, jump: !!C.jump, lapping: C.lapping, girl: { x: Gi.x, t: Gi.target, sitting: Gi.sitting, cls: girl.className }, catcls: cat.className, svg: cat.getAttribute('data-svg'), idle: C.idleAct, wx: C.wanderX, bench: S.benchX, bowl: S.bowlX, home: S.homeX, W: S.W, chase: C.chaseUntil, story: S.story.active, g: S._g, hidden: S.hidden, frames: S._frames, tl: S._tl }; },
      get season() { return S.season; }
    };
    G = { api: api };
    return api;
  }

  window.Garden = { init: init, sound: Sound, seasons: SEASONS, info: INFO };
})();

/* ============================================================
   APP.JS — Mind the Gap
   States: title → stop → map (overview) → stop
                ↑         ↑
           finale (last stop)
   ============================================================ */

// ── State machine ────────────────────────────────────────
const STATE = { TITLE: 'title', STOP: 'stop', MAP: 'map', FINALE: 'finale' };
let appState = STATE.TITLE;
let curIndex = 0;

function setState(s) {
  appState = s;
  document.body.dataset.state = s;
}

// ── Theme colors ─────────────────────────────────────────
const THEME_COLORS = {
  'bay-blue':               '#14558F',
  'berkshires-green':       '#388557',
  'duckling-yellow':        '#F6C51B',
  'independence-cranberry': '#680A1D',
  'granite-gray':           '#535353',
};
function themeHex(stop) {
  const v = stop.theme ? THEMES[stop.theme] : null;
  return THEME_COLORS[v] || '#535353';
}

// ── Element refs ─────────────────────────────────────────
const transitSvg    = document.getElementById('transit-svg');
const svgDefs       = document.getElementById('svg-defs');
const panGroup      = document.getElementById('pan-group');
const pathDim       = document.getElementById('path-dim');
const pathLit       = document.getElementById('path-lit');
const stationsGrp   = document.getElementById('stations-group');

const titleScreen   = document.getElementById('title-screen');
const finaleScreen  = document.getElementById('finale-screen');
const finaleBodyEl  = document.getElementById('finale-body-text');

const stopPanel     = document.getElementById('stop-panel');
const panelIntro    = document.getElementById('panel-intro');
const panelRegular  = document.getElementById('panel-regular');
const introTitleEl  = document.getElementById('intro-title');
const introBodyEl   = document.getElementById('intro-body');
const introImgWrap  = document.getElementById('intro-img-wrap');
const introImg      = document.getElementById('intro-img');
const regTag        = document.getElementById('reg-tag');
const regNumber     = document.getElementById('reg-number');
const regTitle      = document.getElementById('reg-title');
const regImgWrap    = document.getElementById('reg-img-wrap');
const regImg        = document.getElementById('reg-img');
const pContext      = document.getElementById('p-context');
const pObj          = document.getElementById('p-obj');
const pHow          = document.getElementById('p-how');
const pRlabel       = document.getElementById('p-rlabel');
const pResult       = document.getElementById('p-result');

const btnPrev       = document.getElementById('btn-prev');
const btnMap        = document.getElementById('btn-map');
const btnNext       = document.getElementById('btn-next');
const btnReturn     = document.getElementById('btn-return');

// ── Line waypoints (% of viewport) ───────────────────────
// Meanders like a real transit map — 9 direction changes.
const LINE_WP = [
  [6,  48],  // start left
  [22, 48],  // → right
  [22, 22],  // ↑ up
  [42, 22],  // → right
  [42, 60],  // ↓ down
  [58, 60],  // → right
  [58, 30],  // ↑ up
  [78, 30],  // → right
  [78, 68],  // ↓ down
  [93, 68],  // → end
];

let stopPos    = [];   // [{x, y, len}] per stop
let pathLen    = 0;

// ── Build smooth rounded SVG path ────────────────────────
function buildRoundedPath(pts, r) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i-1], [x1, y1] = pts[i], [x2, y2] = pts[i+1];
    const d1 = Math.hypot(x1-x0, y1-y0), d2 = Math.hypot(x2-x1, y2-y1);
    const cr = Math.min(r, d1/2, d2/2);
    const bx = x1 - ((x1-x0)/d1)*cr, by = y1 - ((y1-y0)/d1)*cr;
    const ax = x1 + ((x2-x1)/d2)*cr, ay = y1 + ((y2-y1)/d2)*cr;
    d += ` L ${bx} ${by} Q ${x1} ${y1} ${ax} ${ay}`;
  }
  d += ` L ${pts.at(-1)[0]} ${pts.at(-1)[1]}`;
  return d;
}

// ── SVG text wrapping ─────────────────────────────────────
function wrapSvgText(textEl, str, maxW, lineH) {
  while (textEl.firstChild) textEl.removeChild(textEl.firstChild);
  const x = parseFloat(textEl.getAttribute('x') || 0);
  const words = str.split(/\s+/);
  const lines = [];
  let cur = '';

  // Measure using a temp tspan
  const probe = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  probe.setAttribute('visibility', 'hidden');
  textEl.appendChild(probe);

  words.forEach(w => {
    const test = cur ? `${cur} ${w}` : w;
    probe.textContent = test;
    if (probe.getComputedTextLength() > maxW && cur) {
      lines.push(cur); cur = w;
    } else { cur = test; }
  });
  if (cur) lines.push(cur);
  textEl.removeChild(probe);

  lines.forEach((line, li) => {
    const ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    ts.textContent = line;
    ts.setAttribute('x', x);
    ts.setAttribute('dy', li === 0 ? 0 : lineH);
    textEl.appendChild(ts);
  });
}

// ── Build branch lines (fading tails at path start/end) ──
function buildBranchLines(W, H) {
  document.querySelectorAll('.branch-line, .branch-grad').forEach(el => el.remove());
  const svgNS = 'http://www.w3.org/2000/svg';
  const col   = '#388557';

  function addGrad(id, x1, y1, x2, y2, op1, op2) {
    const g = document.createElementNS(svgNS, 'linearGradient');
    g.id = id; g.classList.add('branch-grad');
    g.setAttribute('gradientUnits', 'userSpaceOnUse');
    g.setAttribute('x1', x1); g.setAttribute('y1', y1);
    g.setAttribute('x2', x2); g.setAttribute('y2', y2);
    [[op1,'0%'],[op2,'100%']].forEach(([op, off]) => {
      const s = document.createElementNS(svgNS, 'stop');
      s.setAttribute('offset', off);
      s.setAttribute('stop-color', col);
      s.setAttribute('stop-opacity', op);
      g.appendChild(s);
    });
    svgDefs.appendChild(g);
  }

  function addLine(id, x1, y1, x2, y2) {
    const l = document.createElementNS(svgNS, 'line');
    l.classList.add('branch-line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', `url(#${id})`);
    panGroup.insertBefore(l, panGroup.firstChild);
  }

  const [sx, sy] = [LINE_WP[0][0]/100*W,   LINE_WP[0][1]/100*H];
  const [ex, ey] = [LINE_WP.at(-1)[0]/100*W, LINE_WP.at(-1)[1]/100*H];
  const blen = W * 0.10;

  // Start branches — fade from node outward to the left
  addGrad('bg-s1', sx, sy, sx-blen,      sy-blen*0.35, 0.55, 0);
  addGrad('bg-s2', sx, sy, sx-blen*0.85, sy,           0.40, 0);
  addGrad('bg-s3', sx, sy, sx-blen,      sy+blen*0.28, 0.30, 0);
  addLine('bg-s1', sx, sy, sx-blen,      sy-blen*0.35);
  addLine('bg-s2', sx, sy, sx-blen*0.85, sy);
  addLine('bg-s3', sx, sy, sx-blen,      sy+blen*0.28);

  // End branches — fade from node outward to the right
  addGrad('bg-e1', ex, ey, ex+blen,      ey-blen*0.38, 0.55, 0);
  addGrad('bg-e2', ex, ey, ex+blen*0.85, ey,           0.40, 0);
  addGrad('bg-e3', ex, ey, ex+blen,      ey+blen*0.30, 0.30, 0);
  addLine('bg-e1', ex, ey, ex+blen,      ey-blen*0.38);
  addLine('bg-e2', ex, ey, ex+blen*0.85, ey);
  addLine('bg-e3', ex, ey, ex+blen,      ey+blen*0.30);
}

// ── Init map ─────────────────────────────────────────────
function initMap() {
  const W = transitSvg.clientWidth;
  const H = transitSvg.clientHeight;
  if (!W || !H) return;

  const pts = LINE_WP.map(([xp, yp]) => [xp/100*W, yp/100*H]);
  const d   = buildRoundedPath(pts, 38);
  pathDim.setAttribute('d', d);
  pathLit.setAttribute('d', d);

  pathLen = pathDim.getTotalLength();
  const N = STOPS.length;

  stopPos = STOPS.map((_, i) => {
    const frac = N > 1 ? i / (N-1) : 0;
    const len  = frac * pathLen;
    const pt   = pathDim.getPointAtLength(len);
    return { x: pt.x, y: pt.y, len };
  });

  pathLit.style.strokeDasharray  = pathLen;
  pathLit.style.strokeDashoffset = pathLen;

  buildBranchLines(W, H);
  buildStations(W, H);
  applyFog(curIndex);
  updateLit(curIndex, false);
}

// ── Build station circles ─────────────────────────────────
function buildStations(W, H) {
  stationsGrp.innerHTML = '';
  const svgNS = 'http://www.w3.org/2000/svg';
  // Label wrapping: max ~110px wide
  const labelMaxW = Math.min(110, W * 0.11);

  STOPS.forEach((stop, i) => {
    const { x, y } = stopPos[i];
    const isDeco   = !!stop.type;      // intro/outro/finale = smaller circle
    const r        = isDeco ? 6 : 8;

    const g = document.createElementNS(svgNS, 'g');
    g.classList.add('station-g');
    g.dataset.stopIndex = i;

    // Circle
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
    c.classList.add('station-circle');
    if (isDeco) c.setAttribute('stroke-dasharray', '4 3');

    // Label — alternates above/below to reduce overlap
    const above = i % 2 === 0;
    const lx = x, ly = above ? y - r - 7 : y + r + 16;
    const lbl = document.createElementNS(svgNS, 'text');
    lbl.setAttribute('x', lx);
    lbl.setAttribute('y', ly);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.classList.add('station-label');
    wrapSvgText(lbl, stop.title, labelMaxW, 14);

    // Hit target (larger, transparent)
    const hit = document.createElementNS(svgNS, 'circle');
    hit.setAttribute('cx', x); hit.setAttribute('cy', y); hit.setAttribute('r', 20);
    hit.classList.add('station-hit');
    hit.setAttribute('role', 'button');
    hit.setAttribute('tabindex', '0');
    hit.setAttribute('aria-label', stop.title);
    hit.addEventListener('click',   () => jumpToStop(i));
    hit.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); jumpToStop(i); } });

    g.appendChild(c); g.appendChild(lbl); g.appendChild(hit);
    stationsGrp.appendChild(g);
  });
}

// ── Fog/tunnel: dim stations ahead of current ─────────────
function applyFog(idx) {
  stationsGrp.querySelectorAll('.station-g').forEach(g => {
    const i    = parseInt(g.dataset.stopIndex);
    const dist = i - idx;
    let op;
    if (dist <= 0) op = 1.0;          // current + visited: fully lit
    else if (dist === 1) op = 0.62;
    else if (dist === 2) op = 0.38;
    else if (dist === 3) op = 0.20;
    else                 op = 0.10;
    g.style.opacity = op;

    const c = g.querySelector('.station-circle');
    c.classList.remove('visited', 'current');
    const lbl = g.querySelector('.station-label');
    lbl.classList.remove('current');
    if (i < idx)  c.classList.add('visited');
    if (i === idx) { c.classList.add('current'); lbl.classList.add('current'); }
  });
}

// ── Update lit track portion ──────────────────────────────
function updateLit(idx, animate) {
  if (!pathLen) return;
  const lit = stopPos[idx]?.len ?? 0;
  if (!animate) {
    const prev = pathLit.style.transition;
    pathLit.style.transition = 'none';
    pathLit.style.strokeDashoffset = pathLen - lit;
    requestAnimationFrame(() => { pathLit.style.transition = prev || ''; });
  } else {
    pathLit.style.strokeDashoffset = pathLen - lit;
  }
}

// ── Render the stop panel ─────────────────────────────────
function renderPanel(idx) {
  const stop    = STOPS[idx];
  const isIntro = !!stop.type && stop.type !== 'finale';

  panelIntro.classList.toggle('hidden', !isIntro);
  panelRegular.classList.toggle('hidden', isIntro);

  if (isIntro) {
    // Cold-open: render wordmark; closer: plain title
    if (stop.type === 'intro' && idx === 0) {
      introTitleEl.innerHTML = `<span class="wordmark" style="font-size:clamp(1.5rem,2.8vw,2.1rem)">Mind the <span class="gap">Gap</span></span>`;
    } else {
      introTitleEl.textContent = stop.title;
    }
    introBodyEl.textContent = stop.body || '';

    if (stop.image) {
      introImg.src = stop.image;
      introImg.alt = stop.title;
      introImgWrap.classList.remove('hidden');
    } else {
      introImgWrap.classList.add('hidden');
    }
  } else {
    const color = themeHex(stop);
    regTag.textContent     = stop.theme ? stop.theme.replace('_',' ') : '';
    regTag.style.background = color;
    regTag.style.display   = stop.theme ? '' : 'none';

    const regulars = STOPS.filter(s => !s.type);
    const myN      = STOPS.slice(0, idx).filter(s => !s.type).length + 1;
    regNumber.textContent = `${myN} of ${regulars.length}`;
    regTitle.textContent  = stop.title;
    pContext.textContent  = stop.context   || '';
    pObj.textContent      = stop.objective || '';
    pHow.textContent      = stop.how       || '';
    pRlabel.textContent   = stop.resultLabel || 'Result';
    pResult.textContent   = stop.result    || '';

    if (stop.image) {
      regImg.src = stop.image; regImg.alt = stop.title;
      regImgWrap.classList.remove('hidden');
    } else {
      regImgWrap.classList.add('hidden');
    }
  }

  btnPrev.disabled = idx === 0;
  btnNext.disabled = idx === STOPS.length - 1;
}

// ── Pan map to show current stop ──────────────────────────
let viewTx = { x: 0, y: 0, scale: 1 };

function applyViewTransform(animated) {
  if (animated) {
    panGroup.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { panGroup.style.transition = ''; }, 520);
  }
  panGroup.setAttribute('transform',
    `translate(${viewTx.x} ${viewTx.y}) scale(${viewTx.scale})`);
}

function resetViewTransform(animated) {
  viewTx = { x: 0, y: 0, scale: 1 };
  applyViewTransform(animated);
}

function panToStop(idx) {
  if (!stopPos[idx]) return;
  const { x, y } = stopPos[idx];
  const W = transitSvg.clientWidth;
  const H = transitSvg.clientHeight;
  // Target: 65% from left (leaves room for the panel), 50% vertical
  const tx = W * 0.65 - x * viewTx.scale;
  const ty = H * 0.50 - y * viewTx.scale;
  viewTx.x = tx; viewTx.y = ty;
  applyViewTransform(true);
}

// ── Pan/zoom (map state only) ─────────────────────────────
let isPanning = false, panStart = null;

transitSvg.addEventListener('mousedown', e => {
  if (appState !== STATE.MAP) return;
  if (e.target.closest('.station-hit')) return;
  isPanning = true;
  panStart  = { mx: e.clientX, my: e.clientY, tx: viewTx.x, ty: viewTx.y };
});
window.addEventListener('mousemove', e => {
  if (!isPanning) return;
  viewTx.x = panStart.tx + (e.clientX - panStart.mx);
  viewTx.y = panStart.ty + (e.clientY - panStart.my);
  applyViewTransform(false);
});
window.addEventListener('mouseup', () => { isPanning = false; });

transitSvg.addEventListener('wheel', e => {
  if (appState !== STATE.MAP) return;
  e.preventDefault();
  const f = e.deltaY < 0 ? 1.12 : 0.89;
  const ns = Math.max(0.35, Math.min(5, viewTx.scale * f));
  const r  = transitSvg.getBoundingClientRect();
  const cx = e.clientX - r.left, cy = e.clientY - r.top;
  const rf = ns / viewTx.scale;
  viewTx.x = cx - rf * (cx - viewTx.x);
  viewTx.y = cy - rf * (cy - viewTx.y);
  viewTx.scale = ns;
  applyViewTransform(false);
}, { passive: false });

// Touch pan
let touchPanStart = null;
transitSvg.addEventListener('touchstart', e => {
  if (appState !== STATE.MAP || e.touches.length !== 1) return;
  touchPanStart = { mx: e.touches[0].clientX, my: e.touches[0].clientY, tx: viewTx.x, ty: viewTx.y };
}, { passive: true });
transitSvg.addEventListener('touchmove', e => {
  if (!touchPanStart || e.touches.length !== 1) return;
  e.preventDefault();
  viewTx.x = touchPanStart.tx + (e.touches[0].clientX - touchPanStart.mx);
  viewTx.y = touchPanStart.ty + (e.touches[0].clientY - touchPanStart.my);
  applyViewTransform(false);
}, { passive: false });
transitSvg.addEventListener('touchend', () => { touchPanStart = null; });

// ── State transitions ─────────────────────────────────────
function goTitle() {
  setState(STATE.TITLE);
}

function goMap() {
  resetViewTransform(true);
  setState(STATE.MAP);
}

function goStop(idx, animate) {
  curIndex = Math.max(0, Math.min(STOPS.length - 1, idx));
  const stop = STOPS[curIndex];

  if (stop.type === 'finale') {
    finaleBodyEl.textContent = stop.body || '';
    updateLit(curIndex, animate !== false);
    applyFog(curIndex);
    setState(STATE.FINALE);
    return;
  }

  setState(STATE.STOP);
  renderPanel(curIndex);
  updateLit(curIndex, animate !== false);
  applyFog(curIndex);
  panToStop(curIndex);
}

function jumpToStop(idx) { goStop(idx, true); }

function advance() {
  if (appState === STATE.TITLE)  { goStop(0, true); return; }
  if (appState === STATE.FINALE) return;
  if (appState === STATE.MAP)    { goStop(curIndex, false); return; }
  if (appState === STATE.STOP && curIndex < STOPS.length - 1) {
    goStop(curIndex + 1, true);
  }
}

function retreat() {
  if (appState === STATE.STOP || appState === STATE.FINALE) {
    if (curIndex > 0) { goStop(curIndex - 1, true); }
    else              { goTitle(); }
  } else if (appState === STATE.MAP) {
    goTitle();
  }
}

// ── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown': case ' ':
      e.preventDefault(); advance(); break;
    case 'ArrowLeft': case 'ArrowUp':
      e.preventDefault(); retreat(); break;
    case 'Escape': case 'm': case 'M':
      if (appState !== STATE.MAP) goMap(); break;
    case 't': case 'T':
      goTitle(); break;
    case 'f': case 'F':
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen().catch(()=>{});
      break;
  }
});

// Click title or finale screen to advance
titleScreen.addEventListener('click',  () => advance());
finaleScreen.addEventListener('click', () => retreat());   // click finale → back

// Buttons
btnPrev.addEventListener('click', () => retreat());
btnNext.addEventListener('click', () => advance());
btnMap.addEventListener('click',  () => goMap());
btnReturn.addEventListener('click', () => goStop(curIndex, false));

// ── Resize ────────────────────────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { viewTx = {x:0,y:0,scale:1}; initMap(); }, 120);
});

// ── Init ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  setState(STATE.TITLE);
});

/* ============================================================
   APP.JS — Mind the Gap
   State machine: 'map' → 'title' → 'stop'
   ============================================================ */

// ── State ────────────────────────────────────────────────
const STATE = { MAP: 'map', TITLE: 'title', STOP: 'stop' };
let appState   = STATE.MAP;
let curIndex   = 0;    // current stop index
let hasStarted = false; // have we passed the title screen?

// ── Theme color map ────────────────────────────────────────
const THEME_COLORS = {
  'bay-blue':               '#14558F',
  'berkshires-green':       '#388557',
  'duckling-yellow':        '#F6C51B',
  'independence-cranberry': '#680A1D',
  'granite-gray':           '#535353',
};
function themeHex(stop) {
  if (!stop.theme) return '#535353';
  const varName = THEMES[stop.theme];
  return THEME_COLORS[varName] || '#535353';
}

// ── Element refs ─────────────────────────────────────────
const transitSvg   = document.getElementById('transit-svg');
const panGroup     = document.getElementById('pan-group');
const pathDim      = document.getElementById('path-dim');
const pathLit      = document.getElementById('path-lit');
const stationsGrp  = document.getElementById('stations-group');

const titleScreen  = document.getElementById('title-screen');

const stopPanel    = document.getElementById('stop-panel');
const panelIntro   = document.getElementById('panel-intro');
const panelRegular = document.getElementById('panel-regular');
const introTitle   = document.getElementById('intro-title');
const introBody    = document.getElementById('intro-body');
const regTag       = document.getElementById('reg-tag');
const regNumber    = document.getElementById('reg-number');
const regTitle     = document.getElementById('reg-title');
const pContext     = document.getElementById('p-context');
const pObj         = document.getElementById('p-obj');
const pHow         = document.getElementById('p-how');
const pRlabel      = document.getElementById('p-rlabel');
const pResult      = document.getElementById('p-result');

const btnPrev      = document.getElementById('btn-prev');
const btnNext      = document.getElementById('btn-next');
const btnOverview  = document.getElementById('btn-overview');
const btnBegin     = document.getElementById('btn-begin');
const btnReturn    = document.getElementById('btn-return');

// ── Line waypoints (% of viewport) ───────────────────────
// A meandering path that changes direction several times,
// like a real transit map.
const LINE_WAYPOINTS_PCT = [
  [6,  48],   // start: left, near center
  [22, 48],   // → right
  [22, 22],   // ↑ up
  [42, 22],   // → right
  [42, 60],   // ↓ down
  [58, 60],   // → right
  [58, 30],   // ↑ up
  [78, 30],   // → right
  [78, 68],   // ↓ down
  [93, 68],   // → end
];

// Stop positions on the path (set during initMap)
let stopPositions = []; // [{x, y, len}] for each stop
let pathTotalLen  = 0;

// ── Build rounded SVG path ────────────────────────────────
function buildRoundedPath(pts, r) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const dx1 = x1 - x0, dy1 = y1 - y0;
    const len1 = Math.hypot(dx1, dy1);
    const dx2 = x2 - x1, dy2 = y2 - y1;
    const len2 = Math.hypot(dx2, dy2);
    const cr = Math.min(r, len1 / 2, len2 / 2);
    const bx = x1 - (dx1 / len1) * cr;
    const by = y1 - (dy1 / len1) * cr;
    const ax = x1 + (dx2 / len2) * cr;
    const ay = y1 + (dy2 / len2) * cr;
    d += ` L ${bx} ${by} Q ${x1} ${y1} ${ax} ${ay}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` L ${lx} ${ly}`;
  return d;
}

// ── Init map (called on load and on resize) ───────────────
function initMap() {
  const W = transitSvg.clientWidth;
  const H = transitSvg.clientHeight;
  if (!W || !H) return;

  // Convert waypoints % → px
  const pts = LINE_WAYPOINTS_PCT.map(([xp, yp]) => [xp / 100 * W, yp / 100 * H]);

  // Build the SVG path
  const d = buildRoundedPath(pts, 38);
  pathDim.setAttribute('d', d);
  pathLit.setAttribute('d', d);

  // Measure total length
  pathTotalLen = pathDim.getTotalLength();

  // Distribute stops evenly along path
  const N = STOPS.length;
  stopPositions = STOPS.map((_, i) => {
    const frac = N > 1 ? i / (N - 1) : 0;
    const len  = frac * pathTotalLen;
    const pt   = pathDim.getPointAtLength(len);
    return { x: pt.x, y: pt.y, len };
  });

  // Init dash for lit path (fully hidden to start)
  pathLit.style.strokeDasharray  = pathTotalLen;
  pathLit.style.strokeDashoffset = pathTotalLen;

  // Draw stations
  buildStations();

  // Restore current state
  updateProgress(curIndex, false);
}

// ── Build station circles on the SVG ─────────────────────
function buildStations() {
  stationsGrp.innerHTML = '';
  STOPS.forEach((stop, i) => {
    const { x, y } = stopPositions[i];
    const isIntroOutro = !!stop.type;
    const r = isIntroOutro ? 7 : 8;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.dataset.stopIndex = i;

    // Visible circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.classList.add('station-circle');
    if (isIntroOutro) circle.setAttribute('stroke-dasharray', '4 3');

    // Label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', y - r - 6);
    label.setAttribute('text-anchor', 'middle');
    label.classList.add('station-label');
    if (isIntroOutro) label.classList.add(stop.type === 'intro' ? 'intro-stop' : 'outro-stop');
    label.textContent = stop.title;

    // Hit target (larger invisible circle for easier clicking)
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hit.setAttribute('cx', x);
    hit.setAttribute('cy', y);
    hit.setAttribute('r', 18);
    hit.classList.add('station-hit');
    hit.setAttribute('aria-label', `Jump to: ${stop.title}`);
    hit.setAttribute('role', 'button');
    hit.setAttribute('tabindex', '0');
    hit.addEventListener('click', () => jumpToStop(i));
    hit.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jumpToStop(i); }
    });

    g.appendChild(circle);
    g.appendChild(label);
    g.appendChild(hit);
    stationsGrp.appendChild(g);
  });

  refreshStationStyles();
}

// ── Update station styles to reflect visited/current ─────
function refreshStationStyles() {
  stationsGrp.querySelectorAll('[data-stop-index]').forEach(g => {
    const i      = parseInt(g.dataset.stopIndex);
    const circle = g.querySelector('.station-circle');
    const label  = g.querySelector('.station-label');
    circle.classList.remove('visited', 'current');
    label.classList.remove('current');
    if (i < curIndex)  circle.classList.add('visited');
    if (i === curIndex) { circle.classList.add('current'); label.classList.add('current'); }
  });
}

// ── Update lit path to show progress up to stop i ────────
function updateProgress(index, animate) {
  if (!pathTotalLen) return;
  const litLen = stopPositions[index]?.len ?? 0;
  if (!animate) {
    pathLit.style.transition = 'none';
    pathLit.style.strokeDashoffset = pathTotalLen - litLen;
    // Re-enable transition after paint
    requestAnimationFrame(() => {
      pathLit.style.transition = '';
    });
  } else {
    pathLit.style.strokeDashoffset = pathTotalLen - litLen;
  }
  refreshStationStyles();
}

// ── Render stop panel for stop at index ──────────────────
function renderPanel(index) {
  const stop = STOPS[index];
  const isIntroOutro = !!stop.type;

  panelIntro.classList.toggle('hidden', !isIntroOutro);
  panelRegular.classList.toggle('hidden', isIntroOutro);

  if (isIntroOutro) {
    // Cold open: show full wordmark; closer: just title text
    if (stop.type === 'intro') {
      introTitle.innerHTML = `<span class="wordmark" style="font-size:clamp(1.6rem,3vw,2.2rem)">Mind the <span class="gap">Gap</span></span>`;
    } else {
      introTitle.textContent = stop.title;
    }
    introBody.textContent = stop.body || '';
  } else {
    const color = themeHex(stop);
    regTag.textContent  = stop.theme ? stop.theme.replace('_', ' ') : '';
    regTag.style.background = color;
    regTag.style.display = stop.theme ? '' : 'none';

    const regCount = STOPS.filter(s => !s.type);
    const myReg    = STOPS.slice(0, index).filter(s => !s.type).length + 1;
    regNumber.textContent = `${myReg} / ${regCount.length}`;

    regTitle.textContent    = stop.title;
    pContext.textContent    = stop.context   || '';
    pObj.textContent        = stop.objective || '';
    pHow.textContent        = stop.how       || '';
    pRlabel.textContent     = stop.resultLabel || 'Result';
    pResult.textContent     = stop.result    || '';
  }

  btnPrev.disabled = index === 0;
  btnNext.disabled = index === STOPS.length - 1;
}

// ── Pan map to show current stop (smooth) ────────────────
function panToStop(index) {
  if (!stopPositions[index]) return;
  const { x, y } = stopPositions[index];
  const W = transitSvg.clientWidth;
  const H = transitSvg.clientHeight;
  // Pan so stop is at 65% from left (leaving room for panel) and centered vertically
  const targetX = W * 0.65;
  const targetY = H * 0.5;
  viewTx.x += targetX - (x * viewTx.scale + viewTx.x);
  viewTx.y += targetY - (y * viewTx.scale + viewTx.y);
  applyViewTransform(true);
}

// ── Pan/zoom ──────────────────────────────────────────────
let viewTx = { x: 0, y: 0, scale: 1 };
let isPanning = false;
let panStart  = null;

function applyViewTransform(animated) {
  if (animated) {
    panGroup.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { panGroup.style.transition = ''; }, 520);
  }
  panGroup.setAttribute('transform',
    `translate(${viewTx.x} ${viewTx.y}) scale(${viewTx.scale})`
  );
}

function resetViewTransform(animated) {
  viewTx = { x: 0, y: 0, scale: 1 };
  applyViewTransform(animated);
}

transitSvg.addEventListener('mousedown', e => {
  if (appState !== STATE.MAP) return;
  if (e.target.closest('.station-hit')) return;
  isPanning = true;
  panStart  = { mx: e.clientX, my: e.clientY, tx: viewTx.x, ty: viewTx.y };
  transitSvg.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', e => {
  if (!isPanning) return;
  viewTx.x = panStart.tx + (e.clientX - panStart.mx);
  viewTx.y = panStart.ty + (e.clientY - panStart.my);
  applyViewTransform(false);
});
window.addEventListener('mouseup', () => {
  isPanning = false;
  transitSvg.style.cursor = '';
});

transitSvg.addEventListener('wheel', e => {
  if (appState !== STATE.MAP) return;
  e.preventDefault();
  const factor    = e.deltaY < 0 ? 1.12 : 0.89;
  const newScale  = Math.max(0.35, Math.min(5, viewTx.scale * factor));
  const scaleRatio = newScale / viewTx.scale;
  // Zoom toward cursor
  const rect = transitSvg.getBoundingClientRect();
  const cx   = e.clientX - rect.left;
  const cy   = e.clientY - rect.top;
  viewTx.x   = cx - scaleRatio * (cx - viewTx.x);
  viewTx.y   = cy - scaleRatio * (cy - viewTx.y);
  viewTx.scale = newScale;
  applyViewTransform(false);
}, { passive: false });

// Touch pan (map state)
let touchStart = null;
transitSvg.addEventListener('touchstart', e => {
  if (appState !== STATE.MAP || e.touches.length !== 1) return;
  touchStart = { mx: e.touches[0].clientX, my: e.touches[0].clientY, tx: viewTx.x, ty: viewTx.y };
}, { passive: true });
transitSvg.addEventListener('touchmove', e => {
  if (!touchStart || e.touches.length !== 1) return;
  e.preventDefault();
  viewTx.x = touchStart.tx + (e.touches[0].clientX - touchStart.mx);
  viewTx.y = touchStart.ty + (e.touches[0].clientY - touchStart.my);
  applyViewTransform(false);
}, { passive: false });
transitSvg.addEventListener('touchend', () => { touchStart = null; });

// ── State transitions ─────────────────────────────────────
function setState(s) {
  appState = s;
  document.body.dataset.state = s;
}

function goToMap() {
  resetViewTransform(true);
  setState(STATE.MAP);
}

function goToTitle() {
  setState(STATE.TITLE);
}

function goToStop(index, animated) {
  curIndex = Math.max(0, Math.min(STOPS.length - 1, index));
  hasStarted = true;
  document.body.dataset.started = 'true';
  setState(STATE.STOP);
  renderPanel(curIndex);
  updateProgress(curIndex, animated !== false);
  panToStop(curIndex);
}

function jumpToStop(index) {
  goToStop(index, true);
}

function advance() {
  if (appState === STATE.MAP && !hasStarted) { goToTitle(); return; }
  if (appState === STATE.TITLE) { goToStop(0, true); return; }
  if (appState === STATE.STOP && curIndex < STOPS.length - 1) {
    goToStop(curIndex + 1, true);
  }
}

function retreat() {
  if (appState === STATE.STOP && curIndex > 0) {
    goToStop(curIndex - 1, true);
  } else if (appState === STATE.TITLE) {
    setState(STATE.MAP);
  }
}

// ── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case ' ':
      e.preventDefault();
      advance();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      retreat();
      break;
    case 'Escape':
    case 'm':
    case 'M':
      if (appState === STATE.STOP || appState === STATE.TITLE) goToMap();
      break;
    case 'f':
    case 'F':
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      break;
  }
});

// ── Clicking the title screen advances ───────────────────
titleScreen.addEventListener('click', () => advance());

// ── Button handlers ───────────────────────────────────────
btnBegin.addEventListener('click',    () => advance());
btnReturn.addEventListener('click',   () => goToStop(curIndex, false));
btnOverview.addEventListener('click', () => goToMap());
btnPrev.addEventListener('click',     () => retreat());
btnNext.addEventListener('click',     () => advance());

// ── Resize ────────────────────────────────────────────────
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { initMap(); }, 120);
});

// ── Init ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  setState(STATE.MAP);
});

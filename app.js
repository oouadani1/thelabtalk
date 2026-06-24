/* ============================================================
   APP.JS — Mind the Gap
   States: title → stop → map (overview) / finale
   ============================================================ */

// ── State ────────────────────────────────────────────────
const STATE = { TITLE: 'title', STOP: 'stop', MAP: 'map', FINALE: 'finale' };
let appState = STATE.TITLE;
let curIndex = 0;

function setState(s) { appState = s; document.body.dataset.state = s; }

// ── Zoom levels ───────────────────────────────────────────
// STOP_ZOOM: how close you are when presenting a stop
// MAP_ZOOM: full overview (shows entire line)
const STOP_ZOOM = 2.8;
const MAP_ZOOM  = 1.0;

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
const ghostGrp      = document.getElementById('ghost-lines-group');
const stationsGrp   = document.getElementById('stations-group');

const titleScreen   = document.getElementById('title-screen');
const finaleScreen  = document.getElementById('finale-screen');
const finaleBodyEl  = document.getElementById('finale-body-text');
// ack board element resolved inside populateAck()

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
const pGap          = document.getElementById('p-gap');
const pAction       = document.getElementById('p-action');
const pLearning     = document.getElementById('p-learning');
const pLink         = document.getElementById('p-link');

const btnPrev       = document.getElementById('btn-prev');
const btnMap        = document.getElementById('btn-map');
const btnNext       = document.getElementById('btn-next');
const btnReturn     = document.getElementById('btn-return');

// ── Line waypoints (% of viewport) ───────────────────────
const LINE_WP = [
  [6,  48], [22, 48], [22, 22], [42, 22],
  [42, 60], [58, 60], [58, 30], [78, 30],
  [78, 68], [93, 68],
];

let stopPos  = [];
let pathLen  = 0;

// ── Rounded SVG path ─────────────────────────────────────
function buildRoundedPath(pts, r) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0,y0]=pts[i-1], [x1,y1]=pts[i], [x2,y2]=pts[i+1];
    const d1=Math.hypot(x1-x0,y1-y0), d2=Math.hypot(x2-x1,y2-y1);
    const cr=Math.min(r,d1/2,d2/2);
    const bx=x1-((x1-x0)/d1)*cr, by=y1-((y1-y0)/d1)*cr;
    const ax=x1+((x2-x1)/d2)*cr, ay=y1+((y2-y1)/d2)*cr;
    d += ` L ${bx} ${by} Q ${x1} ${y1} ${ax} ${ay}`;
  }
  d += ` L ${pts.at(-1)[0]} ${pts.at(-1)[1]}`;
  return d;
}

// ── Path tangent / perpendicular at a given length ───────
function pathPerpendicular(len) {
  const eps = 3;
  const p1 = pathDim.getPointAtLength(Math.max(0, len - eps));
  const p2 = pathDim.getPointAtLength(Math.min(pathLen, len + eps));
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const d  = Math.hypot(dx, dy);
  if (d === 0) return { px: 0, py: 1 };
  // Perpendicular: rotate tangent 90°
  return { px: -dy/d, py: dx/d };
}

// ── SVG text wrapping ─────────────────────────────────────
function wrapSvgText(el, str, maxW, lineH) {
  while (el.firstChild) el.removeChild(el.firstChild);
  const x = parseFloat(el.getAttribute('x') || 0);
  const ns = 'http://www.w3.org/2000/svg';
  const probe = document.createElementNS(ns, 'tspan');
  probe.setAttribute('visibility', 'hidden');
  el.appendChild(probe);
  const words = str.split(/\s+/);
  const lines = [];
  let cur = '';
  words.forEach(w => {
    const test = cur ? `${cur} ${w}` : w;
    probe.textContent = test;
    if (probe.getComputedTextLength() > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  });
  if (cur) lines.push(cur);
  el.removeChild(probe);
  lines.forEach((line, li) => {
    const ts = document.createElementNS(ns, 'tspan');
    ts.textContent = line;
    ts.setAttribute('x', x);
    ts.setAttribute('dy', li === 0 ? 0 : lineH);
    el.appendChild(ts);
  });
}

// ── Build fading branch lines at path start/end ──────────
function buildBranchLines(W, H) {
  document.querySelectorAll('.branch-line,.branch-grad').forEach(el => el.remove());
  const ns  = 'http://www.w3.org/2000/svg';
  const col = '#14558F';

  function addGrad(id, x1,y1,x2,y2,op1,op2) {
    const g = document.createElementNS(ns,'linearGradient');
    g.id=id; g.classList.add('branch-grad');
    g.setAttribute('gradientUnits','userSpaceOnUse');
    ['x1','y1','x2','y2'].forEach((a,i)=>g.setAttribute(a,[x1,y1,x2,y2][i]));
    [[op1,'0%'],[op2,'100%']].forEach(([op,off])=>{
      const s=document.createElementNS(ns,'stop');
      s.setAttribute('offset',off); s.setAttribute('stop-color',col);
      s.setAttribute('stop-opacity',op); g.appendChild(s);
    });
    svgDefs.appendChild(g);
  }
  function addLine(id,x1,y1,x2,y2) {
    const l=document.createElementNS(ns,'line');
    l.classList.add('branch-line');
    ['x1','y1','x2','y2'].forEach((a,i)=>l.setAttribute(a,[x1,y1,x2,y2][i]));
    l.setAttribute('stroke',`url(#${id})`);
    panGroup.insertBefore(l,panGroup.firstChild);
  }

  const [sx,sy]=[LINE_WP[0][0]/100*W, LINE_WP[0][1]/100*H];
  const [ex,ey]=[LINE_WP.at(-1)[0]/100*W, LINE_WP.at(-1)[1]/100*H];
  const bl = W * 0.10;

  addGrad('bg-s1',sx,sy,sx-bl,sy-bl*0.35,0.55,0); addLine('bg-s1',sx,sy,sx-bl,sy-bl*0.35);
  addGrad('bg-s2',sx,sy,sx-bl*0.85,sy,  0.40,0); addLine('bg-s2',sx,sy,sx-bl*0.85,sy);
  addGrad('bg-s3',sx,sy,sx-bl,sy+bl*0.28,0.28,0); addLine('bg-s3',sx,sy,sx-bl,sy+bl*0.28);

  addGrad('bg-e1',ex,ey,ex+bl,ey-bl*0.38,0.55,0); addLine('bg-e1',ex,ey,ex+bl,ey-bl*0.38);
  addGrad('bg-e2',ex,ey,ex+bl*0.85,ey,  0.40,0); addLine('bg-e2',ex,ey,ex+bl*0.85,ey);
  addGrad('bg-e3',ex,ey,ex+bl,ey+bl*0.30,0.28,0); addLine('bg-e3',ex,ey,ex+bl,ey+bl*0.30);
}

// ── Build ghost lines (one per stop with a theme) ─────────
function buildGhostLines() {
  ghostGrp.innerHTML = '';
  const ns      = 'http://www.w3.org/2000/svg';
  const halfLen = 55; // half-length of ghost crossing line, in SVG units

  STOPS.forEach((stop, i) => {
    if (!stop.theme) return;
    const { x, y, len } = stopPos[i];
    const { px, py }    = pathPerpendicular(len);
    const color          = themeHex(stop);

    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x - px * halfLen);
    line.setAttribute('y1', y - py * halfLen);
    line.setAttribute('x2', x + px * halfLen);
    line.setAttribute('y2', y + py * halfLen);
    line.setAttribute('stroke', color);
    line.classList.add('ghost-line');
    line.dataset.stopIndex = i;
    ghostGrp.appendChild(line);
  });
}

// ── Highlight ghost line for current stop ────────────────
function updateGhostLines(idx) {
  ghostGrp.querySelectorAll('.ghost-line').forEach(el => {
    el.classList.remove('active');
  });
  const active = ghostGrp.querySelector(`[data-stop-index="${idx}"]`);
  if (active) active.classList.add('active');
}

// ── Station halo on landing ───────────────────────────────
function triggerHalo(idx) {
  const g = stationsGrp.querySelector(`[data-stop-index="${idx}"]`);
  if (!g) return;
  const c = g.querySelector('.station-circle');
  c.classList.remove('halo-pulse');
  void c.offsetWidth;
  c.classList.add('halo-pulse');
  c.addEventListener('animationend', () => c.classList.remove('halo-pulse'), { once: true });
}

// ── Build stations ────────────────────────────────────────
function buildStations(W) {
  stationsGrp.innerHTML = '';
  const ns       = 'http://www.w3.org/2000/svg';
  const labelMaxW = Math.min(120, W * 0.11);

  STOPS.forEach((stop, i) => {
    const { x, y } = stopPos[i];
    const isDeco   = !!stop.type;
    const r        = isDeco ? 6 : 8;
    const g        = document.createElementNS(ns, 'g');
    g.classList.add('station-g'); g.dataset.stopIndex = i;

    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
    c.classList.add('station-circle');
    if (isDeco) c.setAttribute('stroke-dasharray', '4 3');

    // Place label perpendicular to track direction; alternate sides by index
    const { px: perpX, py: perpY } = pathPerpendicular(stopPos[i].len);
    const side    = i % 2 === 0 ? 1 : -1;
    const offX    = perpX * side;
    const offY    = perpY * side;
    const isHoriz = Math.abs(offX) > Math.abs(offY);
    let lx, ly, anchor;
    if (isHoriz) {
      anchor = offX > 0 ? 'start' : 'end';
      lx = x + offX * (r + 14);
      ly = y + 4;
    } else if (offY < 0) {
      anchor = 'middle'; lx = x; ly = y - r - 7;
    } else {
      anchor = 'middle'; lx = x; ly = y + r + 16;
    }
    const lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('x', lx);
    lbl.setAttribute('y', ly);
    lbl.setAttribute('text-anchor', anchor);
    lbl.classList.add('station-label');
    wrapSvgText(lbl, stop.title, labelMaxW, 14);

    const hit = document.createElementNS(ns, 'circle');
    hit.setAttribute('cx', x); hit.setAttribute('cy', y); hit.setAttribute('r', 22);
    hit.classList.add('station-hit');
    hit.setAttribute('role', 'button'); hit.setAttribute('tabindex', '0');
    hit.setAttribute('aria-label', stop.title);
    hit.addEventListener('click',   () => jumpToStop(i));
    hit.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); jumpToStop(i); } });

    g.appendChild(c); g.appendChild(lbl); g.appendChild(hit);
    stationsGrp.appendChild(g);
  });
}

// ── Station fog (dim stops ahead) ────────────────────────
function applyFog(idx) {
  stationsGrp.querySelectorAll('.station-g').forEach(g => {
    const i    = parseInt(g.dataset.stopIndex);
    const dist = i - idx;
    let op;
    if (dist <= 0)       op = 1.0;
    else if (dist === 1) op = 0.45;
    else if (dist === 2) op = 0.20;
    else                 op = 0.03;
    g.style.opacity = op;
    const c   = g.querySelector('.station-circle');
    const lbl = g.querySelector('.station-label');
    c.classList.remove('visited', 'current');
    c.style.fill   = '';
    c.style.stroke = '';
    lbl.classList.remove('current');
    if (i < idx) c.classList.add('visited');
    if (i === idx) {
      c.classList.add('current');
      lbl.classList.add('current');
      // If this stop has a theme, color the node with that theme
      const stop = STOPS[i];
      if (stop && stop.theme) {
        const color = themeHex(stop);
        c.style.fill   = color;
        c.style.stroke = color;
      }
    }
  });
}

// ── Lit track progress ────────────────────────────────────
function updateLit(idx, animate) {
  if (!pathLen) return;
  const lit = stopPos[idx]?.len ?? 0;
  if (!animate) {
    pathLit.style.transition = 'none';
    pathLit.style.strokeDashoffset = pathLen - lit;
    requestAnimationFrame(() => { pathLit.style.transition = ''; });
  } else {
    pathLit.style.strokeDashoffset = pathLen - lit;
  }
}

// ── Pan/zoom transform ────────────────────────────────────
let viewTx = { x: 0, y: 0, scale: MAP_ZOOM };

function applyViewTransform(animated) {
  if (animated) {
    panGroup.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { panGroup.style.transition = ''; }, 580);
  }
  panGroup.setAttribute('transform',
    `translate(${viewTx.x} ${viewTx.y}) scale(${viewTx.scale})`);
}

function zoomToStop(idx) {
  if (!stopPos[idx]) return;
  const { x, y } = stopPos[idx];
  const W = transitSvg.clientWidth;
  const H = transitSvg.clientHeight;
  // Center the stop in the right portion of the screen (panel is on left)
  const panelFrac = 0.36;    // rough fraction that the panel + margin occupies
  const targetX   = W * panelFrac + (W * (1 - panelFrac)) * 0.45;
  const targetY   = H * 0.5;
  viewTx.scale = STOP_ZOOM;
  viewTx.x     = targetX - x * STOP_ZOOM;
  viewTx.y     = targetY - y * STOP_ZOOM;
  applyViewTransform(true);
}

function zoomToMap() {
  viewTx = { x: 0, y: 0, scale: MAP_ZOOM };
  applyViewTransform(true);
}

// ── Pan/zoom interaction (map state only) ─────────────────
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
  const f  = e.deltaY < 0 ? 1.12 : 0.89;
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
let tpStart = null;
transitSvg.addEventListener('touchstart', e => {
  if (appState !== STATE.MAP || e.touches.length !== 1) return;
  tpStart = { mx: e.touches[0].clientX, my: e.touches[0].clientY, tx: viewTx.x, ty: viewTx.y };
}, { passive: true });
transitSvg.addEventListener('touchmove', e => {
  if (!tpStart || e.touches.length !== 1) return;
  e.preventDefault();
  viewTx.x = tpStart.tx + (e.touches[0].clientX - tpStart.mx);
  viewTx.y = tpStart.ty + (e.touches[0].clientY - tpStart.my);
  applyViewTransform(false);
}, { passive: false });
transitSvg.addEventListener('touchend', () => { tpStart = null; });

// ── Render the stop panel content ────────────────────────
function renderPanel(idx) {
  const stop    = STOPS[idx];
  const isIntro = !!stop.type && stop.type !== 'finale';

  panelIntro.classList.toggle('hidden', !isIntro);
  panelRegular.classList.toggle('hidden', isIntro);

  if (isIntro) {
    if (stop.type === 'intro' && idx === 0) {
      introTitleEl.innerHTML = `<span class="wordmark" style="font-size:clamp(1.5rem,2.6vw,2.1rem)">Mind the <span class="gap">Gap</span></span>`;
    } else {
      introTitleEl.textContent = stop.title;
    }
    introBodyEl.textContent = stop.body || '';
    if (stop.image) {
      introImg.src = stop.image; introImg.alt = stop.title;
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
    regNumber.textContent = `${myN} / ${regulars.length}`;
    regTitle.textContent  = stop.title;
    pGap.textContent      = stop.gap      || '';
    pAction.textContent   = stop.action   || '';
    pLearning.textContent = stop.learning || '';
    if (stop.link) {
      pLink.href = stop.link;
      pLink.textContent = 'View →';
      pLink.classList.remove('hidden');
    } else {
      pLink.classList.add('hidden');
    }

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

// ── Solari flip-board acknowledgments ────────────────────
const ACK_COLS       = 2;
const ACK_ROWS       = 5;
const ACK_GRID_SIZE  = ACK_COLS * ACK_ROWS;  // 10 cells visible at once
const FLIP_CHARS     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ·–·0123456789';
const FLIP_STEPS     = 14;   // scramble frames per cell
const FLIP_FRAME_MS  = 38;   // ms per scramble frame
const FLIP_STAGGER   = 75;   // ms between each cell starting

let ackBatchIdx    = 0;
let ackCycleTimer  = null;

function flipTo(el, target, delay) {
  setTimeout(() => {
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const locked = Math.floor((step / FLIP_STEPS) * target.length);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (i < locked || target[i] === ' ') {
          out += target[i];
        } else {
          out += FLIP_CHARS[Math.floor(Math.random() * FLIP_CHARS.length)];
        }
      }
      el.textContent = out;
      if (step >= FLIP_STEPS) { el.textContent = target; clearInterval(iv); }
    }, FLIP_FRAME_MS);
  }, delay);
}

function showAckBatch(items, cells) {
  const start = ackBatchIdx * ACK_GRID_SIZE;
  cells.forEach((cell, ci) => {
    const item    = items[(start + ci) % items.length];
    const nameEl  = cell.querySelector('.ack-name');
    const orgEl   = cell.querySelector('.ack-org');
    const stagger = ci * FLIP_STAGGER;
    flipTo(nameEl, item.name, stagger);
    flipTo(orgEl,  item.org,  stagger + FLIP_FRAME_MS * 4);
  });
  ackBatchIdx = (ackBatchIdx + 1) % Math.ceil(items.length / ACK_GRID_SIZE);
}

function populateAck() {
  const items = typeof ACKNOWLEDGMENTS !== 'undefined' ? ACKNOWLEDGMENTS : [];
  const board = document.getElementById('ack-grid-board');
  if (!items.length || !board) return;

  // Build fixed grid of empty cells once
  board.innerHTML = '';
  for (let i = 0; i < ACK_GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'ack-cell';
    cell.innerHTML = '<span class="ack-name">&nbsp;</span><span class="ack-org">&nbsp;</span>';
    board.appendChild(cell);
  }
  const cells = [...board.querySelectorAll('.ack-cell')];

  showAckBatch(items, cells);
  if (ackCycleTimer) clearInterval(ackCycleTimer);
  // Each batch: stagger across 10 cells + scramble duration, then hold briefly
  const batchDuration = ACK_GRID_SIZE * FLIP_STAGGER + FLIP_STEPS * FLIP_FRAME_MS + 2400;
  ackCycleTimer = setInterval(() => showAckBatch(items, cells), batchDuration);
}

// ── State transitions ─────────────────────────────────────
function goTitle() {
  setState(STATE.TITLE);
}

function goMap() {
  zoomToMap();
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
  updateGhostLines(curIndex);
  if (animate !== false) triggerHalo(curIndex);
  zoomToStop(curIndex);
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
    if (curIndex > 0) goStop(curIndex - 1, true);
    else              goTitle();
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
    case 't': case 'T': goTitle(); break;
    case 'f': case 'F':
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen().catch(()=>{});
      break;
  }
});

titleScreen.addEventListener('click',  () => advance());
finaleScreen.addEventListener('click', () => retreat());

btnPrev.addEventListener('click',   () => retreat());
btnNext.addEventListener('click',   () => advance());
btnMap.addEventListener('click',    () => goMap());
btnReturn.addEventListener('click', () => goStop(curIndex, false));

// ── Init ─────────────────────────────────────────────────
function initMap() {
  const W = transitSvg.clientWidth;
  const H = transitSvg.clientHeight;
  if (!W || !H) return;

  const pts = LINE_WP.map(([xp,yp]) => [xp/100*W, yp/100*H]);
  const d   = buildRoundedPath(pts, 38);
  pathDim.setAttribute('d', d);
  pathLit.setAttribute('d', d);
  pathLen = pathDim.getTotalLength();

  const N = STOPS.length;
  stopPos = STOPS.map((_, i) => {
    const frac = N > 1 ? i/(N-1) : 0;
    const len  = frac * pathLen;
    const pt   = pathDim.getPointAtLength(len);
    return { x: pt.x, y: pt.y, len };
  });

  pathLit.style.strokeDasharray  = pathLen;
  pathLit.style.strokeDashoffset = pathLen;

  buildBranchLines(W, H);
  buildStations(W);
  buildGhostLines();
  applyFog(curIndex);
  updateLit(curIndex, false);
}

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { viewTx={x:0,y:0,scale:MAP_ZOOM}; initMap(); }, 120);
});

window.addEventListener('DOMContentLoaded', () => {
  initMap();
  populateAck();
  setState(STATE.TITLE);
});

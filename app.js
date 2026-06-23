/* ============================================================
   APP.JS — Mind the Gap
   No framework. No build step. Reads content.js globals.
   ============================================================ */

// ── State ────────────────────────────────────────────────
let currentIndex = 0;
let showingMap   = false;
let showingNotes = false;

// Theme → CSS variable name lookup
const THEME_VARS = {
  'bay-blue':               '#14558F',
  'berkshires-green':       '#388557',
  'duckling-yellow':        '#F6C51B',
  'independence-cranberry': '#680A1D',
  'granite-gray':           '#535353',
  'danger-red':             '#CD0D0D',
};

function themeColor(stop) {
  if (!stop.theme) return '#535353';
  const varName = THEMES[stop.theme];
  return THEME_VARS[varName] || '#535353';
}

// ── Element refs ─────────────────────────────────────────
const stopView    = document.getElementById('stop-view');
const mapView     = document.getElementById('map-view');
const stopCard    = document.getElementById('stop-card');

const introLayout = document.getElementById('intro-layout');
const gridLayout  = document.getElementById('grid-layout');

const introBadge  = document.getElementById('intro-line-badge');
const introTitle  = document.getElementById('intro-title');
const introBody   = document.getElementById('intro-body');
const introImgWrap= document.getElementById('intro-image');

const themeBadge  = document.getElementById('stop-theme-badge');
const stopNumber  = document.getElementById('stop-number');
const stopTitle   = document.getElementById('stop-title');
const stopImgWrap = document.getElementById('stop-image-wrap');
const stopImg     = document.getElementById('stop-image');
const ptContext   = document.getElementById('pt-context');
const ptObjective = document.getElementById('pt-objective');
const ptHow       = document.getElementById('pt-how');
const ptResultLbl = document.getElementById('pt-result-label');
const ptResult    = document.getElementById('pt-result');
const peakBadge   = document.getElementById('peak-badge');

const notesPanel  = document.getElementById('presenter-notes');
const notesText   = document.getElementById('notes-text');

const btnBack     = document.getElementById('btn-back');
const btnForward  = document.getElementById('btn-forward');
const dotsContainer = document.getElementById('stop-dots');

const youAreHere  = document.getElementById('you-are-here');
const trackLit    = document.getElementById('track-lit');
const trackStations = document.getElementById('track-stations');
const mapCanvas   = document.getElementById('map-canvas');

// ── Render stop view ─────────────────────────────────────
function renderStop(index) {
  const stop = STOPS[index];
  const isIntro = stop.type === 'intro' || stop.type === 'outro';

  // Toggle layouts
  introLayout.classList.toggle('hidden', !isIntro);
  gridLayout.classList.toggle('hidden',  isIntro);

  if (isIntro) {
    // Wordmark on cold-open / closer
    const isFirst = index === 0;
    introBadge.textContent = isFirst ? META.line : 'End of the line';
    // Render title with "Gap" underlined on cold open
    if (isFirst) {
      introTitle.innerHTML = '<span class="wordmark">Mind the <span class="gap">Gap</span></span>';
    } else {
      introTitle.innerHTML = '';
      introTitle.textContent = stop.title;
      introTitle.className = 'stop-title';
    }
    introBody.textContent = stop.body;
    if (stop.image) {
      introImgWrap.innerHTML = `<img src="${stop.image}" alt="${stop.title}" />`;
      introImgWrap.classList.remove('hidden');
    } else {
      introImgWrap.classList.add('hidden');
    }
  } else {
    // Theme badge
    const color = themeColor(stop);
    themeBadge.textContent = stop.theme ? stop.theme.replace('_', ' ') : '';
    themeBadge.style.setProperty('--theme-color', color);
    themeBadge.style.background = color;

    // Stop number (count only non-intro/outro stops before this one)
    const regularsBefore = STOPS.slice(0, index).filter(s => !s.type).length;
    stopNumber.textContent = `Stop ${regularsBefore + 1} of ${STOPS.filter(s => !s.type).length}`;

    stopTitle.textContent = stop.title;

    ptContext.textContent   = stop.context   || '';
    ptObjective.textContent = stop.objective || '';
    ptHow.textContent       = stop.how       || '';
    ptResultLbl.textContent = stop.resultLabel || 'Result';
    ptResult.textContent    = stop.result    || '';

    peakBadge.classList.toggle('hidden', !stop.peak);

    if (stop.image) {
      stopImg.src = stop.image;
      stopImg.alt = stop.title;
      stopImgWrap.classList.remove('hidden');
    } else {
      stopImgWrap.classList.add('hidden');
    }
  }

  // Presenter notes
  notesText.textContent = stop.notes || '(no notes for this stop)';

  // Nav buttons
  btnBack.disabled    = index === 0;
  btnForward.disabled = index === STOPS.length - 1;

  // Progress dots
  renderDots(index);

  // Track animation
  updateTrack(index);
}

// ── Progress dots ─────────────────────────────────────────
function renderDots(activeIndex) {
  dotsContainer.innerHTML = '';
  STOPS.forEach((stop, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (stop.type ? ` ${stop.type}` : '') + (i === activeIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to stop: ${stop.title}`);
    dot.setAttribute('aria-current', i === activeIndex ? 'step' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
}

// ── Track animation ───────────────────────────────────────
function updateTrack(index) {
  const total = STOPS.length;
  const pct   = total > 1 ? (index / (total - 1)) * 100 : 0;

  // Lit segment from left to current position
  trackLit.setAttribute('x2', pct + '%');

  // Move marker
  youAreHere.style.left = pct + '%';

  // Update station circles on track
  trackStations.querySelectorAll('circle').forEach((c, i) => {
    c.classList.toggle('active', i <= index);
  });
}

// ── Map view ──────────────────────────────────────────────
function buildMap() {
  const stops    = STOPS;
  const total    = stops.length;
  const padding  = 60;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('aria-label', 'Transit map showing all fellowship stops');

  const rect = mapCanvas.getBoundingClientRect();
  const W = rect.width  || 800;
  const H = rect.height || 500;

  const usableW = W - padding * 2;
  const usableH = H - padding * 2;

  // Layout stops along a gentle S-curve / zigzag path
  // Split into rows of ~6 stops each, alternating direction
  const COLS    = Math.ceil(Math.sqrt(total * 1.6));
  const rows    = [];
  let row = [];
  stops.forEach((s, i) => {
    row.push(s);
    if (row.length === COLS || i === stops.length - 1) {
      rows.push([...row]);
      row = [];
    }
  });

  // Compute (x,y) for each stop
  const positions = [];
  rows.forEach((rowStops, ri) => {
    const isReversed = ri % 2 === 1;
    const ordered    = isReversed ? [...rowStops].reverse() : rowStops;
    const yFrac      = rows.length > 1 ? ri / (rows.length - 1) : 0.5;
    const y          = padding + yFrac * usableH;
    ordered.forEach((stop, ci) => {
      const xFrac = rowStops.length > 1 ? ci / (rowStops.length - 1) : 0.5;
      const x     = padding + xFrac * usableW;
      positions.push({ stop, x, y });
    });
  });

  // Sort positions back to STOPS order
  const pos = stops.map(s => positions.find(p => p.stop.id === s.id));

  // Draw Fellowship Line path
  const pathPoints = pos.map(p => `${p.x},${p.y}`).join(' L ');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${pathPoints}`);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#388557');
  path.setAttribute('stroke-width', '5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  // Draw station circles and labels
  pos.forEach((p, i) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `Jump to ${p.stop.title}`);
    g.style.cursor = 'pointer';

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', p.stop.peak ? 10 : 7);
    circle.className.baseVal = 'map-station-circle' +
      (i < currentIndex ? ' visited' : '') +
      (i === currentIndex ? ' current' : '');

    // Peak gets a red ring
    if (p.stop.peak) {
      circle.setAttribute('stroke', '#CD0D0D');
    }

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', p.x);
    label.setAttribute('y', p.y - 14);
    label.setAttribute('text-anchor', 'middle');
    label.className.baseVal = 'map-station-label';
    label.textContent = p.stop.title;

    g.appendChild(circle);
    g.appendChild(label);

    const handler = () => jumpTo(i);
    g.addEventListener('click', handler);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });

    svg.appendChild(g);
  });

  mapCanvas.innerHTML = '';
  mapCanvas.appendChild(svg);
}

// ── Navigation ────────────────────────────────────────────
function goTo(index, direction) {
  if (index < 0 || index >= STOPS.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReduced && direction !== undefined) {
    // Tunnel animation: brief flash of lit track
    const fromPct = STOPS.length > 1 ? (currentIndex / (STOPS.length - 1)) * 100 : 0;
    const toPct   = STOPS.length > 1 ? (index       / (STOPS.length - 1)) * 100 : 0;
    // Brief overshoot on lit segment to simulate "lighting up"
    trackLit.style.transition = 'x2 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  currentIndex = index;
  renderStop(currentIndex);
}

function advance() {
  if (currentIndex < STOPS.length - 1) goTo(currentIndex + 1, 1);
}
function retreat() {
  if (currentIndex > 0) goTo(currentIndex - 1, -1);
}
function jumpTo(index) {
  showStop();
  goTo(index);
}

// ── View toggling ─────────────────────────────────────────
function showStop() {
  showingMap = false;
  mapView.classList.add('hidden');
  stopView.classList.remove('hidden');
}
function showMap() {
  showingMap = true;
  stopView.classList.add('hidden');
  mapView.classList.remove('hidden');
  buildMap();
}
function toggleMap() {
  showingMap ? showStop() : showMap();
}
function toggleNotes() {
  showingNotes = !showingNotes;
  notesPanel.classList.toggle('hidden', !showingNotes);
}
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  // Don't fire on form elements
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case ' ':
      e.preventDefault();
      if (!showingMap) advance();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      e.preventDefault();
      if (!showingMap) retreat();
      break;
    case 'Escape':
    case 'm':
    case 'M':
      toggleMap();
      break;
    case 'n':
    case 'N':
      if (!showingMap) toggleNotes();
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
  }
});

// ── Click anywhere to advance (stop view only) ────────────
stopView.addEventListener('click', e => {
  // Don't intercept nav button or dot clicks
  if (e.target.closest('#stop-nav')) return;
  advance();
});

btnBack.addEventListener('click', e => {
  e.stopPropagation();
  retreat();
});
btnForward.addEventListener('click', e => {
  e.stopPropagation();
  advance();
});

// ── Build station markers on track SVG ───────────────────
function buildTrackStations() {
  trackStations.innerHTML = '';
  const total = STOPS.length;
  STOPS.forEach((stop, i) => {
    const pct = total > 1 ? (i / (total - 1)) * 100 : 50;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', pct + '%');
    circle.setAttribute('cy', '50%');
    circle.setAttribute('r', stop.type ? '6' : '5');
    circle.setAttribute('stroke-width', '2.5');
    if (stop.peak) circle.setAttribute('stroke', '#CD0D0D');
    trackStations.appendChild(circle);
  });
}

// ── Init ─────────────────────────────────────────────────
function init() {
  buildTrackStations();
  renderStop(0);
  showStop();
}

init();

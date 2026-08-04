// ── Animation Layer (Modern ES6) ──

let _io = null;

const initReveal = () => {
  if (window.innerWidth <= 768) return;
  const selectors = '.kpi, .panel, .filter-bar, .reg-pagination, .request-card, .kv-row, .tool-mobile-card';
  const items = document.querySelectorAll(selectors);

  if (!_io) {
    _io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          _io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
  }

  items.forEach((el) => {
    // Check dataset flag instead of WeakSet
    if (el.dataset.ioObserved) return;
    el.dataset.ioObserved = '1';
    
    if (!el.classList.contains('is-visible')) {
      el.classList.add('anim-reveal');
    }
    _io.observe(el);
  });

  // Stagger KPI grid children
  const grid = document.querySelector('.kpi-grid');
  if (grid && !grid.classList.contains('anim-stagger')) {
    grid.classList.add('anim-stagger');
  }
};

// ── KPI value counter roll-up ──
const initKpiCounters = () => {
  document.querySelectorAll('.kpi-value').forEach((el) => {
    const raw = el.textContent.trim();
    if (el.dataset.animVal === raw) return;
    // Bug 4 fix: extract only the first number sequence so '12 of 50' → 12, not 1250
    const match = raw.match(/[0-9]+/);
    const num = match ? parseInt(match[0], 10) : NaN;
    if (isNaN(num) || num === 0 || num > 99999) {
      el.dataset.animVal = raw;
      return;
    }
    
    el.dataset.animVal = raw;

    let frame = 0;
    const total = 28;
    
    const step = () => {
      frame++;
      const progress = frame / total;
      const ease = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(num * ease);
      
      el.textContent = raw.replace(/[0-9]+/, String(cur));
      
      if (frame < total) {
        requestAnimationFrame(step);
      } else {
        el.textContent = raw;
        el.classList.remove('animating'); // Bug 2 fix: clean up class after animation
      }
    };
    
    el.classList.add('animating');
    setTimeout(() => requestAnimationFrame(step), 120);
  });
};

// ── Haptic helper (works even before app.js loads) ──
const _haptic = (ms = 10) => {
  try {
    if (typeof window.triggerHaptic === 'function') {
      window.triggerHaptic(ms);
    } else if (navigator.vibrate) {
      navigator.vibrate(ms);
    }
  } catch (_) {}
};

// ── Global haptic on every interactive touch ──
let _hapticBound = false;
const initHaptic = () => {
  if (_hapticBound) return;
  _hapticBound = true;

  // Selectors that should produce haptic feedback
  const HAPTIC_SELECTOR = '.btn, .navlink, .nav-tab, button, [role="button"], .tool-mobile-card, select, .filter-chip, .pagination-btn, .kpi, .request-card';

  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest(HAPTIC_SELECTOR);
    if (!el) return;
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    // Very subtle: 10ms for buttons, 6ms for cards/kpis
    const isCard = el.classList.contains('kpi') || el.classList.contains('request-card') || el.classList.contains('tool-mobile-card');
    _haptic(isCard ? 6 : 10);
  }, { passive: true });
};

// ── Ripple on .btn clicks ──
let _rippleBound = false;
const initRipple = () => {
  if (_rippleBound) return;
  _rippleBound = true;
  
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn || btn.disabled) return;
    
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple-wave';
    
    const size = Math.max(rect.width, rect.height) * 1.6;
    r.style.width = `${size}px`;
    r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  }, { passive: true });
};

// ── Nav ink indicator ──
const initNavInk = () => {
  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.inkBound) return;
  
  nav.dataset.inkBound = '1';

  const ink = document.createElement('span');
  ink.className = 'nav-ink';
  nav.appendChild(ink);

  const moveInk = () => {
    const active = nav.querySelector('.navlink.active');
    if (!active) {
      ink.style.width = '0';
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const btnRect = active.getBoundingClientRect();
    ink.style.left = `${btnRect.left - navRect.left + nav.scrollLeft}px`;
    ink.style.width = `${btnRect.width}px`;
  };

  moveInk();
  nav.addEventListener('click', () => setTimeout(moveInk, 35));
  new MutationObserver(moveInk).observe(nav, {
    attributes: true, 
    subtree: true, 
    attributeFilter: ['class']
  });
};

// ── Topbar scroll-shadow ──
let _topbarBound = false;
const initTopbarScroll = () => {
  if (_topbarBound) return;
  _topbarBound = true;
  
  const tb = document.querySelector('.topbar');
  if (!tb) return;
  
  const update = () => tb.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', update, { passive: true });
  update();
};

// ── Stagger register rows on each render ──
const refreshRegisterStagger = () => {
  document.querySelectorAll('table.reg tr').forEach((tr, i) => {
    tr.style.animationDelay = `${Math.min(i * 0.04, 0.28)}s`;
  });
};

// ── Desktop Keyboard Shortcuts Module ──
let _desktopShortcutsBound = false;
const initDesktopShortcuts = () => {
  if (_desktopShortcutsBound) return;
  _desktopShortcutsBound = true;

  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    // Bug 3 fix: guard against null activeElement (can occur in iframes or after DOM mutations)
    const isInput = ['input', 'textarea', 'select'].includes(activeTag) || !!(document.activeElement && document.activeElement.isContentEditable);

    if (e.key === 'Escape') {
      const searchInput = document.getElementById('regSearch');
      if (searchInput && document.activeElement === searchInput) searchInput.blur();
      return;
    }

    if (isInput && !e.altKey && !e.ctrlKey && !e.metaKey) return;

    if ((e.key === '/' && !isInput) || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f')) {
      const search = document.getElementById('regSearch');
      if (search) {
        e.preventDefault();
        search.focus();
        search.select();
      }
      return;
    }

    if (e.altKey) {
      const key = e.key.toLowerCase();
      let selector = '';
      if (key === 'n') selector = '.navlink[data-view="issue-new"]';
      else if (key === 'r') selector = '.navlink[data-view="register"]';
      else if (key === 'd') selector = '.navlink[data-view="dashboard"], .navlink[data-view="admin-dashboard"]';
      
      if (selector) {
        e.preventDefault();
        const navBtn = document.querySelector(selector);
        if (navBtn) navBtn.click();
      }
    }
  });
};

// ── Init on DOMContentLoaded ──
let _clickHandlerBound = false;
const init = () => {
  init3DBackground();
  initReveal();
  initHaptic();
  initRipple();
  initNavInk();
  initTopbarScroll();

  if (!_clickHandlerBound) {
    _clickHandlerBound = true;

    // Auto-refresh counters and reveals smoothly on dynamic view changes
    const appMain = document.getElementById('appMain');
    if (appMain && window.MutationObserver) {
      let mutationDebounce = null;
      new MutationObserver(() => {
        clearTimeout(mutationDebounce);
        mutationDebounce = setTimeout(() => {
          initReveal();
          initKpiCounters();
          refreshRegisterStagger();
        }, 50);
      }).observe(appMain, { childList: true, subtree: false });
    }
  }

  initDesktopShortcuts();
  setTimeout(initKpiCounters, 250);
  setTimeout(refreshRegisterStagger, 100);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init3DBackground() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas || canvas.dataset.initialized) return;
  canvas.dataset.initialized = '1';
  
  const ctx = canvas.getContext('2d');
  let width, height, radius; // Bug 1 fix: radius must be updated on resize, not captured once
  let points = [];
  const isMobile = window.innerWidth <= 768;
  const numPoints = isMobile ? 45 : 100;
  let angle = 0;
  let animationFrameId = null;
  let isRunning = false;
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    radius = Math.min(width, height) * 0.9; // Bug 1 fix: recompute radius on every resize
  }
  
  window.addEventListener('resize', resize, { passive: true });
  resize();
  
  // Create random 3D points in a sphere (radius is now kept live via resize())
  // Store as unit-sphere coords (radius = 1). Each frame, multiply by live radius
  // so window resize rescales the sphere without regenerating all points.
  for(let i = 0; i < numPoints; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);
    points.push({x, y, z});
  }
  
  function renderFrame() {
    ctx.clearRect(0, 0, width, height);
    angle += 0.0015;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const color = isDark ? '56, 189, 248' : '15, 23, 42'; // Light blue in dark theme, slate in light
    
    // Scale unit-sphere points by live radius each frame — correctly tracks resize
    const r = radius;
    const projected = points.map(p => {
      const wx = p.x * r;
      const wy = p.y * r;
      const wz = p.z * r;
      const rx = wx * cos - wz * sin;
      const rz = wx * sin + wz * cos;
      const ry = wy;
      
      const scale = 800 / (800 + rz); 
      return {
        x: width / 2 + rx * scale,
        y: height / 2 + ry * scale,
        z: rz,
        scale
      };
    });
    
    ctx.lineWidth = 0.5;
    for(let i = 0; i < projected.length; i++) {
      for(let j = i + 1; j < projected.length; j++) {
        const p1 = projected[i];
        const p2 = projected[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.25;
          ctx.strokeStyle = `rgba(${color}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    
    projected.forEach(p => {
      const alpha = Math.max(0.1, (p.z + r) / (r * 2));
      ctx.fillStyle = `rgba(${color}, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate() {
    if (!isRunning) return;
    renderFrame();
    animationFrameId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (isRunning) return;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      renderFrame();
      return;
    }
    isRunning = true;
    animate();
  }

  function stopAnimation() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // Battery and background tab conservation
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  startAnimation();
}
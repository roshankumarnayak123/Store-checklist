(function() {
  'use strict';

  /* ── Intersection Observer: scroll-reveal ──
     Bug fix: tracks which elements are already observed to avoid re-adding
     .anim-reveal to elements that already have .is-visible                   */
  var _io = null;
  var _observed = new WeakSet();

  function initReveal() {
    var selectors = '.kpi, .panel, .filter-bar, .reg-pagination, .request-card, .kv-row';
    var items = document.querySelectorAll(selectors);

    if (!_io) {
      _io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            _io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
    }

    items.forEach(function(el) {
      /* Bug fix: skip elements already visible to prevent flash of invisible */
      if (_observed.has(el)) return;
      _observed.add(el);
      if (!el.classList.contains('is-visible')) {
        el.classList.add('anim-reveal');
      }
      _io.observe(el);
    });

    /* Stagger KPI grid children */
    var grid = document.querySelector('.kpi-grid');
    if (grid && !grid.classList.contains('anim-stagger')) {
      grid.classList.add('anim-stagger');
    }
  }

  /* ── KPI value counter roll-up ──
     Bug fix: guard against running twice on same element with a data attribute */
  function initKpiCounters() {
    document.querySelectorAll('.kpi-value').forEach(function(el) {
      if (el.dataset.animDone) return;
      var raw = el.textContent.trim();
      var num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
      if (isNaN(num) || num === 0 || num > 99999) return;
      el.dataset.animDone = '1';

      var frame = 0;
      var total = 28;
      function step() {
        frame++;
        var progress = frame / total;
        var ease = 1 - Math.pow(1 - progress, 3);
        var cur = Math.round(num * ease);
        /* replace only the first numeric run in the string */
        el.textContent = raw.replace(/[0-9]+/, String(cur));
        if (frame < total) {
          requestAnimationFrame(step);
        } else {
          el.textContent = raw;
        }
      }
      el.classList.add('animating');
      setTimeout(function() { requestAnimationFrame(step); }, 150);
    });
  }

  /* ── Ripple on .btn clicks ── */
  var _rippleBound = false;
  function initRipple() {
    if (_rippleBound) return;
    _rippleBound = true;
    document.addEventListener('pointerdown', function(e) {
      var btn = e.target.closest('.btn');
      if (!btn || btn.disabled) return;
      var rect = btn.getBoundingClientRect();
      var r = document.createElement('span');
      r.className = 'ripple-wave';
      var size = Math.max(rect.width, rect.height) * 1.6;
      r.style.width  = size + 'px';
      r.style.height = size + 'px';
      r.style.left   = (e.clientX - rect.left - size / 2) + 'px';
      r.style.top    = (e.clientY - rect.top  - size / 2) + 'px';
      btn.appendChild(r);
      r.addEventListener('animationend', function() { r.remove(); });
    });
  }

  /* ── Nav ink indicator ──
     Bug fix: only create the ink element ONCE using a data-attribute guard;
     previous versions created a new ink span on every navlink click.        */
  function initNavInk() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    if (nav.dataset.inkBound) return; /* already initialised — skip */
    nav.dataset.inkBound = '1';

    var ink = document.createElement('span');
    ink.className = 'nav-ink';
    nav.appendChild(ink);

    function moveInk() {
      var active = nav.querySelector('.navlink.active');
      if (!active) { ink.style.width = '0'; return; }
      var navRect = nav.getBoundingClientRect();
      var btnRect = active.getBoundingClientRect();
      ink.style.left  = (btnRect.left - navRect.left + nav.scrollLeft) + 'px';
      ink.style.width = btnRect.width + 'px';
    }

    moveInk();
    nav.addEventListener('click', function() { setTimeout(moveInk, 35); });
    new MutationObserver(moveInk).observe(nav, {
      attributes: true, subtree: true, attributeFilter: ['class']
    });
  }

  /* ── Topbar scroll-shadow ── */
  var _topbarBound = false;
  function initTopbarScroll() {
    if (_topbarBound) return;
    _topbarBound = true;
    var tb = document.querySelector('.topbar');
    if (!tb) return;
    function update() { tb.classList.toggle('is-scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── Stagger register rows on each render ── */
  function refreshRegisterStagger() {
    document.querySelectorAll('table.reg tr').forEach(function(tr, i) {
      tr.style.animationDelay = Math.min(i * 0.04, 0.28) + 's';
    });
  }

  /* ── Init on DOMContentLoaded ── */
  var _clickHandlerBound = false;
  function init() {
    initReveal();
    initRipple();
    initNavInk();
    initTopbarScroll();

    /* Re-run reveal + counters + stagger after any nav click.
       Bug fix: initNavInk NOT called here — the MutationObserver inside
       initNavInk already handles active-class changes, and calling it again
       would create duplicate ink elements.                                  */
    if (!_clickHandlerBound) {
      _clickHandlerBound = true;
      document.addEventListener('click', function(e) {
        if (e.target.closest('.navlink')) {
          setTimeout(function() {
            initReveal();
            initKpiCounters();
            refreshRegisterStagger();
          }, 80);
        }
      });
    }

    /* Desktop Keyboard Shortcuts handler */
    initDesktopShortcuts();

    /* Initial KPI counter animation */
    setTimeout(initKpiCounters, 250);
    setTimeout(refreshRegisterStagger, 100);
  }

  /* ── Desktop Keyboard Shortcuts Module ── */
  var _desktopShortcutsBound = false;
  function initDesktopShortcuts() {
    if (_desktopShortcutsBound) return;
    _desktopShortcutsBound = true;

    document.addEventListener('keydown', function(e) {
      var activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      var isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || document.activeElement.isContentEditable;

      /* Esc: close active dialogs or blur search */
      if (e.key === 'Escape') {
        var searchInput = document.getElementById('regSearch');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
        return;
      }

      /* When typing in an input field, do not trigger single-key shortcuts */
      if (isInput && !e.altKey && !e.ctrlKey && !e.metaKey) return;

      /* '/' or 'Ctrl+Shift+F' or 'Ctrl+F' inside app: focus register search */
      if ((e.key === '/' && !isInput) || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f')) {
        var search = document.getElementById('regSearch');
        if (search) {
          e.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }

      /* Alt + N: Jump to New Issue form */
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        var navBtn = document.querySelector('.navlink[data-view="issue-new"]');
        if (navBtn) navBtn.click();
        return;
      }

      /* Alt + R: Jump to Register */
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        var regNav = document.querySelector('.navlink[data-view="register"]');
        if (regNav) regNav.click();
        return;
      }

      /* Alt + D: Jump to Dashboard */
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        var dashNav = document.querySelector('.navlink[data-view="dashboard"]') || document.querySelector('.navlink[data-view="admin-dashboard"]');
        if (dashNav) dashNav.click();
        return;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
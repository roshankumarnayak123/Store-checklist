/* Boot watchdog: keeps the page visible when external module/CDN loading is delayed or blocked. */
(() => {
  const auth = document.getElementById('authScreen');
  const app = document.getElementById('appScreen');
  const label = document.getElementById('loginSyncLabel');
  const error = document.getElementById('authError');
  if (auth && (!app || app.classList.contains('hidden'))) auth.classList.remove('hidden');

  window.__cmmModuleReady = false;
  let _bootWatchdog = null;

  function dismissBootErrors() {
    if (error) {
      error.textContent = '';
      error.classList.add('hidden');
    }
  }

  window.addEventListener('cmm-module-ready', () => {
    window.__cmmModuleReady = true;
    if (_bootWatchdog) {
      clearTimeout(_bootWatchdog);
      _bootWatchdog = null;
    }
    dismissBootErrors();
    if (label && (label.textContent.includes('taking longer') || label.textContent.includes('Checking'))) {
      label.textContent = 'Connecting to cloud database…';
    }
    const splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('splash-hidden');
  });

  window.addEventListener('error', (event) => {
    const target = event.target;
    const externalFailure = target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK');
    if (!externalFailure) return;
    if (auth) auth.classList.remove('hidden');
    if (label) label.textContent = 'A required online resource could not be loaded.';
    if (error) {
      error.textContent = 'The page could not load a required cloud library. Check your internet connection, disable blocking extensions for this site, and reload.';
      error.classList.remove('hidden');
    }
  }, true);

  // Soft fallback: only show a gentle notice if completely unresponsive after 12 seconds
  _bootWatchdog = setTimeout(() => {
    _bootWatchdog = null;
    if (window.__cmmModuleReady) return;
    if (auth) auth.classList.remove('hidden');
    if (label) label.textContent = 'Connecting is taking longer than usual…';
    const splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('splash-hidden');
  }, 12000);
})();
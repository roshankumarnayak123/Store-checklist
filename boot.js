/* Boot watchdog: keeps the page visible when external module/CDN loading is delayed or blocked. */
(() => {
  const auth = document.getElementById('authScreen');
  const app = document.getElementById('appScreen');
  const label = document.getElementById('loginSyncLabel');
  const error = document.getElementById('authError');
  if (auth && (!app || app.classList.contains('hidden'))) auth.classList.remove('hidden');

  window.__cmmModuleReady = false;
  // Bug #8 fix: store the timer ID so it can be cleared if the module loads successfully,
  // preventing a false 'loading is delayed' error message after a slow-but-successful load.
  let _bootWatchdog = null;
  window.addEventListener('cmm-module-ready', () => {
    window.__cmmModuleReady = true;
    if (_bootWatchdog) { clearTimeout(_bootWatchdog); _bootWatchdog = null; }
  });

  window.addEventListener('error', (event) => {
    const target = event.target;
    const externalFailure = target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK');
    if (!externalFailure) return;
    if (auth) auth.classList.remove('hidden');
    if (label) label.textContent = 'A required online resource could not be loaded.';
    if (error) {
      error.textContent = 'The page could not load a required cloud library. Check the internet connection, disable blocking extensions for this site, and reload.';
      error.classList.remove('hidden');
    }
  }, true);

  _bootWatchdog = setTimeout(() => {
    _bootWatchdog = null;
    if (window.__cmmModuleReady) return;
    if (auth) auth.classList.remove('hidden');
    if (label) label.textContent = 'Cloud module is taking longer than expected.';
    if (error) {
      error.textContent = 'Loading is delayed. Use Ctrl+F5 to refresh. If the message remains, check whether gstatic.com and jsdelivr.net are allowed on this network.';
      error.classList.remove('hidden');
    }
  }, 12000);
})();
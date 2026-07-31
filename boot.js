/* Boot watchdog: keeps the page visible when external module/CDN loading is delayed or blocked. */
(() => {
  const auth = document.getElementById('authScreen');
  const app = document.getElementById('appScreen');
  const label = document.getElementById('loginSyncLabel');
  const error = document.getElementById('authError');
  if (auth && (!app || app.classList.contains('hidden'))) auth.classList.remove('hidden');

  window.__cmmModuleReady = false;
  window.addEventListener('cmm-module-ready', () => { window.__cmmModuleReady = true; });

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

  setTimeout(() => {
    if (window.__cmmModuleReady) return;
    if (auth) auth.classList.remove('hidden');
    if (label) label.textContent = 'Cloud module is taking longer than expected.';
    if (error) {
      error.textContent = 'Loading is delayed. Use Ctrl+F5 to refresh. If the message remains, check whether gstatic.com and jsdelivr.net are allowed on this network.';
      error.classList.remove('hidden');
    }
  }, 12000);
})();
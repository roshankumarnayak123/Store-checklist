import { $, triggerHaptic } from '../utils.js';

let appDialogResolver = null;
let appDialogLastFocus = null;

export function closeAppDialog(result) {
  const backdrop = $('#appDialog');
  if (!backdrop || backdrop.classList.contains('hidden')) return;
  backdrop.classList.add('hidden');
  document.body.classList.remove('modal-open');
  const resolver = appDialogResolver;
  appDialogResolver = null;
  if (appDialogLastFocus && typeof appDialogLastFocus.focus === 'function') appDialogLastFocus.focus();
  if (resolver) resolver(result);
}

export function showAppDialog(message, options = {}) {
  const { title = 'Notice', type = 'info', confirmText = 'OK', cancelText = 'Cancel', showCancel = false } = options;
  const backdrop = $('#appDialog');
  if (!backdrop) return Promise.resolve(true); // Fallback for tests or missing DOM
  const dialog = backdrop.querySelector('.app-dialog');
  appDialogLastFocus = document.activeElement;
  dialog.dataset.type = type;
  $('#appDialogTitle').textContent = title;
  $('#appDialogMessage').textContent = String(message ?? '');
  $('#appDialogIcon').textContent = type === 'danger' ? '!' : type === 'success' ? '✓' : type === 'confirm' ? '?' : 'i';
  $('#appDialogConfirm').textContent = confirmText;
  $('#appDialogCancel').textContent = cancelText;
  $('#appDialogCancel').classList.toggle('hidden', !showCancel);
  document.body.classList.add('modal-open');
  backdrop.classList.remove('hidden');
  triggerHaptic(type === 'danger' ? [30, 40, 30] : 20);
  setTimeout(() => $('#appDialogConfirm').focus(), 0);
  return new Promise((resolve) => { appDialogResolver = resolve; });
}

export function appAlert(message, options = {}) {
  return showAppDialog(message, { title: options.title || 'Notice', type: options.type || 'info', confirmText: 'OK' });
}

export function appConfirm(message, options = {}) {
  return showAppDialog(message, { title: options.title || 'Please confirm', type: options.type || 'confirm', confirmText: options.confirmText || 'Confirm', cancelText: options.cancelText || 'Cancel', showCancel: true });
}

export function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function showIosInstallDialog() {
  $('#iosInstallDialog')?.classList.remove('hidden');
}

export function closeIosInstallDialog() {
  $('#iosInstallDialog')?.classList.add('hidden');
}

export function initDialogs() {
  window.appConfirm = appConfirm;
  window.appAlert = appAlert;
  window.alert = (message) => { void appAlert(message); };

  $('#appDialogConfirm')?.addEventListener('click', (e) => { e.stopPropagation(); closeAppDialog(true); });
  $('#appDialogCancel')?.addEventListener('click', (e) => { e.stopPropagation(); closeAppDialog(false); });
  $('#appDialog')?.addEventListener('click', (event) => { if (event.target.id === 'appDialog') closeAppDialog(false); });
  
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const backdrop = $('#appDialog');
      if (backdrop && !backdrop.classList.contains('hidden')) {
        event.preventDefault();
        closeAppDialog(false);
        return;
      }
    }
  });

  $('#iosInstallCloseBtn')?.addEventListener('click', closeIosInstallDialog);
  $('#iosInstallGotItBtn')?.addEventListener('click', closeIosInstallDialog);
  $('#iosInstallDialog')?.addEventListener('click', (e) => {
    if (e.target.id === 'iosInstallDialog') closeIosInstallDialog();
  });
}

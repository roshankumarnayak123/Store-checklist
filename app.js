import { $, $$, escapeHtml, todayStr, triggerHaptic, hashPassword, calculatePasswordStrength, MOBILE_NAV_ICONS } from './src/utils.js';
import { firebaseConfig } from './src/firebase-config.js';

import './src/styles/tools.css';
import './src/styles/overdue.css';
window.__cmmModuleReady = true;
window.dispatchEvent(new CustomEvent('cmm-module-ready'));

/* =========================================================================
   ARCHITECTURE & DATABASE SEPARATION INSTRUCTION (FOR DEVELOPERS & AI AGENTS)
   =========================================================================
   IMPORTANT ARCHITECTURAL RULE — STRICT SCHEMA SEPARATION:
   This codebase manages TWO COMPLETELY INDEPENDENT, UNCONNECTED DATABASES/COLLECTIONS:

   1. MATERIAL ISSUE REGISTER (Firebase RTDB: `issues/` path):
      - In-memory cache: `globalState.issuesCache`
      - Purpose: Daily logging of materials/consumables issued to workers/supervisors/vendors,
        tracking issue dates, quantities, partial/full return statuses, and return logs.
      - Key Views: 'dashboard', 'register', 'issue-new', 'return-record', 'edit-issue', 'edit-return'.
      - Roles: 'storekeeper', 'viewer', 'admin'.

   2. TOOL REGISTER / TOOLS MASTER LIST (Firebase RTDB: `tools/` path):
      - In-memory cache: `globalState.toolsCache`
      - Purpose: Master catalog and inventory tracking of physical tools/equipment,
        unique auto-incrementing serial IDs (`CMM/SMS/[TOOLNAME]/[SEQ]`), quantities,
        shelf locations, conditions/statuses (Available, In Maintenance, Damaged, Lost), and notes.
      - Key Views: 'tools-dashboard', 'add-tool', 'edit-tool'.
      - Roles: 'tools_admin', 'tools_viewer', 'admin'.

   STRICT GUIDELINES FOR ANY FUTURE AI AGENTS OR DEVELOPERS:
   - There is NO relationship, foreign key, cross-dependency, or shared ID space between `tools/` and `issues/`.
   - DO NOT attempt to merge these databases, link `tool.id` into `issues/`, or enforce relational constraints.
   - DO NOT conflate tool master catalog records with material issue/return entries.
   - Any bug fixes, refactoring, or feature additions to the Tool Register MUST NOT alter or depend on
     the Material Issue Register, and vice-versa. They operate in complete isolation.
   ========================================================================= */


/* =========================================================================
   STATE (Independent Caches for Issues and Tools)
   ========================================================================= */
import { globalState } from './src/state.js';
import { app, db, storage, cloudConnected, setCloudConnected, appBootstrapped, setAppBootstrapped, attemptFirebaseInit } from './src/services/firebase.js';
import { ref, get, set, push, update, remove, onValue, serverTimestamp, increment, query, orderByChild, equalTo } from "firebase/database";
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject, getMetadata } from "firebase/storage";

 
  
 
 
 








// Explicit public bridge: the error logger lives in a classic <script> outside
// this ES module, and module-scoped bindings never reach it, so mirror the
// two fields it needs onto window (kept in sync at every render/login/logout).
window.currentView = globalState.currentView;
window.currentUser = globalState.currentUser;



import {
  showAppDialog,
  closeAppDialog,
  appAlert,
  appConfirm,
  isIosDevice,
  showIosInstallDialog,
  closeIosInstallDialog,
  initDialogs
} from './src/ui/dialogs.js';

// Initialize the dialogs and event listeners
initDialogs();

// Keep the cleanup preview escape handler here since it depends on app state
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const cleanupPreview = $('#cleanupPreviewDialog');
    if (cleanupPreview && !cleanupPreview.classList.contains('hidden')) {
      event.preventDefault();
      cleanupPreview.classList.add('hidden');
      pendingCleanupRecords = [];
    }
  }
});


// Cloud Sync progress and retry state
let cloudSyncProgressValue = 0;
let lastSyncFailureMessage = '';
// Bug #6 fix: use a dedicated boolean flag instead of checking lastSyncFailureMessage string,
// which could be cleared mid-retry causing the button to fire the wrong action.
let isInRetryMode = false;
function setCloudSyncProgress(value = null, mode = 'determinate') {
  const track = $('#cloudSyncProgress');
  const fill = $('#cloudSyncProgressFill');
  if (!track || !fill) return;
  track.classList.remove('is-indeterminate', 'is-failed');
  if (value === null) {
    track.classList.remove('is-visible');
    fill.style.width = '0%';
    cloudSyncProgressValue = 0;
    return;
  }
  cloudSyncProgressValue = Math.max(0, Math.min(100, Number(value) || 0));
  track.classList.add('is-visible');
  if (mode === 'indeterminate') track.classList.add('is-indeterminate');
  if (mode === 'failed') track.classList.add('is-failed');
  fill.style.width = cloudSyncProgressValue + '%';
}
function showCloudSyncRetry(message = 'Cloud Sync failed') {
  lastSyncFailureMessage = message;
  isInRetryMode = true;
  const retry = $('#cloudSyncRetryBtn');
  const label = $('#appSyncLabel');
  const visual = $('#appSyncDot');
  if (retry) retry.classList.remove('hidden');
  if (label) label.textContent = message;
  if (visual) visual.className = 'cloud-sync-visual is-offline';
  setCloudSyncProgress(100, 'failed');
}
function hideCloudSyncRetry() {
  const retry = $('#cloudSyncRetryBtn');
  if (retry) retry.classList.add('hidden');
  lastSyncFailureMessage = '';
  isInRetryMode = false;
}
async function retryCloudSync() {
  const retry = $('#cloudSyncRetryBtn');
  if (retry) retry.textContent = 'Retrying…';
  hideCloudSyncRetry();
  setSyncingState(true, 'Retrying Cloud Sync…');
  try {
    attemptFirebaseInit(() => {
    if (globalState.currentUser) listenToCollections();
  });
    if (!db) throw new Error('Cloud service is not initialized');
    // Fetch issues to verify database connectivity
    const snap = await get(ref(db, 'issues'));
    globalState.issuesCache = snapshotToArray(snap).sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));
    issuesLoaded = true;

    // Fetch tools to refresh tool cache
    const snapTools = await get(ref(db, 'tools')).catch(() => null);
    if (snapTools) {
      globalState.toolsCache = snapshotToArray(snapTools).sort((a, b) => (a.toolName || '').localeCompare(b.toolName || ''));
      toolsLoaded = true;
    }

    if (globalState.currentUser?.roles?.includes('admin')) {
      const snapToolRequests = await get(ref(db, 'toolDeletionRequests')).catch(() => null);
      globalState.toolDeletionRequestsCache = snapToolRequests ? snapshotToArray(snapToolRequests) : [];
      const snapToolAddRequests = await get(ref(db, 'toolAdditionRequests')).catch(() => null);
      globalState.toolAdditionRequestsCache = snapToolAddRequests ? snapshotToArray(snapToolAddRequests) : [];
      const snapToolQtyRequests = await get(ref(db, 'toolQuantityRequests')).catch(() => null);
      globalState.toolQuantityRequestsCache = snapToolQtyRequests ? snapshotToArray(snapToolQtyRequests) : [];
    }

    setCloudConnected(true);
    lastSyncedAt = new Date();
    if (globalState.currentUser) listenToCollections();
    updateLoginSyncIndicator(true);
    if (!FORM_VIEWS.has(globalState.currentView)) render();
    setCloudSyncProgress(100);
    setTimeout(() => setCloudSyncProgress(null), 550);
  } catch (error) {
    setCloudConnected(false);
    updateLoginSyncIndicator(false);
    showCloudSyncRetry('Cloud Sync failed — click to retry');
    console.error('Cloud Sync retry failed:', error);
  } finally {
    if (retry) retry.textContent = 'Retry';
  }
}
async function refreshFromCloudDatabase() {
  const control = $('#cloudSyncRefreshBtn');
  if (control?.classList.contains('is-refreshing')) return;
  control?.classList.add('is-refreshing');
  setSyncingState(true, 'Refreshing from cloud…');
  try {
    if (!db) attemptFirebaseInit(() => {
    if (globalState.currentUser) listenToCollections();
  });
    if (!db) throw new Error('Cloud service is not initialized');
    const snap = await get(ref(db, 'issues'));
    globalState.issuesCache = snapshotToArray(snap).sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));
    issuesLoaded = true;
    const snapTools = await get(ref(db, 'tools'));
    globalState.toolsCache = snapshotToArray(snapTools).sort((a, b) => (a.toolName || '').localeCompare(b.toolName || ''));
    toolsLoaded = true;
    if (globalState.currentUser?.roles?.includes('admin')) {
      const snapToolRequests = await get(ref(db, 'toolDeletionRequests')).catch(() => null);
      globalState.toolDeletionRequestsCache = snapToolRequests ? snapshotToArray(snapToolRequests) : [];
      const snapToolAddRequests = await get(ref(db, 'toolAdditionRequests')).catch(() => null);
      globalState.toolAdditionRequestsCache = snapToolAddRequests ? snapshotToArray(snapToolAddRequests) : [];
      const snapToolQtyRequests = await get(ref(db, 'toolQuantityRequests')).catch(() => null);
      globalState.toolQuantityRequestsCache = snapToolQtyRequests ? snapshotToArray(snapToolQtyRequests) : [];
    }
    setCloudConnected(true);
    lastSyncedAt = new Date();
    updateLoginSyncIndicator(true);
    if (!FORM_VIEWS.has(globalState.currentView)) render();
    setCloudSyncProgress(100);
    if ($('#appSyncLabel')) $('#appSyncLabel').textContent = 'Cloud Sync refreshed';
    setTimeout(() => { setCloudSyncProgress(null); if ($('#appSyncLabel')) $('#appSyncLabel').textContent = 'Cloud Sync'; }, 900);
  } catch (error) {
    setCloudConnected(false);
    updateLoginSyncIndicator(false);
    showCloudSyncRetry('Refresh failed — click to retry');
    console.error('Cloud database refresh failed:', error);
  } finally {
    control?.classList.remove('is-refreshing');
  }
}
// Bug #6 fix: use isInRetryMode flag (not lastSyncFailureMessage) for reliable action routing
$('#cloudSyncRefreshBtn').addEventListener('click', () => isInRetryMode ? retryCloudSync() : refreshFromCloudDatabase());

// Pull-to-refresh: active only on touch devices while the page is at the top.
const PULL_REFRESH_THRESHOLD = 78;
const PULL_REFRESH_MAX = 126;
let pullStartY = 0;
let pullDistance = 0;
let pullTracking = false;
let pullRefreshing = false;
function resetPullRefreshIndicator(delay = 0) {
  const indicator = $('#pullRefreshIndicator');
  if (!indicator) return;
  setTimeout(() => {
    indicator.classList.remove('is-visible', 'is-ready', 'is-refreshing');
    indicator.style.transform = '';
    const icon = indicator.querySelector('.pull-refresh-icon');
    if (icon) icon.style.transform = '';
    const text = $('#pullRefreshText');
    if (text) text.textContent = 'Pull to refresh';
    pullDistance = 0;
  }, delay);
}
let lastPullRefreshAt = 0;
const PULL_REFRESH_COOLDOWN = 4000;
document.addEventListener('touchstart', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const interactive = target?.closest('input, textarea, select, button, a, label, [contenteditable="true"], [role="button"]');
  const formViewOpen = typeof FORM_VIEWS !== 'undefined' && FORM_VIEWS.has(globalState.currentView);
  const coolingDown = Date.now() - lastPullRefreshAt < PULL_REFRESH_COOLDOWN;
  // Bug #7 fix: do not allow pull-to-refresh when the cloud fail-safe overlay is active
  const cloudSuspended = document.body.classList.contains('cloud-sync-suspended');
  // Bug fix: use optional chaining — #appScreen may not exist on very early load
  if (interactive || formViewOpen || coolingDown || cloudSuspended || pullRefreshing || event.touches.length !== 1 || window.scrollY > 0 || $('#appScreen')?.classList.contains('hidden')) return;
  pullStartY = event.touches[0].clientY;
  pullDistance = 0;
  pullTracking = true;
}, { passive: true });
document.addEventListener('touchmove', (event) => {
  if (!pullTracking || event.touches.length !== 1) return;
  const rawDistance = event.touches[0].clientY - pullStartY;
  if (rawDistance <= 0 || window.scrollY > 0) { pullTracking = false; resetPullRefreshIndicator(); return; }
  pullDistance = Math.min(PULL_REFRESH_MAX, rawDistance * 0.58);
  const indicator = $('#pullRefreshIndicator');
  if (!indicator) return;
  indicator.classList.add('is-visible');
  indicator.classList.toggle('is-ready', pullDistance >= PULL_REFRESH_THRESHOLD);
  indicator.style.transform = `translate(-50%, ${Math.min(18, pullDistance / 5)}px) scale(1)`;
  const icon = indicator.querySelector('.pull-refresh-icon');
  if (icon) icon.style.transform = `rotate(${Math.min(300, pullDistance * 3.2)}deg)`;
  const label = $('#pullRefreshText');
  if (label) label.textContent = pullDistance >= PULL_REFRESH_THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
  if (pullDistance > 12) event.preventDefault();
}, { passive: false });
document.addEventListener('touchend', async () => {
  if (!pullTracking) return;
  pullTracking = false;
  if (pullDistance < PULL_REFRESH_THRESHOLD) { resetPullRefreshIndicator(); return; }
  pullRefreshing = true;
  lastPullRefreshAt = Date.now();
  const indicator = $('#pullRefreshIndicator');
  const label = $('#pullRefreshText');
  indicator?.classList.remove('is-ready');
  indicator?.classList.add('is-visible', 'is-refreshing');
  if (label) label.textContent = 'Refreshing from cloud…';
  await refreshFromCloudDatabase();
  if (label) label.textContent = cloudConnected ? 'Refresh complete' : 'Refresh failed';
  resetPullRefreshIndicator(700);
  pullRefreshing = false;
}, { passive: true });
document.addEventListener('touchcancel', () => { pullTracking = false; resetPullRefreshIndicator(); }, { passive: true });

// Sync State Helper
// Bug fix: used to call showCloudSyncRetry() every time a save completed and
// cloudConnected happened to be false (transient WiFi blip, reconnect cycle).
// This caused the blocking overlay to appear after every write during any
// brief disconnect. Now the header label is updated but the blocking overlay
// is governed exclusively by updateLoginSyncIndicator (which uses Firebase
// .info/connected as the authoritative source, with a debounce).
function setSyncingState(isSyncing, text = null) {
  const visual = $('#appSyncDot');
  const label = $('#appSyncLabel');
  if (!visual || !label) return;
  visual.classList.toggle('is-syncing', isSyncing);
  visual.classList.toggle('is-online', !isSyncing && cloudConnected);
  visual.classList.toggle('is-offline', !isSyncing && !cloudConnected);
  if (isSyncing) {
    hideCloudSyncRetry();
    label.textContent = text || 'Cloud Syncing…';
    setCloudSyncProgress(35, 'indeterminate');
  } else {
    if (cloudConnected) {
      label.textContent = 'Cloud Sync';
      setCloudSyncProgress(100);
      setTimeout(() => setCloudSyncProgress(null), 500);
    } else {
      // Only update the label — don't show the blocking overlay here.
      // updateLoginSyncIndicator handles that with proper debounce + authority.
      label.textContent = 'Cloud Sync Offline';
      setCloudSyncProgress(null);
    }
  }
}

// Tracks whichever upload is currently in flight, so it can be cancelled
let activeUploadTask = null;

// Upload Progress Wrapper
async function uploadWithProgress(path, file, btnEl) {
  if (!storage) throw new Error("Storage not initialized");
  const fileRef = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(fileRef, file);
  activeUploadTask = uploadTask;

  const STALL_TIMEOUT_MS = 30000;

  return new Promise((resolve, reject) => {
    let settled = false;
    let stallTimer = null;
    let lastBytes = -1;

    const clearStallTimer = () => { if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; } };
    const finish = () => { clearStallTimer(); if (activeUploadTask === uploadTask) activeUploadTask = null; };

    const armStallTimer = () => {
      clearStallTimer();
      stallTimer = setTimeout(() => {
        if (settled) return;
        settled = true;
        try { uploadTask.cancel(); } catch { /* ignore */ }
        finish();
        showCloudSyncRetry('Cloud Sync upload failed');
        reject(new Error('Upload stalled with no progress for 30 seconds. Check your connection, or ask an admin.'));
      }, STALL_TIMEOUT_MS);
    };

    armStallTimer();

    uploadTask.on('state_changed',
      (snapshot) => {
        if (snapshot.bytesTransferred > lastBytes) {
          lastBytes = snapshot.bytesTransferred;
          armStallTimer();
        }
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        const pct = Math.round(progress);
        if (btnEl) btnEl.innerHTML = `<span class="spinner"></span> Uploading... ${pct}%`;
        setSyncingState(true, `Cloud Sync ${pct}%`);
        setCloudSyncProgress(pct);
      },
      (error) => {
        if (settled) return;
        settled = true;
        finish();
        console.error("Upload error:", error);
        showCloudSyncRetry(error && error.code === 'storage/canceled' ? 'Cloud Sync canceled' : 'Cloud Sync upload failed');
        reject(error && error.code === 'storage/canceled' ? new Error('Upload canceled.') : error);
      },
      async () => {
        if (settled) return;
        settled = true;
        finish();
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

// Multiple-photo helpers
async function cleanupUploadedPaths(paths = []) {
  if (!storage || !paths.length) return;
  await Promise.allSettled(paths.filter(Boolean).map((path) => deleteObject(storageRef(storage, path))));
}
async function uploadMultiplePhotos(folder, id, files, btn) {
  const urls = [], paths = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const ext = (files[i].name.split('.').pop() || 'jpg').slice(0, 8);
      const path = `${folder}/${id}_${Date.now()}_${i + 1}.${ext}`;
      if (btn) btn.innerHTML = `<span class="spinner"></span> Uploading photo ${i + 1} of ${files.length}...`;
      const url = await uploadWithProgress(path, files[i], btn);
      urls.push(url); paths.push(path);
    }
    return { urls, paths };
  } catch (error) {
    await cleanupUploadedPaths(paths);
    throw error;
  }
}
const MAX_PHOTOS_PER_ENTRY = 5;
let photoGalleryUrls = [];
function normalizePhotoUrls(value) { return (Array.isArray(value) ? value : [value]).filter(Boolean); }
function renderPhotoThumbs(value, label) {
  const urls = normalizePhotoUrls(value);
  if (!urls.length) return '<span class="muted">—</span>';
  const visible = urls.slice(0, 3), remaining = urls.length - visible.length;
  const galleryId = 'gallery_' + Math.random().toString(36).slice(2, 10);
  window.__photoGalleries = window.__photoGalleries || {};
  window.__photoGalleries[galleryId] = { urls, label };
  return `<div class="photo-thumb-strip">${visible.map((url, i) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" title="Open ${escapeHtml(label)} ${i + 1}"><img src="${escapeHtml(url)}" alt="${escapeHtml(label)} ${i + 1}" /></a>`).join('')}${remaining > 0 ? `<button type="button" class="photo-more" data-photo-gallery="${galleryId}" title="View all ${urls.length} photos" aria-label="View ${remaining} more ${escapeHtml(label)} photos">+${remaining}</button>` : ''}</div>`;
}
function updatePhotoGallery() { const url = photoGalleryUrls[photoGalleryIndex]; if (!url) return; $('#photoGalleryMain').src = url; $('#photoGalleryMain').alt = `Photo ${photoGalleryIndex + 1} of ${photoGalleryUrls.length}`; $('#photoGalleryCounter').textContent = `${photoGalleryIndex + 1} of ${photoGalleryUrls.length}`; $('#photoGalleryPrev').disabled = photoGalleryUrls.length < 2; $('#photoGalleryNext').disabled = photoGalleryUrls.length < 2; $$('#photoGalleryGrid .photo-gallery-item').forEach((a, i) => a.classList.toggle('is-active', i === photoGalleryIndex)); }
function openPhotoGallery(galleryId, startIndex = 0) {
  const gallery = window.__photoGalleries?.[galleryId]; if (!gallery) return; photoGalleryUrls = gallery.urls; photoGalleryIndex = Math.max(0, Math.min(startIndex, photoGalleryUrls.length - 1)); $('#photoGalleryTitle').textContent = `${gallery.label}s (${gallery.urls.length})`; $('#photoGalleryGrid').innerHTML = gallery.urls.map((url, index) => `<button type="button" class="photo-gallery-item" data-gallery-index="${index}" title="View photo ${index + 1}"><img src="${escapeHtml(url)}" alt="${escapeHtml(gallery.label)} ${index + 1}" loading="lazy" /></button>`).join(''); $('#photoGalleryDialog').classList.remove('hidden'); $$('[data-gallery-index]').forEach(btn => btn.addEventListener('click', () => { photoGalleryIndex = Number(btn.dataset.galleryIndex); updatePhotoGallery(); })); updatePhotoGallery(); $('#photoGalleryCloseBtn').focus();
}
function closePhotoGallery() { $('#photoGalleryDialog').classList.add('hidden'); $('#photoGalleryGrid').innerHTML = ''; photoGalleryUrls = []; }
function limitPhotoFiles(files, existingCount = 0) {
  const available = Math.max(0, MAX_PHOTOS_PER_ENTRY - existingCount);
  if (available === 0) { void appAlert(`Maximum ${MAX_PHOTOS_PER_ENTRY} photos are already attached to this entry.`, { title: 'Photo Limit Reached', type: 'danger' }); return []; }
  if (files.length > available) { void appAlert(`Only ${available} more photo${available === 1 ? '' : 's'} can be added. Maximum ${MAX_PHOTOS_PER_ENTRY} photos are allowed per entry.`, { title: 'Photo Limit', type: 'danger' }); }
  return files.slice(0, available);
}
// Bug G fix: recalculate the live DOM index at click-time instead of closing
// over the forEach `i`, which becomes stale when the user rapidly removes
// multiple photos before the DOM re-renders.
function previewSelectedImages(files, selector) { const h = $(selector); if (!h) return; h.innerHTML = ''; files.forEach((f, i) => { const item = document.createElement('div'); item.className = 'photo-preview-item'; const img = document.createElement('img'); img.alt = `Selected photo ${i + 1}`; img.style.cssText = 'width:110px;height:90px;object-fit:cover;border-radius:12px;display:block;'; const r = new FileReader(); r.onload = () => img.src = r.result; r.readAsDataURL(f); const rm = document.createElement('button'); rm.type = 'button'; rm.className = 'photo-preview-remove'; rm.setAttribute('aria-label', `Remove photo ${i + 1}`); rm.title = 'Remove photo'; rm.textContent = '\u00d7'; rm.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const liveIndex = Array.from(h.children).indexOf(item); if (liveIndex !== -1) files.splice(liveIndex, 1); previewSelectedImages(files, selector); }); item.appendChild(img); item.appendChild(rm); h.appendChild(item); }); h.parentElement.style.display = files.length ? 'block' : 'none'; }
function uniqueRecentValues(field, limit = 12) {
  const seen = new Set(), values = [];
  for (const item of globalState.issuesCache) {
    const value = String(item?.[field] || '').trim();
    const key = value.toLowerCase();
    if (value && !seen.has(key)) { seen.add(key); values.push(value); }
    if (values.length >= limit) break;
  }
  return values;
}
function quickFillDatalist(id, values) {
  return `<datalist id="${id}">${values.map(value => `<option value="${escapeHtml(value)}"></option>`).join('')}</datalist>`;
}
async function appendCameraPhoto(input, targetArrayName, previewSelector) {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { void appAlert('Please take an image only.', { title: 'Invalid File', type: 'danger' }); input.value = ''; return; }
  const issue = targetArrayName === 'edit-issue' ? globalState.issuesCache.find(i => i.id === editIssueTargetId) : targetArrayName === 'edit-return' ? globalState.issuesCache.find(i => i.id === editReturnTargetId) : targetArrayName === 'return' ? globalState.issuesCache.find(i => i.id === returnFormTargetId) : null;
  const existingCount = targetArrayName === 'edit-issue' ? normalizePhotoUrls(issue?.photoUrls || issue?.photoUrl).length : 0;
  const selectedCount = targetArrayName === 'issue' ? selectedPhotoFiles.length : targetArrayName === 'return' ? returnSelectedPhotoFiles.length : targetArrayName === 'edit-issue' ? editIssueSelectedPhotoFiles.length : editReturnSelectedPhotoFiles.length;
  if (existingCount + selectedCount >= MAX_PHOTOS_PER_ENTRY) { input.value = ''; await appAlert(`Maximum ${MAX_PHOTOS_PER_ENTRY} photos are allowed per entry.`, { title: 'Photo Limit Reached', type: 'danger' }); return; }
  const compressed = await compressImage(file);
  if (targetArrayName === 'issue') selectedPhotoFiles.push(compressed);
  if (targetArrayName === 'return') returnSelectedPhotoFiles.push(compressed);
  if (targetArrayName === 'edit-issue') editIssueSelectedPhotoFiles.push(compressed);
  if (targetArrayName === 'edit-return') editReturnSelectedPhotoFiles.push(compressed);
  const selected = targetArrayName === 'issue' ? selectedPhotoFiles : targetArrayName === 'return' ? returnSelectedPhotoFiles : targetArrayName === 'edit-issue' ? editIssueSelectedPhotoFiles : editReturnSelectedPhotoFiles;
  previewSelectedImages(selected, previewSelector);
  input.value = '';
}

// Client-Side Image Compressor (Optimized with createImageBitmap & dual-axis scaling)
async function compressImage(file, maxDimension = 1600, quality = 0.82) {
  try {
    let imgSource;
    if (window.createImageBitmap) {
      imgSource = await createImageBitmap(file);
    } else {
      imgSource = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    if (!imgSource) return file;

    let width = imgSource.width;
    let height = imgSource.height;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });

    // JPEG has no alpha channel. Without this fill, transparent areas turn solid black
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(imgSource, 0, 0, width, height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    });
  } catch (err) {
    console.warn("Image compression failed, falling back to original", err);
    return file;
  }
}

let registerFilterState = { q: '', status: 'all', month: 'all', year: 'all', vendor: 'all', area: 'all', supervisor: 'all', issuedBy: 'all', dateFrom: '', dateTo: '', page: 1 };
let excelStatusFilter = 'all';
let excelDateFrom = '';
let excelDateTo = '';
let registerFiltersOpen = false;
let registerViewExpanded = false;
const registerExpandedRows = new Set();
let registerStickyObserver = null;
let registerMoreFiltersOpen = false;
let registerDraftFilters = null;
let formDirty = false;
let photoGalleryIndex = 0;
const REGISTER_PREFS_KEY = 'cmm_register_preferences';
let regSearchDebounceTimer = null;
const REG_PAGE_SIZE = 10;
let issuesLoaded = false;
let toolsLoaded = false;

// NOTE: these were previously declared much further down in the file (near the
// functions that use them). Since render() touches them on every call, and a
// restored session invokes render() synchronously during page load (before the
// browser reaches those later lines), that left them in the "temporal dead
// zone" — referencing a `let` before its declaration line has run throws a
// ReferenceError. That crash silently aborted the rest of startup (Firebase
// never got initialized) on every refresh of an already-logged-in session.
// Declaring them here, before startApp() ever runs, fixes that permanently.
let issueFormError = '';
let editIssueTargetId = null;
let editIssueError = '';
let returnFormTargetId = null;
let returnFormError = '';
let editReturnTargetId = null;
let editReturnError = '';
let userFormError = '';
let selectedPhotoFiles = [];
let returnSelectedPhotoFiles = [];
let editReturnSelectedPhotoFiles = [];
let editIssueSelectedPhotoFiles = [];
let profileSelectedPhotoFile = null;
let profilePasswordError = '';

export function showScreen(id) {
  ['authScreen', 'appScreen'].forEach((s) => {
    const el = $('#' + s);
    if (!el) return;
    const isTarget = (s === id);
    el.classList.toggle('hidden', !isTarget);
    if (!isTarget) {
      el.style.display = 'none';
    } else {
      el.style.removeProperty('display');
    }
  });
  window.scrollTo(0, 0);
}

const configIsPlaceholder = Object.values(firebaseConfig).some((v) => v.startsWith('YOUR_'));
let cloudSyncOk = false;
let lastSyncedAt = null;
let clockStarted = false;
let clockInterval = null;
let sessionTimerStarted = false;
let sessionTimerInterval = null;
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '921443c5e72aac9f10321d52f095edd5ed04ab8deeca8cd0eb425ad46c135c14'; // SHA-256 of 'admin321'
const SESSION_KEY = 'mechtools_session';

// =========================================================================
// THEME
// =========================================================================
const THEME_KEY = 'cmm_sms_theme';
function preferredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* ignore */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme, persist = false) {
  const resolved = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = resolved;
  const dark = resolved === 'dark';
  ['themeToggle', 'authThemeToggle'].forEach((id) => {
    const toggle = $('#' + id);
    if (!toggle) return;
    toggle.setAttribute('aria-checked', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    toggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  });
  if (persist) {
    try { localStorage.setItem(THEME_KEY, resolved); } catch { /* ignore */ }
  }
}
function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
}
applyTheme(preferredTheme());
$('#themeToggle')?.addEventListener('click', toggleTheme);
$('#authThemeToggle')?.addEventListener('click', toggleTheme);

// =========================================================================
// APP BOOTSTRAPPING
// =========================================================================
function startApp() {
  clearAuthMessages();
  attemptFirebaseInit(() => {
    if (globalState.currentUser) listenToCollections();
  });
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  updateLoginSyncIndicator(isOnline);
  const saved = loadSession();
  if (saved) {
    globalState.currentUser = saved;
    initTopbar();
    showScreen('appScreen');
    navigateTo(getStartupView(globalState.currentUser), false, true);
  } else {
    showScreen('authScreen');
  }
}



// Bug fix: updateLoginSyncIndicator fired on EVERY .info/connected event from
// Firebase — which can fire many times per second during reconnection. Each
// call dispatched cloud-sync-state which showed/hid the blocking fail-safe
// overlay, causing it to flash rapidly. The debounce below collapses bursts of
// rapid state changes into a single update, 600 ms after the last one.
let _syncIndicatorTimer = null;
let _syncIndicatorPending = null;
export function updateLoginSyncIndicator(connected) {
  _syncIndicatorPending = connected === true;
  if (_syncIndicatorTimer) return;
  _syncIndicatorTimer = setTimeout(() => {
    _syncIndicatorTimer = null;
    const isConnected = _syncIndicatorPending;
    window.dispatchEvent(new CustomEvent('cloud-sync-state', { detail: { connected: isConnected } }));
    const dot = $('#loginSyncDot');
    const label = $('#loginSyncLabel');
    if (dot && label) {
      dot.className = 'sync-dot ' + (isConnected ? 'sync-dot-good' : 'sync-dot-bad');
      label.textContent = isConnected ? 'Cloud Sync ready — login enabled' : 'Cloud Sync offline — login disabled';
    }

    const error = $('#authError');
    if (error && (isConnected || error.textContent.includes('Loading is delayed') || error.textContent.includes('taking longer'))) {
      error.textContent = '';
      error.classList.add('hidden');
    }

    const loginBtn = $('#loginBtn');
    const reqBtn = $('#reqSubmitBtn');
    if (loginBtn) loginBtn.disabled = !isConnected;
    if (reqBtn) reqBtn.disabled = !isConnected;

    const appDot = $('#appSyncDot');
    const appLabel = $('#appSyncLabel');
    if (appDot && appLabel) {
      appDot.className = 'cloud-sync-visual ' + (isConnected ? 'is-online' : 'is-offline');
      appLabel.textContent = isConnected ? 'Cloud Sync' : 'Cloud Sync Offline';
      if (isConnected) {
        hideCloudSyncRetry();
        setCloudSyncProgress(null);
      } else {
        showCloudSyncRetry('Cloud Sync Offline');
      }
    }
  }, 600);
}

function formatClockParts(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  let h = d.getHours();
  const meridiem = h >= 12 ? 'pm' : 'am';
  h = h % 12; if (h === 0) h = 12;
  return {
    date: `${dd}/${mo}`,
    time: `${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
    meridiem,
  };
}
function startLiveClock() {
  if (!$('#clockDate')) return;
  if (clockInterval) clearInterval(clockInterval);
  const tick = () => {
    const dateEl = $('#clockDate'), timeEl = $('#clockTime'), meridiemEl = $('#clockMeridiem');
    if (!dateEl || !timeEl || !meridiemEl) { clearInterval(clockInterval); clockStarted = false; return; }
    const parts = formatClockParts(new Date());
    dateEl.textContent = parts.date;
    timeEl.textContent = parts.time;
    meridiemEl.textContent = parts.meridiem;
  };
  tick();
  clockInterval = setInterval(tick, 1000);
}

// Login session (inactivity) timer: counts down from SESSION_IDLE_LIMIT_SECONDS
// and resets on any user interaction. Reaching zero signs the user out
// automatically, which matters since this app runs on shared store devices.
const SESSION_IDLE_LIMIT_SECONDS = 15 * 60; // 15 minutes — adjust as needed
let lastActivityAt = Date.now();
let sessionWarningShown = false;
function markActivity() { lastActivityAt = Date.now(); sessionWarningShown = false; }
function startSessionTimer() {
  if (!$('#timerText')) return;
  if (sessionTimerInterval) clearInterval(sessionTimerInterval);
  lastActivityAt = Date.now();
  sessionWarningShown = false;
  ['click', 'keydown', 'touchstart', 'scroll'].forEach((evt) => document.addEventListener(evt, markActivity, { passive: true }));
  const tick = () => {
    const textEl = $('#timerText');
    if (!textEl || !globalState.currentUser) { clearInterval(sessionTimerInterval); sessionTimerStarted = false; return; }
    const remaining = Math.max(0, SESSION_IDLE_LIMIT_SECONDS - Math.floor((Date.now() - lastActivityAt) / 1000));
    textEl.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    $('#sessionTimer')?.classList.toggle('is-critical', remaining <= 60);
    if (remaining <= 60 && remaining > 0 && !sessionWarningShown) {
      sessionWarningShown = true;
      const msg = formDirty
        ? "You have unsaved changes and have been inactive for a while. Stay signed in to keep working?"
        : "You've been inactive for a while. Stay signed in?";
      appConfirm(msg, { title: 'Session Expiring Soon', confirmText: 'Stay Signed In', cancelText: 'Sign Out Now' }).then((stay) => {
        if (stay) markActivity(); else $('#logoutBtn')?.click();
      });
    }
    if (remaining <= 0) {
      clearInterval(sessionTimerInterval);
      sessionTimerStarted = false;
      showToast('You were signed out after 15 minutes of inactivity.', { title: 'Session Expired', type: 'info' });
      $('#logoutBtn')?.click();
    }
  };
  tick();
  sessionTimerInterval = setInterval(tick, 1000);
}

// Persist the signed-in session across page refreshes and browser restarts.
// Only the non-sensitive user profile/role is stored; passwords are never saved here.
export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // Remove the old tab-only copy to avoid conflicting session sources.
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('Could not persist the login session:', e);
  }
}
function loadSession() {
  try {
    // Prefer the persistent session. Migrate an existing tab-only session once.
    let raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        localStorage.setItem(SESSION_KEY, raw);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user || typeof user.username !== 'string') return null;
    user.roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['storekeeper']);
    if (user.roles.includes('storekeeper')) user.roles[user.roles.indexOf('storekeeper')] = 'user'; // legacy fix
    if (!user.roles.some(r => ['admin', 'user', 'viewer', 'tools_admin', 'tools_viewer'].includes(r))) {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    // (Legacy migration handled above)
    return user;
  } catch (e) {
    console.warn('Stored session was corrupted and has been cleared:', e);
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    return null;
  }
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

// Which nav destinations exist for each role, in display order. Shared by the
// topbar nav itself and by the "startup page" preference below, so both stay
// in sync automatically if a view is ever added/removed/relabelled.
function navLinksForRoles(roles) {
  if (!roles) return [];
  if (roles.includes('admin')) return [['admin-dashboard', 'Dashboard'], ['register', 'Issue/Return'], ['tools-dashboard', 'Tools List'], ['users-admin', 'Users'], ['settings-admin', 'Settings']];
  
  let links = [];
  if (roles.includes('tools_admin') || roles.includes('tools_viewer')) {
    links.push(['tools-dashboard', 'Tools Master List']);
  }
  if (roles.includes('user') || roles.includes('storekeeper') || roles.includes('viewer')) {
    links.push(['dashboard', 'Dashboard'], ['register', 'Register']);
  }
  
  links.push(['profile', 'My Profile']);
  return links;
}

// Per-user "startup page" preference: which view opens right after login or
// on a returning session, instead of always the role's default dashboard.
const HOME_VIEW_KEY = 'cmm_sms_home_view';
function getHomeView(user) {
  let fallback = 'dashboard';
  const roles = user?.roles || [];
  if (roles.includes('admin')) fallback = 'admin-dashboard';
  else if (roles.includes('user') || roles.includes('storekeeper') || roles.includes('viewer')) fallback = 'dashboard';
  else if (roles.includes('tools_admin') || roles.includes('tools_viewer')) fallback = 'tools-dashboard';
  
  if (!user) return fallback;
  try {
    const saved = JSON.parse(localStorage.getItem(HOME_VIEW_KEY) || '{}')[user.username];
    const isValid = navLinksForRoles(roles).some(([id]) => id === saved);
    return isValid ? saved : fallback;
  } catch (_) { return fallback; }
}

export function getStartupView(user) {
  if (!user) return 'dashboard';
  const hash = (window.location.hash || '').replace('#', '').trim();
  const allowed = navLinksForRoles(user.roles).map(([id]) => id);
  const canIssue = user.roles.includes('admin') || user.roles.includes('storekeeper') || user.roles.includes('user');
  const canTools = user.roles.includes('admin') || user.roles.includes('tools_admin') || user.roles.includes('tools_viewer');
  
  if (hash === 'issue-new' || hash === 'return-record') {
    if (canIssue) return hash;
  }
  if (hash === 'add-tool' || hash === 'tools-dashboard') {
    if (canTools) return hash;
  }
  if (hash && (allowed.includes(hash) || hash === 'profile')) {
    return hash;
  }
  return getHomeView(user);
}
function setHomeView(user, viewId) {
  if (!user) return;
  try {
    const map = JSON.parse(localStorage.getItem(HOME_VIEW_KEY) || '{}');
    map[user.username] = viewId;
    localStorage.setItem(HOME_VIEW_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}
function homeViewSelectHtml() {
  return navLinksForRoles(globalState.currentUser.roles).map(([id, label]) =>
    `<option value="${id}"${getHomeView(globalState.currentUser) === id ? ' selected' : ''}>${escapeHtml(label)}</option>`
  ).join('');
}
function wireHomeViewSelect() {
  $('#homeViewSelect')?.addEventListener('change', (e) => {
    setHomeView(globalState.currentUser, e.target.value);
    showToast("You'll land here next time you sign in.", { title: 'Startup Page Updated' });
  });
}

function clearAuthMessages() { $('#authError').classList.add('hidden'); $('#authInfo').classList.add('hidden'); }
function showAuthError(msg) { $('#authInfo').classList.add('hidden'); $('#authError').textContent = String(msg || ''); $('#authError').classList.remove('hidden'); }
function showAuthInfo(msg) { $('#authError').classList.add('hidden'); $('#authInfo').textContent = String(msg || ''); $('#authInfo').classList.remove('hidden'); }

// Shows a form validation/save error by updating an existing alert element in
// place, WITHOUT calling render(). Calling render() here would regenerate the
// entire form from its template string and silently discard everything the
// user had already typed (and any selected-but-unsaved photo) — all to show a
// one-line error message. This keeps the rest of the form untouched.
export function showInlineError(alertId, msg) {
  const el = $('#' + alertId);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
export function hideInlineError(alertId) {
  const el = $('#' + alertId);
  if (el) el.classList.add('hidden');
}

// =========================================================================
// LOGIN FLOW
// =========================================================================
let loginAttempts = { count: 0, lockedUntil: 0 };

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthMessages();
  if (!db) attemptFirebaseInit(() => {
    if (globalState.currentUser) listenToCollections();
  });

  if (Date.now() < loginAttempts.lockedUntil) {
    showAuthError(`Too many failed attempts. Try again in ${Math.ceil((loginAttempts.lockedUntil - Date.now()) / 1000)} seconds.`);
    return;
  }

  const username = $('#loginUsername').value.trim();
  const password = $('#loginPassword').value;
  const btn = $('#loginBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Logging in…';

  try {
    const hashedPwd = await hashPassword(password);
    
    // 1. Admin login check (case-insensitive username)
    if (username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && hashedPwd === ADMIN_PASSWORD) {
      loginAttempts = { count: 0, lockedUntil: 0 };
      setCloudConnected(true);
      updateLoginSyncIndicator(true);
      globalState.currentUser = { username: ADMIN_USERNAME, fullName: 'Administrator', roles: ['admin'], profilePhotoUrl: null };
      window.currentUser = globalState.currentUser;
      document.body.dataset.role = globalState.currentUser.roles.join(',');
      saveSession(globalState.currentUser);
      initTopbar();
      listenToCollections();
      showScreen('appScreen');
      navigateTo(getStartupView(globalState.currentUser), true, true);
      return;
    }

    if (!db) throw new Error('Database is not initialized. Please check network.');

    // 2. Lookup user record in Firebase
    let record = null;
    let resolvedUsername = username;

    const snap = await get(ref(db, 'users/' + username));
    if (snap.exists()) {
      record = snap.val();
      resolvedUsername = username;
    } else {
      // Fallback: case-insensitive matching across users (helps with mobile auto-caps)
      const allUsersSnap = await get(ref(db, 'users'));
      if (allUsersSnap.exists()) {
        const allUsers = allUsersSnap.val() || {};
        const matchKey = Object.keys(allUsers).find(k => k.toLowerCase() === username.toLowerCase());
        if (matchKey) {
          record = allUsers[matchKey];
          resolvedUsername = matchKey;
        }
      }
    }

    setCloudConnected(true);
    updateLoginSyncIndicator(true);

    if (!record) {
      loginAttempts.count++;
      if (loginAttempts.count >= 5) {
        loginAttempts.lockedUntil = Date.now() + 30000;
        showAuthError('Too many failed attempts. Login locked for 30 seconds.');
      } else {
        showAuthError('Incorrect username or password.');
      }
      return;
    }

    const isHashedMatch = record.password === hashedPwd;
    const isPlainMatch = String(record.password).trim() === String(password).trim();

    if (!isHashedMatch && !isPlainMatch) {
      loginAttempts.count++;
      if (loginAttempts.count >= 5) {
        loginAttempts.lockedUntil = Date.now() + 30000;
        showAuthError('Too many failed attempts. Login locked for 30 seconds.');
      } else {
        showAuthError('Incorrect username or password.');
      }
      return;
    }
    
    loginAttempts = { count: 0, lockedUntil: 0 };
    
    if (isPlainMatch && !isHashedMatch) {
      try {
        await set(ref(db, 'users/' + resolvedUsername + '/password'), hashedPwd);
      } catch (e) {
        console.warn('Could not auto-migrate password to hash.');
      }
    }

    globalState.currentUser = {
      username: resolvedUsername,
      fullName: record.fullName || resolvedUsername,
      roles: Array.isArray(record.roles) ? record.roles : (record.role ? [record.role] : ['storekeeper']),
      profilePhotoUrl: record.profilePhotoUrl || null
    };
    window.currentUser = globalState.currentUser;
    document.body.dataset.role = globalState.currentUser.roles.join(',');
    saveSession(globalState.currentUser);
    initTopbar();
    listenToCollections();
    showScreen('appScreen');
    navigateTo(getStartupView(globalState.currentUser), true, true);
  } catch (err) {
    console.error('Login error:', err);
    showAuthError('Unable to log in: failed to sync with cloud. (' + (err.message || 'unknown error') + ')');
  } finally {
    btn.disabled = false; btn.textContent = 'Log In';
  }
});

$('#logoutBtn').addEventListener('click', () => {
  if (globalState.unsubIssues) { globalState.unsubIssues(); globalState.unsubIssues = null; }
  if (globalState.unsubTools) { globalState.unsubTools(); globalState.unsubTools = null; }
  if (globalState.unsubRequests) { globalState.unsubRequests(); globalState.unsubRequests = null; }
  if (globalState.unsubToolDeletionRequests) { globalState.unsubToolDeletionRequests(); globalState.unsubToolDeletionRequests = null; }

  // Bug D fix: unsubscribe the login-screen KPI listener to prevent memory
  // leak from accumulating Firebase listeners across login/logout cycles.
  if (loginKpiUnsub) { loginKpiUnsub(); loginKpiUnsub = null; }

  if (clockInterval) {
    clearInterval(clockInterval);
    clockStarted = false;
  }
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
    sessionTimerStarted = false;
  }

  // Bug H fix: reset tool search/filter state so it doesn't bleed into
  // the next user's session on a shared device.
  window.toolsSearchQuery = '';
  window.toolsStatusFilter = 'all';
  window.toolsCategoryFilter = 'all';

  globalState.currentUser = null;
  globalState.currentView = null;
  window.currentUser = null;
  window.currentView = null;
  clearSession();
  showScreen('authScreen');
});

$('#showRequestForm').addEventListener('click', () => {
  clearAuthMessages();
  $('#loginForm').classList.add('hidden'); $('#requestForm').classList.remove('hidden');
  $('#showRequestForm').classList.add('hidden'); $('#showLoginForm').classList.remove('hidden');
});
$('#showLoginForm').addEventListener('click', () => {
  clearAuthMessages();
  $('#requestForm').classList.add('hidden'); $('#loginForm').classList.remove('hidden');
  $('#showLoginForm').classList.add('hidden'); $('#showRequestForm').classList.remove('hidden');
});

$('#requestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthMessages();
  if (!cloudConnected) { showAuthError('Cloud sync is not connected.'); return; }
  const fullName = $('#reqFullName').value.trim();
  const username = $('#reqUsername').value.trim();
  const password = $('#reqPassword').value;
  const btn = $('#reqSubmitBtn');

  if (username.toLowerCase() === ADMIN_USERNAME) { showAuthError(`"${ADMIN_USERNAME}" is reserved and can't be requested as a username.`); return; }
  if (/[.#$\[\]\/\s'"]/.test(username)) { showAuthError('Username can\'t contain spaces, quotes, or the characters . # $ [ ] /'); return; }

  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Submitting…';
  setSyncingState(true);
  try {
    const existingUser = await get(ref(db, 'users/' + username));
    if (existingUser.exists()) { showAuthError('That username is already taken.'); return; }
    const existingReq = await get(ref(db, 'accessRequests/' + username));
    if (existingReq.exists()) { showAuthError('A request for that username is already pending approval.'); return; }
    
    const hashedPwd = await hashPassword(password);
    await set(ref(db, 'accessRequests/' + username), { fullName, password: hashedPwd, requestedAt: serverTimestamp() });

    $('#requestForm').classList.add('hidden'); $('#showLoginForm').classList.add('hidden');
    $('#showRequestForm').classList.remove('hidden');
    showAuthInfo('Request submitted. An Admin needs to approve it before you can log in — check back soon.');
    $('#requestForm').reset();
  } catch (err) {
    showAuthError('Unable to submit request: failed to sync with cloud.');
  } finally {
    setSyncingState(false);
    btn.disabled = false; btn.textContent = 'Submit Request';
  }
});

// Password visibility controls. Event delegation also supports dynamically rendered forms.
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-password-target]');
  if (!button) return;
  const input = document.getElementById(button.dataset.passwordTarget);
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  button.textContent = showing ? 'Show' : 'Hide';
  button.setAttribute('aria-pressed', String(!showing));
  button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'reqPassword') {
    const strength = calculatePasswordStrength(event.target.value);
    const indicator = $('#reqPasswordStrength');
    if (indicator) {
      indicator.textContent = strength.text;
      indicator.style.color = strength.color;
    }
  } else if (event.target.id === 'p_newPassword') {
    const strength = calculatePasswordStrength(event.target.value);
    const indicator = $('#p_newPasswordStrength');
    if (indicator) {
      indicator.textContent = strength.text;
      indicator.style.color = strength.color;
    }
  }
});

/* =========================================================================
   TOPBAR / NAV & MOBILE BOTTOM NAVIGATION
   ========================================================================= */

function updateMobileFab() {
  const fab = $('#mobileFab');
  if (!fab) return;

  const roles = globalState.currentUser?.roles || [];
  const hasStorekeeper = roles.includes('storekeeper') || roles.includes('user') || roles.includes('admin');
  const hasToolsAdmin = roles.includes('tools_admin') || roles.includes('admin');
  const canCreate = hasStorekeeper || hasToolsAdmin;

  // Bug C fix: use 'return-record' (the actual view name) not 'return-new'
  const nonFabViews = ['issue-new', 'add-tool', 'return-record', 'edit-issue', 'edit-return', 'profile', 'settings-admin', 'users-admin'];
  if (!canCreate || nonFabViews.includes(globalState.currentView)) {
    fab.style.display = 'none';
    return;
  }

  fab.style.removeProperty('display');

  if (globalState.currentView === 'tools-dashboard' || (hasToolsAdmin && !hasStorekeeper)) {
    fab.dataset.nav = 'add-tool';
    fab.setAttribute('aria-label', 'Add New Tool');
    fab.setAttribute('title', 'Add New Tool');
  } else {
    fab.dataset.nav = 'issue-new';
    fab.setAttribute('aria-label', 'Issue Material');
    fab.setAttribute('title', 'Issue Material');
  }
}

function renderMobileBottomNav(roles = []) {
  const bottomNav = $('#mobileBottomNav');
  if (!bottomNav) return;

  const links = [];
  const hasAdmin = roles.includes('admin');
  const hasStorekeeper = roles.includes('storekeeper') || roles.includes('user');
  const hasViewer = roles.includes('viewer');
  const hasToolsAdmin = roles.includes('tools_admin');
  const hasToolsViewer = roles.includes('tools_viewer');
  const hasToolsAccess = hasAdmin || hasToolsAdmin || hasToolsViewer;

  if (hasAdmin) {
    links.push(
      ['admin-dashboard', 'Dashboard'],
      ['register', 'Register'],
      ['tools-dashboard', 'Tools'],
      ['users-admin', 'Users'],
      ['settings-admin', 'Settings']
    );
  } else if (hasStorekeeper) {
    links.push(['dashboard', 'Dashboard'], ['register', 'Register']);
    if (hasToolsAccess) {
      links.push(['tools-dashboard', 'Tools']);
    }
    links.push(['profile', 'Profile']);
  } else if (hasViewer) {
    links.push(['dashboard', 'Dashboard'], ['register', 'Register']);
    if (hasToolsAccess) {
      links.push(['tools-dashboard', 'Tools']);
    }
    links.push(['profile', 'Profile']);
  } else if (hasToolsAdmin || hasToolsViewer) {
    links.push(['tools-dashboard', 'Tools'], ['profile', 'Profile']);
  } else {
    links.push(['profile', 'Profile']);
  }

  bottomNav.innerHTML = links.map(([id, label]) => {
    const icon = MOBILE_NAV_ICONS[id] || MOBILE_NAV_ICONS['dashboard'];
    return `<button type="button" class="mobile-nav-item${globalState.currentView === id ? ' active' : ''}" data-view="${id}" aria-label="${label}">
      <span class="mobile-nav-icon">${icon}</span>
      <span class="mobile-nav-label">${label}</span>
    </button>`;
  }).join('');

  bottomNav.querySelectorAll('.mobile-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic(14);
      navigateTo(btn.dataset.view);
    });
  });

  updateMobileFab();
}

export function initTopbar() {
  // Assign the highest-privilege role to data-role so that CSS viewer-only
  // restrictions (e.g. hiding [data-nav="issue-new"]) never incorrectly fire
  // for users who have storekeeper/admin/user in addition to viewer.
  const ROLE_PRIORITY = ['admin', 'storekeeper', 'user', 'tools_admin', 'tools_viewer', 'viewer'];
  const primaryRole = ROLE_PRIORITY.find(r => globalState.currentUser.roles.includes(r)) || globalState.currentUser.roles[0] || 'viewer';
  document.body.dataset.role = primaryRole;
  document.body.dataset.roles = globalState.currentUser.roles.join(' ');

  $('#whoName').textContent = globalState.currentUser.fullName || globalState.currentUser.username;
  $('#whoRole').textContent = globalState.currentUser.roles.join(', ');
  $('#whoRole').className = 'who-role role-' + globalState.currentUser.roles[0];

  if (globalState.currentUser.profilePhotoUrl) {
    $('#topbarAvatar').src = globalState.currentUser.profilePhotoUrl;
    $('#topbarAvatar').classList.remove('hidden');
  } else {
    $('#topbarAvatar').classList.add('hidden');
  }

  updateLoginSyncIndicator(cloudConnected);
  if (!clockStarted) { startLiveClock(); clockStarted = true; }
  if (!sessionTimerStarted) { startSessionTimer(); sessionTimerStarted = true; }

  const nav = $('#navLinks');
  const links = navLinksForRoles(globalState.currentUser.roles);

  nav.innerHTML = links.map(([id, label]) => `<button class="navlink" data-view="${id}">${label}</button>`).join('');
  nav.querySelectorAll('.navlink').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  renderMobileBottomNav(globalState.currentUser.roles);

  if (globalState.currentUser.roles.includes('admin')) {
    if (globalState.unsubRequests) { globalState.unsubRequests(); globalState.unsubRequests = null; }
    globalState.unsubRequests = onValue(ref(db, 'accessRequests'), (snap) => {
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      updatePendingRequestsNavBadge(count);
    }, (err) => console.error('access requests listener error', err));
  }
}

// Wrap only explicit navigation (not background data-sync re-renders) in a
// View Transition so switching pages cross-fades smoothly instead of
// popping instantly. Feature-detected and skipped entirely on browsers
// without support or when the user prefers reduced motion.
function renderTransition() {
  const isMobile = window.innerWidth <= 768;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swap = () => { render(); window.scrollTo(0, 0); };
  if (!isMobile && !reduceMotion && typeof document.startViewTransition === 'function') {
    try { 
      const t = document.startViewTransition(swap); 
      t.updateCallbackDone?.catch(() => {});
      t.ready?.catch(() => {});
      t.finished?.catch(() => {});
      return; 
    } catch (_) { /* fall through */ }
  }
  swap();
}

export async function navigateTo(viewId, updateHistory = true, force = false) {
  if (!force && viewId === globalState.currentView) return;
  if (formDirty) {
    const leave = await appConfirm('You have unsaved changes. Leave this page and discard them?', { title: 'Unsaved Changes', confirmText: 'Leave Page', cancelText: 'Stay' });
    if (!leave) return;
    formDirty = false;
  }
  if (globalState.currentView === 'register' && viewId !== 'register') {
    registerStickyObserver?.disconnect();
    registerStickyObserver = null;
  }
  selectedPhotoFiles = [];
  returnSelectedPhotoFiles = [];
  editReturnSelectedPhotoFiles = [];
  editIssueSelectedPhotoFiles = [];
  profileSelectedPhotoFile = null;
  issueFormError = '';
  editIssueError = '';
  returnFormError = '';
  editReturnError = '';
  userFormError = '';

  globalState.currentView = viewId;
  if (updateHistory && window.location.hash !== '#' + viewId) {
    try {
      history.pushState({ view: viewId }, '', '#' + viewId);
    } catch { /* ignore */ }
  }
  $$('.navlink').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === viewId));
  $$('.mobile-nav-item').forEach((btn) => btn.classList.toggle('active', btn.dataset.view === viewId));
  updateMobileFab();
  renderTransition();
}

// Android Back Button and Browser History Handler
window.addEventListener('popstate', (e) => {
  if (!globalState.currentUser) return;
  const target = (e.state && e.state.view) || (window.location.hash ? window.location.hash.replace('#', '').trim() : getHomeView(globalState.currentUser));
  if (target && target !== globalState.currentView) {
    navigateTo(target, false);
  }
});

function snapshotToArray(snap) {
  const val = snap.val();
  if (!val) return [];
  return Object.keys(val).map((key) => ({ id: key, ...val[key] }));
}
async function writeAudit(action, issueId, details = {}) {
  if (!db || !globalState.currentUser) return false;
  try {
    await set(push(ref(db, 'auditLog')), { action, issueId: issueId || null, details, actorUsername: globalState.currentUser.username, actorName: globalState.currentUser.fullName || globalState.currentUser.username, actorRole: globalState.currentUser.roles.join(','), createdAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.warn('Audit log was not saved; primary activity remains valid:', error);
    return false;
  }
}
function friendlySaveError(error, activity = 'save this activity') {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '');
  if (code.includes('permission') || message.toLowerCase().includes('permission_denied') || message.toLowerCase().includes('permission denied')) return `Firebase permission denied. The application is not allowed to ${activity}. Firebase rules must permit the issue fields and returnHistory path in the same atomic update. No partial record was saved.`;
  if (code.includes('network') || message.toLowerCase().includes('network')) return `Network connection failed while trying to ${activity}. Check the internet connection and retry.`;
  return `Could not ${activity}: ${message || 'unknown error'}`;
}


// Views with a live <form> the user could be mid-typing in. A background data
// sync shouldn't blow these away — globalState.issuesCache still updates immediately, the
// visible DOM just isn't force-refreshed until the user navigates away.
const FORM_VIEWS = new Set(['issue-new', 'return-record', 'edit-issue', 'edit-return', 'profile', 'users-admin', 'add-tool', 'edit-tool']);

// -------------------------------------------------------------------------
// Realtime Database Listeners (Completely Separate Paths & Collections)
// 1. Material Issue Register -> `issues/` (populates `globalState.issuesCache`)
// 2. Tool Register           -> `tools/`  (populates `globalState.toolsCache`)
// There is NO joining, foreign key linking, or cross-dependency between them.
// -------------------------------------------------------------------------
export function listenToCollections() {
  if (globalState.unsubIssues) { globalState.unsubIssues(); globalState.unsubIssues = null; }
  if (globalState.unsubTools) { globalState.unsubTools(); globalState.unsubTools = null; }
  if (globalState.unsubToolDeletionRequests) { globalState.unsubToolDeletionRequests(); globalState.unsubToolDeletionRequests = null; }

  if (!db) return;

  globalState.unsubIssues = onValue(ref(db, 'issues'), (snap) => {
    globalState.issuesCache = snapshotToArray(snap).sort((a, b) => (b.issueDate || '').localeCompare(a.issueDate || ''));
    issuesLoaded = true;
    updateOverdueTopbarBadge();
    checkAndNotifyOverdueIssues();
    if (!FORM_VIEWS.has(globalState.currentView)) render();
  }, (err) => {
    // Bug fix: was console.warn (silent) — .info/connected can report
    // "connected" while THIS listener is denied (e.g. expired/edited
    // Firebase rules), leaving the register empty with no visible error.
    // console.error is captured into Admin > Settings > Detailed Error Log;
    // the toast tells whoever is using the app right now, admin or not.
    console.error('Issues sync listener error:', err);
    if (typeof showToast === 'function') showToast('Material register failed to sync from the cloud: ' + (err.message || err.code || 'permission error'), { title: 'Cloud Sync Error', type: 'error', duration: 6000 });
  });
  
  globalState.unsubTools = onValue(ref(db, 'tools'), (snap) => {
    globalState.toolsCache = snapshotToArray(snap).sort((a, b) => (a.toolName || '').localeCompare(b.toolName || ''));
    toolsLoaded = true;
    if (!FORM_VIEWS.has(globalState.currentView)) render();
  }, (err) => {
    // Bug fix: was console.warn (silent) — see note on the issues listener above.
    console.error('Tools sync listener error:', err);
    if (typeof showToast === 'function') showToast('Tool register failed to sync from the cloud: ' + (err.message || err.code || 'permission error'), { title: 'Cloud Sync Error', type: 'error', duration: 6000 });
  });

  if (globalState.currentUser?.roles?.includes('admin')) {
    globalState.unsubToolDeletionRequests = onValue(ref(db, 'toolDeletionRequests'), (snap) => {
      globalState.toolDeletionRequestsCache = snapshotToArray(snap);
      if (!FORM_VIEWS.has(globalState.currentView)) render();
    }, (err) => {
      console.error('Tool deletion requests sync listener error:', err);
      globalState.toolDeletionRequestsCache = [];
    });
    
    if (globalState.unsubToolAdditionRequests) { globalState.unsubToolAdditionRequests(); globalState.unsubToolAdditionRequests = null; }
    globalState.unsubToolAdditionRequests = onValue(ref(db, 'toolAdditionRequests'), (snap) => {
      globalState.toolAdditionRequestsCache = snapshotToArray(snap);
      if (!FORM_VIEWS.has(globalState.currentView)) render();
    }, (err) => {
      console.error('Tool addition requests sync listener error:', err);
      globalState.toolAdditionRequestsCache = [];
    });

    if (globalState.unsubToolQuantityRequests) { globalState.unsubToolQuantityRequests(); globalState.unsubToolQuantityRequests = null; }
    globalState.unsubToolQuantityRequests = onValue(ref(db, 'toolQuantityRequests'), (snap) => {
      globalState.toolQuantityRequestsCache = snapshotToArray(snap);
      if (!FORM_VIEWS.has(globalState.currentView)) render();
    }, (err) => {
      console.error('Tool quantity requests sync listener error:', err);
      globalState.toolQuantityRequestsCache = [];
    });
  }
}

function statusOf(issue) { const returned = issue.qtyReturned || 0; if (returned >= issue.qtyIssued) return 'Returned'; if (returned > 0) return 'Partially Returned'; return 'Issued'; }

function enrichedIssues() {
  return globalState.issuesCache.map((i) => {
    const displayName = i.materialName || '(unnamed)';
    return { ...i, materialName: displayName, status: statusOf(i) };
  });
}

// =========================================================================
// OVERDUE FOLLOW-UP & DEVICE NOTIFICATION ENGINE (> 7 DAYS)
// =========================================================================
function getOverdueIssues(thresholdDays = 7) {
  const now = Date.now();
  const oneDayMs = 86400000;
  const thresholdMs = thresholdDays * oneDayMs;
  const overdue = [];

  for (let i = 0; i < globalState.issuesCache.length; i++) {
    const issue = globalState.issuesCache[i];
    const qtyIssued = Number(issue.qtyIssued) || 0;
    const qtyReturned = Number(issue.qtyReturned) || 0;
    if (qtyReturned >= qtyIssued) continue;

    let issueTime = 0;
    if (issue.issueDate) {
      const parts = String(issue.issueDate).split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          issueTime = new Date(y, m, d).getTime();
        }
      }
    }
    if (!issueTime && issue.createdAt) {
      issueTime = Number(issue.createdAt) || 0;
    }
    if (!issueTime) continue;

    const diff = now - issueTime;
    if (diff >= thresholdMs) {
      const daysAgo = Math.max(1, Math.floor(diff / oneDayMs));
      const daysOverdue = Math.max(0, daysAgo - thresholdDays);
      overdue.push({
        ...issue,
        materialName: issue.materialName || '(unnamed)',
        status: statusOf(issue),
        daysAgo,
        daysOverdue,
        qtyRemaining: Math.max(0, qtyIssued - qtyReturned)
      });
    }
  }

  return overdue.sort((a, b) => b.daysAgo - a.daysAgo);
}

function getNotificationPermissionLabel() {
  if (!('Notification' in window)) return 'Not Supported';
  const p = Notification.permission;
  if (p === 'granted') return 'Active & Allowed';
  if (p === 'denied') return 'Blocked / Denied';
  return 'Not Enabled (Tap to enable)';
}

function getNotificationPermissionColor() {
  if (!('Notification' in window)) return 'var(--text-muted)';
  const p = Notification.permission;
  if (p === 'granted') return 'var(--good, #10b981)';
  if (p === 'denied') return 'var(--bad, #ef4444)';
  return 'var(--warn-dark, #b45309)';
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    await appAlert('This browser or device does not support Web Notifications.', { title: 'Not Supported', type: 'warn' });
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      showToast('Device notifications enabled. You will receive alerts for overdue items.', { title: 'Notifications Allowed', type: 'success' });
      checkAndNotifyOverdueIssues(true);
      render();
      return true;
    } else if (permission === 'denied') {
      await appAlert('Notification permission is blocked. You can enable notifications in your browser or mobile site settings.', { title: 'Permission Denied', type: 'warn' });
      render();
      return false;
    }
  } catch (err) {
    console.warn('Notification permission error:', err);
  }
  return false;
}

function showNativeNotification(title, options = {}) {
  const defaultOpts = {
    icon: './icon-192.png',
    badge: './icon.svg',
    vibrate: [200, 100, 200],
    ...options
  };

  if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(reg => {
      if (reg && typeof reg.showNotification === 'function') {
        return reg.showNotification(title, defaultOpts);
      }
      try { new Notification(title, defaultOpts); } catch { /* ignore */ }
    }).catch(() => {
      try { new Notification(title, defaultOpts); } catch { /* ignore */ }
    });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, defaultOpts); } catch { /* ignore */ }
  }
}

async function checkAndNotifyOverdueIssues(force = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const overdue = getOverdueIssues(7);
  if (overdue.length === 0) {
    if (force) {
      showNativeNotification('Store Follow-up: All Up to Date', {
        body: 'No issued tools or materials are overdue past 7 days right now!',
        tag: 'cmm-overdue-clean'
      });
    }
    return;
  }

  const lastNotifyTime = Number(localStorage.getItem('cmm_last_overdue_notify_time') || 0);
  const now = Date.now();
  // Auto-alert throttle: at most once every 12 hours unless triggered manually
  if (!force && (now - lastNotifyTime < 12 * 60 * 60 * 1000)) return;

  const topItem = overdue[0];
  const othersCount = overdue.length - 1;
  const title = `⚠️ ${overdue.length} Overdue Store ${overdue.length === 1 ? 'Item' : 'Items'} (>7 Days)`;
  const body = `${topItem.materialName} (${topItem.supervisorName ? `Issued to ${topItem.supervisorName} ` : ''}${topItem.daysAgo}d ago)${othersCount > 0 ? ` and ${othersCount} other items pending return.` : ' is pending return. Tap to review.'}`;

  showNativeNotification(title, {
    body,
    tag: 'cmm-overdue-followup',
    data: { action: 'open-overdue', url: './#overdue' }
  });
  localStorage.setItem('cmm_last_overdue_notify_time', String(now));
}

function updateOverdueTopbarBadge() {
  const overdue = getOverdueIssues(7);
  const btn = $('#topbarOverdueBtn');
  const countEl = $('#topbarOverdueCount');
  
  if (navigator.setAppBadge) {
    if (overdue.length > 0) navigator.setAppBadge(overdue.length).catch(() => {});
    else navigator.clearAppBadge().catch(() => {});
  }

  if (!btn || !countEl) return;
  if (overdue.length > 0) {
    btn.classList.remove('hidden');
    countEl.textContent = overdue.length > 99 ? '99+' : overdue.length;
  } else {
    btn.classList.add('hidden');
  }
}

function updateRequestsTopbarBadge() {
  const btn = $('#topbarRequestsBtn');
  const countEl = $('#topbarRequestsCount');
  if (!btn || !countEl || !globalState.currentUser) return;

  const isAdmin = globalState.currentUser.roles.includes('admin');
  const isToolsAdmin = globalState.currentUser.roles.includes('tools_admin') && !isAdmin;

  if (!isAdmin && !isToolsAdmin) {
    btn.classList.add('hidden');
    return;
  }

  let addReqs, qtyReqs, delReqs;

  if (isAdmin) {
    addReqs = globalState.toolAdditionRequestsCache.length;
    qtyReqs = globalState.toolQuantityRequestsCache.length;
    delReqs = globalState.toolDeletionRequestsCache.length;
  } else {
    addReqs = globalState.toolAdditionRequestsCache.filter(r => r.requestedBy === globalState.currentUser.username || r.createdBy === globalState.currentUser.username).length;
    qtyReqs = globalState.toolQuantityRequestsCache.filter(r => r.requestedBy === globalState.currentUser.username).length;
    delReqs = globalState.toolDeletionRequestsCache.filter(r => r.requestedBy === globalState.currentUser.username).length;
  }

  const total = addReqs + qtyReqs + delReqs;

  if (total > 0) {
    btn.classList.remove('hidden');
    countEl.textContent = total > 99 ? '99+' : total;
  } else {
    btn.classList.add('hidden');
  }
}

function renderOverdueBannerHtml() {
  const overdue = getOverdueIssues(7);
  if (!overdue.length) return '';
  return `
    <div class="overdue-alert-banner">
      <div class="overdue-alert-icon">⚠️</div>
      <div class="overdue-alert-content">
        <strong>${overdue.length} ${overdue.length === 1 ? 'Item' : 'Items'} Overdue for Return (> 7 Days)</strong>
        <p>Issued items have not been returned for more than a week. Follow up with supervisors to confirm return status.</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm overdue-banner-action" id="overdueBannerFollowUpBtn">
        Follow Up Now (${overdue.length}) →
      </button>
    </div>
  `;
}

function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (monthIdx >= 0 && monthIdx < 12 && !isNaN(day)) {
    return `${day} ${months[monthIdx]} ${parts[0]}`;
  }
  return dateStr;
}

function openOverdueFollowUpModal() {
  const overdue = getOverdueIssues(7);
  const listEl = $('#overdueFollowUpList');
  const subEl = $('#overdueModalSubtitle');
  const countBadgeEl = $('#overdueCountBadge');

  if (countBadgeEl) {
    countBadgeEl.textContent = `${overdue.length} Overdue`;
  }
  if (subEl) {
    subEl.textContent = `${overdue.length} ${overdue.length === 1 ? 'item' : 'items'} issued over 7 days ago pending return.`;
  }

  if (listEl) {
    if (overdue.length === 0) {
      listEl.innerHTML = `
        <div class="overdue-empty-state">
          <div class="overdue-empty-icon">✅</div>
          <strong class="overdue-empty-title">All issued items are up to date!</strong>
          <p class="overdue-empty-text">No materials or tools are currently pending return past the 7-day threshold.</p>
        </div>
      `;
    } else {
      listEl.innerHTML = overdue.map(item => `
        <div class="overdue-card-item">
          <div class="overdue-card-top">
            <div class="overdue-card-name-group">
              <div class="overdue-item-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div class="overdue-card-title-wrap">
                <strong class="overdue-card-title">${escapeHtml(item.materialName)}</strong>
                ${item.id ? `<span class="overdue-card-code">#${escapeHtml(item.id.slice(-6).toUpperCase())}</span>` : ''}
              </div>
            </div>
            <div class="overdue-badge-pill">
              <span class="overdue-badge-dot"></span>
              <span class="overdue-badge-text">${item.daysAgo}d ago (${item.daysOverdue}d overdue)</span>
            </div>
          </div>

          <div class="overdue-meta-chips">
            <div class="overdue-chip">
              <span class="overdue-chip-label">Pending:</span>
              <strong class="overdue-chip-value">${item.qtyRemaining} <span class="overdue-chip-total">/ ${item.qtyIssued}</span></strong>
            </div>
            <div class="overdue-chip">
              <span class="overdue-chip-label">Area:</span>
              <strong class="overdue-chip-value">${escapeHtml(item.area || '—')}</strong>
            </div>
            <div class="overdue-chip">
              <span class="overdue-chip-label">Issued:</span>
              <strong class="overdue-chip-value">${formatShortDate(item.issueDate)}</strong>
            </div>
          </div>

          <div class="overdue-contact-card">
            <div class="overdue-supervisor-info">
              <div class="overdue-avatar">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="overdue-supervisor-text">
                <span class="overdue-supervisor-name">${escapeHtml(item.supervisorName || 'Unassigned')}</span>
                ${item.vendor ? `<span class="overdue-supervisor-vendor">(${escapeHtml(item.vendor)})</span>` : ''}
              </div>
            </div>
            <div class="overdue-contact-action">
              ${item.supervisorContact ? `
                ${(() => {
                  const rawDigits = String(item.supervisorContact || '').replace(/[^0-9]/g, '');
                  if (!rawDigits) return '';
                  const waPhone = rawDigits.length === 10 ? '91' + rawDigits : rawDigits;
                  const waMsg = `Hello ${item.supervisorName || 'Sir/Madam'},\n\nThis is a reminder from CMM SMS Store regarding the following overdue item:\n📦 Material: ${item.materialName}\n🔢 Pending Qty: ${item.qtyRemaining} / ${item.qtyIssued}\n📅 Issued Date: ${formatShortDate(item.issueDate)} (${item.daysAgo} days ago)\n📍 Area: ${item.area || 'N/A'}\n\nPlease arrange for its return to the store at the earliest.\nThank you!`;
                  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`;
                  return `
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="overdue-wa-pill-btn" title="Send WhatsApp Reminder to ${escapeHtml(item.supervisorName)} (${escapeHtml(item.supervisorContact)})">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.21 8.21 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.01-1.24-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  `;
                })()}
                <a href="tel:${escapeHtml(item.supervisorContact)}" class="overdue-call-pill-btn" title="Call ${escapeHtml(item.supervisorName)} (${escapeHtml(item.supervisorContact)})">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>Call</span>
                </a>
              ` : `
                <span class="overdue-no-phone">No phone</span>
              `}
            </div>
          </div>

          <div class="overdue-card-btns">
            <button type="button" class="btn btn-ghost btn-sm overdue-action-view" data-overdue-view-issue="${item.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>View Details</span>
            </button>
            ${(globalState.currentUser && (globalState.currentUser.roles.includes('admin') || globalState.currentUser.roles.includes('storekeeper') || globalState.currentUser.roles.includes('user'))) ? `
              <button type="button" class="btn btn-dark btn-sm overdue-action-return" data-overdue-record-return="${item.id}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 14 4 9 9 4"/>
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                </svg>
                <span>Record Return</span>
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  // Wire inner card buttons
  $$('[data-overdue-view-issue]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.overdueViewIssue;
      closeOverdueFollowUpModal();
      registerFilterState.q = '';
      registerFilterState.status = 'all';

      // Find exact page containing this issue
      const all = typeof enrichedIssues === 'function' ? enrichedIssues() : globalState.issuesCache;
      const itemIndex = all.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        registerFilterState.page = Math.floor(itemIndex / REG_PAGE_SIZE) + 1;
      } else {
        registerFilterState.page = 1;
      }

      registerExpandedRows.add(id);
      saveRegisterPreferences();
      if (globalState.currentView === 'register') {
        render();
      } else {
        navigateTo('register');
      }
      setTimeout(() => {
        const row = document.querySelector(`tr[data-register-id="${CSS.escape(id)}"]`);
        if (row) {
          row.classList.add('mobile-expanded');
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.style.animation = 'highlightRow 2.2s ease';
        }
      }, 250);
    });
  });

  $$('[data-overdue-record-return]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.overdueRecordReturn;
      closeOverdueFollowUpModal();
      returnFormTargetId = id;
      returnFormError = '';
      navigateTo('return-record');
    });
  });

  $('#overdueFollowUpDialog')?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeOverdueFollowUpModal() {
  $('#overdueFollowUpDialog')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function render() {
  if (!globalState.currentUser) return;

  const main = $('#appMain');
  const adminOnlyViews = ['admin-dashboard', 'users-admin', 'settings-admin', 'edit-return'];

  let validViews = ['profile'];
  if (globalState.currentUser.roles.includes('admin')) {
    validViews.push('admin-dashboard', 'users-admin', 'settings-admin', 'edit-return', 'register', 'tools-dashboard', 'add-tool', 'edit-tool', 'dashboard');
  }
  if (globalState.currentUser.roles.includes('user') || globalState.currentUser.roles.includes('storekeeper') || globalState.currentUser.roles.includes('viewer')) {
    validViews.push('dashboard', 'register');
    if (!globalState.currentUser.roles.includes('viewer') || globalState.currentUser.roles.includes('storekeeper')) {
      validViews.push('issue-new', 'return-record', 'edit-issue', 'edit-return');
    }
  }
  if (globalState.currentUser.roles.includes('tools_admin')) {
    validViews.push('tools-dashboard', 'add-tool', 'edit-tool');
  } else if (globalState.currentUser.roles.includes('tools_viewer')) {
    validViews.push('tools-dashboard');
  }
  if (!validViews.includes(globalState.currentView)) {
    globalState.currentView = getHomeView(globalState.currentUser);
  }

  window.currentView = globalState.currentView;
  window.currentUser = globalState.currentUser;

  const views = {
    'dashboard': renderUserDashboard,
    'profile': renderProfile,
    'admin-dashboard': renderAdminDashboard,
    'register': renderRegister,
    'issue-new': renderIssueForm,
    'users-admin': renderUsersAdmin,
    'settings-admin': renderSettingsAdmin,
    'return-record': renderReturnForm,
    'edit-return': renderEditReturnForm,
    'edit-issue': renderEditIssueForm,
    'tools-dashboard': renderToolsDashboard,
    'add-tool': renderAddToolForm,
    'edit-tool': renderEditToolForm,
  };

  const fn = views[globalState.currentView] || (globalState.currentUser.roles.includes('admin') ? renderAdminDashboard : renderUserDashboard);
  const html = fn();
  if (typeof html === 'string') main.innerHTML = html;
  wireViewEvents(globalState.currentView);
  updateOverdueTopbarBadge();
  updateRequestsTopbarBadge();
}

function statsSummary() {
  let pending = 0;
  let returned = 0;
  const total = globalState.issuesCache.length;
  for (let i = 0; i < total; i++) {
    const isRet = (globalState.issuesCache[i].qtyReturned || 0) >= (globalState.issuesCache[i].qtyIssued || 0);
    if (isRet) returned++;
    else pending++;
  }
  return { total, pending, returned };
}

// Before the first real-time snapshot arrives, globalState.issuesCache is genuinely empty —
// showing "0" for every KPI reads as "there are no records" rather than
// "still loading", which is misleading. Show a small spinner instead until
// we know the real numbers.
function kpiValue(n) {
  return issuesLoaded ? String(n) : '<span class="spinner" aria-label="Loading"></span>';
}

function renderUserDashboard() {
  const s = statsSummary();
  const canIssue = globalState.currentUser.roles.includes('admin') || globalState.currentUser.roles.includes('storekeeper') || globalState.currentUser.roles.includes('user');
  const canManageTools = globalState.currentUser.roles.includes('admin') || globalState.currentUser.roles.includes('tools_admin');
  const canViewTools = globalState.currentUser.roles.includes('admin') || globalState.currentUser.roles.includes('tools_admin') || globalState.currentUser.roles.includes('tools_viewer');
  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Store Overview</span>
        <h1>Dashboard</h1>
        <div class="page-sub">Live status of the material issue &amp; return register.</div>
      </div>
    </div>
    ${renderOverdueBannerHtml()}
    <div class="kpi-grid">
      <button type="button" class="kpi kpi-button" data-kpi-status="all" aria-label="Show all ${s.total} register entries"><div class="kpi-label">Total Entries</div><div class="kpi-value">${kpiValue(s.total)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi warn kpi-button" data-kpi-status="pending" aria-label="Show ${s.pending} pending return entries"><div class="kpi-label">Pending Return</div><div class="kpi-value">${kpiValue(s.pending)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi good kpi-button" data-kpi-status="returned" aria-label="Show ${s.returned} returned entries"><div class="kpi-label">Returned</div><div class="kpi-value">${kpiValue(s.returned)}</div><span class="kpi-open-hint">View records →</span></button>
    </div>
    <div class="panel panel-pad">
      <h2 style="margin-top:0;">Quick actions</h2>
      <div class="actions-row">
        ${canIssue ? `<button class="btn btn-dark" data-nav="issue-new">Log a New Issue</button>` : ''}
        <button class="btn btn-ghost" data-nav="register">View Full Register</button>
        ${canManageTools ? `<button class="btn btn-dark" data-nav="add-tool">Enter New Tool Details</button>` : (canViewTools ? `<button class="btn btn-ghost" data-nav="tools-dashboard">Tools Master List</button>` : '')}
      </div>
    </div>`;
}

function renderProfile() {
  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDJDMi40OCAyIDIgMi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMyMS41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMiAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4=';
  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Account</span>
        <h1>My Profile</h1>
        <div class="page-sub">Manage your storekeeper account details.</div>
      </div>
    </div>
    <div class="panel panel-pad" style="max-width:600px;">
      <form id="profileForm">
        <div class="form-grid">
          <div class="field full" style="display:flex; flex-direction:column; align-items:center; gap:16px;">
            <img id="p_avatarPreview" src="${globalState.currentUser.profilePhotoUrl || placeholderSvg}" class="avatar" style="width:80px; height:80px; border-width:3px;" />
            <div>
              <input type="file" id="p_photo" accept="image/*" style="display:none;" />
              <button type="button" class="btn btn-ghost btn-sm" id="profileChoosePhotoBtn">Choose Profile Photo</button>
            </div>
          </div>
          <div class="field">
            <label>Username</label>
            <input type="text" value="${escapeHtml(globalState.currentUser.username)}" disabled />
          </div>
          <div class="field">
            <label>Full Name</label>
            <input type="text" value="${escapeHtml(globalState.currentUser.fullName)}" disabled />
          </div>
        </div>
        <p style="margin:12px 0 0; font-size:12.5px; color:var(--text-muted);">Username and full name are set by an Admin. You can update your password and profile photo here.</p>
        <div class="actions-row" style="margin-top:32px;">
          <button type="submit" class="btn btn-primary" id="profileSubmitBtn">Save Profile Photo</button>
        </div>
      </form>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">Mobile &amp; Overdue Notifications</h2>
      <p style="margin:0 0 14px; font-size:13.5px; color:var(--text-muted);">
        Receive push and device alerts for tools and materials issued more than 7 days ago that remain unreturned.
      </p>
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px; padding:12px 14px; background:var(--surface-sunken, #f1f5f9); border-radius:var(--radius-md, 8px);">
        <div>
          <span style="font-size:12px; font-weight:600; color:var(--text-muted); display:block;">Device Notification Status</span>
          <strong style="font-size:14px; color:${getNotificationPermissionColor()};">${getNotificationPermissionLabel()}</strong>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn btn-primary btn-sm" id="enableNotificationsBtn">
            ${('Notification' in window && Notification.permission === 'granted') ? 'Re-check Permission' : 'Enable Notifications'}
          </button>
          ${('Notification' in window && Notification.permission === 'granted') ? `
            <button type="button" class="btn btn-ghost btn-sm" id="testNotificationBtn">Send Test Alert</button>
          ` : ''}
        </div>
      </div>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">App Preferences</h2>
      <div class="field" style="max-width:320px;">
        <label for="homeViewSelect">Default landing page</label>
        <select id="homeViewSelect">${homeViewSelectHtml()}</select>
      </div>
      <p style="margin:10px 0 0; font-size:12.5px; color:var(--text-muted);">Choose which page opens automatically when you log in.</p>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">Install App (PWA)</h2>
      <p style="margin:0 0 14px; font-size:13.5px; color:var(--text-muted);">
        Install CMM SMS Store on your mobile or desktop device for fast, full-screen standalone access and quick action shortcuts.
      </p>
      <div id="profilePwaStatusArea">
        <button type="button" class="btn btn-primary" id="profilePwaInstallBtn" style="display:inline-flex; align-items:center; gap:8px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Install App to Home Screen
        </button>
      </div>
    </div>

    <div class="panel panel-pad" style="max-width:600px; margin-top:24px;">
      <h2 style="margin-top:0;">Change Password</h2>
      <div class="alert alert-error${profilePasswordError ? '' : ' hidden'}" id="profilePasswordAlert" role="alert">${escapeHtml(profilePasswordError)}</div>
      <form id="profilePasswordForm">
        <div class="form-grid">
          <div class="field full">
            <label for="p_currentPassword">Current Password</label>
            <div class="password-field-wrap">
              <input type="password" id="p_currentPassword" required autocomplete="current-password" />
              <button type="button" class="password-toggle-btn" data-password-target="p_currentPassword" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
          <div class="field full">
            <label for="p_newPassword">New Password</label>
            <div class="password-field-wrap">
              <input type="password" id="p_newPassword" required minlength="4" autocomplete="new-password" />
              <button type="button" class="password-toggle-btn" data-password-target="p_newPassword" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
            <div class="password-strength" id="p_newPasswordStrength" style="margin-top:6px; font-size:12px; font-weight:600;"></div>
          </div>
          <div class="field full">
            <label for="p_confirmPassword">Confirm New Password</label>
            <div class="password-field-wrap">
              <input type="password" id="p_confirmPassword" required minlength="4" autocomplete="new-password" />
              <button type="button" class="password-toggle-btn" data-password-target="p_confirmPassword" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
        </div>
        <div class="actions-row" style="margin-top:32px;">
          <button type="submit" class="btn btn-primary" id="profilePasswordSubmitBtn">Update Password</button>
        </div>
      </form>
    </div>
  `;
}

function renderAdminDashboard() {
  const s = statsSummary();
  const delReqCount = globalState.toolDeletionRequestsCache.length;
  const delBanner = delReqCount > 0 ? 
    `<div class="overdue-banner" style="background:var(--bad-light); border:1px solid var(--bad); color:var(--bad-dark); padding:12px 16px; border-radius:12px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between;">
      <div style="display:flex; align-items:center; gap:12px;">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong style="display:block; font-size:15px; margin-bottom:2px;">Tool Deletion Requests Pending</strong>
          <span style="font-size:13px; opacity:0.9;">There ${delReqCount === 1 ? 'is' : 'are'} ${delReqCount} tool deletion request${delReqCount === 1 ? '' : 's'} awaiting admin approval.</span>
        </div>
      </div>
      <button class="btn btn-dark btn-sm" data-nav="tools-dashboard">Review</button>
    </div>` : '';

  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Administrator</span>
        <h1>Admin Dashboard</h1>
        <div class="page-sub">Store-wide overview and management tools.</div>
      </div>
    </div>
    ${renderOverdueBannerHtml()}
    ${delBanner}
    <div class="kpi-grid">
      <button type="button" class="kpi kpi-button" data-kpi-status="all" aria-label="Show all ${s.total} register entries"><div class="kpi-label">Total Entries</div><div class="kpi-value">${kpiValue(s.total)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi warn kpi-button" data-kpi-status="pending" aria-label="Show ${s.pending} pending return entries"><div class="kpi-label">Pending Return</div><div class="kpi-value">${kpiValue(s.pending)}</div><span class="kpi-open-hint">View records →</span></button>
      <button type="button" class="kpi good kpi-button" data-kpi-status="returned" aria-label="Show ${s.returned} returned entries"><div class="kpi-label">Returned</div><div class="kpi-value">${kpiValue(s.returned)}</div><span class="kpi-open-hint">View records →</span></button>
    </div>
    <div class="actions-row">
      <button class="btn btn-dark" data-nav="register">Manage Full Register</button>
      <button class="btn btn-ghost" data-nav="users-admin">Manage Users</button>
      <button class="btn btn-ghost" data-nav="settings-admin">Settings</button>
    </div>`;
}

function formatTimestamp(ms) {
  if (!ms || typeof ms !== 'number') return 'Syncing...';

  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function saveRegisterPreferences() { try { localStorage.setItem(REGISTER_PREFS_KEY, JSON.stringify({ filters: registerFilterState, expanded: registerViewExpanded, more: registerMoreFiltersOpen, filtersOpen: registerFiltersOpen })); } catch { /* ignore */ } }
function loadRegisterPreferences() { try { const p = JSON.parse(localStorage.getItem(REGISTER_PREFS_KEY) || 'null'); if (p?.filters) registerFilterState = { ...registerFilterState, ...p.filters, page: 1 }; if (typeof p?.expanded === 'boolean') registerViewExpanded = p.expanded; if (typeof p?.more === 'boolean') registerMoreFiltersOpen = p.more; if (typeof p?.filtersOpen === 'boolean') registerFiltersOpen = p.filtersOpen; } catch { /* ignore */ } }
function resetRegisterPreferences() { try { localStorage.removeItem(REGISTER_PREFS_KEY); } catch { /* ignore */ } resetRegisterFilters(); registerViewExpanded = false; registerMoreFiltersOpen = false; registerFiltersOpen = false; registerExpandedRows.clear(); }
function showToast(message, { title = 'Done', type = 'success', duration = 3500, actionText = '', onAction = null } = {}) {
  const region = $('#toastRegion'); if (!region) return;
  const icons = {
    success: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>',
    danger: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    error: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    warning: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    warn: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>',
    info: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'
  };
  const normType = (type === 'danger' || type === 'error') ? 'danger' : (type === 'warning' || type === 'warn') ? 'warning' : type === 'info' ? 'info' : 'success';
  const el = document.createElement('section');
  el.className = 'toast'; el.dataset.type = normType; el.setAttribute('role', normType === 'danger' ? 'alert' : 'status'); el.style.setProperty('--toast-duration', `${duration}ms`);
  const closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  el.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[normType] || icons.success}</span><div class="toast-copy"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>${actionText ? `<div class="toast-actions"><button type="button" class="toast-action">${escapeHtml(actionText)}</button></div>` : ''}</div><button type="button" class="toast-close" aria-label="Dismiss notification">${closeSvg}</button><span class="toast-progress" aria-hidden="true"><span class="toast-progress-fill"></span></span>`;
  let timer = null, remaining = duration, started = 0, paused = false, hovered = false, focused = false, isTouching = false;
  const close = () => { if (!el.isConnected || el.classList.contains('is-leaving')) return; clearTimeout(timer); el.classList.add('is-leaving'); setTimeout(() => el.remove(), 220) };
  const startTimer = () => { if (paused || !el.isConnected) return; clearTimeout(timer); started = Date.now(); timer = setTimeout(close, remaining) };
  const pauseTimer = () => { if (paused) return; paused = true; clearTimeout(timer); remaining = Math.max(250, remaining - (Date.now() - started)); el.classList.add('is-paused'); };
  const resumeIfReady = () => { if (hovered || focused || isTouching) return; paused = false; el.classList.remove('is-paused'); startTimer() };
  el.querySelector('.toast-close').addEventListener('click', close);
  el.querySelector('.toast-action')?.addEventListener('click', () => { try { onAction?.() } finally { close() } });
  el.addEventListener('mouseenter', () => { hovered = true; pauseTimer() });
  el.addEventListener('mouseleave', () => { hovered = false; resumeIfReady() });
  el.addEventListener('focusin', () => { focused = true; pauseTimer() });
  el.addEventListener('focusout', (event) => { if (el.contains(event.relatedTarget)) return; focused = false; resumeIfReady() });
  let startX = 0, startY = 0;
  el.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    isTouching = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    pauseTimer();
  }, { passive: true });
  el.addEventListener('touchend', (e) => {
    isTouching = false;
    if (!e.changedTouches || !e.changedTouches[0]) { resumeIfReady(); return; }
    const endX = e.changedTouches[0].clientX, endY = e.changedTouches[0].clientY;
    if (Math.abs(endX - startX) > 60 || (startY - endY) > 40) close();
    else resumeIfReady();
  }, { passive: true });
  el.addEventListener('touchcancel', () => {
    isTouching = false;
    resumeIfReady();
  }, { passive: true });
  try { if (navigator.vibrate) navigator.vibrate(normType === 'danger' ? [20, 30, 20] : 15); } catch { /* ignore */ }
  region.appendChild(el);
  const activeToasts = Array.from(region.querySelectorAll('.toast:not(.is-leaving)'));
  if (activeToasts.length > 3) {
    for (let i = 0; i < activeToasts.length - 3; i++) {
      const old = activeToasts[i];
      if (old && old !== el) {
        old.classList.add('is-leaving');
        setTimeout(() => old.remove(), 220);
      }
    }
  }
  startTimer();
}
window.showToast = showToast;
function setFormDirty(value = true) { formDirty = value; document.querySelector('.page-head h1')?.classList.toggle('has-unsaved', value); }
function isRegisterRowExpanded(id) { const overridden = registerExpandedRows.has(String(id)); return overridden ? !registerViewExpanded : registerViewExpanded; }
function syncRegisterStickyOffset() { const t = $('#registerViewToolbar'), h = document.querySelector('.topbar'); if (!t || !h) return; const apply = () => document.documentElement.style.setProperty('--register-sticky-top', `${Math.ceil(h.getBoundingClientRect().height) + 6}px`); apply(); registerStickyObserver?.disconnect(); if ('ResizeObserver' in window) { registerStickyObserver = new ResizeObserver(apply); registerStickyObserver.observe(h); } }
function activeFilterChips() {
  const c = [];
  if (registerFilterState.q) c.push(['q', `Search: ${registerFilterState.q}`]);
  if (registerFilterState.status !== 'all') c.push(['status', `Status: ${registerFilterState.status}`]);
  if (registerFilterState.year !== 'all') c.push(['year', `Year: ${registerFilterState.year}`]);
  if (registerFilterState.month !== 'all') c.push(['month', `Month: ${registerFilterState.month}`]);
  if (registerFilterState.vendor !== 'all') c.push(['vendor', `Vendor: ${registerFilterState.vendor}`]);
  if (registerFilterState.area !== 'all') c.push(['area', `Area: ${registerFilterState.area}`]);
  if (registerFilterState.supervisor !== 'all') c.push(['supervisor', `Supervisor: ${registerFilterState.supervisor}`]);
  if (registerFilterState.issuedBy !== 'all') c.push(['issuedBy', `Issued by: ${registerFilterState.issuedBy}`]);
  if (registerFilterState.dateFrom) c.push(['dateFrom', `From: ${registerFilterState.dateFrom}`]);
  if (registerFilterState.dateTo) c.push(['dateTo', `To: ${registerFilterState.dateTo}`]);
  return c;
}
// Bug A fix: also clear expanded-row overrides so stale IDs from the old result
// set don't accidentally expand rows in the new filtered result set.
function resetRegisterFilters() { registerFilterState = { q: '', status: 'all', month: 'all', year: 'all', vendor: 'all', area: 'all', supervisor: 'all', issuedBy: 'all', dateFrom: '', dateTo: '', page: 1 }; registerExpandedRows.clear(); }
function registerFilterOptions(field) { return Array.from(new Set(globalState.issuesCache.map(item => String(item?.[field] || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)); }
function countRegisterMatches(filters) {
  return enrichedIssues().filter(r => {
    if (filters.q) { const q = filters.q.toLowerCase(); if (![r.materialName, r.vendor, r.area, r.supervisorName, r.empCode, r.issueDate, r.returnDate, r.status].join(' ').toLowerCase().includes(q)) return false; }
    if (filters.status !== 'all' && (filters.status === 'pending' ? r.status === 'Returned' : r.status.replace(/\s/g, '').toLowerCase() !== filters.status)) return false;
    if (filters.year !== 'all' && (!r.issueDate || !r.issueDate.startsWith(filters.year))) return false;
    if (filters.month !== 'all' && (!r.issueDate || r.issueDate.split('-')[1] !== filters.month)) return false;
    if (filters.vendor !== 'all' && String(r.vendor || '') !== filters.vendor) return false;
    if (filters.area !== 'all' && String(r.area || '') !== filters.area) return false;
    if (filters.supervisor !== 'all' && String(r.supervisorName || '') !== filters.supervisor) return false;
    if (filters.issuedBy !== 'all' && String(r.issuedByName || r.issuedBy || '') !== filters.issuedBy) return false;
    if (filters.dateFrom && (!r.issueDate || r.issueDate < filters.dateFrom)) return false;
    if (filters.dateTo && (!r.issueDate || r.issueDate > filters.dateTo)) return false;
    return true;
  }).length;
}
function renderRegister() {
  const isAdmin = globalState.currentUser.roles.includes('admin');
  // Bug I fix: compute enrichedIssues() once and reuse — previously called 6
  // times per render (O(6n)), now called once (O(n)).
  const allEnriched = enrichedIssues();
  let rows = allEnriched;

  if (registerFilterState.q) {
    const needle = registerFilterState.q.toLowerCase();
    rows = rows.filter((r) => {
      const rowText = [
        r.materialName, r.vendor, r.area, r.supervisorName,
        r.empCode, r.issueDate, r.returnDate, r.status
      ].join(' ').toLowerCase();

      return rowText.includes(needle);
    });
  }

  if (registerFilterState.status !== 'all') {
    rows = rows.filter((r) => registerFilterState.status === 'pending'
      ? r.status !== 'Returned'
      : r.status.replace(/\s/g, '').toLowerCase() === registerFilterState.status);
  }

  if (registerFilterState.year !== 'all') {
    rows = rows.filter(r => r.issueDate && r.issueDate.startsWith(registerFilterState.year));
  }

  if (registerFilterState.month !== 'all') {
    rows = rows.filter(r => {
      if (!r.issueDate) return false;
      const parts = r.issueDate.split('-');
      return parts[1] === registerFilterState.month;
    });
  }
  if (registerFilterState.vendor !== 'all') rows = rows.filter(r => String(r.vendor || '') === registerFilterState.vendor);
  if (registerFilterState.area !== 'all') rows = rows.filter(r => String(r.area || '') === registerFilterState.area);
  if (registerFilterState.supervisor !== 'all') rows = rows.filter(r => String(r.supervisorName || '') === registerFilterState.supervisor);
  if (registerFilterState.issuedBy !== 'all') rows = rows.filter(r => String(r.issuedByName || r.issuedBy || '') === registerFilterState.issuedBy);
  if (registerFilterState.dateFrom) rows = rows.filter(r => r.issueDate && r.issueDate >= registerFilterState.dateFrom);
  if (registerFilterState.dateTo) rows = rows.filter(r => r.issueDate && r.issueDate <= registerFilterState.dateTo);

  const activeFilterCount = [
    !!registerFilterState.q,
    registerFilterState.status !== 'all',
    registerFilterState.year !== 'all',
    registerFilterState.month !== 'all',
    registerFilterState.vendor !== 'all', registerFilterState.area !== 'all',
    registerFilterState.supervisor !== 'all', registerFilterState.issuedBy !== 'all',
    !!registerFilterState.dateFrom, !!registerFilterState.dateTo,
  ].filter(Boolean).length;

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / REG_PAGE_SIZE));
  if (registerFilterState.page > totalPages) registerFilterState.page = totalPages;
  if (registerFilterState.page < 1) registerFilterState.page = 1;
  const pageStart = (registerFilterState.page - 1) * REG_PAGE_SIZE;
  const pageRows = rows.slice(pageStart, pageStart + REG_PAGE_SIZE);

  // Always include the current year (even with zero records so far) plus any
  // year that actually appears in the data — instead of a fixed 2024–2028
  // list that would silently go stale in 2029 and can't reach older records.
  const yearOptions = Array.from(new Set([
    String(new Date().getFullYear()),
    ...globalState.issuesCache.map((r) => r.issueDate ? r.issueDate.slice(0, 4) : null).filter(Boolean),
  ])).sort((a, b) => b.localeCompare(a));
  const vendorOptions = registerFilterOptions('vendor');
  const areaOptions = registerFilterOptions('area');
  const supervisorOptions = registerFilterOptions('supervisorName');
  const issuedByOptions = Array.from(new Set(globalState.issuesCache.map(r => String(r.issuedByName || r.issuedBy || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  let totalPending = 0, totalReturned = 0, totalIssued = 0, totalPartial = 0;
  for (let i = 0; i < allEnriched.length; i++) {
    const st = allEnriched[i].status;
    if (st === 'Returned') {
      totalReturned++;
    } else {
      totalPending++;
      if (st === 'Issued') totalIssued++;
      else if (st === 'Partially Returned') totalPartial++;
    }
  }

  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Records</span>
        <h1>${isAdmin ? 'Full Register' : 'Issue &amp; Return Register'}</h1>
        <div class="page-sub">${isAdmin ? 'Every record. Admins can remove entries here.' : 'All material movements logged by the store.'}</div>
        <div class="register-summary-meta"><span><strong>${totalRows}</strong> shown</span><span>${globalState.issuesCache.length} total</span><span>${totalPending} pending</span><span>${totalReturned} returned</span></div>
      </div>
    </div>

    <div class="status-filter-chips" aria-label="Quick status filters">
      ${[['all', 'All', globalState.issuesCache.length], ['pending', 'Pending', totalPending], ['issued', 'Issued', totalIssued], ['partiallyreturned', 'Partial', totalPartial], ['returned', 'Returned', totalReturned]].map(([value, label, count]) => `<button type="button" class="status-filter-chip ${registerFilterState.status === value ? 'is-active' : ''}" data-status-chip="${value}">${label} · ${count}</button>`).join('')}
    </div>
    <button type="button" class="btn btn-ghost filter-toggle" id="filterToggleBtn" aria-expanded="${registerFiltersOpen ? 'true' : 'false'}" aria-controls="regFilterBar">
      <span>Filters${activeFilterCount ? `<span class="count-badge">${activeFilterCount}</span>` : ''}</span>
      <span aria-hidden="true">${registerFiltersOpen ? '▲' : '▼'}</span>
    </button>

    <div class="filter-bar register-toolbar${registerFiltersOpen ? ' open' : ''}" id="regFilterBar">
      <div style="display: flex; gap: 10px; width: 100%; align-items: center; flex-wrap: wrap;">
        <input type="text" id="regSearch" placeholder="Search material, vendor, area, supervisor…" value="${escapeHtml(registerFilterState.q)}" aria-label="Search register" style="flex: 1; min-width: 200px;" />
        <button type="button" class="btn btn-ghost btn-sm more-filters-toggle" id="moreFiltersToggle">More Filters${activeFilterChips().filter(([k]) => ['vendor', 'area', 'supervisor', 'issuedBy', 'year', 'month', 'status'].includes(k)).length ? ` · ${activeFilterChips().filter(([k]) => ['vendor', 'area', 'supervisor', 'issuedBy', 'year', 'month', 'status'].includes(k)).length}` : ''}</button>
        <button type="button" class="btn btn-ghost btn-sm clear-filter-btn" id="clearRegisterFilters" ${activeFilterCount ? '' : 'disabled'}>Clear Filters</button>
        <button type="button" class="btn btn-ghost btn-sm" id="resetRegisterView">Reset View</button>
      </div>
      <div class="register-advanced-filters ${registerMoreFiltersOpen ? '' : 'is-collapsed'}">
        <div class="register-filter-field"><label for="regStatus">Status</label><select id="regStatus" aria-label="Filter by status">
          <option value="all" ${registerFilterState.status === 'all' ? 'selected' : ''}>All statuses</option>
          <option value="pending" ${registerFilterState.status === 'pending' ? 'selected' : ''}>Pending Return</option>
          <option value="issued" ${registerFilterState.status === 'issued' ? 'selected' : ''}>Issued</option>
          <option value="partiallyreturned" ${registerFilterState.status === 'partiallyreturned' ? 'selected' : ''}>Partially Returned</option>
          <option value="returned" ${registerFilterState.status === 'returned' ? 'selected' : ''}>Returned</option>
        </select></div>
        <div class="register-filter-field"><label for="regYear">Year</label><select id="regYear" aria-label="Filter by year">
          <option value="all" ${registerFilterState.year === 'all' ? 'selected' : ''}>All Years</option>
          ${yearOptions.map((y) => `<option value="${y}" ${registerFilterState.year === y ? 'selected' : ''}>${y}</option>`).join('')}
        </select></div>
        <div class="register-filter-field"><label for="regMonth">Month</label><select id="regMonth" aria-label="Filter by month">
          <option value="all" ${registerFilterState.month === 'all' ? 'selected' : ''}>All Months</option>
          <option value="01" ${registerFilterState.month === '01' ? 'selected' : ''}>Jan</option>
          <option value="02" ${registerFilterState.month === '02' ? 'selected' : ''}>Feb</option>
          <option value="03" ${registerFilterState.month === '03' ? 'selected' : ''}>Mar</option>
          <option value="04" ${registerFilterState.month === '04' ? 'selected' : ''}>Apr</option>
          <option value="05" ${registerFilterState.month === '05' ? 'selected' : ''}>May</option>
          <option value="06" ${registerFilterState.month === '06' ? 'selected' : ''}>Jun</option>
          <option value="07" ${registerFilterState.month === '07' ? 'selected' : ''}>Jul</option>
          <option value="08" ${registerFilterState.month === '08' ? 'selected' : ''}>Aug</option>
          <option value="09" ${registerFilterState.month === '09' ? 'selected' : ''}>Sep</option>
          <option value="10" ${registerFilterState.month === '10' ? 'selected' : ''}>Oct</option>
          <option value="11" ${registerFilterState.month === '11' ? 'selected' : ''}>Nov</option>
          <option value="12" ${registerFilterState.month === '12' ? 'selected' : ''}>Dec</option>
        </select></div>
        <div class="register-filter-field"><label for="regVendor">Vendor</label><select id="regVendor"><option value="all">All vendors</option>${vendorOptions.map(v => `<option value="${escapeHtml(v)}" ${registerFilterState.vendor === v ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select></div>
        <div class="register-filter-field"><label for="regArea">Area</label><select id="regArea"><option value="all">All areas</option>${areaOptions.map(v => `<option value="${escapeHtml(v)}" ${registerFilterState.area === v ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select></div>
        <div class="register-filter-field"><label for="regSupervisor">Supervisor</label><select id="regSupervisor"><option value="all">All supervisors</option>${supervisorOptions.map(v => `<option value="${escapeHtml(v)}" ${registerFilterState.supervisor === v ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select></div>
        <div class="register-filter-field"><label for="regIssuedBy">Issued By</label><select id="regIssuedBy"><option value="all">All issuers</option>${issuedByOptions.map(v => `<option value="${escapeHtml(v)}" ${registerFilterState.issuedBy === v ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select></div>
        <div class="register-filter-field"><label for="regDateFrom">Issue Date From</label><input type="date" id="regDateFrom" value="${escapeHtml(registerFilterState.dateFrom)}" max="${escapeHtml(registerFilterState.dateTo || todayStr())}" /></div>
        <div class="register-filter-field"><label for="regDateTo">Issue Date To</label><input type="date" id="regDateTo" value="${escapeHtml(registerFilterState.dateTo)}" min="${escapeHtml(registerFilterState.dateFrom)}" max="${todayStr()}" /></div>
        <div class="register-filter-actions" style="grid-column: 1 / -1;"><button type="button" class="btn btn-primary btn-sm apply-filter-btn" id="applyRegisterFilters" style="display: inline-flex;">Apply Filters</button></div>
      </div>
    </div>
    ${activeFilterCount ? `<div class="filter-chips">${activeFilterChips().map(([key, label]) => `<span class="filter-chip">${escapeHtml(label)}<button type="button" data-clear-filter="${key}" aria-label="Remove ${escapeHtml(label)}">×</button></span>`).join('')}</div>` : ''}

    <div class="register-view-toolbar" id="registerViewToolbar">
      <button type="button" class="register-view-toggle" id="registerViewToggle" aria-pressed="${registerViewExpanded}" title="Switch Register view">
        <span class="register-view-option ${!registerViewExpanded ? 'is-active' : ''}"><span class="register-view-option-icon">☰</span>Compact</span>
        <span class="register-view-option ${registerViewExpanded ? 'is-active' : ''}"><span class="register-view-option-icon">▦</span>Expanded</span>
      </button>
    </div>
    <div class="panel">
      <div class="table-wrap">
        ${rows.length === 0 ? (
      issuesLoaded
        ? `<div class="empty-state"><div class="display">${activeFilterCount ? 'No matching records' : 'No register records yet'}</div><p>${activeFilterCount ? 'No records match the selected filters.' : 'No material movements have been recorded.'}</p>${activeFilterCount || !globalState.currentUser.roles.includes('viewer') || globalState.currentUser.roles.includes('storekeeper') ? `<button type="button" class="btn btn-ghost register-empty-action" ${activeFilterCount ? 'id="emptyClearFilters"' : 'data-nav="issue-new"'}>${activeFilterCount ? 'Clear Filters' : 'Log New Issue'}</button>` : ''}</div>`
        : `<div class="skeleton-register" aria-label="Loading records"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div>`
    ) : `
        <table class="reg">
          <thead>
            <tr>
              <th scope="col">Material</th><th scope="col">Qty Issued</th><th scope="col">Vendor</th><th scope="col">Area</th>
              <th scope="col">Issue Date</th><th scope="col">Issued At</th><th scope="col">Supervisor</th><th scope="col">Issued By</th>
              <th scope="col">Return Date</th><th scope="col">Returned At</th><th scope="col">Received By</th><th scope="col">Qty Returned</th><th scope="col">Qty Remaining</th><th scope="col">Condition</th><th scope="col">Return Photo</th><th scope="col">Issue Photo</th><th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            ${pageRows.map((r) => {
      const qtyReturned = r.qtyReturned || 0;
      const qtyRemaining = r.qtyIssued - qtyReturned;
      return `
              <tr data-register-id="${r.id}" class="status-${r.status === 'Returned' ? 'returned' : r.status === 'Partially Returned' ? 'partial' : 'issued'} ${isRegisterRowExpanded(r.id) ? 'mobile-expanded' : ''}">
                <td class="mobile-register-summary" colspan="18">
                  <div class="mobile-register-item">
                    <span class="mobile-register-summary-label">Issued Item</span>
                    <strong>${escapeHtml(r.materialName)}</strong>
                  </div>
                  <div class="mobile-register-person">
                    <span class="mobile-register-summary-label">Issued To</span>
                    <strong>${escapeHtml(r.supervisorName) || '—'}</strong>
                  </div>
                  <div class="desktop-register-extra">
                    <span class="mobile-register-summary-label">Quantity</span>
                    <strong>${r.qtyIssued}</strong>
                  </div>
                  <div class="desktop-register-extra desktop-register-date">
                    <span class="mobile-register-summary-label">Issue Date</span>
                    <strong>${escapeHtml(r.issueDate) || '—'}</strong>
                  </div>
                  <button type="button" class="mobile-register-view" data-mobile-register-view aria-expanded="${isRegisterRowExpanded(r.id)}" aria-label="${isRegisterRowExpanded(r.id) ? 'Hide full register details' : `View full details for ${escapeHtml(r.materialName)}`}" title="${isRegisterRowExpanded(r.id) ? 'Hide details' : 'View full details'}">
                    <span class="view-icon" aria-hidden="true">👁</span><span class="collapse-icon" aria-hidden="true">×</span><span class="view-spinner" aria-hidden="true"></span>
                  </button>
                </td>
                <td data-label="Material">${escapeHtml(r.materialName)}</td>
                <td class="qty" data-label="Qty Issued">${r.qtyIssued}</td>
                <td class="register-section-title issue" aria-hidden="true">Issue Details</td>
                <td data-label="Vendor">${escapeHtml(r.vendor) || '—'}</td>
                <td data-label="Area">${escapeHtml(r.area) || '—'}</td>
                <td class="mono" data-label="Issue Date">${escapeHtml(r.issueDate)}</td>
                <td class="mono" data-label="Issued At">${formatTimestamp(r.createdAt)}</td>
                <td data-label="Supervisor">${escapeHtml(r.supervisorName) || '—'}${r.supervisorContact ? `<br/><span class="muted" style="font-size:11px;">${escapeHtml(r.supervisorContact)}</span>` : ''}</td>
                <td data-label="Issued By">${escapeHtml(r.issuedByName) || '—'}${r.empCode ? `<br/><span class="muted" style="font-size:11px;">${escapeHtml(r.empCode)}</span>` : ''}</td>
                <td class="register-section-title return" aria-hidden="true">Return Details</td>
                <td class="mono" data-label="Return Date">${escapeHtml(r.returnDate) || '—'}</td>
                <td class="mono" data-label="Returned At">${r.returnedAt ? formatTimestamp(r.returnedAt) : '—'}</td>
                <td data-label="Received By">${escapeHtml(r.receivedByName) || '—'}</td>
                <td class="qty" data-label="Qty Returned">${qtyReturned}</td>
                <td class="qty ${qtyRemaining > 0 && r.status !== 'Returned' ? 'qty-pending' : ''}" data-label="Qty Remaining">${qtyRemaining > 0 ? qtyRemaining : '—'}</td>
                <td data-label="Condition">${escapeHtml(r.conditionOnReturn) || '—'}</td>
                <td class="register-section-title media" aria-hidden="true">Photos & Actions</td>
                <td data-label="Return Photo">${renderPhotoThumbs(r.returnPhotoUrls || r.returnPhotoUrl, 'Return photo')}</td>
                <td data-label="Issue Photo">${renderPhotoThumbs(r.photoUrls || r.photoUrl, 'Issue photo')}</td>
                <td data-label="Status">
                  ${r.status === 'Returned' ? '<span class="badge good">Returned</span>' : r.status === 'Partially Returned' ? '<span class="badge" style="background:#dbeafe;color:#1d4ed8">Partially Returned</span>' : '<span class="badge warn">Issued</span>'}
                </td>
                <td data-label="Action" class="register-actions">
                  ${(!globalState.currentUser.roles.includes('viewer') || globalState.currentUser.roles.includes('storekeeper') || globalState.currentUser.roles.includes('admin')) && r.status !== 'Returned' ? `<button class="btn btn-dark btn-sm" data-return="${r.id}">Record Return</button>` : ''}
                  
                  ${(!globalState.currentUser.roles.includes('viewer') || globalState.currentUser.roles.includes('storekeeper') || globalState.currentUser.roles.includes('admin')) && r.status !== 'Returned' ? `<button class="btn btn-ghost btn-sm" data-edit-issue="${r.id}">Edit Issue</button>` : ''}
                  
                  ${isAdmin && r.status === 'Returned' ? `<button class="btn btn-ghost btn-sm" data-edit-return="${r.id}">Edit Return</button>` : ''}
                  ${r.returnHistory && Object.keys(r.returnHistory).length ? `<button class="btn btn-ghost btn-sm return-history-btn" data-return-history="${r.id}">Return History · ${Object.keys(r.returnHistory).length}</button>` : ''}
                  ${isAdmin ? `<button class="btn btn-danger btn-sm" data-delete-issue="${r.id}"><span aria-hidden="true">🗑</span><span>Delete</span></button>` : ''}
                </td>
              </tr>`;
    }).join('')}
          </tbody>
        </table>
        <div class="reg-pagination">
          <button type="button" class="btn btn-ghost btn-sm" id="regPagePrev" ${registerFilterState.page <= 1 ? 'disabled' : ''} aria-label="Previous page">← Prev</button>
          <span class="reg-page-info" role="status" aria-live="polite">Page ${registerFilterState.page} of ${totalPages} · ${totalRows} record${totalRows === 1 ? '' : 's'}</span>
          <button type="button" class="btn btn-ghost btn-sm" id="regPageNext" ${registerFilterState.page >= totalPages ? 'disabled' : ''} aria-label="Next page">Next →</button>
        </div>
        `}
      </div>
    </div>`;
}

function renderIssueForm() {
  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Log Movement</span>
        <h1>Issue Material</h1>
        <div class="page-sub">Record material being handed out from the store.</div>
      </div>
    </div>
    <div class="alert alert-error${issueFormError ? '' : ' hidden'}" id="issueFormAlert" role="alert">${escapeHtml(issueFormError)}</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="issueForm">
        <div class="form-grid">
          <div class="field">
            <label for="f_material">Material</label>
            <input type="text" id="f_material" list="qf_materials" placeholder="Enter material name..." required />
          </div>
          <div class="field">
            <label for="f_qty">Quantity Issued</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="1" id="f_qty" required />
          </div>
          <div class="field">
            <label for="f_vendor">Vendor</label>
            <input type="text" id="f_vendor" list="qf_vendors" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="f_area">Area</label>
            <input type="text" id="f_area" list="qf_areas" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="f_supervisorName">Supervisor Name</label>
            <input type="text" id="f_supervisorName" list="qf_supervisors" autocomplete="off" required />
          </div>
          <div class="field">
            <label for="f_supervisorContact">Supervisor Contact Number</label>
            <input type="tel" id="f_supervisorContact" list="qf_contacts" inputmode="numeric" autocomplete="tel" pattern="[0-9]{10}" maxlength="10" minlength="10" title="Please enter exactly 10 digits" required />
          </div>
          <div class="field">
            <label for="f_empCode">Employee Code / Dept.</label>
            <input type="text" id="f_empCode" list="qf_empcodes" autocomplete="off" />
          </div>
          <div class="field">
            <label for="f_photo">Photos of Material (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="f_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="f_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 photos per issue entry.</div><input type="file" id="f_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="f_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="f_photoPreviewWrap" style="display:none;">
            <div id="f_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="f_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="f_remarks">Remarks / Details</label>
            <textarea id="f_remarks" placeholder="Any extra details about this issue — condition, purpose, job reference, etc."></textarea>
          </div>          ${quickFillDatalist('qf_materials', uniqueRecentValues('materialName'))}
          ${quickFillDatalist('qf_vendors', uniqueRecentValues('vendor'))}
          ${quickFillDatalist('qf_areas', uniqueRecentValues('area'))}
          ${quickFillDatalist('qf_supervisors', uniqueRecentValues('supervisorName'))}
          ${quickFillDatalist('qf_contacts', uniqueRecentValues('supervisorContact'))}
          ${quickFillDatalist('qf_empcodes', uniqueRecentValues('empCode'))}
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="issueSubmitBtn">Save Issue Record</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`;
}

function renderEditIssueForm() {
  const issue = globalState.issuesCache.find((i) => i.id === editIssueTargetId);
  if (!issue) return `<div class="empty-state"><div class="display">Record not found</div></div>`;

  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Edit Movement</span>
        <h1>Edit Issue Details</h1>
        <div class="page-sub">Update the original material issue record.</div>
      </div>
    </div>
    <div class="alert alert-error${editIssueError ? '' : ' hidden'}" id="editIssueFormAlert" role="alert">${escapeHtml(editIssueError)}</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="editIssueForm">
        <div class="form-grid">
          <div class="field">
            <label for="ei_material">Material</label>
            <input type="text" id="ei_material" value="${escapeHtml(issue.materialName)}" required />
          </div>
          <div class="field">
            <label for="ei_qty">Quantity Issued</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="${issue.qtyReturned || 1}" id="ei_qty" value="${issue.qtyIssued}" required />
          </div>
          <div class="field">
            <label for="ei_vendor">Vendor</label>
            <input type="text" id="ei_vendor" value="${escapeHtml(issue.vendor || '')}" required />
          </div>
          <div class="field">
            <label for="ei_area">Area</label>
            <input type="text" id="ei_area" value="${escapeHtml(issue.area || '')}" required />
          </div>
          <div class="field">
            <label>Issue Date</label>
            <input type="date" value="${escapeHtml(issue.issueDate)}" disabled />
          </div>
          <div class="field">
            <label for="ei_supervisorName">Supervisor Name</label>
            <input type="text" id="ei_supervisorName" value="${escapeHtml(issue.supervisorName || '')}" required />
          </div>
          <div class="field">
            <label for="ei_supervisorContact">Supervisor Contact Number</label>
            <input type="tel" id="ei_supervisorContact" value="${escapeHtml(issue.supervisorContact || '')}" pattern="[0-9]{10}" maxlength="10" minlength="10" title="Please enter exactly 10 digits" required />
          </div>
          <div class="field">
            <label for="ei_empCode">Employee Code / Dept.</label>
            <input type="text" id="ei_empCode" value="${escapeHtml(issue.empCode || '')}" />
          </div>
          <div class="field full">
            <label>Current Issue Photos</label>
            ${renderPhotoThumbs(issue.photoUrls || issue.photoUrl, 'Issue photo')}
          </div>
          <div class="field">
            <label for="ei_photo">Add Issue Photos (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="ei_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="ei_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 photos total for this issue entry.</div><input type="file" id="ei_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="ei_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="ei_photoPreviewWrap" style="display:none;">
            <div id="ei_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="ei_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="ei_remarks">Remarks / Details</label>
            <textarea id="ei_remarks">${escapeHtml(issue.remarks || '')}</textarea>
          </div>
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="editIssueSubmitBtn">Save Changes</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`;
}

function renderReturnForm() {
  const issue = globalState.issuesCache.find((i) => i.id === returnFormTargetId);
  if (!issue) return `<div class="empty-state"><div class="display">Record not found</div></div>`;
  const materialName = issue.materialName || '(unnamed)';
  const alreadyReturned = issue.qtyReturned || 0;
  const remaining = issue.qtyIssued - alreadyReturned;
  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Log Movement</span>
        <h1>Record a Return</h1>
        <div class="page-sub">${escapeHtml(materialName)} — ${escapeHtml(issue.area) || 'area not recorded'}, issued ${escapeHtml(issue.issueDate)}</div>
      </div>
    </div>
    <div class="alert alert-error${returnFormError ? '' : ' hidden'}" id="returnFormAlert" role="alert">${escapeHtml(returnFormError)}</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="returnForm">
        <div class="form-grid">
          <div class="field">
            <label>Qty Issued</label>
            <input type="text" value="${issue.qtyIssued}" disabled />
          </div>
          <div class="field">
            <label>Qty Already Returned</label>
            <input type="text" value="${alreadyReturned}" disabled />
          </div>
          <div class="field">
            <label for="r_qty">Qty Returning Now (max ${remaining})</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="1" max="${remaining}" id="r_qty" value="${remaining}" required />
          </div>
          <div class="field">
            <label for="r_date">Return Date</label>
            <input type="date" id="r_date" value="${todayStr()}" required />
          </div>
          <div class="field">
            <label for="r_condition">Condition on Return</label>
            <select id="r_condition">
              <option>Good</option><option>Worn</option><option>Needs Repair</option><option>Damaged</option><option>Lost</option>
            </select>
          </div>
          <div class="field">
            <label for="r_photo">Photos on Return (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="r_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="r_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 photos per return entry.</div><input type="file" id="r_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="r_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="r_photoPreviewWrap" style="display:none;">
            <div id="r_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="r_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="r_remarks">Remarks</label>
            <textarea id="r_remarks">${escapeHtml(issue.remarks || '')}</textarea>
          </div>
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="returnSubmitBtn">Save Return</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`;
}

function renderEditReturnForm() {
  const issue = globalState.issuesCache.find((i) => i.id === editReturnTargetId);
  if (!issue) return `<div class="empty-state"><div class="display">Record not found</div></div>`;
  const materialName = issue.materialName || '(unnamed)';
  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Admin — Edit Return</span>
        <h1>Edit Return Details</h1>
        <div class="page-sub">${escapeHtml(materialName)} — originally issued ${escapeHtml(issue.issueDate)}</div>
      </div>
    </div>
    <div class="alert alert-error${editReturnError ? '' : ' hidden'}" id="editReturnFormAlert" role="alert">${escapeHtml(editReturnError)}</div>
    <div class="alert alert-info">Only return-side details can be edited here — the original issue record is preserved.</div>
    <div class="panel panel-pad" style="max-width:760px;">
      <form id="editReturnForm">
        <div class="form-grid">
          <div class="field">
            <label>Qty Issued (read-only)</label>
            <input type="text" value="${issue.qtyIssued}" disabled />
          </div>
          <div class="field">
            <label for="er_qty">Qty Returned</label>
            <input type="number" inputmode="numeric" pattern="[0-9]*" min="0" max="${issue.qtyIssued}" id="er_qty" value="${issue.qtyReturned || 0}" required />
          </div>
          <div class="field">
            <label for="er_date">Return Date</label>
            <input type="date" id="er_date" value="${escapeHtml(issue.returnDate || todayStr())}" required />
          </div>
          <div class="field">
            <label for="er_condition">Condition on Return</label>
            <select id="er_condition">
              ${['Good', 'Worn', 'Needs Repair', 'Damaged', 'Lost'].map((c) =>
    `<option ${issue.conditionOnReturn === c ? 'selected' : ''}>${c}</option>`
  ).join('')}
            </select>
          </div>
          <div class="field full">
            <label>Current Return Photos</label>
            ${renderPhotoThumbs(issue.returnPhotoUrls || issue.returnPhotoUrl, 'Return photo')}
          </div>
          <div class="field">
            <label for="er_photo">Add Return Photos (optional)</label>
            <div class="camera-upload-row"><button type="button" class="btn btn-ghost btn-sm" id="er_choosePhotoBtn">Choose Photos</button><button type="button" class="btn btn-dark btn-sm" id="er_cameraBtn">Take Picture</button></div><div class="photo-limit-note">Maximum 5 new photos per edit.</div><input type="file" id="er_photo" class="camera-input" accept="image/*" multiple /><input type="file" id="er_camera" class="camera-input" accept="image/*" capture="environment" />
          </div>
          <div class="field full" id="er_photoPreviewWrap" style="display:none;">
            <div id="er_photoPreview" style="display:flex;gap:10px;flex-wrap:wrap;"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="er_photoClear" style="margin-top:12px; width:fit-content;">Remove Photo</button>
          </div>
          <div class="field full">
            <label for="er_remarks">Remarks</label>
            <textarea id="er_remarks">${escapeHtml(issue.remarks || '')}</textarea>
          </div>
        </div>
        <div class="actions-row">
          <button type="submit" class="btn btn-primary" id="editReturnSubmitBtn">Save Changes</button>
          <button type="button" class="btn btn-ghost" data-nav="register">Cancel</button>
        </div>
      </form>
    </div>`;
}

function renderUsersAdmin() {
  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Administrator</span>
        <h1>Users</h1>
        <div class="page-sub">Create and manage staff (storekeeper) accounts. Admin access uses a single fixed login and isn't managed here.</div>
      </div>
    </div>
    <div class="alert alert-error${userFormError ? '' : ' hidden'}" id="userFormAlert" role="alert">${escapeHtml(userFormError)}</div>

    <div id="requestsHolder" class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><h2>Pending Access Requests</h2></div>
      <div class="panel-pad">
        <div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">Loading requests…</p></div>
      </div>
    </div>

    <div id="usersTableHolder" class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><h2>Storekeeper Accounts</h2></div>
      <div class="table-wrap">
        <div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">Loading users…</p></div>
      </div>
    </div>
    <div class="panel panel-pad">
      <h2 style="margin-top:0;">Add New Storekeeper Account</h2>
      <form id="newUserForm">
        <div class="form-grid">
          <div class="field">
            <label for="nu_username">Username</label>
            <input type="text" id="nu_username" autocapitalize="none" required />
          </div>
          <div class="field">
            <label for="nu_fullname">Full Name</label>
            <input type="text" id="nu_fullname" required />
          </div>
          <div class="field">
            <label>Roles (Max 2)</label>
            <div class="custom-multi-select" style="position:relative; max-width: 250px;">
              <div class="multi-select-header" tabindex="0" style="border: 1px solid var(--border); padding: 8px 12px; border-radius: 4px; cursor: pointer; background: var(--surface); display:flex; justify-content:space-between; align-items:center;">
                <span class="ms-label">1 Role Selected</span>
                <span style="font-size:10px;">▼</span>
              </div>
              <div id="nu_role_group" class="role-checkbox-group multi-select-options hidden" style="position:absolute; top:100%; left:0; right:0; background:var(--input-bg, var(--surface)); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); z-index:10; padding: 10px; border-radius: 4px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:8px; margin-top:2px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="storekeeper" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" checked> Storekeeper</label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;"> Viewer</label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="tools_admin" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;"> Tools Admin</label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0;"><input type="checkbox" value="tools_viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;"> Tools Viewer</label>
              </div>
            </div>
          </div>
          <div class="field full">
            <label for="nu_password">Password</label>
            <div class="password-field-wrap">
              <input type="password" id="nu_password" required minlength="4" />
              <button type="button" class="password-toggle-btn" data-password-target="nu_password" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
        </div>
        <div class="actions-row"><button type="submit" class="btn btn-primary" id="newUserSubmitBtn">Create Account</button></div>
      </form>
    </div>`;
}

const EXCEL_STATUS_MAP = { issued: 'Issued', partial: 'Partially Returned', returned: 'Returned' };
function excelRegisterRows(fromDate, toDate, statusFilter = 'all') {
  const wantStatus = EXCEL_STATUS_MAP[statusFilter] || null;
  return enrichedIssues().filter(r => r.issueDate && r.issueDate >= fromDate && r.issueDate <= toDate && (!wantStatus || r.status === wantStatus)).sort((a, b) => (a.issueDate || '').localeCompare(b.issueDate || '')).map((r, index) => ({
    'Sl No.': index + 1, 'Material': r.materialName || '', 'Quantity Issued': Number(r.qtyIssued) || 0, 'Vendor': r.vendor || '', 'Area': r.area || '',
    'Issue Date': r.issueDate || '', 'Issued At': r.createdAt ? new Date(r.createdAt) : '', 'Supervisor': r.supervisorName || '', 'Supervisor Contact': r.supervisorContact || '',
    'Employee Code / Department': r.empCode || '', 'Issued By': r.issuedByName || r.issuedBy || '', 'Return Date': r.returnDate || '',
    'Returned At': r.returnedAt ? new Date(r.returnedAt) : '', 'Received By': r.receivedByName || r.receivedBy || '', 'Quantity Returned': Number(r.qtyReturned) || 0,
    'Quantity Remaining': Math.max(0, (Number(r.qtyIssued) || 0) - (Number(r.qtyReturned) || 0)), 'Condition on Return': r.conditionOnReturn || '',
    'Status': r.status || statusOf(r), 'Remarks': r.remarks || ''
  }));
}
function updateExcelExportSummary() {
  const from = $('#excelDateFrom')?.value || '', to = $('#excelDateTo')?.value || '', summary = $('#excelExportSummary'), button = $('#downloadRegisterExcelBtn');
  if (!summary || !button) return;
  const invalid = !from || !to || from > to || to > todayStr();
  const count = invalid ? 0 : excelRegisterRows(from, to, excelStatusFilter).length;
  const statusNote = excelStatusFilter !== 'all' ? ` (${EXCEL_STATUS_MAP[excelStatusFilter]} only)` : '';
  summary.textContent = !from || !to ? 'Choose both dates to prepare the register download.' : from > to ? 'Start date cannot be after end date.' : to > todayStr() ? 'End date cannot be in the future.' : `${count} record${count === 1 ? '' : 's'}${statusNote} will be exported. Photos are excluded.`;
  button.disabled = invalid || count === 0 || !window.XLSX;
}
function excelPresetRange(preset) { const now = new Date(), local = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10) }; let from, to = local(now); if (preset === 'this-month') from = local(new Date(now.getFullYear(), now.getMonth(), 1)); else if (preset === 'last-month') { from = local(new Date(now.getFullYear(), now.getMonth() - 1, 1)); to = local(new Date(now.getFullYear(), now.getMonth(), 0)); } else if (preset === '30-days') { const d = new Date(now); d.setDate(d.getDate() - 29); from = local(d); } else if (preset === 'this-year') from = `${now.getFullYear()}-01-01`; else { const dates = globalState.issuesCache.map(r => r.issueDate).filter(Boolean).sort(); from = dates[0] || todayStr(); to = dates[dates.length - 1] || todayStr(); } return { from, to }; }
function updateExcelModuleReadiness() { const el = $('#excelReadiness'), retry = $('#retryExcelModuleBtn'); if (!el) return; const ready = !!window.XLSX; el.classList.toggle('is-ready', ready); el.querySelector('span:last-child').textContent = ready ? 'Excel module ready' : 'Excel module unavailable'; retry?.classList.toggle('hidden', ready); updateExcelExportSummary(); }
async function downloadRegisterExcel() {
  if (!globalState.currentUser?.roles.includes('admin')) { await appAlert('Only the administrator can download the Excel register.', { title: 'Admin Access Required', type: 'danger' }); return; }
  const from = $('#excelDateFrom')?.value || '', to = $('#excelDateTo')?.value || '';
  if (!from || !to || from > to || to > todayStr()) { await appAlert('Select a valid issue-date range up to today.', { title: 'Invalid Date Range', type: 'danger' }); return; }
  const statusFilter = excelStatusFilter, statusLabel = EXCEL_STATUS_MAP[statusFilter] || '';
  const rows = excelRegisterRows(from, to, statusFilter);
  if (!rows.length) { await appAlert(statusFilter === 'all' ? 'No register records were found in the selected date range.' : `No register records with status "${statusLabel}" were found in the selected date range.`, { title: 'Nothing to Export', type: 'info' }); return; }
  if (!window.XLSX) { await appAlert('The Excel export library could not be loaded. Check the internet connection and try again.', { title: 'Excel Export Unavailable', type: 'danger' }); return; }
  const ws = window.XLSX.utils.json_to_sheet(rows, { cellDates: true });
  ws['!autofilter'] = { ref: ws['!ref'] };
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 16 }, { wch: 22 }, { wch: 18 }, { wch: 13 }, { wch: 21 }, { wch: 24 }, { wch: 20 }, { wch: 25 }, { wch: 24 }, { wch: 13 }, { wch: 21 }, { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 20 }, { wch: 35 }];
  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Register');
  wb.Props = { Title: `CMM SMS Register ${from} to ${to}${statusFilter === 'all' ? '' : ' - ' + statusLabel}`, Subject: 'Issue and Return Register', Author: globalState.currentUser.fullName || globalState.currentUser.username, CreatedDate: new Date() };
  const downloadBtn = $('#downloadRegisterExcelBtn'); if (downloadBtn) { downloadBtn.disabled = true; downloadBtn.innerHTML = '<span class="spinner"></span> Preparing Excel…'; }
  const statusSuffix = statusFilter === 'all' ? '' : `_${statusLabel.replace(/\s+/g, '')}`;
  const fileName = `CMM_SMS_Register_${from}_to_${to}${statusSuffix}.xlsx`;
  window.XLSX.writeFile(wb, fileName, { compression: true, cellDates: true });
  await writeAudit('register-exported', null, { fromDate: from, toDate: to, statusFilter, recordCount: rows.length, fileName });
  showToast(`${rows.length} records exported as ${fileName}`, { title: 'Excel Downloaded' });
  if (downloadBtn) { downloadBtn.disabled = false; downloadBtn.textContent = 'Download Excel Register'; }
  await appAlert(`${rows.length} register record${rows.length === 1 ? '' : 's'} exported successfully. Photos were excluded.`, { title: 'Excel Download Ready', type: 'success' });
}
async function downloadToolsExcel() {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can download the Tools Master List in Excel.', { title: 'Admin Access Required', type: 'danger' });
    return;
  }
  if (!window.XLSX) {
    await appAlert('The Excel export module is not ready. Please verify your internet connection.', { title: 'Excel Unavailable', type: 'danger' });
    return;
  }

  const categoryFilter = $('#toolsExcelCategory')?.value || 'all';
  const statusFilter = $('#toolsExcelStatus')?.value || 'all';

  let filtered = globalState.toolsCache.filter(t => {
    if (categoryFilter !== 'all' && (t.category || '').trim() !== categoryFilter) return false;
    if (statusFilter !== 'all' && (t.status || 'Available') !== statusFilter) return false;
    return true;
  });

  if (!filtered.length) {
    await appAlert('No tool records found matching the chosen filters.', { title: 'Nothing to Export', type: 'info' });
    return;
  }

  const rows = filtered.map((t, index) => {
    const historyText = Array.isArray(t.statusHistory) && t.statusHistory.length
      ? t.statusHistory.map(h => `${h.dateStr || (h.timestamp ? new Date(h.timestamp).toLocaleString() : '')}: [${h.status || ''}] by ${h.changedBy || h.changedByUsername || ''}${h.notes ? ' - ' + h.notes : ''}`).join(' | ')
      : '';

    return {
      'Sl No.': index + 1,
      'Tool ID': t.uniqueId || '',
      'Tool Name': t.toolName || '',
      'Category': t.category || 'General',
      'Quantity': Number(t.quantity) || 0,
      'Location / Shelf': t.location || '',
      'Current Status': t.status || 'Available',
      'Notes': t.notes || '',
      'Created By': t.createdBy || '',
      'Created Date': t.createdAt ? new Date(t.createdAt) : '',
      'Last Updated By': t.updatedBy || '',
      'Last Updated Date': t.updatedAt ? new Date(t.updatedAt) : '',
      'Latest Status Note': t.lastStatusNote || '',
      'Status History': historyText
    };
  });

  const ws = window.XLSX.utils.json_to_sheet(rows, { cellDates: true });
  ws['!autofilter'] = { ref: ws['!ref'] };
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  ws['!cols'] = [
    { wch: 8 },  // Sl No.
    { wch: 26 }, // Tool ID
    { wch: 32 }, // Tool Name
    { wch: 18 }, // Category
    { wch: 10 }, // Quantity
    { wch: 18 }, // Location
    { wch: 18 }, // Current Status
    { wch: 30 }, // Notes
    { wch: 18 }, // Created By
    { wch: 20 }, // Created Date
    { wch: 18 }, // Last Updated By
    { wch: 20 }, // Last Updated Date
    { wch: 25 }, // Latest Status Note
    { wch: 50 }  // Status History
  ];

  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, 'Tools Master');
  wb.Props = {
    Title: `CMM SMS Tools Master List`,
    Subject: 'Physical Tool Asset Master Register',
    Author: globalState.currentUser.fullName || globalState.currentUser.username,
    CreatedDate: new Date()
  };

  const btn = $('#downloadToolsExcelBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Preparing Excel…'; }

  const today = todayStr();
  const fileName = `CMM_SMS_Tools_Master_${today}.xlsx`;
  window.XLSX.writeFile(wb, fileName, { compression: true, cellDates: true });

  await writeAudit('tools-master-exported', null, { categoryFilter, statusFilter, recordCount: rows.length, fileName });
  showToast(`${rows.length} tools exported as ${fileName}`, { title: 'Tools Excel Downloaded' });

  if (btn) { btn.disabled = false; btn.textContent = 'Download Tools Excel (.xlsx)'; }
  await appAlert(`${rows.length} tool record${rows.length === 1 ? '' : 's'} exported successfully.`, { title: 'Excel Download Ready', type: 'success' });
}

function renderSettingsAdmin() {
  const dbUrl = firebaseConfig.databaseURL || '(not set)';
  const toolCategories = Array.from(new Set(globalState.toolsCache.map(t => (t.category || '').trim()).filter(Boolean))).sort();
  const errorLogs = typeof window.getAdminErrorLogs === 'function' ? window.getAdminErrorLogs() : [];
  const errorSummary = typeof window.renderAdminErrorSummary === 'function' ? window.renderAdminErrorSummary() : '';
  const errorLogsHtml = typeof window.renderAdminErrorLogs === 'function' ? window.renderAdminErrorLogs() : '<div class="error-log-empty">No errors recorded.</div>';

  return `
    <div class="page-head">
      <div>
        <span class="eyebrow">Administrator</span>
        <h1>Settings</h1>
        <div class="page-sub">Cloud sync status, database payload analytics, and data management.</div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="homeview" aria-expanded="true"><h2>Startup Page</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="homeview">
        <div class="page-sub" style="margin-bottom:14px;">Choose which page opens automatically when you log in or reopen the app.</div>
        <div class="field" style="max-width:320px;">
          <label for="homeViewSelect">Default landing page</label>
          <select id="homeViewSelect">${homeViewSelectHtml()}</select>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="errors" aria-expanded="true"><h2>Detailed Error Log <span id="adminErrorCount" class="error-log-chip">${errorLogs.length}</span></h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="errors">
        <div class="page-sub" style="margin-bottom:14px;">Browser, application, promise, network and Firebase errors recorded on this device. Logs are stored locally and limited to the latest 200 entries.</div>
        <div class="error-log-toolbar">
          <input id="errorLogSearch" class="input" type="search" placeholder="Search message, page, user or code" aria-label="Search error logs">
          <select id="errorLogLevel" class="input" aria-label="Filter error severity"><option value="all">All severities</option><option value="error">Errors</option><option value="warning">Warnings</option><option value="info">Information</option></select>
          <button class="btn btn-ghost btn-sm" id="refreshErrorLogBtn">Refresh</button>
          <button class="btn btn-ghost btn-sm" id="exportErrorLogBtn">Export JSON</button>
          <button class="btn btn-danger btn-sm" id="clearErrorLogBtn">Clear Log</button>
        </div>
        <div id="adminErrorLogSummary" class="error-log-summary">${errorSummary}</div>
        <div id="adminErrorLogList" class="error-log-list">${errorLogsHtml}</div>
      </div>
    </div>
    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="cloud" aria-expanded="true"><h2>Cloud Sync Status</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="cloud">
        <div class="sync-status-row">
          <span class="sync-dot ${cloudConnected ? 'sync-dot-good' : 'sync-dot-bad'}"></span>
          <span class="sync-status-label">${cloudConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div class="kv-grid">
          <div class="kv-row"><span class="kv-key">Last synced</span><span class="kv-val mono">${lastSyncedAt ? lastSyncedAt.toLocaleString() : '—'}</span></div>
          <div class="kv-row"><span class="kv-key">Database URL</span><span class="kv-val mono" style="word-break:break-all;">${escapeHtml(dbUrl)}</span></div>
          <div class="kv-row"><span class="kv-key">Project ID</span><span class="kv-val mono">${escapeHtml(firebaseConfig.projectId || '—')}</span></div>
          <div class="kv-row"><span class="kv-key">Issue records cached</span><span class="kv-val mono">${globalState.issuesCache.length}</span></div>
          <div class="kv-row"><span class="kv-key">Tools cached</span><span class="kv-val mono">${globalState.toolsCache.length}</span></div>
          <div class="kv-row"><span class="kv-key">Pending tool deletion requests</span><span class="kv-val mono">${globalState.toolDeletionRequestsCache.length}</span></div>
        </div>
        <div class="actions-row">
          <button class="btn btn-ghost btn-sm" id="refreshSyncStatusBtn">Refresh Status</button>
          <button class="btn btn-ghost btn-sm" id="testSyncHealthBtn">Test Sync Health</button>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="audit" aria-expanded="false"><h2>System Audit Log</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body hidden" data-settings-body="audit">
        <div class="page-sub" style="margin-bottom:14px;">Review recent administrative and system actions. (Loads latest 100 entries on demand)</div>
        <div class="actions-row" style="margin-bottom:16px;">
          <button class="btn btn-dark btn-sm" id="loadAuditLogBtn">Load Audit Log</button>
        </div>
        <div id="auditLogContainer" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-alt); padding: 8px;">
          <div style="padding: 12px; text-align: center; color: var(--text-light); font-size: 13px;">Click "Load Audit Log" to fetch records from the cloud.</div>
        </div>
      </div>
    </div>

    <!-- Download Register Excel (Issues Collection) -->
    <div class="panel excel-export-card" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="export" aria-expanded="true"><h2>Download Material Issue Register in Excel</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="export">
        <div class="excel-export-grid">
          <div class="excel-presets"><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="this-month">This Month</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="last-month">Last Month</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="30-days">Last 30 Days</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="this-year">This Year</button><button type="button" class="btn btn-ghost btn-sm" data-excel-preset="all">All Records</button></div>
          <p class="excel-export-note">Select an inclusive <strong>Issue Date</strong> range. The Excel workbook includes material issue details and return information, but deliberately excludes all issue/return photos, photo URLs and storage paths.</p>
          <div class="field"><label for="excelDateFrom">Issue Date From</label><input type="date" id="excelDateFrom" max="${excelDateTo || todayStr()}" value="${excelDateFrom}" /></div>
          <div class="field"><label for="excelDateTo">Issue Date To</label><input type="date" id="excelDateTo" min="${excelDateFrom}" max="${todayStr()}" value="${excelDateTo}" /></div>
          <div class="field excel-status-filter">
            <label id="excelStatusLabel">Status</label>
            <div class="status-filter-chips excel-status-chips" role="group" aria-labelledby="excelStatusLabel">
              <button type="button" class="status-filter-chip ${excelStatusFilter === 'all' ? 'is-active' : ''}" data-excel-status="all">All</button>
              <button type="button" class="status-filter-chip ${excelStatusFilter === 'issued' ? 'is-active' : ''}" data-excel-status="issued">Issued</button>
              <button type="button" class="status-filter-chip ${excelStatusFilter === 'partial' ? 'is-active' : ''}" data-excel-status="partial">Partial</button>
              <button type="button" class="status-filter-chip ${excelStatusFilter === 'returned' ? 'is-active' : ''}" data-excel-status="returned">Returned</button>
            </div>
          </div>
          <div class="excel-export-summary" id="excelExportSummary">Choose both dates to prepare the register download.</div><div id="excelReadiness" class="export-readiness"><span class="export-readiness-dot"></span><span>Checking Excel module…</span></div><button type="button" class="btn btn-ghost btn-sm hidden" id="retryExcelModuleBtn">Retry Excel Module</button>
          <button type="button" class="btn btn-primary" id="downloadRegisterExcelBtn">Download Excel Register</button>
        </div>
      </div>
    </div>

    <!-- Download Tools Master List Excel (Tools Collection) -->
    <div class="panel excel-export-card" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="tools-export" aria-expanded="true"><h2>Download Tools Master List in Excel</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="tools-export">
        <div class="excel-export-grid">
          <p class="excel-export-note">Export the complete <strong>Physical Tool Master Register</strong> to Excel (.xlsx). Includes tool IDs, categories, quantities, locations, current conditions, notes, creator timestamps, and formatted status update history log.</p>
          <div class="field">
            <label for="toolsExcelCategory">Category Filter</label>
            <select id="toolsExcelCategory">
              <option value="all">All Categories</option>
              ${toolCategories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="toolsExcelStatus">Status Filter</label>
            <select id="toolsExcelStatus">
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="In Maintenance">Under Maintenance</option>
              <option value="Damaged">Damage Declared</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div class="excel-export-summary" id="toolsExcelSummary">Total tools in master register: <strong>${globalState.toolsCache.length}</strong></div>
          <button type="button" class="btn btn-primary" id="downloadToolsExcelBtn">Download Tools Excel (.xlsx)</button>
        </div>
      </div>
    </div>

    <div class="panel" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="data" aria-expanded="true"><h2>Data Management</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="data">
        <p style="margin-top:0; margin-bottom:20px; color:var(--steel-600); font-size:14px;">
          Keep your database fast and free up cloud storage by permanently removing old, fully returned records.
        </p>
        <div class="actions-row">
          <button class="btn btn-danger" id="cleanupOldRecordsBtn">Delete Returned Records Older Than 3 Months</button>
        </div>
      </div>
    </div>
    <div class="panel danger-zone" style="margin-bottom:32px;">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="danger" aria-expanded="false"><h2>Danger Zone</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body is-collapsed" data-settings-body="danger">
        <p class="danger-zone-note"><strong>Clear All Store Data</strong> permanently removes every issue/return record, linked issue and return photos, pending access requests, and audit history. Storekeeper user accounts and the administrator login are preserved.</p>
        <button type="button" class="btn btn-danger" id="clearAllStoreDataBtn">Clear All Store Data</button>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><button type="button" class="settings-section-toggle" data-settings-section="storage" aria-expanded="true"><h2>Database Payload Estimate</h2><span>⌄</span></button></div>
      <div class="panel-pad settings-section-body" data-settings-body="storage" id="storageUsageHolder">
        <div class="empty-state"><span class="spinner"></span><p style="margin-top:10px;">Calculating…</p></div>
      </div>
    </div>`;
}

function renderStorageUsage() {
  const holder = $('#storageUsageHolder');
  if (!holder) return;

  const LIMIT_KB = 1024 * 1024; // 1 GB reference quota

  const snapUsersPromise = get(ref(db, 'users')).catch(() => null);
  const snapAccessReqPromise = get(ref(db, 'accessRequests')).catch(() => null);
  const snapToolDelReqPromise = get(ref(db, 'toolDeletionRequests')).catch(() => null);
  const snapAuditPromise = get(ref(db, 'auditLog')).catch(() => null);

  Promise.all([snapUsersPromise, snapAccessReqPromise, snapToolDelReqPromise, snapAuditPromise]).then(([snapUsers, snapAccess, snapToolDel, snapAudit]) => {
    if (!document.contains(holder)) return;

    const issuesKB = new Blob([JSON.stringify(globalState.issuesCache)]).size / 1024;
    const toolsKB = new Blob([JSON.stringify(globalState.toolsCache)]).size / 1024;
    const usersKB = snapUsers?.val() ? new Blob([JSON.stringify(snapUsers.val())]).size / 1024 : 0;
    const accessReqKB = snapAccess?.val() ? new Blob([JSON.stringify(snapAccess.val())]).size / 1024 : 0;
    const toolDelReqKB = snapToolDel?.val() ? new Blob([JSON.stringify(snapToolDel.val())]).size / 1024 : 0;
    const reqKB = accessReqKB + toolDelReqKB;
    const auditKB = snapAudit?.val() ? new Blob([JSON.stringify(snapAudit.val())]).size / 1024 : 0;

    const userCount = snapUsers?.val() ? Object.keys(snapUsers.val()).length : 0;
    const accessCount = snapAccess?.val() ? Object.keys(snapAccess.val()).length : 0;
    const toolDelCount = snapToolDel?.val() ? Object.keys(snapToolDel.val()).length : 0;
    const auditCount = snapAudit?.val() ? Object.keys(snapAudit.val()).length : 0;

    const breakdown = [
      { label: 'Material Issue Register', count: `${globalState.issuesCache.length} records`, kb: issuesKB, color: '#3b82f6' },
      { label: 'Tool Master Catalog', count: `${globalState.toolsCache.length} tools`, kb: toolsKB, color: '#f59e0b' },
      { label: 'Staff User Accounts', count: `${userCount} accounts`, kb: usersKB, color: '#8b5cf6' },
      { label: 'Pending Access & Tool Requests', count: `${accessCount + toolDelCount} pending`, kb: reqKB, color: '#ec4899' },
      { label: 'Audit Trail Logs', count: `${auditCount} events`, kb: auditKB, color: '#10b981' }
    ];

    const usedKB = breakdown.reduce((sum, s) => sum + s.kb, 0);
    const freeKB = Math.max(0, LIMIT_KB - usedKB);
    const pct = Math.min(100, (usedKB / LIMIT_KB) * 100);

    const formatSize = (kb) => {
      if (kb >= 1024) return (kb / 1024).toFixed(2) + ' MB';
      return kb.toFixed(2) + ' KB';
    };

    holder.innerHTML = `
      <div class="storage-bar-wrap">
        <div class="storage-bar-track">
          <div class="storage-bar-fill" style="width:${Math.max(pct, 0.08).toFixed(3)}%; background:${pct > 80 ? 'linear-gradient(90deg,#ef4444,#f59e0b)' : 'linear-gradient(90deg,#10b981,#f59e0b)'};"></div>
        </div>
        <div class="storage-bar-caption">
          <span><strong>${formatSize(usedKB)}</strong> total database payload</span>
          <span>${((usedKB / LIMIT_KB) * 100).toFixed(4)}% of 1 GB Realtime DB limit</span>
        </div>
      </div>
      <div class="storage-legend">
        ${breakdown.map((s) => `
          <div class="storage-legend-row">
            <span class="storage-dot" style="background:${s.color};"></span>
            <span class="storage-legend-label"><strong>${escapeHtml(s.label)}</strong> <span class="muted" style="font-size:11.5px; margin-left:4px;">(${s.count})</span></span>
            <span class="storage-legend-val mono">${formatSize(s.kb)}</span>
          </div>`).join('')}
        <div class="storage-legend-row storage-legend-free">
          <span class="storage-dot" style="background:var(--steel-100); border:1px solid var(--steel-300);"></span>
          <span class="storage-legend-label">Available Cloud Quota</span>
          <span class="storage-legend-val mono">${formatSize(freeKB)}</span>
        </div>
      </div>
      <div class="muted" style="font-size:12.5px; margin-top:16px;">
        Estimated Realtime Database JSON payloads calculated live from active memory caches and Firebase collections. Uploaded photos are stored and tracked in Firebase Cloud Storage.
      </div>`;
  }).catch((err) => {
    if (document.contains(holder)) {
      holder.innerHTML = `<div class="empty-state"><p style="color:var(--bad);">Storage estimate calculation error: ${escapeHtml(err.message)}</p></div>`;
    }
  });
}


/* =========================================================================
   EVENT WIRING
   ========================================================================= */
function wireViewEvents(viewId) {
  if (viewId === 'dashboard' || viewId === 'admin-dashboard') {
    $('#overdueBannerFollowUpBtn')?.addEventListener('click', () => {
      openOverdueFollowUpModal();
    });
  }

  if (viewId === 'register') {
    $('#regSearch')?.addEventListener('input', (e) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      clearTimeout(regSearchDebounceTimer);
      regSearchDebounceTimer = setTimeout(() => {
        registerFilterState.q = value;
        registerFilterState.page = 1;
        render();
        const input = $('#regSearch');
        if (input) { input.focus(); input.setSelectionRange(cursorPos, cursorPos); }
      }, 300);
    });

    registerDraftFilters = { ...registerFilterState };
    [['regStatus', 'status'], ['regYear', 'year'], ['regMonth', 'month'], ['regVendor', 'vendor'], ['regArea', 'area'], ['regSupervisor', 'supervisor'], ['regIssuedBy', 'issuedBy'], ['regDateFrom', 'dateFrom'], ['regDateTo', 'dateTo']].forEach(([id, key]) => $('#' + id)?.addEventListener('change', e => {
      registerDraftFilters[key] = e.target.value;
      if (!window.matchMedia('(max-width:768px)').matches) { registerFilterState = { ...registerDraftFilters, page: 1 }; saveRegisterPreferences(); render(); }
    }));
    $('#moreFiltersToggle')?.addEventListener('click', () => { registerMoreFiltersOpen = !registerMoreFiltersOpen; saveRegisterPreferences(); render(); });
    $('#applyRegisterFilters')?.addEventListener('click', () => { const count = countRegisterMatches(registerDraftFilters); registerFilterState = { ...registerDraftFilters, page: 1 }; saveRegisterPreferences(); render(); showToast(`${count} matching record${count === 1 ? '' : 's'}`, { title: 'Filters Applied', type: 'info' }); });
    $('#resetRegisterView')?.addEventListener('click', () => { resetRegisterPreferences(); render(); showToast('Register preferences and filters reset.', { title: 'Register Reset', type: 'info' }); });
    $$('[data-status-chip]').forEach(btn => btn.addEventListener('click', () => { registerFilterState.status = btn.dataset.statusChip; registerFilterState.page = 1; saveRegisterPreferences(); render(); }));

    $('#filterToggleBtn')?.addEventListener('click', () => {
      registerFiltersOpen = !registerFiltersOpen;
      render();
    });

    $('#regPagePrev')?.addEventListener('click', () => {
      if (registerFilterState.page > 1) { registerFilterState.page -= 1; render(); }
    });
    $('#regPageNext')?.addEventListener('click', () => {
      registerFilterState.page += 1;
      render();
    });
    syncRegisterStickyOffset();
    $('#clearRegisterFilters')?.addEventListener('click', () => { resetRegisterFilters(); saveRegisterPreferences(); render(); });
    $('#emptyClearFilters')?.addEventListener('click', () => { resetRegisterFilters(); saveRegisterPreferences(); render(); });
    $$('[data-clear-filter]').forEach(btn => btn.addEventListener('click', () => { const key = btn.dataset.clearFilter; registerFilterState[key] = (key === 'q' || key === 'dateFrom' || key === 'dateTo') ? '' : 'all'; registerFilterState.page = 1; saveRegisterPreferences(); render(); }));

    $('#registerViewToggle')?.addEventListener('click', (event) => {
      const toggle = event.currentTarget;
      if (toggle.classList.contains('is-switching')) return;
      toggle.classList.add('is-switching');
      window.setTimeout(() => { registerViewExpanded = !registerViewExpanded; registerExpandedRows.clear(); saveRegisterPreferences(); render(); }, 180);
    });
    $$('.mobile-register-summary').forEach(summary => summary.addEventListener('click', (event) => { if (event.target.closest('button,a')) return; summary.querySelector('[data-mobile-register-view]')?.click(); }));
    $$('[data-mobile-register-view]').forEach((button) => button.addEventListener('click', () => {
      const row = button.closest('tr') || document.querySelector(`tr[data-register-id="${CSS.escape(button.dataset.registerId || '')}"]`);
      if (!row || button.classList.contains('is-loading')) return;
      const willExpand = !row.classList.contains('mobile-expanded');
      button.classList.add('is-loading');
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      window.setTimeout(() => {
        const rowId = String(row.dataset.registerId || '');
        if (rowId) { if (window.matchMedia('(max-width:768px)').matches && willExpand) { registerExpandedRows.clear(); $$('table.reg tr.mobile-expanded').forEach(other => { if (other !== row) other.classList.remove('mobile-expanded'); }); } if (willExpand === registerViewExpanded) registerExpandedRows.delete(rowId); else registerExpandedRows.add(rowId); saveRegisterPreferences(); }
        row.classList.toggle('mobile-expanded', willExpand);
        button.classList.remove('is-loading');
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.setAttribute('aria-expanded', String(willExpand));
        button.setAttribute('aria-label', willExpand ? 'Hide full register details' : 'View full register details');
        button.title = willExpand ? 'Hide details' : 'View full details';
        if (willExpand) window.setTimeout(() => row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 180);
      }, 280);
    }));
    $$('[data-return-history]').forEach(btn => btn.addEventListener('click', async () => {
      const issue = globalState.issuesCache.find(i => i.id === btn.dataset.returnHistory);
      const entries = issue?.returnHistory ? (Array.isArray(issue.returnHistory) ? issue.returnHistory.slice() : Object.values(issue.returnHistory)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)) : [];
      if (!entries.length) { await appAlert('No return history is available.', { title: 'Return History', type: 'info' }); return; }
      const text = entries.map((e, i) => {
        const parts = [`${i + 1}. ${e.createdAt ? formatTimestamp(e.createdAt) : (e.returnDate || 'No date')} — Qty ${e.qtyReturnedNow || 0}`, `Condition: ${e.conditionOnReturn || '—'}`, `Received by: ${e.receivedByName || e.receivedBy || '—'}`, `Photos: ${normalizePhotoUrls(e.returnPhotoUrls || e.returnPhotoUrl).length}`];
        if (e.remarks) parts.push(`Remarks: ${e.remarks}`);
        return parts.join('\n');
      }).join('\n\n');
      await appAlert(text, { title: `Return History · ${entries.length}`, type: 'info' });
    }));
    $$('[data-return]').forEach((btn) => btn.addEventListener('click', () => {
      returnFormTargetId = btn.dataset.return;
      returnFormError = '';
      navigateTo('return-record');
    }));
    $$('[data-delete-issue]').forEach((btn) => btn.addEventListener('click', async () => {
      if (await appConfirm('Delete this register entry permanently? This action cannot be undone.', { title: 'Delete register entry', type: 'danger', confirmText: 'Delete' })) deleteIssue(btn.dataset.deleteIssue);
    }));
    $$('[data-edit-return]').forEach((btn) => btn.addEventListener('click', () => {
      editReturnTargetId = btn.dataset.editReturn;
      editReturnError = '';
      navigateTo('edit-return');
    }));
    $$('[data-edit-issue]').forEach((btn) => btn.addEventListener('click', () => {
      editIssueTargetId = btn.dataset.editIssue;
      editIssueError = '';
      navigateTo('edit-issue');
    }));
  }

  if (viewId === 'profile') {
    wireHomeViewSelect();
    $('#p_photo').addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { profileSelectedPhotoFile = null; return; }
      if (!file.type.startsWith('image/')) { void appAlert('Please choose an image file.', { title: 'Invalid File', type: 'danger' }); e.target.value = ''; return; }

      const reader = new FileReader();
      reader.onload = () => { $('#p_avatarPreview').src = reader.result; };
      reader.readAsDataURL(file);

      // Compress the profile photo to max width 400px, 80% quality
      profileSelectedPhotoFile = await compressImage(file, 400, 0.8);
    });
    $('#profileChoosePhotoBtn')?.addEventListener('click', () => $('#p_photo')?.click());
    $('#profileForm').addEventListener('submit', handleProfileSubmit);
    $('#profilePasswordForm').addEventListener('submit', handleProfilePasswordSubmit);

    $('#enableNotificationsBtn')?.addEventListener('click', async () => {
      await requestNotificationPermission();
    });
    $('#testNotificationBtn')?.addEventListener('click', () => {
      showNativeNotification('Store Follow-up Test', {
        body: 'Overdue notifications are enabled and working properly on your device!',
        tag: 'cmm-test-alert'
      });
      showToast('Test notification sent to device.', { title: 'Test Alert Sent' });
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const pwaStatus = $('#profilePwaStatusArea');
    if (pwaStatus) {
      if (isStandalone) {
        pwaStatus.innerHTML = '<span class="tag tag-returned" style="padding:7px 14px; font-size:13px; display:inline-flex; align-items:center; gap:6px; font-weight:600;">✓ App is Installed & Running Standalone</span>';
      } else {
        $('#profilePwaInstallBtn')?.addEventListener('click', async () => {
          if (isIosDevice()) {
            showIosInstallDialog();
          } else if (typeof window.promptPwaInstall === 'function' && window.__deferredPwaPrompt) {
            const accepted = await window.promptPwaInstall();
            if (accepted) {
              showToast('Thank you for installing CMM SMS Store!', { title: 'App Installed' });
              render();
            }
          } else {
            showToast('To install: tap your browser menu (⋮ or Share) and choose "Install App" or "Add to Home screen".', { title: 'Install Instructions' });
          }
        });
      }
    }
  }

  if (viewId === 'issue-new') {
    $('#issueForm').addEventListener('submit', handleIssueSubmit);
    $('#f_photo').addEventListener('change', handlePhotoSelected);
    $('#f_photoClear').addEventListener('click', clearSelectedPhoto);
    $('#f_supervisorName').addEventListener('change', e => { const match = globalState.issuesCache.find(i => String(i.supervisorName || '').toLowerCase() === e.target.value.trim().toLowerCase()); if (match?.supervisorContact && !$('#f_supervisorContact').value) $('#f_supervisorContact').value = match.supervisorContact; });
    $('#f_supervisorContact').addEventListener('change', e => { const match = globalState.issuesCache.find(i => String(i.supervisorContact || '') === e.target.value.trim()); if (match?.supervisorName && !$('#f_supervisorName').value) $('#f_supervisorName').value = match.supervisorName; });
    $('#f_choosePhotoBtn').addEventListener('click', () => $('#f_photo').click());
    $('#f_cameraBtn').addEventListener('click', () => $('#f_camera').click());
    $('#f_camera').addEventListener('change', e => appendCameraPhoto(e.target, 'issue', '#f_photoPreview'));
  }

  if (viewId === 'return-record') {
    $('#returnForm').addEventListener('submit', handleReturnSubmit);
    $('#r_choosePhotoBtn').addEventListener('click', () => $('#r_photo').click());
    $('#r_cameraBtn').addEventListener('click', () => $('#r_camera').click());
    $('#r_camera').addEventListener('change', e => appendCameraPhoto(e.target, 'return', '#r_photoPreview'));
    $('#r_photo').addEventListener('change', async (e) => { let files = Array.from(e.target.files || []); if (!files.length) { returnSelectedPhotoFiles = []; $('#r_photoPreviewWrap').style.display = 'none'; $('#r_photoPreview').innerHTML = ''; return; } if (files.some(f => !f.type.startsWith('image/'))) { returnSelectedPhotoFiles = []; e.target.value = ''; $('#r_photoPreviewWrap').style.display = 'none'; $('#r_photoPreview').innerHTML = ''; await appAlert('Please choose image files only.', { title: 'Invalid Photo', type: 'danger' }); return; } files = limitPhotoFiles(files, 0); returnSelectedPhotoFiles = await Promise.all(files.map(f => compressImage(f))); previewSelectedImages(returnSelectedPhotoFiles, '#r_photoPreview'); });
    $('#r_photoClear').addEventListener('click', () => { returnSelectedPhotoFiles = []; const i = $('#r_photo'); if (i) i.value = ''; $('#r_photoPreviewWrap').style.display = 'none'; $('#r_photoPreview').innerHTML = ''; });
  }

  if (viewId === 'edit-return') {
    $('#editReturnForm').addEventListener('submit', handleEditReturnSubmit);
    $('#er_choosePhotoBtn').addEventListener('click', () => $('#er_photo').click());
    $('#er_cameraBtn').addEventListener('click', () => $('#er_camera').click());
    $('#er_camera').addEventListener('change', e => appendCameraPhoto(e.target, 'edit-return', '#er_photoPreview'));
    $('#er_photo').addEventListener('change', async e => { let files = Array.from(e.target.files || []); if (!files.length) { editReturnSelectedPhotoFiles = []; $('#er_photoPreviewWrap').style.display = 'none'; $('#er_photoPreview').innerHTML = ''; return; } if (files.some(f => !f.type.startsWith('image/'))) { editReturnSelectedPhotoFiles = []; e.target.value = ''; $('#er_photoPreviewWrap').style.display = 'none'; $('#er_photoPreview').innerHTML = ''; await appAlert('Please choose image files only.', { title: 'Invalid Photo', type: 'danger' }); return; } files = limitPhotoFiles(files, 0); editReturnSelectedPhotoFiles = await Promise.all(files.map(f => compressImage(f))); previewSelectedImages(editReturnSelectedPhotoFiles, '#er_photoPreview'); });
    $('#er_photoClear').addEventListener('click', () => { editReturnSelectedPhotoFiles = []; $('#er_photo').value = ''; $('#er_photoPreviewWrap').style.display = 'none'; $('#er_photoPreview').innerHTML = ''; });
  }
  if (viewId === 'edit-issue') {
    $('#editIssueForm').addEventListener('submit', handleEditIssueSubmit);
    $('#ei_choosePhotoBtn').addEventListener('click', () => $('#ei_photo').click());
    $('#ei_cameraBtn').addEventListener('click', () => $('#ei_camera').click());
    $('#ei_camera').addEventListener('change', e => appendCameraPhoto(e.target, 'edit-issue', '#ei_photoPreview'));
    $('#ei_photo').addEventListener('change', async e => { let files = Array.from(e.target.files || []); if (files.some(f => !f.type.startsWith('image/'))) { void appAlert('Please choose image files only.', { title: 'Invalid File', type: 'danger' }); e.target.value = ''; return; } const issue = globalState.issuesCache.find(i => i.id === editIssueTargetId); files = limitPhotoFiles(files, normalizePhotoUrls(issue?.photoUrls || issue?.photoUrl).length); editIssueSelectedPhotoFiles = await Promise.all(files.map(f => compressImage(f))); previewSelectedImages(editIssueSelectedPhotoFiles, '#ei_photoPreview'); });
    $('#ei_photoClear').addEventListener('click', () => { editIssueSelectedPhotoFiles = []; $('#ei_photo').value = ''; $('#ei_photoPreviewWrap').style.display = 'none'; $('#ei_photoPreview').innerHTML = ''; });
  }
  if (viewId === 'users-admin') {
    $('#newUserForm').addEventListener('submit', handleNewUserSubmit);
    loadRequestsTable();
    loadUsersTable();
  }

  if (viewId === 'settings-admin') {
    wireHomeViewSelect();
    renderStorageUsage();
    $('#refreshSyncStatusBtn')?.addEventListener('click', async () => {
      setSyncingState(true, 'Refreshing sync status...');
      try {
        await refreshFromCloudDatabase();
        renderStorageUsage();
        showToast('Sync status and storage metrics refreshed.', { title: 'Cloud Sync Updated' });
      } catch (err) {
        showToast('Sync refresh error: ' + err.message, { type: 'danger' });
      } finally {
        setSyncingState(false);
      }
    });

    $('#testSyncHealthBtn')?.addEventListener('click', async () => {
      setSyncingState(true, 'Testing sync health...');
      try {
        const results = [];
        
        results.push(`Network: ${navigator.onLine ? 'Online 🟢' : 'Offline 🔴'}`);
        results.push(`Firebase RTDB: ${cloudConnected ? 'Connected 🟢' : 'Disconnected 🔴'}`);
        results.push(`Issues Cache: ${globalState.issuesCache?.length || 0} records 🟢`);
        results.push(`Tools Cache: ${globalState.toolsCache?.length || 0} records 🟢`);
        
        if (db) {
          const startRead = performance.now();
          await get(ref(db, 'healthCheck/lastTest'));
          const readTime = Math.round(performance.now() - startRead);
          results.push(`Read Access: OK (${readTime}ms) 🟢`);
          
          const startWrite = performance.now();
          await set(ref(db, 'healthCheck/lastTest'), { timestamp: Date.now(), user: globalState.currentUser?.username || 'unknown' });
          const writeTime = Math.round(performance.now() - startWrite);
          results.push(`Write Access: OK (${writeTime}ms) 🟢`);
        } else {
          results.push('Read/Write Tests: Skipped (DB not initialized) 🔴');
        }
        
        await appAlert(results.join('\n'), { title: 'Sync Health Report', type: 'info' });
        
      } catch (err) {
        await appAlert('Health check failed:\n' + err.message, { title: 'Sync Health Error', type: 'danger' });
      } finally {
        setSyncingState(false);
      }
    });

    $('#loadAuditLogBtn')?.addEventListener('click', async (e) => {
      const btn = e.target;
      const container = $('#auditLogContainer');
      if (!container) return;
      btn.disabled = true; btn.textContent = 'Loading...';
      try {
        // We use query, orderByChild, and limitToLast from standard firebase imports
        // Wait, the imports at top might not include query, limitToLast, orderByChild
        // Since we don't know the exact imports, we can fetch all or just use standard get
        const snap = await get(ref(db, 'auditLog'));
        if (snap.exists()) {
          const logs = snapshotToArray(snap).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 100);
          if (logs.length === 0) {
            container.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-light); font-size: 13px;">No audit logs found.</div>';
          } else {
            container.innerHTML = '<table class="data-table" style="font-size: 13px; width: 100%;"><thead><tr><th>Date</th><th>Action</th><th>Actor</th><th>Details</th></tr></thead><tbody>' +
              logs.map(log => `<tr>
                <td style="white-space: nowrap;">${log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</td>
                <td><strong style="color: var(--primary);">${escapeHtml(log.action)}</strong></td>
                <td>${escapeHtml(log.actorName || log.actorUsername)}</td>
                <td><code style="background: none; padding: 0; color: var(--text-muted);">${escapeHtml(JSON.stringify(log.details || {}))}</code></td>
              </tr>`).join('') +
            '</tbody></table>';
          }
        } else {
          container.innerHTML = '<div style="padding: 12px; text-align: center; color: var(--text-light); font-size: 13px;">No audit logs found.</div>';
        }
      } catch (err) {
        container.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--danger); font-size: 13px;">Failed to load logs: ${escapeHtml(err.message)}</div>`;
      } finally {
        btn.disabled = false; btn.textContent = 'Load Audit Log';
      }
    });
    $('#cleanupOldRecordsBtn')?.addEventListener('click', handleCleanupOldRecords);
    $('#cleanupPreviewConfirmBtn')?.addEventListener('click', executeCleanupOldRecords);
    const closeCleanupPreview = () => { $('#cleanupPreviewDialog')?.classList.add('hidden'); pendingCleanupRecords = []; };
    $('#cleanupPreviewCancelBtn')?.addEventListener('click', closeCleanupPreview);
    $('#cleanupPreviewCloseBtn')?.addEventListener('click', closeCleanupPreview);
    $('#cleanupPreviewDialog')?.addEventListener('click', (e) => {
      if (e.target.id === 'cleanupPreviewDialog') closeCleanupPreview();
    });
    $('#clearAllStoreDataBtn')?.addEventListener('click', openClearDataDialog);
    $('#excelDateFrom')?.addEventListener('change', () => { const from = $('#excelDateFrom').value; excelDateFrom = from; if ($('#excelDateTo')) $('#excelDateTo').min = from; updateExcelExportSummary(); });
    $('#excelDateTo')?.addEventListener('change', () => { const to = $('#excelDateTo').value; excelDateTo = to; if ($('#excelDateFrom')) $('#excelDateFrom').max = to || todayStr(); updateExcelExportSummary(); });
    $('#downloadRegisterExcelBtn')?.addEventListener('click', downloadRegisterExcel);
    $('#downloadToolsExcelBtn')?.addEventListener('click', downloadToolsExcel);

    const updateToolsExcelSummary = () => {
      const cat = $('#toolsExcelCategory')?.value || 'all';
      const st = $('#toolsExcelStatus')?.value || 'all';
      const matching = globalState.toolsCache.filter(t => {
        if (cat !== 'all' && (t.category || '').trim() !== cat) return false;
        if (st !== 'all' && (t.status || 'Available') !== st) return false;
        return true;
      }).length;
      const summaryEl = $('#toolsExcelSummary');
      if (summaryEl) {
        summaryEl.innerHTML = `Matching tools to export: <strong>${matching}</strong> (out of ${globalState.toolsCache.length} total)`;
      }
    };
    $('#toolsExcelCategory')?.addEventListener('change', updateToolsExcelSummary);
    $('#toolsExcelStatus')?.addEventListener('change', updateToolsExcelSummary);

    $$('[data-excel-preset]').forEach(btn => btn.addEventListener('click', () => { const range = excelPresetRange(btn.dataset.excelPreset); excelDateFrom = range.from; excelDateTo = range.to; $('#excelDateFrom').value = range.from; $('#excelDateTo').value = range.to; updateExcelExportSummary(); }));
    $$('[data-excel-status]').forEach(btn => btn.addEventListener('click', () => {
      excelStatusFilter = btn.dataset.excelStatus;
      $$('[data-excel-status]').forEach(b => b.classList.toggle('is-active', b.dataset.excelStatus === excelStatusFilter));
      updateExcelExportSummary();
    }));
    $('#retryExcelModuleBtn')?.addEventListener('click', () => {
      const retry = $('#retryExcelModuleBtn'); if (retry) { retry.disabled = true; retry.innerHTML = '<span class="spinner"></span> Retrying…'; }
      const oldScript = document.querySelector('script[data-excel-retry]'); oldScript?.remove();
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'; script.dataset.excelRetry = 'true';
      script.onload = () => { updateExcelModuleReadiness(); showToast('Excel module is ready.', { title: 'Export Restored' }); };
      script.onerror = () => { if (retry) { retry.disabled = false; retry.textContent = 'Retry Excel Module'; } updateExcelModuleReadiness(); showToast('Excel module is still unavailable. Check the network and retry.', { title: 'Export Unavailable', type: 'danger' }); };
      document.head.appendChild(script);
    });
    $$('[data-settings-section]').forEach(btn => btn.addEventListener('click', () => { const key = btn.dataset.settingsSection, body = $(`[data-settings-body="${key}"]`), open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); body?.classList.toggle('is-collapsed', open); }));
    updateExcelModuleReadiness();
    updateExcelExportSummary();
    updateToolsExcelSummary();
  }

  if (viewId === 'tools-dashboard') {
    const isAdmin = globalState.currentUser.roles.includes('admin');
    const canManageTools = isAdmin || globalState.currentUser.roles.includes('tools_admin');
    const main = $('#appMain');

    const searchInput = main.querySelector('#toolsSearchInput');
    const searchClear = main.querySelector('#toolsSearchClear');
    const statusFilter = main.querySelector('#toolsStatusFilter');
    const categoryFilter = main.querySelector('#toolsCategoryFilter');

    if (searchInput) {
      let searchDebounce;
      searchInput.addEventListener('input', (e) => {
        const cursorPos = e.target.selectionStart;
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
          window.toolsSearchQuery = e.target.value;
          render();
          const reSearch = $('#toolsSearchInput');
          if (reSearch) {
            reSearch.focus();
            if (typeof cursorPos === 'number') {
              reSearch.setSelectionRange(cursorPos, cursorPos);
            }
          }
        }, 180);
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        window.toolsSearchQuery = '';
        render();
        const reSearch = $('#toolsSearchInput');
        if (reSearch) reSearch.focus();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        window.toolsStatusFilter = e.target.value;
        render();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        window.toolsCategoryFilter = e.target.value;
        render();
      });
    }

    main.querySelectorAll('#toolsClearFiltersBtn, #toolsClearFiltersBtnMobile').forEach(btn => {
      btn.addEventListener('click', () => {
        window.toolsSearchQuery = '';
        window.toolsStatusFilter = 'all';
        window.toolsCategoryFilter = 'all';
        render();
      });
    });

    // Wire Status Update & History modal triggers
    main.querySelectorAll('[data-update-status], [data-tool-history]').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(10);
        const toolId = btn.dataset.updateStatus || btn.dataset.toolHistory;
        openToolStatusModal(toolId);
      });
    });

    // Wire Deletion Request modal trigger (Non-admin users)
    main.querySelectorAll('[data-request-delete-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic(12);
        const toolId = btn.dataset.requestDeleteTool;
        openToolDeletionRequestModal(toolId);
      });
    });

    // Admin Request Handlers
    if (isAdmin) {
      main.querySelectorAll('[data-approve-tool-deletion]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(14);
          handleApproveToolDeletion(btn.dataset.approveToolDeletion);
        });
      });
      main.querySelectorAll('[data-reject-tool-deletion]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(14);
          handleRejectToolDeletion(btn.dataset.rejectToolDeletion);
        });
      });
      main.querySelectorAll('[data-approve-tool-addition]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(14);
          handleApproveToolAddition(btn.dataset.approveToolAddition);
        });
      });
      main.querySelectorAll('[data-reject-tool-addition]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(14);
          handleRejectToolAddition(btn.dataset.rejectToolAddition);
        });
      });
      main.querySelectorAll('[data-approve-tool-qty]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(14);
          handleApproveToolQty(btn.dataset.approveToolQty);
        });
      });
      main.querySelectorAll('[data-reject-tool-qty]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(14);
          handleRejectToolQty(btn.dataset.rejectToolQty);
        });
      });
    }

    // Wire Edit Tool
    if (canManageTools) {
      main.querySelectorAll('[data-edit-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
          triggerHaptic(10);
          window.currentEditToolId = btn.dataset.editTool;
          navigateTo('edit-tool');
        });
      });
    }

    // Wire Direct Delete Tool (Admin only)
    if (isAdmin) {
      main.querySelectorAll('[data-delete-tool]').forEach(btn => {
        btn.addEventListener('click', async () => {
          triggerHaptic(18);
          const id = btn.dataset.deleteTool;
          const tool = globalState.toolsCache.find(t => t.id === id);
          if (await appConfirm(`Are you sure you want to permanently delete tool "${tool?.toolName || id}" from the master register?`, { title: 'Delete Tool', type: 'danger', confirmText: 'Delete' })) {
            try {
              setSyncingState(true, 'Deleting tool...');
              await remove(ref(db, 'tools/' + id));
              await remove(ref(db, 'toolDeletionRequests/' + id)).catch(() => {});
              await writeAudit('tool-deleted', id, { toolName: tool?.toolName, uniqueId: tool?.uniqueId });
              showToast('Tool deleted successfully.', { title: 'Tool Deleted' });
            } catch (e) {
              appAlert('Could not delete tool: ' + e.message, { type: 'danger' });
            } finally {
              setSyncingState(false);
            }
          }
        });
      });
    }
  }
}

/* =========================================================================
   WRITE OPERATIONS
   ========================================================================= */
async function handleProfileSubmit(e) {
  e.preventDefault();
  if (!profileSelectedPhotoFile) { showToast('No new photo selected.', { title: 'Photo Required', type: 'warning' }); return; }

  const btn = $('#profileSubmitBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving...';
  setSyncingState(true, 'Uploading profile photo...');

  try {
    const ext = (profileSelectedPhotoFile.name.split('.').pop() || 'jpg').slice(0, 8);
    const path = `profile-photos/${globalState.currentUser.username}.${ext}`;
    const url = await uploadWithProgress(path, profileSelectedPhotoFile, btn);

    await update(ref(db, 'users/' + globalState.currentUser.username), { profilePhotoUrl: url, profilePhotoPath: path });

    globalState.currentUser.profilePhotoUrl = url;
    saveSession(globalState.currentUser);

    $('#topbarAvatar').src = url;
    $('#topbarAvatar').classList.remove('hidden');

    showToast('Profile photo updated successfully.', { title: 'Profile Updated' });
    profileSelectedPhotoFile = null;
    formDirty = false;
    render();
  } catch (err) {
    void appAlert('Could not upload photo: ' + (err.message || 'unknown error'), { title: 'Upload Failed', type: 'danger' });
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Profile Photo'; }
    setSyncingState(false);
  }
}

async function handleProfilePasswordSubmit(e) {
  e.preventDefault();
  profilePasswordError = '';
  hideInlineError('profilePasswordAlert');

  const currentPassword = $('#p_currentPassword').value;
  const newPassword = $('#p_newPassword').value;
  const confirmPassword = $('#p_confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    profilePasswordError = 'Please fill in your current password and the new password twice.';
    showInlineError('profilePasswordAlert', profilePasswordError); return;
  }
  if (newPassword.length < 4) {
    profilePasswordError = 'New password must be at least 4 characters.';
    showInlineError('profilePasswordAlert', profilePasswordError); return;
  }
  if (newPassword !== confirmPassword) {
    profilePasswordError = 'New password and confirmation do not match.';
    showInlineError('profilePasswordAlert', profilePasswordError); return;
  }
  if (newPassword === currentPassword) {
    profilePasswordError = 'New password must be different from your current password.';
    showInlineError('profilePasswordAlert', profilePasswordError); return;
  }

  const btn = $('#profilePasswordSubmitBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Updating...';
  setSyncingState(true, 'Updating password...');
  
  try {
    const hashedCurrentPwd = await hashPassword(currentPassword);
    const hashedNewPwd = await hashPassword(newPassword);

    const userSnap = await get(ref(db, 'users/' + globalState.currentUser.username));
    if (!userSnap.exists()) {
      profilePasswordError = 'User record not found.';
      showInlineError('profilePasswordAlert', profilePasswordError);
      return;
    }

    const userData = userSnap.val();
    const isHashedMatch = userData.password === hashedCurrentPwd;
    const isPlainMatch = String(userData.password).trim() === String(currentPassword).trim();

    if (!isHashedMatch && !isPlainMatch) {
      profilePasswordError = 'Current password is incorrect.';
      showInlineError('profilePasswordAlert', profilePasswordError);
      return;
    }

    await set(ref(db, 'users/' + globalState.currentUser.username + '/password'), hashedNewPwd);
    $('#profilePasswordAlert').className = 'alert alert-info';
    
    await writeAudit('profile-password-changed', null, {});

    $('#profilePasswordForm').reset();
    showToast('Your password has been updated.', { title: 'Password Updated' });
  } catch (err) {
    profilePasswordError = friendlySaveError(err, 'update your password');
    showInlineError('profilePasswordAlert', profilePasswordError);
  } finally {
    btn.disabled = false; btn.textContent = 'Update Password';
    setSyncingState(false);
  }
}

async function handlePhotoSelected(e) { let files = Array.from(e.target.files || []); if (!files.length) { clearSelectedPhoto(); return; } if (files.some(f => !f.type.startsWith('image/'))) { void appAlert('Please choose image files only.', { title: 'Invalid File', type: 'danger' }); e.target.value = ''; return; } files = limitPhotoFiles(files, 0); selectedPhotoFiles = await Promise.all(files.map(f => compressImage(f))); previewSelectedImages(selectedPhotoFiles, '#f_photoPreview'); }
function clearSelectedPhoto() { selectedPhotoFiles = []; const i = $('#f_photo'); if (i) i.value = ''; const w = $('#f_photoPreviewWrap'); if (w) w.style.display = 'none'; const p = $('#f_photoPreview'); if (p) p.innerHTML = ''; }
async function handleIssueSubmit(e) {
  e.preventDefault();
  issueFormError = '';
  hideInlineError('issueFormAlert');
  const materialName = $('#f_material').value.trim();
  const qty = parseInt($('#f_qty').value, 10);
  const vendor = $('#f_vendor').value.trim();
  const area = $('#f_area').value.trim();
  const issueDate = todayStr();
  const supervisorName = $('#f_supervisorName').value.trim();
  const supervisorContact = $('#f_supervisorContact').value.trim();
  const empCode = $('#f_empCode').value.trim();
  const remarks = $('#f_remarks').value.trim();
  if (!materialName || !qty || qty <= 0 || !vendor || !area || !supervisorName || !supervisorContact) {
    issueFormError = 'Please fill in material, quantity, vendor, area, supervisor name, and supervisor contact number.';
    showInlineError('issueFormAlert', issueFormError); return;
  }
  if (!/^\d{10}$/.test(supervisorContact)) {
    issueFormError = 'Supervisor contact number must be exactly 10 digits.';
    showInlineError('issueFormAlert', issueFormError); return;
  }
  const photosToUpload = selectedPhotoFiles.slice(0, MAX_PHOTOS_PER_ENTRY);
  const btn = $('#issueSubmitBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving…';
  setSyncingState(true, 'Saving record...');
  let uploadedPhotoPaths = [];
  try {
    const newRef = push(ref(db, 'issues'));
    let uploadedPhotoUrls = [], photoUploadFailed = false;
    if (photosToUpload.length && storage) {
      try { const u = await uploadMultiplePhotos('issue-photos', newRef.key, photosToUpload, btn); uploadedPhotoUrls = u.urls; uploadedPhotoPaths = u.paths; }
      catch (error) { photoUploadFailed = true; console.warn('Issue photo upload failed:', error); }
    }
    try {
      await set(newRef, {
        materialName, qtyIssued: qty, vendor, area, empCode: empCode || null,
        issueDate, supervisorName, supervisorContact, returnDate: null, qtyReturned: 0, conditionOnReturn: null,
        issuedBy: globalState.currentUser.username, issuedByName: globalState.currentUser.fullName, receivedBy: null, receivedByName: null,
        remarks: remarks || null, photoUrls: uploadedPhotoUrls, photoPaths: uploadedPhotoPaths,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
    } catch (databaseError) {
      await cleanupUploadedPaths(uploadedPhotoPaths);
      uploadedPhotoPaths = [];
      throw databaseError;
    }
    await writeAudit('issue-created', newRef.key, { materialName, qtyIssued: qty, vendor, area });
    clearSelectedPhoto();
    const photoWarning = photoUploadFailed ? ' The issue was saved, but one or more selected photos could not be uploaded.' : '';
    showToast(`Issue recorded for ${materialName} — quantity ${qty}.${photoWarning}`, { title: 'Issue Submitted' });
    formDirty = false; navigateTo('register');
  } catch (err) {
    issueFormError = friendlySaveError(err, 'save the issue record');
    showInlineError('issueFormAlert', issueFormError);
    await appAlert(issueFormError, { title: 'Issue Not Saved', type: 'danger' });
    btn.disabled = false; btn.textContent = 'Save Issue Record';
  } finally { setSyncingState(false); }
}

async function handleEditIssueSubmit(e) {
  e.preventDefault();
  editIssueError = '';
  hideInlineError('editIssueFormAlert');
  const issue = globalState.issuesCache.find((i) => i.id === editIssueTargetId);
  if (!issue) return;

  const materialName = $('#ei_material').value.trim();
  const qtyIssued = parseInt($('#ei_qty').value, 10);
  const vendor = $('#ei_vendor').value.trim();
  const area = $('#ei_area').value.trim();
  const supervisorName = $('#ei_supervisorName').value.trim();
  const supervisorContact = $('#ei_supervisorContact').value.trim();
  const empCode = $('#ei_empCode').value.trim();
  const remarks = $('#ei_remarks').value.trim();

  if (!materialName || isNaN(qtyIssued) || qtyIssued < (issue.qtyReturned || 0) || !vendor || !area || !supervisorName || !supervisorContact) {
    editIssueError = `Please fill all required fields. Quantity issued cannot be less than quantity already returned (${issue.qtyReturned || 0}).`;
    showInlineError('editIssueFormAlert', editIssueError);
    return;
  }

  if (!/^\d{10}$/.test(supervisorContact)) {
    editIssueError = 'Supervisor contact number must be exactly 10 digits.';
    showInlineError('editIssueFormAlert', editIssueError);
    return;
  }

  const btn = $('#editIssueSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving…'; }

  setSyncingState(true, 'Updating record...');
  let newlyUploadedPaths = [];
  try {
    const updates = {
      materialName, qtyIssued, vendor, area, supervisorName, supervisorContact,
      empCode: empCode || null, remarks: remarks || null, updatedAt: serverTimestamp(),
    };

    const newPhotos = editIssueSelectedPhotoFiles.slice(0, Math.max(0, MAX_PHOTOS_PER_ENTRY - normalizePhotoUrls(issue.photoUrls || issue.photoUrl).length));
    let photoWarning = '';
    if (newPhotos.length) { try { if (!storage) throw new Error('Cloud photo storage is unavailable.'); const u = await uploadMultiplePhotos('issue-photos', issue.id, newPhotos, btn); updates.photoUrls = [...(issue.photoUrls || (issue.photoUrl ? [issue.photoUrl] : [])), ...u.urls]; updates.photoPaths = [...(issue.photoPaths || (issue.photoPath ? [issue.photoPath] : [])), ...u.paths]; newlyUploadedPaths = u.paths; } catch (error) { photoWarning = ' The changes were saved, but new photos could not be uploaded.'; console.warn('Edit issue photo upload failed:', error); } }
    try { await update(ref(db, 'issues/' + issue.id), updates); } catch (databaseError) { await cleanupUploadedPaths(newlyUploadedPaths); newlyUploadedPaths = []; throw databaseError; }
    await writeAudit('issue-edited', issue.id, { materialName, qtyIssued, vendor, area });
    editIssueSelectedPhotoFiles = [];
    await appAlert(`Issue record updated successfully for ${materialName}.${photoWarning}`, { title: 'Issue Updated', type: 'success' });
    formDirty = false; navigateTo('register');
  } catch (err) {
    editIssueError = friendlySaveError(err, 'update the issue record');
    showInlineError('editIssueFormAlert', editIssueError);
    await appAlert(editIssueError, { title: 'Issue Update Failed', type: 'danger' });
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  } finally {
    setSyncingState(false);
  }
}

async function handleReturnSubmit(e) {
  e.preventDefault();
  returnFormError = '';
  hideInlineError('returnFormAlert');
  const issue = globalState.issuesCache.find((i) => i.id === returnFormTargetId);
  if (!issue) return;
  const alreadyReturned = issue.qtyReturned || 0;
  const remaining = issue.qtyIssued - alreadyReturned;
  const qty = parseInt($('#r_qty').value, 10);
  const returnDate = $('#r_date').value;
  const condition = $('#r_condition').value;
  const remarks = $('#r_remarks').value.trim();
  if (!returnDate || isNaN(qty) || qty <= 0 || qty > remaining) {
    returnFormError = `Please enter a valid return date and quantity (max ${remaining} remaining).`;
    showInlineError('returnFormAlert', returnFormError); return;
  }
  if (returnDate > todayStr() || (issue.issueDate && returnDate < issue.issueDate)) {
    returnFormError = `Return date must be between ${issue.issueDate} and today.`;
    showInlineError('returnFormAlert', returnFormError); return;
  }
  const submitBtn = document.querySelector('#returnForm button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="spinner"></span> Saving…'; }
  const existingReturnUrls = normalizePhotoUrls(issue.returnPhotoUrls || issue.returnPhotoUrl);
  const existingReturnPaths = normalizePhotoUrls(issue.returnPhotoPaths || issue.returnPhotoPath);
  const photosToUpload = returnSelectedPhotoFiles.slice(0, MAX_PHOTOS_PER_ENTRY);
  setSyncingState(true, 'Recording return...');
  let newlyUploadedPaths = [];
  try {
    let newlyUploadedUrls = [];
    if (photosToUpload.length) {
      if (!storage) throw new Error('Cloud photo storage is unavailable. The return was not submitted; selected photos are still available to retry.');
      const u = await uploadMultiplePhotos('return-photos', issue.id, photosToUpload, submitBtn);
      newlyUploadedUrls = u.urls; newlyUploadedPaths = u.paths;
      if (newlyUploadedUrls.length !== photosToUpload.length) throw new Error('Not all selected return photos were uploaded. The return was not submitted.');
    }
    const historyKey = push(ref(db, `issues/${issue.id}/returnHistory`)).key;
    const base = `issues/${issue.id}`;
    const atomicUpdates = {
      [`${base}/returnDate`]: returnDate,
      [`${base}/qtyReturned`]: increment(qty),
      [`${base}/conditionOnReturn`]: condition,
      [`${base}/receivedBy`]: globalState.currentUser.username,
      [`${base}/receivedByName`]: globalState.currentUser.fullName,
      [`${base}/remarks`]: remarks || issue.remarks || null,
      [`${base}/updatedAt`]: serverTimestamp(),
      [`${base}/returnedAt`]: serverTimestamp(),
      [`${base}/returnHistory/${historyKey}`]: {
        qtyReturnedNow: qty, returnDate, conditionOnReturn: condition,
        receivedBy: globalState.currentUser.username, receivedByName: globalState.currentUser.fullName,
        remarks: remarks || null,
        returnPhotoUrls: newlyUploadedUrls,
        returnPhotoPaths: newlyUploadedPaths,
        photoCount: newlyUploadedUrls.length,
        createdAt: serverTimestamp()
      }
    };
    if (newlyUploadedUrls.length) {
      atomicUpdates[`${base}/returnPhotoUrls`] = [...existingReturnUrls, ...newlyUploadedUrls];
      atomicUpdates[`${base}/returnPhotoPaths`] = [...existingReturnPaths, ...newlyUploadedPaths];
    }
    try { await update(ref(db), atomicUpdates); }
    catch (databaseError) { await cleanupUploadedPaths(newlyUploadedPaths); newlyUploadedPaths = []; throw databaseError; }
    await writeAudit('return-recorded', issue.id, { qtyReturnedNow: qty, returnDate, condition });
    returnSelectedPhotoFiles = [];
    const photoNote = newlyUploadedUrls.length ? ` ${newlyUploadedUrls.length} return photo${newlyUploadedUrls.length === 1 ? '' : 's'} uploaded.` : '';
    showToast(`Return recorded for ${issue.materialName} — quantity ${qty}.${photoNote}`, { title: 'Return Submitted' });
    formDirty = false; navigateTo('register');
  } catch (err) {
    returnFormError = friendlySaveError(err, 'save the return record');
    showInlineError('returnFormAlert', returnFormError);
    await appAlert(returnFormError, { title: 'Return Not Saved', type: 'danger' });
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Return'; }
  } finally { setSyncingState(false); }
}

async function handleEditReturnSubmit(e) {
  e.preventDefault();
  editReturnError = '';
  hideInlineError('editReturnFormAlert');
  const issue = globalState.issuesCache.find((i) => i.id === editReturnTargetId);
  if (!issue) return;

  const qty = parseInt($('#er_qty').value, 10);
  const returnDate = $('#er_date').value;
  const condition = $('#er_condition').value;
  const remarks = $('#er_remarks').value.trim();

  if (!returnDate || isNaN(qty) || qty < 0 || qty > issue.qtyIssued) {
    editReturnError = `Please enter a valid return date and quantity (0–${issue.qtyIssued}).`;
    showInlineError('editReturnFormAlert', editReturnError);
    return;
  }
  if (qty > 0 && (returnDate > todayStr() || (issue.issueDate && returnDate < issue.issueDate))) { editReturnError = `Return date must be between ${issue.issueDate} and today.`; showInlineError('editReturnFormAlert', editReturnError); return; }

  const btn = $('#editReturnSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Saving…'; }

  setSyncingState(true, 'Updating return...');
  let newlyUploadedPaths = [];
  try {
    const oldPaths = issue.returnPhotoPaths || (issue.returnPhotoPath ? [issue.returnPhotoPath] : []);
    const updates = qty === 0 ? { returnDate: null, qtyReturned: 0, conditionOnReturn: null, receivedBy: null, receivedByName: null, returnedAt: null, returnPhotoUrls: null, returnPhotoPaths: null, returnPhotoUrl: null, returnPhotoPath: null, returnHistory: null, updatedAt: serverTimestamp() } : { returnDate, qtyReturned: qty, conditionOnReturn: condition, remarks: remarks || issue.remarks || null, updatedAt: serverTimestamp() };
    const newPhotos = editReturnSelectedPhotoFiles.slice(0, MAX_PHOTOS_PER_ENTRY);
    let uploadedEditUrls = [];
    if (qty > 0 && newPhotos.length) {
      if (!storage) throw new Error('Cloud photo storage is unavailable. The return changes were not saved; selected photos are still available to retry.');
      const u = await uploadMultiplePhotos('return-photos', issue.id, newPhotos, btn);
      if (u.urls.length !== newPhotos.length) throw new Error('Not all selected return photos were uploaded. The return changes were not saved.');
      uploadedEditUrls = u.urls; newlyUploadedPaths = u.paths;
      updates.returnPhotoUrls = [...normalizePhotoUrls(issue.returnPhotoUrls || issue.returnPhotoUrl), ...u.urls];
      updates.returnPhotoPaths = [...oldPaths, ...u.paths];
    }
    try { await update(ref(db, 'issues/' + issue.id), updates); } catch (databaseError) { await cleanupUploadedPaths(newlyUploadedPaths); newlyUploadedPaths = []; throw databaseError; }
    if (qty === 0 && storage) for (const p of oldPaths) try { await deleteObject(storageRef(storage, p)); } catch { /* ignore */ }
    await writeAudit('return-edited', issue.id, { previousQtyReturned: issue.qtyReturned || 0, newQtyReturned: qty, returnDate: qty === 0 ? null : returnDate });
    editReturnSelectedPhotoFiles = [];
    const editPhotoNote = uploadedEditUrls.length ? ` ${uploadedEditUrls.length} return photo${uploadedEditUrls.length === 1 ? '' : 's'} uploaded.` : '';
    await appAlert(`Return record updated successfully for ${issue.materialName}.${editPhotoNote}`, { title: 'Return Updated', type: 'success' });
    formDirty = false; navigateTo('register');
  } catch (err) {
    editReturnError = friendlySaveError(err, 'update the return record');
    showInlineError('editReturnFormAlert', editReturnError);
    await appAlert(editReturnError, { title: 'Return Update Failed', type: 'danger' });
    if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
  } finally {
    setSyncingState(false);
  }
}

async function deleteIssue(id) {
  setSyncingState(true, 'Deleting record...');
  try {
    const issue = globalState.issuesCache.find((i) => i.id === id);
    if (!issue) return;

    await writeAudit('issue-deleted', id, { materialName: issue.materialName, qtyIssued: issue.qtyIssued });
    await remove(ref(db, 'issues/' + id));

    if (storage && issue) {
      for (const path of (issue.photoPaths || (issue.photoPath ? [issue.photoPath] : []))) try { await deleteObject(storageRef(storage, path)); } catch { /* ignore */ }
      for (const path of (issue.returnPhotoPaths || (issue.returnPhotoPath ? [issue.returnPhotoPath] : []))) try { await deleteObject(storageRef(storage, path)); } catch { /* ignore */ }
    }
  } catch (err) { void appAlert('Could not delete this record: ' + (err.message || 'unknown error'), { title: 'Delete Failed', type: 'danger' }); }
  finally { setSyncingState(false); }
}

// Bug fix: removed a duplicate, orphaned "Clear All Store Data" implementation that
// used to live here (its own closeClearDataDialog(), a SHA-256 password check, and its
// own #clearDataCancelBtn / #clearDataVerifyBtn / #clearDataDialog listeners). It was
// never wired to any button (handleClearAllStoreData() had zero callers) — the real,
// UI-wired flow is openClearDataDialog()/closeClearDataDialog() below, bound to
// #clearAllStoreDataBtn. Having two same-named top-level closeClearDataDialog()
// functions is a SyntaxError in an ES module ("Identifier ... has already been
// declared"), which silently killed the entire app.js module — nothing in this file
// ran, which is why the app looked like cloud sync (and everything else) had stopped.
document.addEventListener('click', (event) => { const trigger = event.target.closest?.('[data-photo-gallery]'); if (trigger) { event.preventDefault(); openPhotoGallery(trigger.dataset.photoGallery); } });
$('#photoGalleryCloseBtn')?.addEventListener('click', () => { triggerHaptic(10); closePhotoGallery(); });
$('#photoGalleryPrev')?.addEventListener('click', () => {
  if (photoGalleryUrls.length) {
    triggerHaptic(12);
    photoGalleryIndex = (photoGalleryIndex - 1 + photoGalleryUrls.length) % photoGalleryUrls.length;
    updatePhotoGallery();
  }
});
$('#photoGalleryNext')?.addEventListener('click', () => {
  if (photoGalleryUrls.length) {
    triggerHaptic(12);
    photoGalleryIndex = (photoGalleryIndex + 1) % photoGalleryUrls.length;
    updatePhotoGallery();
  }
});
$('#photoGalleryDialog')?.addEventListener('click', (event) => { if (event.target.id === 'photoGalleryDialog') closePhotoGallery(); });
document.addEventListener('keydown', (event) => {
  if ($('#photoGalleryDialog')?.classList.contains('hidden')) return;
  if (event.key === 'Escape') closePhotoGallery();
  if (event.key === 'ArrowLeft') $('#photoGalleryPrev')?.click();
  if (event.key === 'ArrowRight') $('#photoGalleryNext')?.click();
});

// Touch Swipe Gestures for Mobile Photo Lightbox
(function initGallerySwipe() {
  let touchStartX = 0;
  let touchStartY = 0;
  const galleryStage = document.querySelector('.photo-gallery-stage');
  if (!galleryStage) return;

  galleryStage.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  galleryStage.addEventListener('touchend', (e) => {
    if (!touchStartX || !e.changedTouches || !e.changedTouches.length) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= 40) {
      triggerHaptic(12);
      if (diffX < 0) {
        $('#photoGalleryNext').click();
      } else {
        $('#photoGalleryPrev').click();
      }
    }
    touchStartX = 0;
    touchStartY = 0;
  }, { passive: true });
})();

/* =========================================================================
   TOOL STATUS & DELETION REQUEST MODAL CONTROLLERS
   ========================================================================= */
function getToolStatusQuantities(tool) {
  if (tool.statusQuantities) return tool.statusQuantities;
  const legacyStatus = tool.status || 'Available';
  return {
    'Available': legacyStatus === 'Available' ? (tool.quantity || 0) : 0,
    'In Maintenance': legacyStatus === 'In Maintenance' ? (tool.quantity || 0) : 0,
    'Damaged': legacyStatus === 'Damaged' ? (tool.quantity || 0) : 0,
    'Lost': legacyStatus === 'Lost' ? (tool.quantity || 0) : 0
  };
}

function updateStatusModalSum() {
  const maintenance = parseInt($('#statusModalQtyMaintenance')?.value || '0', 10) || 0;
  const damaged = parseInt($('#statusModalQtyDamaged')?.value || '0', 10) || 0;
  const lost = parseInt($('#statusModalQtyLost')?.value || '0', 10) || 0;
  
  const totalSumEl = $('#statusModalTotalSum');
  const targetTotal = parseInt(totalSumEl?.textContent || '0', 10) || 0;
  
  let available = targetTotal - (maintenance + damaged + lost);
  // Optional: clamp to 0 if they type more than total
  // But if we clamp, sum > targetTotal, triggering the warn/disabled save button!
  
  const availableInput = $('#statusModalQtyAvailable');
  if (availableInput) {
    // Show negative so user knows they over-allocated, or clamp to 0. Clamping to 0 is safer for UI.
    availableInput.value = available < 0 ? 0 : available;
    if (available < 0) available = 0;
  }

  const sum = available + maintenance + damaged + lost;
  
  const sumEl = $('#statusModalAllocatedSum');
  if (sumEl) sumEl.textContent = sum;
  
  const warnEl = $('#statusModalAllocatedWarn');
  const saveBtn = $('#statusModalSaveBtn');
  if (sum !== targetTotal) {
    if (sumEl) sumEl.style.color = 'var(--danger)';
    if (warnEl) warnEl.style.display = 'inline';
    if (saveBtn) saveBtn.disabled = true;
  } else {
    if (sumEl) sumEl.style.color = '';
    if (warnEl) warnEl.style.display = 'none';
    if (saveBtn) saveBtn.disabled = false;
  }
}

function openToolStatusModal(toolId) {
  const tool = globalState.toolsCache.find(t => t.id === toolId);
  if (!tool) return;
  const toolIdInput = $('#statusModalToolId');
  if (toolIdInput) toolIdInput.value = toolId;

  const titleEl = $('#toolStatusTitle');
  if (titleEl) titleEl.textContent = `Status: ${tool.toolName}`;

  const subEl = $('#toolStatusSubtitle');
  if (subEl) subEl.innerHTML = `ID: <span class="mono">${escapeHtml(tool.uniqueId || '—')}</span> &bull; Location: ${escapeHtml(tool.location || '—')} &bull; Qty: ${escapeHtml(tool.quantity ?? 0)}`;

  const sq = getToolStatusQuantities(tool);
  if ($('#statusModalQtyAvailable')) $('#statusModalQtyAvailable').value = sq['Available'] || 0;
  if ($('#statusModalQtyMaintenance')) $('#statusModalQtyMaintenance').value = sq['In Maintenance'] || 0;
  if ($('#statusModalQtyDamaged')) $('#statusModalQtyDamaged').value = sq['Damaged'] || 0;
  if ($('#statusModalQtyLost')) $('#statusModalQtyLost').value = sq['Lost'] || 0;
  
  if ($('#statusModalTotalSum')) $('#statusModalTotalSum').textContent = tool.quantity || 0;
  updateStatusModalSum();

  const btnQty = $('#statusModalRequestQtyBtn');
  if (btnQty) {
    if (globalState.currentUser?.roles?.includes('tools_admin') && !globalState.currentUser?.roles?.includes('admin')) {
      btnQty.style.display = 'inline-block';
      btnQty.onclick = () => {
        handleRequestTotalQuantityChange(toolId);
      };
    } else {
      btnQty.style.display = 'none';
    }
  }

  const notesEl = $('#statusModalNotes');
  if (notesEl) notesEl.value = '';

  const timelineEl = $('#toolStatusHistoryTimeline');
  if (timelineEl) {
    const history = Array.isArray(tool.statusHistory) ? [...tool.statusHistory] : [];
    if (!history.length && tool.status) {
      history.push({
        status: tool.status,
        previousStatus: null,
        changedBy: tool.createdBy || 'Initial System Record',
        changedByUsername: tool.createdBy || 'system',
        timestamp: tool.createdAt || Date.now(),
        dateStr: tool.createdAt ? new Date(tool.createdAt).toLocaleString() : new Date().toLocaleString(),
        notes: tool.notes || 'Initial registration'
      });
    }
    history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (!history.length) {
      timelineEl.innerHTML = '<div class="empty-state" style="padding:16px 0;"><p style="margin:0; font-size:12.5px; color:var(--text-muted);">No status updates recorded yet.</p></div>';
    } else {
      timelineEl.innerHTML = history.map(item => {
        let badgeClass = 'good';
        if (item.status === 'Lost' || item.status === 'Damaged') badgeClass = 'bad';
        else if (item.status === 'In Maintenance') badgeClass = 'warn';
        return `
          <div class="tool-timeline-item">
            <span class="tool-timeline-dot"></span>
            <div class="tool-timeline-top">
              <span class="badge ${badgeClass}">${escapeHtml(item.status || 'Available')}</span>
              <div class="tool-timeline-meta">
                <span>${escapeHtml(item.changedBy || item.changedByUsername || 'User')}</span>
                &bull;
                <span class="mono">${escapeHtml(item.dateStr || (item.timestamp ? new Date(item.timestamp).toLocaleString() : '—'))}</span>
              </div>
            </div>
            ${item.previousStatus && item.previousStatus !== item.status ? `<div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Changed from: <em>${escapeHtml(item.previousStatus)}</em></div>` : ''}
            ${item.notes ? `<div class="tool-timeline-note">${escapeHtml(item.notes)}</div>` : ''}
          </div>
        `;
      }).join('');
    }
  }

  $('#toolStatusDialog')?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeToolStatusModal() {
  $('#toolStatusDialog')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function openToolDeletionRequestModal(toolId) {
  const tool = globalState.toolsCache.find(t => t.id === toolId);
  if (!tool) return;
  const toolIdInput = $('#deletionReqToolId');
  if (toolIdInput) toolIdInput.value = toolId;

  const infoEl = $('#deletionReqToolInfo');
  if (infoEl) {
    infoEl.innerHTML = `
      <strong>${escapeHtml(tool.toolName)}</strong> <span class="mono">(${escapeHtml(tool.uniqueId || '—')})</span><br/>
      <span style="color:var(--text-muted); font-size:12.5px;">Category: ${escapeHtml(tool.category || 'General')} &bull; Location: ${escapeHtml(tool.location || '—')} &bull; Qty: ${escapeHtml(tool.quantity ?? 0)} &bull; Status: ${escapeHtml(tool.status || 'Available')}</span>
    `;
  }

  const reasonEl = $('#deletionReqReason');
  if (reasonEl) reasonEl.value = '';

  $('#toolDeletionRequestDialog')?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeToolDeletionRequestModal() {
  $('#toolDeletionRequestDialog')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

async function handleToolStatusSubmit(e) {
  e.preventDefault();
  const toolId = $('#statusModalToolId')?.value;
  const tool = globalState.toolsCache.find(t => t.id === toolId);
  if (!tool) { await appAlert('Tool record not found.', { type: 'danger' }); return; }

  const available = parseInt($('#statusModalQtyAvailable')?.value || '0', 10) || 0;
  const maintenance = parseInt($('#statusModalQtyMaintenance')?.value || '0', 10) || 0;
  const damaged = parseInt($('#statusModalQtyDamaged')?.value || '0', 10) || 0;
  const lost = parseInt($('#statusModalQtyLost')?.value || '0', 10) || 0;
  const sum = available + maintenance + damaged + lost;
  const total = parseInt(tool.quantity || 0, 10);
  
  if (sum !== total) {
    await appAlert(`The allocated quantities (${sum}) must equal the tool's total quantity (${total}).`, { type: 'warn' });
    return;
  }
  
  const newStatusQuantities = {
    'Available': available,
    'In Maintenance': maintenance,
    'Damaged': damaged,
    'Lost': lost
  };

  // Determine a primary display status
  let newPrimaryStatus = 'Available';
  if (available < total) {
    if (maintenance >= damaged && maintenance >= lost && maintenance > 0) newPrimaryStatus = 'In Maintenance';
    else if (damaged >= lost && damaged > 0) newPrimaryStatus = 'Damaged';
    else if (lost > 0) newPrimaryStatus = 'Lost';
  }
  
  // Format history text
  const parts = [];
  if (available > 0) parts.push(`${available} Available`);
  if (maintenance > 0) parts.push(`${maintenance} Maintenance`);
  if (damaged > 0) parts.push(`${damaged} Damaged`);
  if (lost > 0) parts.push(`${lost} Lost`);
  const statusSnapshot = parts.join(', ') || '0 items';

  const notes = ($('#statusModalNotes')?.value || '').trim();
  const btn = $('#statusModalSaveBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  try {
    setSyncingState(true, 'Updating tool status...');
    const now = Date.now();
    const dateStr = new Date().toLocaleString();
    const historyEntry = {
      status: statusSnapshot,
      previousStatus: null,
      changedBy: globalState.currentUser.fullName || globalState.currentUser.username,
      changedByUsername: globalState.currentUser.username,
      timestamp: now,
      dateStr: dateStr,
      notes: notes
    };

    const currentHistory = Array.isArray(tool.statusHistory) ? [...tool.statusHistory] : (tool.status ? [{
      status: tool.status,
      previousStatus: null,
      changedBy: tool.createdBy || 'Initial System Record',
      changedByUsername: tool.createdBy || 'system',
      timestamp: tool.createdAt || now,
      dateStr: tool.createdAt ? new Date(tool.createdAt).toLocaleString() : dateStr,
      notes: tool.notes || 'Initial registration'
    }] : []);
    const updatedHistory = [...currentHistory, historyEntry];

    await update(ref(db, 'tools/' + toolId), {
      status: newPrimaryStatus,
      statusQuantities: newStatusQuantities,
      statusHistory: updatedHistory,
      updatedAt: serverTimestamp(),
      updatedBy: globalState.currentUser.username,
      lastStatusNote: notes
    });

    await writeAudit('tool-status-updated', toolId, {
      toolName: tool.toolName,
      uniqueId: tool.uniqueId,
      statusQuantities: newStatusQuantities,
      notes
    });

    showToast(`Tool status updated to "${newPrimaryStatus}"`, { title: 'Status Updated' });
    closeToolStatusModal();
  } catch (err) {
    await appAlert('Could not update tool status: ' + err.message, { type: 'danger' });
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Status Update'; }
    setSyncingState(false);
  }
}

async function handleToolDeletionRequestSubmit(e) {
  e.preventDefault();
  const toolId = $('#deletionReqToolId')?.value;
  const reason = ($('#deletionReqReason')?.value || '').trim();
  if (!reason) { await appAlert('Please provide a reason for the deletion request.', { type: 'warn' }); return; }
  const tool = globalState.toolsCache.find(t => t.id === toolId);
  if (!tool) { await appAlert('Tool record not found.', { type: 'danger' }); return; }

  const btn = $('#deletionReqSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }

  try {
    setSyncingState(true, 'Submitting deletion request...');
    await set(ref(db, 'toolDeletionRequests/' + toolId), {
      toolId: toolId,
      toolName: tool.toolName,
      uniqueId: tool.uniqueId || '',
      category: tool.category || '',
      quantity: tool.quantity ?? 0,
      status: tool.status || 'Available',
      reason: reason,
      requestedBy: globalState.currentUser.username,
      requestedByName: globalState.currentUser.fullName || globalState.currentUser.username,
      requestedAt: Date.now()
    });

    await writeAudit('tool-deletion-requested', toolId, {
      toolName: tool.toolName,
      uniqueId: tool.uniqueId,
      reason
    });

    showToast('Deletion request submitted to Administrator', { title: 'Request Sent' });
    closeToolDeletionRequestModal();
  } catch (err) {
    await appAlert('Could not submit deletion request: ' + err.message, { type: 'danger' });
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Deletion Request'; }
    setSyncingState(false);
  }
}

async function handleApproveToolDeletion(reqId) {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can approve tool deletions.', { type: 'danger' });
    return;
  }
  const req = globalState.toolDeletionRequestsCache.find(r => (r.id || r.toolId) === reqId);
  const toolId = req?.toolId || reqId;
  const toolName = req?.toolName || 'this tool';

  if (await appConfirm(`Permanently delete tool "${toolName}" per the deletion request? This will remove the tool from the Master Register.`, {
    title: 'Approve & Delete Tool',
    type: 'danger',
    confirmText: 'Approve & Delete'
  })) {
    try {
      setSyncingState(true, 'Deleting tool...');
      await remove(ref(db, 'tools/' + toolId));
      await remove(ref(db, 'toolDeletionRequests/' + (req?.id || toolId)));
      await writeAudit('tool-deletion-approved', toolId, {
        toolName,
        uniqueId: req?.uniqueId || '',
        reason: req?.reason || '',
        requestedBy: req?.requestedBy || '',
        approvedBy: globalState.currentUser.username
      });
      showToast(`Tool "${toolName}" deleted successfully.`, { title: 'Tool Deleted' });
    } catch (err) {
      await appAlert('Could not delete tool: ' + err.message, { type: 'danger' });
    } finally {
      setSyncingState(false);
    }
  }
}

async function handleRejectToolDeletion(reqId) {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can reject deletion requests.', { type: 'danger' });
    return;
  }
  const req = globalState.toolDeletionRequestsCache.find(r => (r.id || r.toolId) === reqId);
  const toolName = req?.toolName || 'tool';

  if (await appConfirm(`Reject the deletion request for "${toolName}"? The tool will remain in the master register.`, {
    title: 'Reject Deletion Request',
    type: 'warn',
    confirmText: 'Reject Request'
  })) {
    try {
      setSyncingState(true, 'Rejecting request...');
      await remove(ref(db, 'toolDeletionRequests/' + (req?.id || reqId)));
      await writeAudit('tool-deletion-rejected', reqId, {
        toolName,
        requestedBy: req?.requestedBy || '',
        rejectedBy: globalState.currentUser.username
      });
      showToast('Deletion request rejected.', { title: 'Request Rejected' });
    } catch (err) {
      await appAlert('Could not reject request: ' + err.message, { type: 'danger' });
    } finally {
      setSyncingState(false);
    }
  }
}

function closeToolQtyRequestModal() {
  $('#toolQtyRequestDialog')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function handleRequestTotalQuantityChange(toolId) {
  const tool = globalState.toolsCache.find(t => t.id === toolId);
  if (!tool) return;
  
  const currentQty = tool.quantity || 0;
  
  const toolIdInput = $('#qtyReqToolId');
  const toolInfo = $('#qtyReqToolInfo');
  const newQtyInput = $('#qtyReqNewQuantity');
  
  if (toolIdInput) toolIdInput.value = toolId;
  if (toolInfo) toolInfo.innerHTML = `<strong>Tool:</strong> ${escapeHtml(tool.toolName)}<br><strong>Current Total:</strong> ${currentQty}`;
  if (newQtyInput) newQtyInput.value = currentQty;
  
  $('#toolQtyRequestDialog')?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

async function handleQtyRequestSubmit(e) {
  e.preventDefault();
  
  const toolId = $('#qtyReqToolId')?.value;
  const tool = globalState.toolsCache.find(t => t.id === toolId);
  if (!tool) {
    await appAlert('Tool record not found.', { type: 'danger' });
    return;
  }
  
  const currentQty = tool.quantity || 0;
  const newQty = parseInt($('#qtyReqNewQuantity')?.value, 10);
  
  if (isNaN(newQty) || newQty < 0) {
    await appAlert('Invalid quantity entered.', { type: 'warn' });
    return;
  }
  
  if (newQty === currentQty) {
    await appAlert('The requested quantity is the same as the current quantity.', { type: 'info' });
    return;
  }
  
  const btn = $('#qtyReqSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting...'; }
  
  try {
    setSyncingState(true, 'Submitting quantity update request...');
    await push(ref(db, 'toolQuantityRequests'), {
      toolId: toolId,
      toolName: tool.toolName,
      uniqueId: tool.uniqueId || '',
      oldQuantity: currentQty,
      newQuantity: newQty,
      requestedBy: globalState.currentUser.username,
      requestedByName: globalState.currentUser.fullName || globalState.currentUser.username,
      createdAt: serverTimestamp()
    });
    showToast('Quantity update request submitted to admin.', { title: 'Request Sent' });
    closeToolQtyRequestModal();
  } catch (err) {
    await appAlert('Could not submit request: ' + err.message, { type: 'danger' });
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Submit Request'; }
    setSyncingState(false);
  }
}

async function handleApproveToolAddition(reqId) {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can approve tool additions.', { type: 'danger' });
    return;
  }
  const req = globalState.toolAdditionRequestsCache.find(r => r.id === reqId || r.toolName === reqId);
  if (!req) return;
  const toolName = req.toolName || 'tool';

  if (await appConfirm(`Approve the addition of "${toolName}" and add it to the Master Register?`, {
    title: 'Approve Tool Addition',
    confirmText: 'Approve & Add'
  })) {
    try {
      setSyncingState(true, 'Adding tool...');
      let maxSequence = 0;
      const upperName = req.toolName.replace(/\//g, '-').trim().toUpperCase();
      
      globalState.toolsCache.forEach(t => {
        const tName = (t.toolName || '').replace(/\//g, '-').trim().toUpperCase();
        const prefix = `CMM/SMS/${upperName}/`;
        if (tName === upperName || (t.uniqueId && t.uniqueId.startsWith(prefix))) {
          const match = (t.uniqueId || '').match(/(\d+)$/);
          if (match) {
            const seq = parseInt(match[1], 10);
            if (seq > maxSequence) maxSequence = seq;
          }
        }
      });
      
      const nextSequence = String(maxSequence + 1).padStart(4, '0');
      const uniqueId = `CMM/SMS/${upperName}/${nextSequence}`;
      
      const newToolData = { ...req };
      delete newToolData.id;
      delete newToolData.requestedByName;
      newToolData.uniqueId = uniqueId;
      newToolData.statusHistory = [{
        status: req.status || 'Available',
        previousStatus: null,
        changedBy: globalState.currentUser.fullName || globalState.currentUser.username,
        changedByUsername: globalState.currentUser.username,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString(),
        notes: req.notes || 'Approved tool addition'
      }];
      
      const newRef = await push(ref(db, 'tools'), newToolData);
      await remove(ref(db, 'toolAdditionRequests/' + (req.id || reqId)));
      await writeAudit('tool-addition-approved', newRef.key, {
        toolName,
        uniqueId,
        requestedBy: req.createdBy || '',
        approvedBy: globalState.currentUser.username
      });
      showToast(`Tool "${toolName}" approved and added successfully.`, { title: 'Tool Added' });
    } catch (err) {
      await appAlert('Could not approve tool addition: ' + err.message, { type: 'danger' });
    } finally {
      setSyncingState(false);
    }
  }
}

async function handleRejectToolAddition(reqId) {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can reject tool additions.', { type: 'danger' });
    return;
  }
  const req = globalState.toolAdditionRequestsCache.find(r => r.id === reqId || r.toolName === reqId);
  const toolName = req?.toolName || 'tool';

  if (await appConfirm(`Reject the addition request for "${toolName}"? This will permanently delete the request.`, {
    title: 'Reject Tool Addition',
    type: 'warn',
    confirmText: 'Reject Request'
  })) {
    try {
      setSyncingState(true, 'Rejecting request...');
      await remove(ref(db, 'toolAdditionRequests/' + (req?.id || reqId)));
      await writeAudit('tool-addition-rejected', reqId, {
        toolName,
        requestedBy: req?.createdBy || '',
        rejectedBy: globalState.currentUser.username
      });
      showToast('Tool addition request rejected.', { title: 'Request Rejected' });
    } catch (err) {
      await appAlert('Could not reject request: ' + err.message, { type: 'danger' });
    } finally {
      setSyncingState(false);
    }
  }
}

async function handleApproveToolQty(reqId) {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can approve quantity changes.', { type: 'danger' });
    return;
  }
  const req = globalState.toolQuantityRequestsCache.find(r => r.id === reqId || r.toolId === reqId);
  if (!req) return;
  const toolName = req.toolName || 'tool';

  if (await appConfirm(`Approve changing the total quantity of "${toolName}" from ${req.oldQuantity} to ${req.newQuantity}?`, {
    title: 'Approve Quantity Change',
    confirmText: 'Approve'
  })) {
    try {
      setSyncingState(true, 'Updating quantity...');
      const tool = globalState.toolsCache.find(t => t.id === req.toolId);
      if (tool) {
        await update(ref(db, 'tools/' + tool.id), { quantity: req.newQuantity });
      }
      await remove(ref(db, 'toolQuantityRequests/' + (req.id || reqId)));
      await writeAudit('tool-qty-change-approved', req.toolId, {
        toolName,
        oldQuantity: req.oldQuantity,
        newQuantity: req.newQuantity,
        requestedBy: req.requestedBy || '',
        approvedBy: globalState.currentUser.username
      });
      showToast(`Quantity for "${toolName}" updated successfully.`, { title: 'Quantity Updated' });
    } catch (err) {
      await appAlert('Could not approve quantity change: ' + err.message, { type: 'danger' });
    } finally {
      setSyncingState(false);
    }
  }
}

async function handleRejectToolQty(reqId) {
  if (!globalState.currentUser?.roles.includes('admin')) {
    await appAlert('Only administrators can reject quantity changes.', { type: 'danger' });
    return;
  }
  const req = globalState.toolQuantityRequestsCache.find(r => r.id === reqId || r.toolId === reqId);
  const toolName = req?.toolName || 'tool';

  if (await appConfirm(`Reject the total quantity change request for "${toolName}"?`, {
    title: 'Reject Quantity Change',
    type: 'warn',
    confirmText: 'Reject Request'
  })) {
    try {
      setSyncingState(true, 'Rejecting request...');
      await remove(ref(db, 'toolQuantityRequests/' + (req?.id || reqId)));
      await writeAudit('tool-qty-change-rejected', reqId, {
        toolName,
        requestedBy: req?.requestedBy || '',
        rejectedBy: globalState.currentUser.username
      });
      showToast('Quantity change request rejected.', { title: 'Request Rejected' });
    } catch (err) {
      await appAlert('Could not reject request: ' + err.message, { type: 'danger' });
    } finally {
      setSyncingState(false);
    }
  }
}


// Wire Dialog Modal Event Listeners
$('#toolStatusCloseBtn')?.addEventListener('click', closeToolStatusModal);
$('#statusModalCancelBtn')?.addEventListener('click', closeToolStatusModal);
$('#toolStatusForm')?.addEventListener('submit', handleToolStatusSubmit);
$('#toolStatusDialog')?.addEventListener('click', (event) => { if (event.target.id === 'toolStatusDialog') closeToolStatusModal(); });
['Available', 'Maintenance', 'Damaged', 'Lost'].forEach(st => {
  $(`#statusModalQty${st}`)?.addEventListener('input', updateStatusModalSum);
});

$('#toolDeletionRequestCloseBtn')?.addEventListener('click', closeToolDeletionRequestModal);
$('#deletionReqCancelBtn')?.addEventListener('click', closeToolDeletionRequestModal);
$('#toolDeletionRequestForm')?.addEventListener('submit', handleToolDeletionRequestSubmit);
$('#toolDeletionRequestDialog')?.addEventListener('click', (event) => { if (event.target.id === 'toolDeletionRequestDialog') closeToolDeletionRequestModal(); });

$('#toolQtyRequestCloseBtn')?.addEventListener('click', closeToolQtyRequestModal);
$('#qtyReqCancelBtn')?.addEventListener('click', closeToolQtyRequestModal);
$('#toolQtyRequestForm')?.addEventListener('submit', handleQtyRequestSubmit);
$('#toolQtyRequestDialog')?.addEventListener('click', (event) => { if (event.target.id === 'toolQtyRequestDialog') closeToolQtyRequestModal(); });

// Overdue Follow-up Modal Event Listeners
$('#topbarOverdueBtn')?.addEventListener('click', openOverdueFollowUpModal);
$('#topbarRequestsBtn')?.addEventListener('click', () => navigateTo('tools-dashboard'));
$('#overdueFollowUpCloseBtn')?.addEventListener('click', closeOverdueFollowUpModal);
$('#overdueModalDoneBtn')?.addEventListener('click', closeOverdueFollowUpModal);
$('#overdueFollowUpDialog')?.addEventListener('click', (event) => { if (event.target.id === 'overdueFollowUpDialog') closeOverdueFollowUpModal(); });
$('#overdueViewAllRegisterBtn')?.addEventListener('click', () => {
  closeOverdueFollowUpModal();
  registerFilterState.q = '';
  registerFilterState.status = 'Issued';
  registerFilterState.page = 1;
  saveRegisterPreferences();
  navigateTo('register');
});

// Clear All Store Data Verification Dialog Handlers
function openClearDataDialog() {
  const pwdInput = $('#clearDataPassword');
  const errEl = $('#clearDataPasswordError');
  if (pwdInput) pwdInput.value = '';
  if (errEl) {
    errEl.textContent = '';
    errEl.classList.add('hidden');
  }
  $('#clearDataDialog')?.classList.remove('hidden');
  document.body.classList.add('modal-open');
  setTimeout(() => pwdInput?.focus(), 50);
}

function closeClearDataDialog() {
  $('#clearDataDialog')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

$('#clearDataCancelBtn')?.addEventListener('click', closeClearDataDialog);
$('#clearDataDialog')?.addEventListener('click', (event) => {
  if (event.target.id === 'clearDataDialog') closeClearDataDialog();
});

$('#clearDataVerifyBtn')?.addEventListener('click', async () => {
  const pwd = $('#clearDataPassword')?.value || '';
  const errEl = $('#clearDataPasswordError');

  if (pwd !== ADMIN_PASSWORD) {
    if (errEl) {
      errEl.textContent = 'Incorrect cleanup password. Verification failed.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  closeClearDataDialog();

  const doubleConfirmed = await appConfirm(
    'DANGER: Are you sure you want to permanently clear all Material Issue Register records, return logs, uploaded photos, pending access requests, and audit history?\n\nStaff accounts and Tool Master Catalog records will NOT be deleted.',
    { title: 'Permanently Erase Store Records', type: 'danger', confirmText: 'Yes, Erase Everything', cancelText: 'Cancel' }
  );
  if (!doubleConfirmed) return;

  setSyncingState(true, 'Clearing all store data...');
  try {
    // 1. Delete storage photos for issues
    if (storage) {
      for (const issue of globalState.issuesCache) {
        for (const path of (issue.photoPaths || (issue.photoPath ? [issue.photoPath] : []))) {
          try { await deleteObject(storageRef(storage, path)); } catch { /* ignore */ }
        }
        for (const path of (issue.returnPhotoPaths || (issue.returnPhotoPath ? [issue.returnPhotoPath] : []))) {
          try { await deleteObject(storageRef(storage, path)); } catch { /* ignore */ }
        }
      }
    }

    // 2. Remove RTDB collections (Issues, access requests, audit log)
    await remove(ref(db, 'issues'));
    await remove(ref(db, 'accessRequests'));
    await remove(ref(db, 'auditLog'));

    // 3. Write new audit log marking the clear
    await writeAudit('store-data-cleared', null, { clearedBy: globalState.currentUser.username, timestamp: Date.now() });

    globalState.issuesCache = [];
    showToast('All material issue records and store data have been cleared.', { title: 'Store Data Cleared' });
    render();
  } catch (err) {
    appAlert('Error clearing store data: ' + err.message, { type: 'danger' });
  } finally {
    setSyncingState(false);
  }
});

// Service Worker message receiver for mobile notification clicks
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && (event.data.action === 'open-overdue' || event.data.filter === 'overdue' || event.data.action === 'open-register')) {
      if (event.data.action === 'open-overdue' || event.data.filter === 'overdue') {
        openOverdueFollowUpModal();
      } else {
        navigateTo('register');
      }
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (!$('#toolStatusDialog')?.classList.contains('hidden')) closeToolStatusModal();
    if (!$('#toolDeletionRequestDialog')?.classList.contains('hidden')) closeToolDeletionRequestModal();
    if (!$('#overdueFollowUpDialog')?.classList.contains('hidden')) closeOverdueFollowUpModal();
    if (!$('#clearDataDialog')?.classList.contains('hidden')) closeClearDataDialog();
  }
});

let pendingCleanupRecords = [];

async function handleCleanupOldRecords() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 3);

  const toDelete = globalState.issuesCache.filter(issue => {
    if (statusOf(issue) !== 'Returned') return false;
    const completed = issue.returnedAt ? new Date(issue.returnedAt) : (issue.returnDate ? new Date(issue.returnDate + 'T23:59:59') : null);
    return completed && !Number.isNaN(completed.getTime()) && completed < cutoffDate;
  });

  if (toDelete.length === 0) {
    void appAlert('Your database is already clean! No completed records older than 3 months were found.', { title: 'Database Clean', type: 'info' });
    return;
  }

  const btn = $('#cleanupOldRecordsBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Loading...'; }

  pendingCleanupRecords = toDelete;

  // Show modal
  $('#cleanupPreviewDialog').classList.remove('hidden');
  const tbody = $('#cleanupPreviewTableBody');
  if (tbody) {
    tbody.innerHTML = toDelete.map(issue => `
      <tr>
        <td class="mono">${escapeHtml(issue.id)}</td>
        <td><strong>${escapeHtml(issue.materialName || '—')}</strong></td>
        <td class="mono">${issue.returnedAt ? new Date(issue.returnedAt).toLocaleDateString() : (issue.returnDate || '—')}</td>
      </tr>
    `).join('');
  }

  const banner = $('#cleanupPreviewStorageBanner');
  if (banner) {
    banner.style.background = 'var(--surface)';
    banner.style.color = 'inherit';
    banner.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; border-width: 2px;"></span> Calculating storage space...`;
  }

  // Calculate total space
  let totalBytes = 0;
  if (storage) {
    const allPaths = [];
    for (const issue of toDelete) {
      if (issue.photoPaths) allPaths.push(...issue.photoPaths);
      else if (issue.photoPath) allPaths.push(issue.photoPath);

      if (issue.returnPhotoPaths) allPaths.push(...issue.returnPhotoPaths);
      else if (issue.returnPhotoPath) allPaths.push(issue.returnPhotoPath);
    }
    
    // Batch getMetadata requests
    const metadataPromises = allPaths.filter(Boolean).map(path => {
      return getMetadata(storageRef(storage, path)).catch(() => ({ size: 0 }));
    });
    
    const metadatas = await Promise.all(metadataPromises);
    for (const meta of metadatas) {
      totalBytes += Number(meta.size || 0);
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Delete Returned Records Older Than 3 Months'; }
  if (banner) {
    const mb = (totalBytes / (1024 * 1024)).toFixed(2);
    banner.style.background = 'rgba(16, 185, 129, 0.1)';
    banner.style.color = 'var(--success)';
    banner.innerHTML = `<strong>${mb} MB</strong> of cloud storage will be freed from attached photos.`;
  }
}

async function executeCleanupOldRecords() {
  const toDelete = pendingCleanupRecords;
  $('#cleanupPreviewDialog').classList.add('hidden');
  pendingCleanupRecords = [];
  
  if (toDelete.length === 0) return;

  setSyncingState(true, `Deleting ${toDelete.length} records...`);
  
  let successCount = 0;
  let failCount = 0;

  for (const issue of toDelete) {
    try {
      await writeAudit('issue-cleanup-deleted', issue.id, { materialName: issue.materialName, returnDate: issue.returnDate || null });
      await remove(ref(db, 'issues/' + issue.id));

      if (storage) {
        for (const path of (issue.photoPaths || (issue.photoPath ? [issue.photoPath] : []))) try { await deleteObject(storageRef(storage, path)); } catch { /* ignore */ }
        for (const path of (issue.returnPhotoPaths || (issue.returnPhotoPath ? [issue.returnPhotoPath] : []))) try { await deleteObject(storageRef(storage, path)); } catch { /* ignore */ }
      }
      successCount++;
    } catch (e) {
      console.error('Failed to delete issue', issue.id, e);
      failCount++;
    }
  }

  setSyncingState(false);
  void appAlert(`Cleanup complete.\n\nSuccessfully deleted: ${successCount} record(s).${failCount > 0 ? `\nFailed to delete: ${failCount} record(s).` : ''}`, { title: 'Cleanup Complete', type: failCount > 0 ? 'warning' : 'success' });
  render();
}

function readAdminData(path, timeoutMs = 10000) {
  return Promise.race([
    get(ref(db, path)),
    new Promise((_, reject) => setTimeout(() => reject(new Error('The cloud request timed out. Check the Cloud Sync status and retry.')), timeoutMs))
  ]);
}

async function loadRequestsTable() {
  const holder = $('#requestsHolder');
  if (!holder) return;
  const pad = holder.querySelector('.panel-pad');

  setSyncingState(true, 'Loading requests...');
  try {
    const snap = await readAdminData('accessRequests');
    const requests = snapshotToArray(snap);
    updatePendingRequestsNavBadge(requests.length);

    if (requests.length === 0) { pad.innerHTML = `<div class="empty-state" style="padding:40px 0;"><p>No pending requests right now.</p></div>`; return; }

    pad.innerHTML = requests.map((r) => `
      <div class="request-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap;">
          <div>
            <div style="font-weight:700; font-size:15px; color:var(--text-strong);">${escapeHtml(r.fullName)}</div>
            <div class="mono muted" style="font-size:12.5px; margin-top:4px;">Username: ${escapeHtml(r.id)}</div>
          </div>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-primary btn-sm" data-approve-request="${escapeHtml(r.id)}">Approve</button>
            <button class="btn btn-danger btn-sm" data-reject-request="${escapeHtml(r.id)}">Reject</button>
          </div>
        </div>
      </div>`).join('');

    pad.querySelectorAll('[data-approve-request]').forEach((btn) => { btn.addEventListener('click', () => handleApproveRequest(btn.dataset.approveRequest)); });
    pad.querySelectorAll('[data-reject-request]').forEach((btn) => { btn.addEventListener('click', () => handleRejectRequest(btn.dataset.rejectRequest)); });
  } catch (err) {
    pad.innerHTML = `<div class="alert alert-error" role="alert">Could not load requests: ${escapeHtml(err.message || 'unknown error')}</div><button type="button" class="btn btn-primary btn-sm" id="retryRequestsLoadBtn" style="margin-top:12px;">Retry loading requests</button>`;
    $('#retryRequestsLoadBtn')?.addEventListener('click', loadRequestsTable);
  } finally {
    setSyncingState(false);
  }
}

async function handleApproveRequest(username) {
  setSyncingState(true, 'Approving user...');
  try {
    const reqSnap = await get(ref(db, 'accessRequests/' + username));
    if (!reqSnap.exists()) { loadRequestsTable(); return; }
    const existing = await get(ref(db, 'users/' + username));
    if (existing.exists()) { void appAlert(`A user named "${username}" already exists. Reject this request or ask them to choose a different username.`, { title: 'Username Taken', type: 'danger' }); return; }
    const { fullName, password } = reqSnap.val();
    // Bug fix: include default roles so the user record is complete from creation. Default is 'user'.
    await set(ref(db, 'users/' + username), { fullName, password, roles: ['user'], createdAt: serverTimestamp() });
    await remove(ref(db, 'accessRequests/' + username));
    loadRequestsTable();
    loadUsersTable();
  } catch (err) {
    void appAlert('Could not approve this request: ' + (err.message || 'unknown error'), { title: 'Approval Failed', type: 'danger' });
  } finally {
    setSyncingState(false);
  }
}

async function handleRejectRequest(username) {
  if (!await appConfirm(`Reject the access request from "${username}"?`, { title: 'Reject access request', type: 'danger', confirmText: 'Reject' })) return;
  setSyncingState(true, 'Rejecting request...');
  try {
    await remove(ref(db, 'accessRequests/' + username));
    loadRequestsTable();
  } catch (err) {
    void appAlert('Could not reject this request: ' + (err.message || 'unknown error'), { title: 'Action Failed', type: 'danger' });
  } finally {
    setSyncingState(false);
  }
}

function updatePendingRequestsNavBadge(count) {
  const updateBadgeIn = (selector) => {
    const btn = document.querySelector(selector);
    if (!btn) return;
    const existing = btn.querySelector('.pending-count-dot');
    if (existing) existing.remove();
    if (count > 0) {
      const dot = document.createElement('span');
      dot.className = 'pending-count-dot';
      dot.textContent = count;
      btn.appendChild(dot);
    }
  };
  updateBadgeIn('.navlink[data-view="users-admin"]');
  updateBadgeIn('.mobile-nav-item[data-view="users-admin"]');
}

async function loadUsersTable() {
  const holder = $('#usersTableHolder');
  if (!holder) return;

  setSyncingState(true, 'Loading users...');
  try {
    const snap = await readAdminData('users');
    const users = snapshotToArray(snap);
    holder.innerHTML = `
      <div class="panel-head"><h2>Storekeeper Accounts</h2></div>
      <div class="table-wrap">
        ${users.length === 0 ? `<div class="empty-state"><div class="display">No staff accounts yet</div><p>Add one using the form below.</p></div>` : `
        <table class="users-admin-table">
          <thead><tr><th>Username</th><th>Full Name</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>
            ${users.map((u) => {
      const uRoles = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['storekeeper']);
      return `
              <tr>
                <td class="mono" data-label="Username">${escapeHtml(u.id)}</td>
                <td data-label="Full Name">${escapeHtml(u.fullName)}</td>
                <td data-label="Role">
                  <div class="custom-multi-select" style="position:relative; width: 160px;">
                    <div class="multi-select-header" tabindex="0" style="border: 1px solid var(--border); padding: 6px 10px; border-radius: 4px; cursor: pointer; background: var(--surface); display:flex; justify-content:space-between; align-items:center;">
                      <span class="ms-label">${uRoles.length} Role${uRoles.length > 1 ? 's' : ''} Selected</span>
                      <span style="font-size:10px;">▼</span>
                    </div>
                    <div class="role-checkbox-group multi-select-options hidden" data-user-id="${escapeHtml(u.id)}" style="position:absolute; top:100%; left:0; right:0; background:var(--input-bg, var(--surface)); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid var(--border); z-index:10; padding: 10px; border-radius: 4px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:8px; margin-top:2px; text-align: left;">
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="storekeeper" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${uRoles.includes('storekeeper') ? 'checked' : ''}> Storekeeper</label>
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${uRoles.includes('viewer') ? 'checked' : ''}> Viewer</label>
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="tools_admin" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${uRoles.includes('tools_admin') ? 'checked' : ''}> Tools Admin</label>
                      <label style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: normal; cursor: pointer; margin: 0; white-space: nowrap;"><input type="checkbox" value="tools_viewer" style="width: 16px; height: 16px; margin: 0; padding: 0; min-width: 16px;" ${uRoles.includes('tools_viewer') ? 'checked' : ''}> Tools Viewer</label>
                    </div>
                  </div>
                </td>
                <td data-label="Action"><button class="btn btn-danger btn-sm" data-remove-user="${escapeHtml(u.id)}"><span aria-hidden="true">🗑</span><span>Delete</span></button></td>
              </tr>`;
    }).join('')}
          </tbody>
        </table>`}
      </div>`;

    holder.querySelectorAll('.role-checkbox-group input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', async (e) => {
        const group = e.target.closest('.role-checkbox-group');
        const uid = group.dataset.userId;
        let checkedBoxes = Array.from(group.querySelectorAll('input:checked'));
        let newRoles = checkedBoxes.map(cb => cb.value);
        
        if (e.target.checked) {
          if (e.target.value === 'viewer') {
            group.querySelectorAll('input:checked').forEach(cb => {
              if (cb !== e.target) cb.checked = false;
            });
            checkedBoxes = [e.target];
            newRoles = ['viewer'];
            showToast('Viewer role selected. Other roles removed.', { title: 'Role Updated', type: 'info' });
          } else if (newRoles.includes('viewer')) {
            const viewerCb = group.querySelector('input[value="viewer"]');
            if (viewerCb && viewerCb.checked) viewerCb.checked = false;
            checkedBoxes = Array.from(group.querySelectorAll('input:checked'));
            newRoles = checkedBoxes.map(cb => cb.value);
          }
        }
        
        if (checkedBoxes.length > 2) {
          showToast('A user can have a maximum of 2 roles.', { title: 'Role Limit', type: 'warning' });
          e.target.checked = false;
          return;
        }
        if (checkedBoxes.length === 0) {
          showToast('A user must have at least 1 role.', { title: 'Role Required', type: 'warning' });
          e.target.checked = true;
          return;
        }
        const headerLabel = group.previousElementSibling?.querySelector('.ms-label');
        if (headerLabel) headerLabel.textContent = `${checkedBoxes.length} Role${checkedBoxes.length > 1 ? 's' : ''} Selected`;


        setSyncingState(true, 'Updating roles...');
        try {
          await update(ref(db, 'users/' + uid), { roles: newRoles });
        } catch (err) {
          void appAlert('Could not update role: ' + (err.message || 'unknown error'), { title: 'Update Failed', type: 'danger' });
          loadUsersTable();
        } finally {
          setSyncingState(false);
        }
      });
    });

    holder.querySelectorAll('[data-remove-user]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!await appConfirm(`Delete the account "${btn.dataset.removeUser}"? They will no longer be able to log in.`, { title: 'Delete storekeeper account', type: 'danger', confirmText: 'Delete account' })) return;
        setSyncingState(true, 'Deleting user...');
        try {
          await remove(ref(db, 'users/' + btn.dataset.removeUser));
          loadUsersTable();
        } catch (err) {
          void appAlert('Could not delete this account: ' + (err.message || 'unknown error'), { title: 'Delete Failed', type: 'danger' });
        } finally {
          setSyncingState(false);
        }
      });
    });
  } catch (err) {
    holder.innerHTML = `<div class="panel-head"><h2>Storekeeper Accounts</h2></div><div class="panel-pad"><div class="alert alert-error" role="alert">Could not load users: ${escapeHtml(err.message || 'unknown error')}</div><button type="button" class="btn btn-primary btn-sm" id="retryUsersLoadBtn" style="margin-top:12px;">Retry loading users</button></div>`;
    $('#retryUsersLoadBtn')?.addEventListener('click', loadUsersTable);
  } finally {
    setSyncingState(false);
  }
}

async function handleNewUserSubmit(e) {
  e.preventDefault();
  userFormError = '';
  hideInlineError('userFormAlert');
  const username = $('#nu_username').value.trim();
  const fullName = $('#nu_fullname').value.trim();
  const password = $('#nu_password').value;
  
  const checkedBoxes = Array.from(document.querySelectorAll('#nu_role_group input:checked'));
  const roles = checkedBoxes.map(cb => cb.value);
  if (roles.includes('viewer') && roles.length > 1) {
    userFormError = 'A Viewer cannot have any other roles assigned.';
    showInlineError('userFormAlert', userFormError);
    return;
  }
  if (checkedBoxes.length > 2) {
    userFormError = 'A user can have a maximum of 2 roles.';
    showInlineError('userFormAlert', userFormError);
    return;
  }
  if (checkedBoxes.length === 0) {
    userFormError = 'Please select at least 1 role.';
    showInlineError('userFormAlert', userFormError);
    return;
  }

  if (!username || !fullName || !password) { userFormError = 'Please fill in username, full name, and password.'; showInlineError('userFormAlert', userFormError); return; }
  if (username.toLowerCase() === ADMIN_USERNAME) { userFormError = `"${ADMIN_USERNAME}" is reserved for the Admin login and can't be used here.`; showInlineError('userFormAlert', userFormError); return; }
  if (/[.#$\[\]\/\s'"]/.test(username)) { userFormError = 'Username can\'t contain spaces, quotes, or the characters . # $ [ ] /'; showInlineError('userFormAlert', userFormError); return; }

  const btn = $('#newUserSubmitBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Creating…'; }
  setSyncingState(true, 'Creating account...');
  try {
    const existing = await get(ref(db, 'users/' + username));
    if (existing.exists()) { userFormError = 'That username already exists.'; showInlineError('userFormAlert', userFormError); return; }
    await set(ref(db, 'users/' + username), { fullName, password, roles, createdAt: serverTimestamp(), });
    navigateTo('users-admin');
  } catch (err) {
    userFormError = 'Could not create this account: ' + (err.message || 'unknown error');
    showInlineError('userFormAlert', userFormError);
    // Bug fix: only re-enable the button on failure; on success navigateTo() has
    // already re-rendered the view and btn is a detached (removed) DOM node.
    if (btn && btn.isConnected) { btn.disabled = false; btn.textContent = 'Create Account'; }
  } finally {
    setSyncingState(false);
  }
}

// Explicit public bridge for the fail-safe script outside this ES module.
window.cloudSyncBridge = Object.freeze({
  retry: () => retryCloudSync(),
  isConnected: () => cloudConnected === true
});
window.dispatchEvent(new CustomEvent('cloud-sync-bridge-ready', {
  detail: { connected: cloudConnected === true }
}));

// --- Login Screen KPI Setup ---
// Bug D fix: store the Firebase listener unsub function so it can be called
// during logout, preventing listener accumulation on repeated login/logout cycles.
let loginKpiUnsub = null;
function setupLoginKPIs() {
  const kpiGrid = document.getElementById('loginKpiGrid');
  if (!kpiGrid) return;
  const totEl = document.getElementById('loginKpiTotal');
  const penEl = document.getElementById('loginKpiPending');
  const retEl = document.getElementById('loginKpiReturned');

  // Avoid attaching a duplicate listener if already set up.
  if (loginKpiUnsub) return;

  try {
    if (typeof db !== 'undefined' && db) {
      loginKpiUnsub = onValue(ref(db, 'issues'), (snap) => {
        if (!snap.exists()) return;
        const records = [];
        snap.forEach(child => { records.push(child.val()); });
        const total = records.length;
        const returned = records.filter(r => (typeof statusOf === 'function' ? statusOf(r) : r.status) === 'Returned').length;
        const pending = total - returned;

        if (totEl) totEl.innerHTML = total;
        if (penEl) penEl.innerHTML = pending;
        if (retEl) retEl.innerHTML = returned;

        kpiGrid.style.display = 'flex';
        setTimeout(() => { kpiGrid.style.opacity = '1'; }, 50);
      }, (error) => {
        // Bug fix: was console.warn (silent) — see note on the issues listener above.
        console.error('Login KPIs read error:', error);
      });
    }
  } catch (e) {
    console.warn('Login KPIs setup failed:', e);
  }
}
setTimeout(setupLoginKPIs, 1000);

// =========================================================================
// GLOBAL EVENT DELEGATION
// =========================================================================
document.addEventListener('change', (e) => {
  if (e.target.closest('#nu_role_group')) {
    const checkedBoxes = Array.from(document.querySelectorAll('#nu_role_group input:checked'));
    const newRoles = checkedBoxes.map(cb => cb.value);
    if (newRoles.includes('viewer') && newRoles.length > 1) {
      showToast('A Viewer cannot have any other roles assigned.', { title: 'Role Conflict', type: 'warning' });
      e.target.checked = false;
      return;
    }
    const headerLabel = document.querySelector('#nu_role_group').previousElementSibling?.querySelector('.ms-label');
    if (headerLabel) headerLabel.textContent = `${checkedBoxes.length} Role${checkedBoxes.length !== 1 ? 's' : ''} Selected`;
  }
});
document.addEventListener('click', (e) => {
  const msHeader = e.target.closest('.multi-select-header');
  if (msHeader) {
    const options = msHeader.nextElementSibling;
    const isHidden = options.classList.contains('hidden');
    document.querySelectorAll('.multi-select-options').forEach(el => el.classList.add('hidden'));
    if (isHidden) options.classList.remove('hidden');
    return;
  }
  if (!e.target.closest('.custom-multi-select')) {
    document.querySelectorAll('.multi-select-options').forEach(el => el.classList.add('hidden'));
  }

  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) {
    if (typeof activeUploadTask !== 'undefined' && activeUploadTask) { try { activeUploadTask.cancel(); } catch { /* ignore */ } }
    navigateTo(navBtn.dataset.nav);
    return;
  }
  const kpiBtn = e.target.closest('.kpi-button[data-kpi-status]');
  if (kpiBtn) {
    registerFilterState.status = kpiBtn.dataset.kpiStatus || 'all';
    registerFilterState.q = '';
    registerFilterState.month = 'all';
    registerFilterState.year = 'all';
    registerFilterState.page = 1;
    formDirty = false; navigateTo('register');
    return;
  }
});

// =========================================================================
// TOOLS MASTER LIST MODULE (INDEPENDENT TOOL REGISTER)
// =========================================================================
// ARCHITECTURE INSTRUCTION:
// This module operates strictly on the `tools/` Firebase collection and
// `globalState.toolsCache`. It is COMPLETELY SEPARATE and INDEPENDENT from the Material
// Issue & Return Register (`issues/`). Do NOT connect or link them.
// =========================================================================
function renderToolsDashboard() {
  const main = $('#appMain');
  const isAdmin = globalState.currentUser.roles.includes('admin');
  const canManageTools = isAdmin || globalState.currentUser.roles.includes('tools_admin');

  if (!toolsLoaded) {
    return `
      <div class="panel">
        <div class="panel-head tools-panel-head">
          <div class="tools-head-title">
            <h2>Tools Master List</h2>
            <span class="tools-count-pill"><span class="spinner" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></span>Loading...</span>
          </div>
        </div>
        <div class="panel-pad">
          <div class="tools-skeleton" aria-label="Loading tools">
            <div class="tools-skeleton-row"></div>
            <div class="tools-skeleton-row"></div>
            <div class="tools-skeleton-row"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  const categories = Array.from(new Set(globalState.toolsCache.map(t => (t.category || '').trim()).filter(Boolean))).sort();
  const activeSearch = (window.toolsSearchQuery || '').toLowerCase().trim();
  const activeStatus = window.toolsStatusFilter || 'all';
  const activeCategory = window.toolsCategoryFilter || 'all';
  const hasActiveFilters = Boolean(activeSearch || activeStatus !== 'all' || activeCategory !== 'all');

  let filteredTools = globalState.toolsCache.filter(t => {
    if (activeStatus !== 'all') {
      const sq = getToolStatusQuantities(t);
      if ((sq[activeStatus] || 0) <= 0) return false;
    }
    if (activeCategory !== 'all' && (t.category || '').trim() !== activeCategory) return false;
    if (activeSearch) {
      const matchName = String(t.toolName || '').toLowerCase().includes(activeSearch);
      const matchId = String(t.uniqueId || '').toLowerCase().includes(activeSearch);
      const matchLoc = String(t.location || '').toLowerCase().includes(activeSearch);
      const matchCat = String(t.category || '').toLowerCase().includes(activeSearch);
      const matchNotes = String(t.notes || '').toLowerCase().includes(activeSearch);
      if (!matchName && !matchId && !matchLoc && !matchCat && !matchNotes) return false;
    }
    return true;
  });

  const getStatusBadge = (tool) => {
    const sq = getToolStatusQuantities(tool);
    let badges = [];
    if (sq['Available'] > 0) badges.push(`<span class="badge good">${sq['Available']} Avail</span>`);
    if (sq['In Maintenance'] > 0) badges.push(`<span class="badge warn">${sq['In Maintenance']} Maint</span>`);
    if (sq['Damaged'] > 0) badges.push(`<span class="badge bad">${sq['Damaged']} Dmg</span>`);
    if (sq['Lost'] > 0) badges.push(`<span class="badge bad">${sq['Lost']} Lost</span>`);
    
    if (badges.length === 0) return `<span class="badge good">0 Avail</span>`;
    return `<div style="display:flex; gap:4px; flex-wrap:wrap; justify-content:center;">${badges.join('')}</div>`;
  };

  let html = `
    <div class="panel">
      <div class="panel-head tools-panel-head">
        <div class="tools-head-title">
          <h2>Tools Master List</h2>
          <span class="tools-count-pill">${filteredTools.length} ${filteredTools.length === 1 ? 'tool' : 'tools'}</span>
        </div>
        <div class="tools-head-actions">
          ${canManageTools ? '<button type="button" class="btn btn-primary" data-nav="add-tool"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px;vertical-align:-2px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add New Tool</button>' : ''}
        </div>
      </div>
      <div class="panel-pad">
  `;

  // Admin View: Pending Tool Deletion Requests Banner/Table
  const isToolsAdmin = globalState.currentUser.roles.includes('tools_admin') && !isAdmin;
  const deletionRequestsToShow = isAdmin ? globalState.toolDeletionRequestsCache : globalState.toolDeletionRequestsCache.filter(r => r.requestedBy === globalState.currentUser.username);
  
  if ((isAdmin || isToolsAdmin) && deletionRequestsToShow.length > 0) {
    let pendingDelTitle = isAdmin ? "Pending Tool Deletion Requests" : "Your Pending Deletion Requests";
    let pendingDelSub = isAdmin ? "Users cannot delete tools directly. Review requests below:" : "Waiting for Admin approval:";
    
    html += `
      <div class="pending-deletion-requests-card" style="margin-bottom:24px; background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.25); border-radius:var(--radius-lg); padding:16px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--danger)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <strong style="color:var(--danger); font-size:14px;">${pendingDelTitle}</strong>
            <span class="badge warn" style="font-size:11px; font-weight:700;">${deletionRequestsToShow.length} pending</span>
          </div>
          <span style="font-size:12px; color:var(--text-muted);">${pendingDelSub}</span>
        </div>
        <div class="table-wrap" style="overflow-x:auto;">
          <table class="tools-master-table" style="font-size:12.5px; width:100%; background:var(--surface);">
            <thead>
              <tr>
                <th style="width:130px;">Tool ID</th>
                <th>Tool Name</th>
                <th>Requested By</th>
                <th>Reason for Deletion</th>
                <th style="width:130px;">Requested Date</th>
                <th style="width:160px; text-align:right;">Status/Actions</th>
              </tr>
            </thead>
            <tbody>
              ${deletionRequestsToShow.map(req => `
                <tr>
                  <td class="tool-id-cell mono">${escapeHtml(req.uniqueId || req.toolId || '—')}</td>
                  <td><strong>${escapeHtml(req.toolName || '—')}</strong></td>
                  <td>${escapeHtml(req.requestedByName || req.requestedBy || 'User')}</td>
                  <td style="max-width:240px; word-break:break-word;"><em>${escapeHtml(req.reason || 'No reason provided')}</em></td>
                  <td class="mono" style="font-size:11.5px;">${req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '—'}</td>
                  <td style="text-align:right; white-space:nowrap;">
                    ${isAdmin ? `
                      <button type="button" class="btn btn-danger btn-sm" data-approve-tool-deletion="${escapeHtml(req.id || req.toolId)}" title="Approve and permanently delete tool">Approve Delete</button>
                      <button type="button" class="btn btn-ghost btn-sm" data-reject-tool-deletion="${escapeHtml(req.id || req.toolId)}" title="Reject deletion request" style="margin-left:4px;">Reject</button>
                    ` : `<span style="font-size:11px; color:var(--text-muted); font-style:italic;">Pending Approval</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Admin View: Pending Tool Addition Requests Banner/Table
  const additionRequestsToShow = isAdmin ? toolAdditionRequestsCache : globalState.toolAdditionRequestsCache.filter(r => r.requestedBy === globalState.currentUser.username || r.createdBy === globalState.currentUser.username);
  
  if ((isAdmin || isToolsAdmin) && additionRequestsToShow.length > 0) {
    let pendingTitle = isAdmin ? "Pending Tool Additions" : "Your Pending Tool Additions";
    let pendingSub = isAdmin ? "Review and approve new tools added by Tools Admins:" : "Waiting for Admin approval:";
    
    html += `
      <div class="pending-addition-requests-card" style="margin-bottom:24px; background:rgba(16, 185, 129, 0.05); border:1px solid rgba(16, 185, 129, 0.25); border-radius:var(--radius-lg); padding:16px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            <strong style="color:var(--primary); font-size:14px;">${pendingTitle}</strong>
            <span class="badge warn" style="font-size:11px; font-weight:700;">${additionRequestsToShow.length} pending</span>
          </div>
          <span style="font-size:12px; color:var(--text-muted);">${pendingSub}</span>
        </div>
        <div class="table-wrap" style="overflow-x:auto;">
          <table class="tools-master-table" style="font-size:12.5px; width:100%; background:var(--surface);">
            <thead>
              <tr>
                <th>Tool Name</th>
                <th>Category</th>
                <th>Requested Qty</th>
                <th>Requested By</th>
                <th style="width:130px;">Requested Date</th>
                <th style="width:160px; text-align:right;">Status/Actions</th>
              </tr>
            </thead>
            <tbody>
              ${additionRequestsToShow.map(req => `
                <tr>
                  <td><strong>${escapeHtml(req.toolName || '—')}</strong></td>
                  <td>${escapeHtml(req.category || '—')}</td>
                  <td class="mono">${req.quantity || 0}</td>
                  <td>${escapeHtml(req.requestedByName || req.requestedBy || 'User')}</td>
                  <td class="mono" style="font-size:11.5px;">${req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}</td>
                  <td style="text-align:right; white-space:nowrap;">
                    ${isAdmin ? `
                      <button type="button" class="btn btn-primary btn-sm" data-approve-tool-addition="${escapeHtml(req.id || req.toolName)}" title="Approve and add to Master Register">Approve</button>
                      <button type="button" class="btn btn-ghost btn-sm" data-reject-tool-addition="${escapeHtml(req.id || req.toolName)}" title="Reject addition request" style="margin-left:4px;">Reject</button>
                    ` : `<span style="font-size:11px; color:var(--text-muted); font-style:italic;">Pending Approval</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Admin View: Pending Tool Quantity Updates Banner/Table
  const qtyRequestsToShow = isAdmin ? toolQuantityRequestsCache : globalState.toolQuantityRequestsCache.filter(r => r.requestedBy === globalState.currentUser.username);
  
  if ((isAdmin || isToolsAdmin) && qtyRequestsToShow.length > 0) {
    let pendingQtyTitle = isAdmin ? "Pending Total Quantity Updates" : "Your Pending Quantity Updates";
    let pendingQtySub = isAdmin ? "Review changes to tool total allocations:" : "Waiting for Admin approval:";
    
    html += `
      <div class="pending-quantity-requests-card" style="margin-bottom:24px; background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.25); border-radius:var(--radius-lg); padding:16px 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--warn)" stroke-width="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            <strong style="color:var(--warn); font-size:14px;">${pendingQtyTitle}</strong>
            <span class="badge warn" style="font-size:11px; font-weight:700;">${qtyRequestsToShow.length} pending</span>
          </div>
          <span style="font-size:12px; color:var(--text-muted);">${pendingQtySub}</span>
        </div>
        <div class="table-wrap" style="overflow-x:auto;">
          <table class="tools-master-table" style="font-size:12.5px; width:100%; background:var(--surface);">
            <thead>
              <tr>
                <th style="width:130px;">Tool ID</th>
                <th>Tool Name</th>
                <th>Old Qty</th>
                <th>New Qty</th>
                <th>Requested By</th>
                <th style="width:130px;">Requested Date</th>
                <th style="width:160px; text-align:right;">Status/Actions</th>
              </tr>
            </thead>
            <tbody>
              ${qtyRequestsToShow.map(req => `
                <tr>
                  <td class="tool-id-cell mono">${escapeHtml(req.uniqueId || req.toolId || '—')}</td>
                  <td><strong>${escapeHtml(req.toolName || '—')}</strong></td>
                  <td class="mono">${req.oldQuantity || 0}</td>
                  <td class="mono" style="color:var(--warn); font-weight:bold;">${req.newQuantity || 0}</td>
                  <td>${escapeHtml(req.requestedByName || req.requestedBy || 'User')}</td>
                  <td class="mono" style="font-size:11.5px;">${req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}</td>
                  <td style="text-align:right; white-space:nowrap;">
                    ${isAdmin ? `
                      <button type="button" class="btn btn-warn btn-sm" data-approve-tool-qty="${escapeHtml(req.id || req.toolId)}" title="Approve quantity change">Approve</button>
                      <button type="button" class="btn btn-ghost btn-sm" data-reject-tool-qty="${escapeHtml(req.id || req.toolId)}" title="Reject quantity change" style="margin-left:4px;">Reject</button>
                    ` : `<span style="font-size:11px; color:var(--text-muted); font-style:italic;">Pending Approval</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  html += `
        <div class="tools-filter-bar">
          <div class="tools-search-wrap">
            <svg class="tools-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" id="toolsSearchInput" class="tools-search-input" placeholder="Search tool by name, ID, location..." value="${escapeHtml(window.toolsSearchQuery || '')}" autocomplete="off" />
            ${window.toolsSearchQuery ? '<button type="button" id="toolsSearchClear" class="tools-search-clear" aria-label="Clear search">&times;</button>' : ''}
          </div>
          <div class="tools-filters-row">
            <select id="toolsStatusFilter" class="input-select tools-filter-select">
              <option value="all"${activeStatus === 'all' ? ' selected' : ''}>All Statuses</option>
              <option value="Available"${activeStatus === 'Available' ? ' selected' : ''}>Available</option>
              <option value="In Maintenance"${activeStatus === 'In Maintenance' ? ' selected' : ''}>Under Maintenance</option>
              <option value="Damaged"${activeStatus === 'Damaged' ? ' selected' : ''}>Damage Declared</option>
              <option value="Lost"${activeStatus === 'Lost' ? ' selected' : ''}>Lost</option>
            </select>
            <select id="toolsCategoryFilter" class="input-select tools-filter-select">
              <option value="all"${activeCategory === 'all' ? ' selected' : ''}>All Categories</option>
              ${categories.map(c => `<option value="${escapeHtml(c)}"${activeCategory === c ? ' selected' : ''}>${escapeHtml(c)}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="desktop-tools-table">
          <div class="tools-table-wrap">
            <table class="tools-master-table">
              <thead>
                <tr>
                  <th scope="col" style="width:140px;">Tool ID</th>
                  <th scope="col">Tool Name</th>
                  <th scope="col" style="width:130px;">Category</th>
                  <th scope="col" style="width:90px; text-align:center;">Quantity</th>
                  <th scope="col" style="width:120px;">Location</th>
                  <th scope="col" style="width:140px; text-align:center;">Status & History</th>
                  <th scope="col">Notes</th>
                  <th scope="col" style="width:180px; text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
  `;

  if (filteredTools.length === 0) {
    html += `
      <tr>
        <td colspan="8" style="text-align:center; padding: 48px 16px;">
          <div class="empty-state" style="padding:0;">
            <div class="display" style="font-size:16px; margin-bottom:6px;">${globalState.toolsCache.length === 0 ? 'No tools recorded yet' : 'No matching tools found'}</div>
            <p style="margin:0 0 16px; font-size:13.5px; color:var(--text-muted);">${globalState.toolsCache.length === 0 ? 'Start by logging your first tool into the master register.' : 'Try adjusting or clearing your search and filter criteria.'}</p>
            ${hasActiveFilters ? '<button type="button" class="btn btn-ghost btn-sm" id="toolsClearFiltersBtn">Clear Filters</button>' : (canManageTools ? '<button type="button" class="btn btn-primary btn-sm" data-nav="add-tool">+ Add First Tool</button>' : '')}
          </div>
        </td>
      </tr>
    `;
  } else {
    filteredTools.forEach(t => {
      const pendingReq = globalState.toolDeletionRequestsCache.find(r => (r.id || r.toolId) === t.id);
      const historyCount = Array.isArray(t.statusHistory) ? t.statusHistory.length : 0;

      html += `
        <tr>
          <td class="tool-id-cell">${escapeHtml(t.uniqueId || '—')}</td>
          <td class="tool-name-cell">
            <strong>${escapeHtml(t.toolName)}</strong>
            ${pendingReq ? '<br/><span class="badge warn" style="font-size:10.5px; margin-top:3px; display:inline-block;" title="Deletion requested by ' + escapeHtml(pendingReq.requestedByName || pendingReq.requestedBy || 'user') + '">Deletion Pending</span>' : ''}
          </td>
          <td><span class="tool-cat-badge">${escapeHtml(t.category || 'General')}</span></td>
          <td style="text-align:center;"><span class="tool-qty-pill">${String(t.quantity ?? 0)}</span></td>
          <td><span class="tool-loc-badge"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.6;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(t.location || '—')}</span></td>
          <td style="text-align:center;">
            <button type="button" class="btn-clean" data-update-status="${escapeHtml(t.id)}" title="Click to view history or update status" style="cursor:pointer; display:inline-flex; flex-direction:column; align-items:center; gap:3px;">
              ${getStatusBadge(t)}
              <span style="font-size:10.5px; color:var(--text-muted); text-decoration:underline;">${historyCount > 0 ? historyCount + ' logs' : 'Update'}</span>
            </button>
          </td>
          <td class="tool-notes-cell" title="${escapeHtml(t.notes || '')}">${escapeHtml(t.notes || '—')}</td>
          <td class="tool-actions-cell" style="text-align:right; white-space:nowrap;">
            <button type="button" class="btn btn-ghost btn-sm" data-update-status="${escapeHtml(t.id)}" title="Update Status & View Timeline">Status</button>
            ${isAdmin ? `<button type="button" class="btn btn-ghost btn-sm" data-edit-tool="${escapeHtml(t.id)}" title="Edit Tool Details">Edit</button>` : ''}
            ${isAdmin ? `
              <button type="button" class="btn btn-danger btn-sm" data-delete-tool="${escapeHtml(t.id)}" title="Permanently Delete Tool">Delete</button>
            ` : (pendingReq ? `
              <span class="badge warn" style="font-size:10.5px; vertical-align:middle;" title="Deletion request submitted">Req Pending</span>
            ` : `
              <button type="button" class="btn btn-ghost btn-sm" data-request-delete-tool="${escapeHtml(t.id)}" title="Request Admin to delete this tool" style="color:var(--danger);">Request Delete</button>
            `)}
          </td>
        </tr>
      `;
    });
  }

  html += `</tbody></table></div></div>`;

  // Mobile Card Grid View
  html += `<div class="mobile-tools-cards">`;
  if (filteredTools.length === 0) {
    html += `
      <div class="empty-state" style="padding:40px 16px; text-align:center;">
        <div class="display" style="font-size:16px; margin-bottom:6px;">${globalState.toolsCache.length === 0 ? 'No tools recorded yet' : 'No matching tools found'}</div>
        <p style="margin:0 0 16px; font-size:13px; color:var(--text-muted);">${globalState.toolsCache.length === 0 ? 'Start by logging your first tool into the master register.' : 'Try adjusting or clearing your search and filter criteria.'}</p>
        ${hasActiveFilters ? '<button type="button" class="btn btn-ghost btn-sm" id="toolsClearFiltersBtnMobile">Clear Filters</button>' : (canManageTools ? '<button type="button" class="btn btn-primary btn-sm" data-nav="add-tool">+ Add First Tool</button>' : '')}
      </div>
    `;
  } else {
    filteredTools.forEach(t => {
      const pendingReq = globalState.toolDeletionRequestsCache.find(r => (r.id || r.toolId) === t.id);
      const historyCount = Array.isArray(t.statusHistory) ? t.statusHistory.length : 0;

      html += `
        <div class="tool-mobile-card anim-reveal is-visible">
          <div class="tool-card-top">
            <div class="tool-card-identity">
              <span class="tool-card-id">${escapeHtml(t.uniqueId || 'ID: —')}</span>
              <h3 class="tool-card-name">${escapeHtml(t.toolName)}</h3>
              ${pendingReq ? '<span class="badge warn" style="font-size:10.5px; margin-top:2px;">Deletion Pending Review</span>' : ''}
            </div>
            <div class="tool-card-status">
              <button type="button" class="btn-clean" data-update-status="${escapeHtml(t.id)}" style="cursor:pointer;">
                ${getStatusBadge(t)}
              </button>
            </div>
          </div>
          <div class="tool-card-meta">
            ${t.category ? `<span class="tool-meta-chip"><span class="meta-icon">🏷</span>${escapeHtml(t.category)}</span>` : ''}
            ${t.location ? `<span class="tool-meta-chip"><span class="meta-icon">📍</span>${escapeHtml(t.location)}</span>` : ''}
            <span class="tool-meta-chip tool-qty-chip"><span class="meta-icon">📦</span>Qty: <strong>${escapeHtml(t.quantity || '0')}</strong></span>
            <span class="tool-meta-chip" data-tool-history="${escapeHtml(t.id)}" style="cursor:pointer;"><span class="meta-icon">📜</span>${historyCount > 0 ? historyCount + ' logs' : 'History'}</span>
          </div>
          ${t.notes ? `<div class="tool-card-notes"><span class="notes-label">Notes:</span>${escapeHtml(t.notes)}</div>` : ''}
          <div class="tool-card-actions">
            <button type="button" class="btn btn-dark btn-sm tool-action-btn tool-action-primary" data-update-status="${escapeHtml(t.id)}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Status & History
            </button>
            <div class="tool-card-actions-secondary">
              ${isAdmin ? `
                <button type="button" class="btn btn-ghost btn-sm tool-action-btn" data-edit-tool="${escapeHtml(t.id)}">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
                </button>
              ` : ''}
              ${isAdmin ? `
                <button type="button" class="btn btn-danger btn-sm tool-action-btn" data-delete-tool="${escapeHtml(t.id)}">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Delete
                </button>
              ` : (pendingReq ? `
                <span class="badge warn" style="display:flex; justify-content:center; align-items:center; font-size:11px; padding:6px 10px; border-radius:10px;">Deletion Pending</span>
              ` : `
                <button type="button" class="btn btn-ghost btn-sm tool-action-btn" data-request-delete-tool="${escapeHtml(t.id)}" style="color:var(--danger);">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Request Delete
                </button>
              `)}
            </div>
          </div>
        </div>
      `;
    });
  }
  html += `</div></div></div>`;

  return html;
}

function renderAddToolForm() {
  // Bug fix: renderToolForm writes directly to main.innerHTML (it also wires its
  // own submit handler inline), so it must NOT return a string for render() to
  // set — returning null signals render() to skip its own innerHTML assignment.
  renderToolForm('Add New Tool', {});
  return null;
}

function renderEditToolForm() {
  const tool = globalState.toolsCache.find(t => t.id === window.currentEditToolId);
  if (!tool) { navigateTo('tools-dashboard'); return null; }
  renderToolForm('Edit Tool', tool);
  return null;
}

function renderToolForm(title, tool) {
  if (!globalState.currentUser.roles.includes('admin') && !globalState.currentUser.roles.includes('tools_admin')) {
    appAlert('You do not have permission to modify tools.', { type: 'danger' });
    navigateTo('tools-dashboard');
    return;
  }
  
  const main = $('#appMain');
  const isEdit = !!tool.id;
  
  main.innerHTML = `
    <div class="panel form-panel">
      <div class="panel-head">
        <h2>${title}</h2>
        <button type="button" class="btn btn-ghost" data-nav="tools-dashboard">Cancel</button>
      </div>
      <div class="panel-pad">
        <form id="toolForm">
          <div class="form-grid">
            ${isEdit ? `
            <div class="field full">
              <label>Tool ID</label>
              <input type="text" value="${escapeHtml(tool.uniqueId || '')}" disabled style="background:var(--surface); cursor:not-allowed;" />
            </div>` : ''}
            <div class="field full">
              <label for="t_name">Tool Name *</label>
              <input type="text" id="t_name" value="${escapeHtml(tool.toolName || '')}" required />
            </div>
            <div class="field">
              <label for="t_category">Category</label>
              <input type="text" id="t_category" value="${escapeHtml(tool.category || '')}" />
            </div>
            <div class="field">
              <label for="t_qty">Quantity *</label>
              <input type="number" inputmode="numeric" pattern="[0-9]*" id="t_qty" min="0" value="${escapeHtml(tool.quantity !== undefined && tool.quantity !== null ? tool.quantity : '1')}" required />
            </div>
            <div class="field">
              <label for="t_loc">Location / Shelf</label>
              <input type="text" id="t_loc" value="${escapeHtml(tool.location || '')}" />
            </div>
            <div class="field">
              <label for="t_status">Status</label>
              <select id="t_status">
                <option value="Available" ${tool.status === 'Available' ? 'selected' : ''}>Available</option>
                <option value="In Maintenance" ${tool.status === 'In Maintenance' ? 'selected' : ''}>In Maintenance</option>
                <option value="Damaged" ${tool.status === 'Damaged' ? 'selected' : ''}>Damaged</option>
                <option value="Lost" ${tool.status === 'Lost' ? 'selected' : ''}>Lost</option>
              </select>
            </div>
            <div class="field full">
              <label for="t_notes">Notes</label>
              <textarea id="t_notes" rows="3">${escapeHtml(tool.notes || '')}</textarea>
            </div>
          </div>
          <div class="actions-row" style="margin-top:20px;">
            <button type="submit" class="btn btn-primary btn-large" id="saveToolBtn">Save Tool</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Bug fix: trackFormDirty was called but never defined anywhere in the codebase.
  // Replace with the existing setFormDirty pattern used throughout app.js.
  setFormDirty(false);
  $('#toolForm')?.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => setFormDirty(true), { once: false });
    el.addEventListener('change', () => setFormDirty(true), { once: false });
  });
  
  $('#toolForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('#saveToolBtn');
    btn.disabled = true; btn.textContent = 'Saving...';
    
    const toolName = $('#t_name').value.trim();
    const toolQty = Math.max(0, parseInt($('#t_qty').value, 10) || 0);
    const toolData = {
      toolName: toolName,
      category: $('#t_category').value.trim(),
      quantity: toolQty,
      location: $('#t_loc').value.trim(),
      status: $('#t_status').value,
      notes: $('#t_notes').value.trim(),
      updatedAt: serverTimestamp(),
      updatedBy: globalState.currentUser.username
    };
    
    try {
      setSyncingState(true, 'Saving tool...');
      const now = Date.now();
      const dateStr = new Date().toLocaleString();

      if (isEdit) {
        if (toolData.status !== tool.status) {
          const currentHist = Array.isArray(tool.statusHistory) ? [...tool.statusHistory] : (tool.status ? [{
            status: tool.status,
            previousStatus: null,
            changedBy: tool.createdBy || 'Initial System Record',
            changedByUsername: tool.createdBy || 'system',
            timestamp: tool.createdAt || now,
            dateStr: tool.createdAt ? new Date(tool.createdAt).toLocaleString() : dateStr,
            notes: tool.notes || 'Initial registration'
          }] : []);
          toolData.statusHistory = [...currentHist, {
            status: toolData.status,
            previousStatus: tool.status || 'Available',
            changedBy: globalState.currentUser.fullName || globalState.currentUser.username,
            changedByUsername: globalState.currentUser.username,
            timestamp: now,
            dateStr: dateStr,
            notes: toolData.notes || 'Status updated via tool editor'
          }];
          toolData.statusQuantities = null;
        }
        await update(ref(db, 'tools/' + tool.id), toolData);
        await writeAudit('tool-edited', tool.id, { toolName, quantity: toolQty, status: toolData.status, uniqueId: tool.uniqueId });
      } else {
        const cleanName = toolName.replace(/\//g, '-').trim();
        const upperName = cleanName.toUpperCase();
        
        toolData.createdAt = serverTimestamp();
        toolData.createdBy = globalState.currentUser.username;
        toolData.requestedByName = globalState.currentUser.fullName || globalState.currentUser.username;

        if (!globalState.currentUser.roles.includes('admin')) {
          await push(ref(db, 'toolAdditionRequests'), toolData);
          await writeAudit('tool-addition-requested', toolName, { toolName, quantity: toolQty });
          showToast('Tool addition request submitted for admin approval.');
        } else {
          let maxSequence = 0;
          
          globalState.toolsCache.forEach(t => {
            const tName = (t.toolName || '').replace(/\//g, '-').trim().toUpperCase();
            const prefix = `CMM/SMS/${upperName}/`;
            if (tName === upperName || (t.uniqueId && t.uniqueId.startsWith(prefix))) {
              const match = (t.uniqueId || '').match(/(\d+)$/);
              if (match) {
                const seq = parseInt(match[1], 10);
                if (seq > maxSequence) maxSequence = seq;
              }
            }
          });
          
          const nextSequence = String(maxSequence + 1).padStart(4, '0');
          toolData.uniqueId = `CMM/SMS/${upperName}/${nextSequence}`;
          toolData.statusHistory = [{
            status: toolData.status,
            previousStatus: null,
            changedBy: globalState.currentUser.fullName || globalState.currentUser.username,
            changedByUsername: globalState.currentUser.username,
            timestamp: now,
            dateStr: dateStr,
            notes: toolData.notes || 'Initial registration'
          }];
          
          const newRef = await push(ref(db, 'tools'), toolData);
          await writeAudit('tool-created', newRef.key, { toolName, quantity: toolQty, uniqueId: toolData.uniqueId });
          showToast('Tool saved successfully.');
        }
      }
      formDirty = false;
      window.toolsStatusFilter = 'all';
      if (isEdit) showToast('Tool updated successfully.');
      navigateTo('tools-dashboard');
    } catch (err) {
      appAlert('Error saving tool: ' + err.message, { type: 'danger' });
      btn.disabled = false; btn.textContent = 'Save Tool';
    } finally {
      setSyncingState(false);
    }
  });
}

// START APP AFTER ALL MODULE DEFINITIONS & HANDLERS ARE LOADED
loadRegisterPreferences();

window.addEventListener('beforeunload', (e) => {
  if (formDirty) {
    const msg = 'You have unsaved changes. Are you sure you want to leave?';
    e.returnValue = msg;
    return msg;
  }
});

startApp();

// ==========================================
// Offline Banner Logic
// ==========================================
const offlineBanner = document.createElement('div');
offlineBanner.id = 'offlineBanner';
offlineBanner.className = 'hidden';
offlineBanner.innerHTML = '&#9888; You are offline. Changes will sync when reconnected.';
Object.assign(offlineBanner.style, {
  position: 'fixed', top: '0', left: '0', width: '100%', backgroundColor: '#ef4444', 
  color: 'white', textAlign: 'center', padding: '8px', fontSize: '13px', 
  fontWeight: '600', zIndex: '1000000', transition: 'transform 0.3s'
});
document.body.appendChild(offlineBanner);

window.addEventListener('offline', () => offlineBanner.classList.remove('hidden'));
window.addEventListener('online', () => offlineBanner.classList.add('hidden'));
if (!navigator.onLine) offlineBanner.classList.remove('hidden');

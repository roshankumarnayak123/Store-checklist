import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from '../firebase-config.js';

export let app, db, storage;
export let cloudConnected = false;
export let appBootstrapped = false;

const configIsPlaceholder = firebaseConfig.projectId === "YOUR_PROJECT_ID";

export function attemptFirebaseInit(onConnectedCallback) {
  if (configIsPlaceholder) return;
  if (app && db) return;
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    try { storage = getStorage(app); } catch (e) { storage = null; }
  } catch (err) {
    console.error('Firebase init error:', err);
    return;
  }

  onValue(ref(db, '.info/connected'), (snap) => {
    const connected = snap.val() === true;
    cloudConnected = connected;
    window.dispatchEvent(new CustomEvent('firebase-connection-status', { detail: { connected } }));
    if (connected) {
      if (!appBootstrapped) {
        appBootstrapped = true;
        if (onConnectedCallback) onConnectedCallback();
      }
    }
  });
}

export function setCloudConnected(val) { cloudConnected = val; }
export function setAppBootstrapped(val) { appBootstrapped = val; }

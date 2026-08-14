import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, push, update, remove, onValue, serverTimestamp, increment, query, orderByChild, equalTo } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject, getMetadata } from "firebase/storage";
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

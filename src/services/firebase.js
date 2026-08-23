import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";
import { firebaseConfig } from '../firebase-config.js';

export let app, db, storage, auth;
export let cloudConnected = false;
export let appBootstrapped = false;

const configIsPlaceholder = firebaseConfig.projectId === "YOUR_PROJECT_ID";

export function attemptFirebaseInit(onConnectedCallback) {
  if (configIsPlaceholder) return;
  if (app && db) return;
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
    try { storage = getStorage(app); } catch (e) { storage = null; }
  } catch (err) {
    console.error('Firebase init error:', err);
    return;
  }

  let isDbConnected = false;
  let isAuthComplete = false;

  const evaluateConnection = () => {
    const fullyConnected = isDbConnected && isAuthComplete;
    cloudConnected = fullyConnected;
    window.dispatchEvent(new CustomEvent('firebase-connection-status', { detail: { connected: fullyConnected } }));
    if (fullyConnected) {
      if (!appBootstrapped) {
        appBootstrapped = true;
        if (onConnectedCallback) onConnectedCallback();
      }
    }
  };

  // Listen for auth state to confirm we have the anonymous token
  import('firebase/auth').then(({ onAuthStateChanged }) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        isAuthComplete = true;
        evaluateConnection();
      }
    });
  });

  // Attempt to sign in anonymously under the hood to satisfy Firebase Security Rules
  signInAnonymously(auth).catch((error) => {
    console.error("Firebase Anonymous Auth failed:", error.message);
    isAuthComplete = true; // Proceed anyway so we don't hang, it will just show standard permission errors
    evaluateConnection();
  });

  onValue(ref(db, '.info/connected'), (snap) => {
    isDbConnected = snap.val() === true;
    evaluateConnection();
  });
}

export function setCloudConnected(val) { cloudConnected = val; }
export function setAppBootstrapped(val) { appBootstrapped = val; }

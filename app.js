import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ---- Firebase config ----
const firebaseConfig = {
  apiKey: "AIzaSyDh9vQKIIKNWTl8GfjLgNzksEWBUIY6mYs",
  authDomain: "lega-10e72.firebaseapp.com",
  projectId: "lega-10e72",
  storageBucket: "lega-10e72.firebasestorage.app",
  messagingSenderId: "64220913818",
  appId: "1:64220913818:web:c0362b644a52e70ad8ff23",
  measurementId: "G-YHZYTJKGF5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ---- Safe element getter: warns instead of silently crashing the whole script ----
function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[Legacy] Missing element: #${id} — check your HTML id matches.`);
  return el;
}

// ---- Elements (matched to your actual HTML) ----
const navActions   = $("nav-actions");
const authEmail    = $("auth-email");
const authPass     = $("auth-pass");
const btnLogin     = $("btn-login");
const btnSignup    = $("btn-signup");
const btnGoogle    = $("btn-google");

const profileAvatar = $("profile-avatar");
const profileEmail  = $("profile-email");

const obsText  = $("obs-text");
const locText  = $("loc-text");
const saveBtn  = $("save-btn");
const feedEl   = $("public-feed");

// ---- In-memory feed (swap for Firestore once you're ready to persist for real) ----
let localFeed = [];

// ---- Auth state ----
onAuthStateChanged(auth, (user) => {
  if (user) {
    const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();
    if (profileAvatar) profileAvatar.textContent = initial;
    if (profileEmail) profileEmail.textContent = user.email || "Authenticated user";

    if (navActions) {
      navActions.innerHTML = `<button class="nav-btn" id="logout-btn">Log Out</button>`;
      document.getElementById("logout-btn").addEventListener("click", () => {
        signOut(auth).catch((err) => console.error("Sign out error:", err));
      });
    }

    // Move user into the app view once signed in
    window.switchPage("page-app");
    renderFeed();
  } else {
    if (navActions) {
      navActions.innerHTML = `<button class="nav-btn" onclick="switchPage('page-auth')">Sign In / Register</button>`;
    }
  }
});

// ---- Email/password login ----
if (btnLogin) {
  btnLogin.addEventListener("click", () => {
    const email = authEmail?.value.trim();
    const pass = authPass?.value;
    if (!email || !pass) { alert("Enter email and password."); return; }

    signInWithEmailAndPassword(auth, email, pass)
      .catch((err) => {
        console.error("Login error:", err);
        alert(friendlyAuthError(err));
      });
  });
}

// ---- Email/password register ----
if (btnSignup) {
  btnSignup.addEventListener("click", () => {
    const email = authEmail?.value.trim();
    const pass = authPass?.value;
    if (!email || !pass) { alert("Enter email and password."); return; }
    if (pass.length < 6) { alert("Password needs at least 6 characters."); return; }

    createUserWithEmailAndPassword(auth, email, pass)
      .catch((err) => {
        console.error("Register error:", err);
        alert(friendlyAuthError(err));
      });
  });
}

// ---- Google sign-in ----
if (btnGoogle) {
  btnGoogle.addEventListener("click", () => {
    signInWithPopup(auth, provider).catch((err) => {
      console.error("Google auth error:", err);
      alert(friendlyAuthError(err));
    });
  });
}

// ---- Publish a field entry ----
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const text = obsText?.value.trim();
    const loc = locText?.value.trim();
    if (!text) { alert("Write something in the field narrative first."); return; }

    const user = auth.currentUser;
    const entry = {
      text,
      location: loc || "Unspecified",
      author: user?.email || "Anonymous",
      date: new Date().toLocaleDateString()
    };
    localFeed.unshift(entry);
    if (obsText) obsText.value = "";
    if (locText) locText.value = "";
    renderFeed();
  });
}

function renderFeed() {
  if (!feedEl) return;
  if (localFeed.length === 0) {
    feedEl.innerHTML = `<p style="color: var(--text-muted); font-size: 14px;">No entries published yet — be the first.</p>`;
    return;
  }
  feedEl.innerHTML = localFeed.map(e => `
    <div class="feed-card">
      <div class="score-badge">PENDING SCORE</div>
      <p>${escapeHtml(e.text)}</p>
      <p style="color: var(--text-muted); font-size: 12px; margin-top: 10px;">
        ${escapeHtml(e.location)} · ${escapeHtml(e.author)} · ${e.date}
      </p>
    </div>
  `).join("");
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function friendlyAuthError(err) {
  const code = err.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered — try signing in instead.";
  if (code.includes("invalid-credential") || code.includes("wrong-password")) return "Wrong email or password.";
  if (code.includes("user-not-found")) return "No account with that email — try registering.";
  if (code.includes("weak-password")) return "Password is too weak — use at least 6 characters.";
  if (code.includes("invalid-email")) return "That email address doesn't look right.";
  if (code.includes("popup-closed-by-user")) return "Google sign-in was closed before finishing.";
  return "Something went wrong: " + (err.message || code);
}

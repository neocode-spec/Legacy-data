import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { GoogleGenAI } from "https://esm.run/@google/genai";

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyDh9vQKIIKNWTl8GfjLgNzksEWBUIY6mYs",
  authDomain: "lega-10e72.firebaseapp.com",
  projectId: "lega-10e72",
  storageBucket: "lega-10e72.firebasestorage.app",
  messagingSenderId: "64220913818",
  appId: "1:64220913818:web:c0362b644a52e70ad8ff23",
  measurementId: "G-YHZYTJKGF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Safe API Key Manager
function getGeminiApiKey() {
  let savedKey = localStorage.getItem("GEMINI_API_KEY");
  
  if (!savedKey || savedKey.trim() === "") {
    const userInput = window.prompt("Enter your Gemini API Key:");
    if (userInput && userInput.trim() !== "") {
      savedKey = userInput.trim();
      localStorage.setItem("GEMINI_API_KEY", savedKey);
    }
  }
  return savedKey;
}

// Page Navigation Handler
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active');
}
window.switchPage = navigateTo;

// Authentication Listener
onAuthStateChanged(auth, (user) => {
  const navActions = document.getElementById('nav-actions');

  if (user) {
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (profileEmail) profileEmail.innerText = user.email || "Authenticated User";
    if (profileAvatar) profileAvatar.innerText = (user.email || "U").charAt(0).toUpperCase();
    
    if (navActions) {
      navActions.innerHTML = `
        <button class="nav-btn" id="btn-key-reset" style="margin-right: 8px; opacity: 0.8;">Set AI Key</button>
        <button class="nav-btn" id="btn-logout">Log Out</button>
      `;
      
      document.getElementById('btn-key-reset').addEventListener('click', () => {
        const newKey = window.prompt("Enter/Update your Gemini API Key:");
        if (newKey) {
          localStorage.setItem("GEMINI_API_KEY", newKey.trim());
          alert("Gemini Key saved!");
        }
      });

      document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));
    }

    navigateTo('page-app');
  } else {
    if (navActions) {
      navActions.innerHTML = `<button class="nav-btn" id="btn-nav-auth">Sign In / Register</button>`;
      document.getElementById('btn-nav-auth').addEventListener('click', () => navigateTo('page-auth'));
    }

    navigateTo('page-landing');
  }
});

// Auth Handlers
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
  btnGoogle.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert("Auth Error: " + error.message);
    }
  });
}

const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
  btnLogin.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      alert("Login Failed: " + error.message);
    }
  });
}

const btnSignup = document.getElementById('btn-signup');
if (btnSignup) {
  btnSignup.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      alert("Registration Failed: " + error.message);
    }
  });
}

// 2. GEMINI PUBLISH LOGIC
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    const narrativeEl = document.getElementById('obs-text');
    const locationEl = document.getElementById('loc-text');

    const narrative = narrativeEl ? narrativeEl.value : '';
    const location = locationEl ? locationEl.value : '';

    if (!narrative) {
      alert("Please enter field narrative.");
      return;
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      alert("Gemini API key is required to analyze logs. Click 'Set AI Key' in the top navbar.");
      return;
    }

    saveBtn.innerText = "Analyzing with Gemini...";
    saveBtn.disabled = true;

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Evaluate this field log observation for ground-truth quality. Provide a score out of 20 and a short 1-sentence analysis.\nLocation: ${location}\nLog: ${narrative}`,
      });

      const aiAnalysis = response.text;

      const feed = document.getElementById('public-feed');
      if (feed) {
        const newCard = document.createElement('div');
        newCard.className = 'feed-card';
        newCard.innerHTML = `
          <div class="score-badge">Gemini Verified</div>
          <p style="font-size: 15px; margin-bottom: 8px;">"${narrative}"</p>
          <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 12px;">📍 ${location || 'Unspecified Location'}</p>
          <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-size: 13px; border-left: 3px solid var(--neon-purple);">
            <strong>Gemini Evaluation:</strong><br>${aiAnalysis}
          </div>
        `;

        feed.prepend(newCard);
      }

      if (narrativeEl) narrativeEl.value = '';
      if (locationEl) locationEl.value = '';

    } catch (err) {
      alert("Gemini Error: " + err.message);
      localStorage.removeItem("GEMINI_API_KEY");
    } finally {
      saveBtn.innerText = "Publish Entry";
      saveBtn.disabled = false;
    }
  });
}

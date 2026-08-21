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

// Dynamic API Key Retriever (Avoids GitHub Secret Scanning Block)
function getGeminiApiKey() {
  let savedKey = localStorage.getItem("GEMINI_API_KEY");
  if (!savedKey) {
    savedKey = prompt("Please enter your Gemini API Key to enable AI evaluations:");
    if (savedKey) {
      localStorage.setItem("GEMINI_API_KEY", savedKey.trim());
    }
  }
  return savedKey;
}

// Page Routing Handler
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active');
}
window.switchPage = navigateTo;

// Authentication State Listener
onAuthStateChanged(auth, (user) => {
  const navActions = document.getElementById('nav-actions');

  if (user) {
    document.getElementById('profile-email').innerText = user.email || "Authenticated User";
    document.getElementById('profile-avatar').innerText = (user.email || "U").charAt(0).toUpperCase();
    
    navActions.innerHTML = `<button class="nav-btn" id="btn-logout">Log Out</button>`;
    document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

    navigateTo('page-app');
  } else {
    navActions.innerHTML = `<button class="nav-btn" id="btn-nav-auth">Sign In / Register</button>`;
    document.getElementById('btn-nav-auth').addEventListener('click', () => navigateTo('page-auth'));

    navigateTo('page-landing');
  }
});

// Google Sign-In Handler
document.getElementById('btn-google').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    alert("Authentication Error: " + error.message);
  }
});

// Email/Password Auth Handlers
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
});

document.getElementById('btn-signup').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Registration Failed: " + error.message);
  }
});

// 2. GEMINI PUBLISH LOGIC
document.getElementById('save-btn').addEventListener('click', async () => {
  const narrative = document.getElementById('obs-text').value;
  const location = document.getElementById('loc-text').value;

  if (!narrative) {
    alert("Please enter field narrative.");
    return;
  }

  // Get key without triggering GitHub secret scanning
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    alert("Gemini API key is required to analyze logs.");
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  saveBtn.innerText = "Analyzing with Gemini...";
  saveBtn.disabled = true;

  try {
    // Initialize Gemini dynamically
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Generate evaluation using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Evaluate this field log observation for ground-truth quality. Provide a score out of 20 and a short 1-sentence analysis.\nLocation: ${location}\nLog: ${narrative}`,
    });

    const aiAnalysis = response.text;

    // Append output directly to Feed
    const feed = document.getElementById('public-feed');
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

    // Reset input fields
    document.getElementById('obs-text').value = '';
    document.getElementById('loc-text').value = '';

  } catch (err) {
    alert("Gemini Error: " + err.message);
    // If the saved key was invalid, reset it so it prompts again next time
    localStorage.removeItem("GEMINI_API_KEY");
  } finally {
    saveBtn.innerText = "Publish Entry";
    saveBtn.disabled = false;
  }
});

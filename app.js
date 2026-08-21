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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Local Storage AI Key Resolver
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

// Page Navigation Switcher
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active');
}
window.switchPage = navigateTo;

// Auth State Monitor
onAuthStateChanged(auth, (user) => {
  const navActions = document.getElementById('nav-actions');

  if (user) {
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    if (profileEmail) profileEmail.innerText = user.email || "Authenticated User";
    if (profileAvatar) profileAvatar.innerText = (user.email || "U").charAt(0).toUpperCase();
    
    if (navActions) {
      navActions.innerHTML = `
        <button class="nav-btn" id="btn-key-reset">Set AI Key</button>
        <button class="nav-btn" id="btn-logout">Log Out</button>
      `;
      
      document.getElementById('btn-key-reset').addEventListener('click', () => {
        const newKey = window.prompt("Enter/Update your Gemini API Key:");
        if (newKey) {
          localStorage.setItem("GEMINI_API_KEY", newKey.trim());
          alert("Key stored successfully!");
        }
      });

      document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));
    }

    navigateTo('page-app');
  } else {
    if (navActions) {
      navActions.innerHTML = `<button class="nav-btn" id="btn-nav-auth" onclick="switchPage('page-auth')">Sign In / Register</button>`;
    }
    navigateTo('page-landing');
  }
});

// Auth Handlers
document.getElementById('btn-google')?.addEventListener('click', () => signInWithPopup(auth, googleProvider));
document.getElementById('btn-login')?.addEventListener('click', () => {
  signInWithEmailAndPassword(auth, document.getElementById('auth-email').value, document.getElementById('auth-pass').value);
});
document.getElementById('btn-signup')?.addEventListener('click', () => {
  createUserWithEmailAndPassword(auth, document.getElementById('auth-email').value, document.getElementById('auth-pass').value);
});

// File Selected Name Display
const fileInput = document.getElementById('file-input');
fileInput?.addEventListener('change', (e) => {
  const display = document.getElementById('file-name-display');
  if (display) display.innerText = e.target.files[0] ? `Attached: ${e.target.files[0].name}` : 'No file selected';
});

// Search Filter Logic
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.feed-card');
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(term) ? 'block' : 'none';
  });
});

// Gemini Publishing & Verification Handler
document.getElementById('save-btn')?.addEventListener('click', async () => {
  const narrative = document.getElementById('obs-text').value;
  const location = document.getElementById('loc-text').value;
  const attachedFile = fileInput?.files[0];

  if (!narrative) {
    alert("Please enter field narrative.");
    return;
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    alert("API Key required.");
    return;
  }

  const saveBtn = document.getElementById('save-btn');
  saveBtn.innerText = "Analyzing with Gemini...";
  saveBtn.disabled = true;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

    const promptText = `Evaluate this field log observation for ground-truth quality. Provide a score out of 20 and a short 1-sentence analysis.\nLocation: ${location}\nAttachment: ${attachedFile ? attachedFile.name : 'None'}\nLog: ${narrative}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
    });

    const aiAnalysis = response.text;

    // Build Feed Card
    const feed = document.getElementById('public-feed');
    const newCard = document.createElement('div');
    newCard.className = 'feed-card';
    newCard.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin-bottom: 16px;";
    
    newCard.innerHTML = `
      <div style="font-weight: bold; color: #a855f7; font-size: 12px; margin-bottom: 6px;">Gemini Verified</div>
      <p style="font-size: 15px; margin-bottom: 8px;">"${narrative}"</p>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">📍 ${location || 'Unspecified Location'}</p>
      ${attachedFile ? `<p style="color: #38bdf8; font-size: 12px; margin-bottom: 8px;">📎 File: ${attachedFile.name}</p>` : ''}
      <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-size: 13px; border-left: 3px solid #a855f7;">
        <strong>Gemini Evaluation:</strong><br>${aiAnalysis}
      </div>
    `;

    feed.prepend(newCard);

    // Reset Inputs
    document.getElementById('obs-text').value = '';
    document.getElementById('loc-text').value = '';
    fileInput.value = '';
    document.getElementById('file-name-display').innerText = 'No file selected';

  } catch (err) {
    alert("Gemini Error: " + err.message);
  } finally {
    saveBtn.innerText = "Publish Entry";
    saveBtn.disabled = false;
  }
});

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

// 1. FIREBASE CONFIGURATION (lega-10e72)
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

// Safe Gemini Key Retriever (stored locally to bypass GitHub Secret Scanning)
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

// Page Router
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
        <button class="nav-btn" id="btn-key-reset" style="margin-right:8px;">Set AI Key</button>
        <button class="nav-btn" id="btn-logout">Log Out</button>
      `;
      
      document.getElementById('btn-key-reset').addEventListener('click', () => {
        const newKey = window.prompt("Enter/Update your Gemini API Key:");
        if (newKey) {
          localStorage.setItem("GEMINI_API_KEY", newKey.trim());
          alert("Gemini key saved!");
        }
      });

      document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));
    }

    navigateTo('page-app');
  } else {
    if (navActions) {
      navActions.innerHTML = `<button class="nav-btn" onclick="switchPage('page-auth')">Sign In / Register</button>`;
    }
    navigateTo('page-landing');
  }
});

// Auth Click Handlers
document.getElementById('btn-google')?.addEventListener('click', () => signInWithPopup(auth, googleProvider));
document.getElementById('btn-login')?.addEventListener('click', () => {
  signInWithEmailAndPassword(auth, document.getElementById('auth-email').value, document.getElementById('auth-pass').value);
});
document.getElementById('btn-signup')?.addEventListener('click', () => {
  createUserWithEmailAndPassword(auth, document.getElementById('auth-email').value, document.getElementById('auth-pass').value);
});

// File Selection Handler
let currentFile = null;
document.getElementById('file-input')?.addEventListener('change', (e) => {
  currentFile = e.target.files[0];
  const status = document.getElementById('file-status');
  if (status) {
    status.innerText = currentFile ? `📄 Attached: ${currentFile.name}` : 'No file loaded';
  }
});

// 2. GEMINI WORKSPACE ASSISTANT (Helps while creating report)
document.getElementById('btn-ask-gemini')?.addEventListener('click', async () => {
  const promptText = document.getElementById('ai-prompt-input').value;
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    alert("Please provide a Gemini API key using the 'Set AI Key' button in the navbar.");
    return;
  }

  if (!promptText && !currentFile) {
    alert("Please enter a instruction or upload a document first.");
    return;
  }

  const btn = document.getElementById('btn-ask-gemini');
  btn.innerText = "Gemini is analyzing...";
  btn.disabled = true;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let fullPrompt = `You are an AI assistant helping a researcher draft a field observation.\n`;
    if (currentFile) fullPrompt += `Attached Document: ${currentFile.name}\n`;
    fullPrompt += `User Request: ${promptText || "Summarize the findings and draft a short report."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const aiOutput = response.text;

    const responseBox = document.getElementById('gemini-response-box');
    const textEl = document.getElementById('gemini-text');
    
    if (textEl && responseBox) {
      textEl.innerText = aiOutput;
      responseBox.style.display = 'block';
    }

    document.getElementById('btn-use-suggestion').onclick = () => {
      document.getElementById('obs-text').value = aiOutput;
    };

  } catch (err) {
    alert("Gemini Error: " + err.message);
  } finally {
    btn.innerText = "Ask Gemini for Help";
    btn.disabled = false;
  }
});

// 3. PUBLISH REPORT TO COMMUNITY FEED
document.getElementById('save-btn')?.addEventListener('click', () => {
  const narrative = document.getElementById('obs-text').value;
  const location = document.getElementById('loc-text').value;

  if (!narrative) {
    alert("Please write an observation narrative before publishing.");
    return;
  }

  const feed = document.getElementById('public-feed');
  if (feed) {
    const card = document.createElement('div');
    card.className = 'feed-card';
    card.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin-bottom: 16px;";

    card.innerHTML = `
      <div style="font-size: 11px; color: #38bdf8; font-weight: bold; margin-bottom: 6px;">POSTED REPORT</div>
      <p style="font-size: 15px; margin-bottom: 10px;">"${narrative}"</p>
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">📍 Location: ${location || 'Unspecified'}</p>
      ${currentFile ? `<p style="color: #a855f7; font-size: 12px;">📎 Dataset/Doc Attached: ${currentFile.name}</p>` : ''}
    `;

    feed.prepend(card);
  }

  // Reset Workspace Form
  document.getElementById('obs-text').value = '';
  document.getElementById('loc-text').value = '';
  document.getElementById('ai-prompt-input').value = '';
  document.getElementById('gemini-response-box').style.display = 'none';
  document.getElementById('file-status').innerText = 'No file loaded';
  currentFile = null;
});

// Search Filter
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.feed-card').forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
  });
});

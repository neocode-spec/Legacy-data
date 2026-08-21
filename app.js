import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh9vQKIIKNWTl8GfjLgNzksEWBUIY6mYs",
  authDomain: "lega-10e72.firebaseapp.com",
  projectId: "lega-10e72",
  storageBucket: "lega-10e72.firebasestorage.app",
  messagingSenderId: "64220913818",
  appId: "1:64220913818:web:c0362b644a52e70ad8ff23",
  measurementId: "G-YHZYTJKGF5"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Auth State Monitor
onAuthStateChanged(auth, (user) => {
  const display = document.getElementById('user-display');
  const btn = document.getElementById('auth-btn');
  if (user) {
    currentUser = user;
    if (display) display.innerText = user.email;
    if (btn) {
      btn.innerText = "Log Out";
      btn.onclick = () => signOut(auth);
    }
  } else {
    currentUser = null;
    if (display) display.innerText = "";
    if (btn) {
      btn.innerText = "Sign In / Register";
      btn.onclick = () => window.toggleAuthModal();
    }
  }
});

// Modal Control
window.toggleAuthModal = function() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
  }
};

// Authentication Listeners
document.getElementById('btn-signup')?.addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert('Account created successfully!');
    window.toggleAuthModal();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('btn-login')?.addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert('Logged in successfully!');
    window.toggleAuthModal();
  } catch (err) {
    alert(err.message);
  }
});

// F-Formula Engine Calculation
function calculate() {
  let G = parseFloat(document.getElementById('g').value);
  let C = parseFloat(document.getElementById('c').value);
  let B = parseFloat(document.getElementById('b').value);
  let R = parseFloat(document.getElementById('r').value);
  let I = parseFloat(document.getElementById('i').value);
  let lenses = parseFloat(document.getElementById('lenses').value) || 1;
  let confirm = parseFloat(document.getElementById('confirm').value) || 0;
  let contradict = parseFloat(document.getElementById('contradict').value) || 0;
  let sources = parseFloat(document.getElementById('sources').value) || 1;

  document.getElementById('disp-g').innerText = G;
  document.getElementById('disp-c').innerText = C.toFixed(2);
  document.getElementById('disp-b').innerText = B.toFixed(2);
  document.getElementById('disp-r').innerText = R.toFixed(2);
  document.getElementById('disp-i').innerText = I;

  let G_norm = (G - 11) / (22 - 11);
  let W = ((C * B) + R) * (1 + Math.pow(G_norm, 2)) * (1 + (Math.abs(I) / 4));
  let M = W * ((confirm - contradict) / lenses);
  let V = Math.min(1, sources / 3);
  let F = M * V;

  let scaled = (F * 4).toFixed(1);

  document.getElementById('score-out').innerText = `${scaled} / 20`;
  document.getElementById('math-out').innerHTML = `
    G_norm: ${G_norm.toFixed(3)} | W: ${W.toFixed(3)}<br>
    M: ${M.toFixed(3)} | V: ${V.toFixed(3)}<br>
    Final Score (F): ${F.toFixed(3)}
  `;

  return { G, C, B, R, I, lenses, confirm, contradict, sources, F, scaled };
}

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', calculate);
});

document.getElementById('calc-btn')?.addEventListener('click', calculate);

// Save Data to Firestore
document.getElementById('save-btn')?.addEventListener('click', async () => {
  const calcData = calculate();
  const narrative = document.getElementById('obs-text').value;
  const location = document.getElementById('loc-text').value;

  if (!narrative.trim()) {
    alert("Please enter field notes or narrative before publishing.");
    return;
  }

  try {
    await addDoc(collection(db, "field_records"), {
      narrative,
      location: location || "Rivers State Field Zone",
      metrics: calcData,
      user: currentUser ? currentUser.email : "Anonymous Agent",
      createdAt: serverTimestamp()
    });
    alert('Field record published directly to public feed!');
    document.getElementById('obs-text').value = "";
    document.getElementById('loc-text').value = "";
  } catch (err) {
    alert('Error publishing record: ' + err.message);
  }
});

// Part 3: Real-Time Public Data Reader
const feedContainer = document.getElementById('public-feed');

const q = query(collection(db, "field_records"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  if (!feedContainer) return;
  feedContainer.innerHTML = "";

  if (snapshot.empty) {
    feedContainer.innerHTML = `<p class="subtext" style="text-align:center;">No published field records yet. Submit your first observation above!</p>`;
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    const time = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "Just now";
    
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginTop = '16px';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <span style="font-size:11px; background:#1e2029; padding:4px 8px; border-radius:4px; color:#ff4d5a; font-weight:700;">FIELD RECORD</span>
          <h3 style="margin-top:8px; margin-bottom:4px;">${data.narrative}</h3>
          <p class="subtext" style="margin:0;">📍 ${data.location} • Agent: ${data.user} • ${time}</p>
        </div>
        <div style="text-align:right;">
          <span class="subtext">F-Score</span>
          <div style="color:var(--accent-red); font-size:24px; font-weight:800;">${data.metrics?.scaled || "0.0"} <span style="font-size:12px; color:var(--text-sub);">/ 20</span></div>
        </div>
      </div>
      <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border); font-family:monospace; font-size:11px; color:var(--text-sub);">
        G: ${data.metrics?.G || "-"} | C: ${data.metrics?.C || "-"} | B: ${data.metrics?.B || "-"} | R: ${data.metrics?.R || "-"} | |I|: ${data.metrics?.I || "-"} | Sources: ${data.metrics?.sources || "-"}
      </div>
    `;
    feedContainer.appendChild(card);
  });
});

calculate();

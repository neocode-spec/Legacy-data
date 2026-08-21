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

// YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "legacy-10e72.firebaseapp.com",
  projectId: "legacy-10e72",
  storageBucket: "legacy-10e72.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Direct Page Switching Function
function navigateTo(pageId) {
  document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// Make switchPage globally available for top nav links
window.switchPage = navigateTo;

// Listen for Authentication State
onAuthStateChanged(auth, (user) => {
  const navActions = document.getElementById('nav-actions');

  if (user) {
    // User is signed in -> Switch directly to Page 3 (Main App Feed)
    document.getElementById('profile-email').innerText = user.email || "Authenticated User";
    document.getElementById('profile-avatar').innerText = (user.email || "U").charAt(0).toUpperCase();
    
    navActions.innerHTML = `<button class="nav-btn" id="btn-logout">Log Out</button>`;
    document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

    navigateTo('page-app');
  } else {
    // User signed out -> Return to Landing Page
    navActions.innerHTML = `<button class="nav-btn" id="btn-nav-auth">Sign In / Register</button>`;
    document.getElementById('btn-nav-auth').addEventListener('click', () => navigateTo('page-auth'));

    navigateTo('page-landing');
  }
});

// Google Auth Handler
document.getElementById('btn-google').addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    // onAuthStateChanged will handle navigating to 'page-app' automatically
  } catch (error) {
    alert("Authentication Error: " + error.message);
  }
});

// Email/Password Sign In
document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
});

// Email/Password Register
document.getElementById('btn-signup').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Registration Failed: " + error.message);
  }
});

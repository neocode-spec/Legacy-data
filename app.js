import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your client-side web config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "lega-10e72.firebaseapp.com",
  projectId: "lega-10e72",
  storageBucket: "lega-10e72.appspot.com",
  messagingSenderId: "64220913818",
  appId: "1:64220913818:web:c0362b644a52e70ad8ff23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const authBtn = document.getElementById("auth-btn");
const userEmail = document.getElementById("user-email");
const userAvatar = document.getElementById("user-avatar");

// Handle Authentication State Changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
    authBtn.textContent = "Log Out";
    userEmail.textContent = user.email || "Authenticated User";
    
    // Set first letter of email/name as avatar
    const initial = (user.displayName || user.email || "U").charAt(0).toUpperCase();
    userAvatar.textContent = initial;
  } else {
    // User is logged out
    authBtn.textContent = "Sign In / Register";
    userEmail.textContent = "Guest User";
    userAvatar.textContent = "?";
  }
});

// Button Action: Login or Logout
authBtn.addEventListener("click", () => {
  if (auth.currentUser) {
    signOut(auth).catch((error) => console.error("Sign out error:", error));
  } else {
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Authentication failed:", error);
    });
  }
});

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Check account user is logged in 
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

// flyout menu
const menuToggle = document.getElementById("menuToggle");
const flyoutMenu = document.getElementById("flyoutMenu");
const menuOverlay = document.getElementById("menuOverlay");
// open
menuToggle.addEventListener("click", () => {
  flyoutMenu.classList.toggle("open");
  menuOverlay.classList.toggle("show");
});
// Close 
menuOverlay.addEventListener("click", () => {
  flyoutMenu.classList.remove("open");
  menuOverlay.classList.remove("show");
});


// update Theme
async function updateThemeInFirestore(theme) {
  const userUID = localStorage.getItem("userUID");
  if (!userUID) return;
  
  const userRef = doc(db, "users", userUID);
  await setDoc(userRef, { theme }, { merge: true }); // merge keeps albums intact
}

// Load Theme from Firestore
async function loadThemeFromFirestore() {
  const userUID = localStorage.getItem("userUID");
  if (!userUID) return localStorage.getItem("theme") || "light";

  const userRef = doc(db, "users", userUID);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().theme) {
    return userSnap.data().theme;
  } 
  else {
    return localStorage.getItem("theme") || "light";
  }
}

// Apply a given theme
function applyTheme(themeName) {
  document.body.className = themeName; // sets body class directly
  localStorage.setItem("theme", themeName);
}

// Theme management
async function setupThemeSelector() {
  const themeSelect = document.getElementById("themeSelect");
  if (!themeSelect) return;

  // Load & apply saved theme
  const savedTheme = await loadThemeFromFirestore();
  applyTheme(savedTheme);

  // Set dropdown value
  themeSelect.value = savedTheme;

  // Handle dropdown change
  themeSelect.addEventListener("change", async () => {
    const selectedTheme = themeSelect.value;
    applyTheme(selectedTheme);
    await updateThemeInFirestore(selectedTheme);
  });
}


// account info (email password change)

// profile info (username, profile picture, join date)

// download stats 

// Clear all data

// logout

window.addEventListener("DOMContentLoaded", () => {
  setupThemeSelector();
});
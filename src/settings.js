import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc} from "firebase/firestore";
import { getAuth, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, sendEmailVerification } from "firebase/auth";

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
  await setDoc(userRef, { theme }, { merge: true });
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



// Account Information
const emailChangeButton = document.getElementById("emailChangeButton");
const passwordChangeButton = document.getElementById("passwordChangeButton");
const emailChangeInput = document.getElementById("emailChangeInput");
const passwordChangeInput = document.getElementById("passwordChangeInput");

// change email
emailChangeButton.addEventListener("click", async () => {
    const email = emailChangeInput.value;
    const user = auth.currentUser;

    // Check there isnt an empty input
    if (!email){
        alert("Please fill all fields");
        return;
    }

    // text before and after @, also needs domain at the end
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Confirm input fits the reg ex
    if (!emailRegEx.test(email)) {
        alert("Please Enter a Valid Email Address")
        return;
    }

    // Update Email
    try {
      await verifyBeforeUpdateEmail(user, email, {
        url: window.location.origin + "/settings.html",
      });
      alert("A verification email has been sent to your new address. Please check your inbox!");
      emailChangeInput.value = "";
    } catch (error) {
      console.error("Error updating email:", error);
      if (error.code === "auth/requires-recent-login") {
        alert("Please re-login before changing your email.");
      } else {
        alert("Failed to update email: " + error.message);
      }
    }

    // clear input
    emailChangeInput.value = "";
})

// change password
passwordChangeButton.addEventListener("click", () => {
    const password = passwordChangeInput.value;
    const user = auth.currentUser;

    // Check there isnt an empty input
    if (!password){
        alert("Please fill all fields");
        return;
    }

    // 8 characters, 1+uppercase, 1+lowercase, 1+number, 1+special char
    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegEx.test(password)) {
        alert("Please Enter a Valid Password")
        return;
    }

    // Update Password
    if (password) {
      if (!passwordRegEx.test(password)) {
        alert("Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.");
        return;
      }
      updatePassword(user, password)
        .then(() => {
          alert("Password successfully updated!");
          console.log("User password updated.");
          passwordChangeInput.value = "";
        })
        .catch((error) => {
          console.error("Error updating password:", error);
          if (error.code === "auth/requires-recent-login") {
            alert("Please re-login to update your password.");
          } else {
            alert("Failed to update password. Please try again.");
          }
        });
    }

    // clear input
    passwordChangeInput.value = "";
})

// profile info (username, profile picture, join date)

// download stats 

// Clear all data

// logout

window.addEventListener("DOMContentLoaded", () => {
  setupThemeSelector();
});
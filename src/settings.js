import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, deleteDoc} from "firebase/firestore";
import { getAuth, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, sendEmailVerification } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";


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
const downloadStatsButton = document.getElementById("downloadStatsButton");

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
  document.body.className = themeName;
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
const emailConfirmChangeInput = document.getElementById("emailConfirmChangeInput");
const passwordChangeInput = document.getElementById("passwordChangeInput");
const passwordConfirmChangeInput = document.getElementById("passwordConfirmChangeInput");

// change email
emailChangeButton.addEventListener("click", async () => {
    const email = emailChangeInput.value;
    const confirmEmail = emailConfirmChangeInput.value;
    const user = auth.currentUser;

    // Check there isnt an empty input
    if (!email){
        alert("Please fill all fields");
        return;
    }

    // text before and after @, also needs domain at the end
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Confirm input fits the reg ex
    if (!emailRegEx.test(email) || !emailRegEx.test(confirmEmail)) {
        alert("Please Enter a Valid Email Address")
        return;
    }

    // Emails match
    if (email != confirmEmail){
        alert("Emails do not Match");
        return;
    }

    // Update Email
    try {
      await verifyBeforeUpdateEmail(user, email, {
        url: window.location.origin + "/settings.html",
      });
      alert("A verification email has been sent to your new address. Please check your inbox!");
      emailChangeInput.value = "";

      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "login.html";
    } 
    catch (error) {
      console.error("Error updating email:", error);
      if (error.code === "auth/requires-recent-login") {
        // Save current page to return later
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        
        // Redirect to login page
        window.location.href = "login.html";
        return;
      } 
      else {
        alert("Failed to update email: " + error.message);
      }
    }

    // clear input
    emailChangeInput.value = "";
    emailConfirmChangeInput.value = "";
})

// change password
passwordChangeButton.addEventListener("click", () => {
    const password = passwordChangeInput.value;
    const confirmPassword = passwordConfirmChangeInput.value;
    const user = auth.currentUser;

    // Check there isnt an empty input
    if (!password){
        alert("Please fill all fields");
        return;
    }

    // 8 characters, 1+uppercase, 1+lowercase, 1+number, 1+special char
    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegEx.test(password) || !passwordRegEx.test(confirmPassword)) {
        alert("Please Enter a Valid Password")
        return;
    }

    // Password match
    if (password != confirmPassword){
        alert("Passwords do not Match");
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

          localStorage.setItem("redirectAfterLogin", window.location.pathname);
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Error updating password:", error);
          if (error.code === "auth/requires-recent-login") {
            // Save current page to return later
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            
            // Redirect to login page
            window.location.href = "login.html";
            return;
          } 
          else {
            alert("Failed to update email: " + error.message);
          }
        });
    }

    // clear input
    passwordChangeInput.value = "";
    passwordConfirmChangeInput.value = "";
})



// profile info (username, join date)
onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email;
    const joinDate = new Date(user.metadata.creationTime).toLocaleDateString();

    document.getElementById("userEmail").textContent = email;
    document.getElementById("userJoinDate").textContent = joinDate;
  } else {
    console.log("No user is signed in.");
  }
});



// download stats 
downloadStatsButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to download your stats.");
    return;
  }

  try {
    // Path: users / userID / albums
    const albumsRef = collection(db, "users", user.uid, "albums");
    const snapshot = await getDocs(albumsRef);

    const albums = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (albums.length === 0) {
      alert("No album data found!");
      return;
    }

    // Convert to JSON
    const jsonData = JSON.stringify(albums, null, 2);

    // Trigger file download
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "myAlbumsData.json";
    link.click();
    URL.revokeObjectURL(url);

    alert("Your album stats have been downloaded!");
  } catch (error) {
    console.error("Error downloading stats:", error);
    alert("Failed to download stats. Please try again later.");
  }
});



// Clear all data
const clearAllButton = document.getElementById("clearAllButton");

clearAllButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in first!");
    return;
  }

  // Confirm action
  const confirmed = confirm("⚠️ This will permanently delete ALL your data. Are you sure?");
  if (!confirmed) return;

  try {
    // Delete all albums
    const albumsRef = collection(db, "users", user.uid, "albums");
    const snapshot = await getDocs(albumsRef);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(albumsRef, docSnap.id));
    }

    // Optionally, delete the user document itself
    await deleteDoc(doc(db, "users", user.uid));

    alert("All your data has been deleted.");
    // Redirect to signup/login
    auth.signOut().then(() => window.location.href = "index.html");

  } catch (error) {
    console.error("Error deleting data:", error);
    alert("Failed to delete data. Please try again.");
  }
});

// logout

window.addEventListener("DOMContentLoaded", () => {
  setupThemeSelector();
});
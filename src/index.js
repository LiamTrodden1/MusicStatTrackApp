// Firebase setup
// Import firebase nodules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
// Secrets secured in .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign user out
try {
  await signOut(auth);
  console.log("User logged out successfully");
  localStorage.setItem("loggedIn", "false");
  localStorage.removeItem("userUID");
}
catch (error){
  console.error("Error logging out", error);
}

// submit details to login with firebase
loginButton.addEventListener("click", async () => {
  // get values from textboxes
  const email = emailLogInput.value;
  const password = passwordLogInput.value;

  // text before and after @, also needs domain at the end
  // 8 characters, 1+uppercase, 1+lowercase, 1+number, 1+special char
  const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Check there isnt an empty input
  if (!email || !password){
      alert("Please fill all fields");
      return;
  }
  // Confirm inputs fit the reg ex
  if (!emailRegEx.test(email)) {
      alert("Please Enter a Valid Email Address")
      return;
  }
  if (!passwordRegEx.test(password)) {
      alert("Please Enter a Valid Password")
      return;
  }
  // Cookies check
  if (!cookieCheckbox || !cookieCheckbox.checked) {
    alert("Please accept cookies before signing in.");
    return;
  }

  // submit to firebase
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Login Successful");
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userUID", user.uid);

      // direct to dashboard
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      alert("Account not Found");
      console.log("Login Failed");
    }) 

  // Clear inputs
  emailLogInput.value = "";
  passwordLogInput.value = "";
})


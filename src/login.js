// Firebase setup
// Import firebase nodules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEGx2P22O8sjRaOz-aOK1g3Kd9wg8L5Q8",
  authDomain: "musicstattrackapp.firebaseapp.com",
  projectId: "musicstattrackapp",
  storageBucket: "musicstattrackapp.firebasestorage.app",
  messagingSenderId: "951193429459",
  appId: "1:951193429459:web:887f7bf866504f7ca53b26",
  measurementId: "G-C8NE0FN86W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);


// submit details to login with firebase
loginButton.addEventListener("click", () => {
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

  // submit to firebase
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      window.location.href = "index.html";
      console.log("Login Successful")
    })
    .catch((error) => {
      alert("Account not Found")
      console.log("Login Failed")
    }) 

  // Clear inputs
  emailLogInput.value = "";
  passwordLogInput.value = "";
})
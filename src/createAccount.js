// Firebase setup
// Import firebase nodules
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

// Submit details to firebase for account creation
createButton.addEventListener("click", () => {
    const email = emailCreateInput.value;
    const password = passwordCreateInput.value;
    const confirmPassword = passwordConfirmInput.value;

    // text before and after @, also needs domain at the end
    // 8 characters, 1+uppercase, 1+lowercase, 1+number, 1+special char
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Check there isnt an empty input
    if (!email || !password || !confirmPassword){
        alert("Please fill all fields");
        return;
    }

    // Check the passwords match
    if (password != confirmPassword){
        alert("Passwords do not Match");
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

    // Submit Details
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
            console.log("Account Successfully Created");
            window.location.href = "login.html";
        })
        .catch((error) => {
            alert("Error Creating Account")
            console.log("Account Creation Failed")
        })

    // clear inputs
    emailCreateInput.value = "";
    passwordCreateInput.value = "";
    passwordConfirmInput.value = "";
})
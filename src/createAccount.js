// Firebase setup
// Import firebase modules
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth} from "firebase/auth";

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
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert("Error Creating Account");
        })

    // clear inputs
    emailCreateInput.value = "";
    passwordCreateInput.value = "";
    passwordConfirmInput.value = "";
})
// Firebase setup
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Redirect to login if user not logged in
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

async function getAlbums() {
    try {
        // get userID
        const userID = localStorage.getItem("userUID");
        if (!userID) {
            console.error("No user ID found in localStorage");
            return;
        }

        // Access Firestore route to stored albums
        const albumsRef = collection(db, "users", userID, "albums");
        const snapshot = await getDocs(albumsRef);

        if (snapshot.empty) {
            console.log("No albums found for this user");
            return;
        }

        snapshot.forEach((doc) => {
            console.log("Album:", doc.id, doc.data());
        });
    } 
    catch (error) {
        console.error("Error reading albums:", error);
    }
}

getAlbums();


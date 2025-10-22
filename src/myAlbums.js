// Firebase setup
import { getFirestore, collection, getDocs } from "firebase/firestore";
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

// ✅ Grab the album container from the DOM
const albumContainer = document.querySelector(".albumContainer");

async function getAlbums() {
    try {
        const userID = localStorage.getItem("userUID");
        if (!userID) {
            console.error("No user ID found in localStorage");
            albumContainer.innerHTML = "<p>No user ID found.</p>";
            return;
        }

        const albumsRef = collection(db, "users", userID, "albums");
        const snapshot = await getDocs(albumsRef);

        albumContainer.innerHTML = ""; // clear “Loading…” message

        if (snapshot.empty) {
            albumContainer.innerHTML = "<p>No albums found yet.</p>";
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            // Create the card
            const card = document.createElement("div");
            card.classList.add("albumCard");

            card.innerHTML = `
                <img src="${data.image || 'default-cover.png'}" alt="${data.name}" />
                <h3 class="albumTitle">${data.name}</h3>
                <p class="albumArtist">${data.artists}</p>
                <p class="albumInfo">
                    <span>${data.albumType}</span> • 
                    <span>${data.totalTracks} tracks</span> • 
                    <span>${data.releaseDate}</span>
                </p>
                <p class="listenCount">Listened ${data.listenCount || 0} times</p>
                <a href="${data.link}" target="_blank" class="spotifyLink">Open in Spotify</a>
            `;

            albumContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error reading albums:", error);
        albumContainer.innerHTML = "<p>Failed to load albums.</p>";
    }
}

getAlbums();

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Redirect if not logged in
if (localStorage.getItem("loggedIn") !== "true") {
  window.location.href = "index.html";
}

async function loadDashboardData() {
  try {
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
      console.error("No userUID found in localStorage");
      return;
    }

    console.log("Fetching albums for user:", userUID);
    const albumsCol = collection(db, "users", userUID, "albums");
    const snapshot = await getDocs(albumsCol);

    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Fetched albums:", albums);

    // Total albums
    // Totals
    const totalAlbums = albums.length;
    const totalListens = albums.reduce((sum, album) => sum + (album.listenCount || 0), 0);

    // Update UI
    document.getElementById("totalAlbums").textContent = `${totalAlbums}`;
    document.getElementById("totalListens").textContent = `${totalListens}`;

    // Sort by date (timestamp can be a number or Firestore Timestamp)
    const sortedByDate = [...albums].sort((a, b) => {
    const aTime = a.lastListened?.seconds || 0;
    const bTime = b.lastListened?.seconds || 0;
    return bTime - aTime; // newest first
    });

    const recent = sortedByDate.slice(0, 5);
    displayRecentAlbums(recent);

    // Most listened
    const mostListened = albums.reduce(
      (max, album) => (album.listenCount || 0) > (max.listenCount || 0) ? album : max,
      {}
    );
    displayMostListened(mostListened);

  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

// Render recent albums
function displayRecentAlbums(albums) {
  const container = document.getElementById("recentAlbums");
  container.innerHTML = albums.map(a => `
    <div class="albumCard">
      <img src="${a.image || 'placeholder.jpg'}" alt="${a.name}" class="albumCover">
      <div class="albumInfo">
        <p class="albumTitle">${a.name}</p>
        <p class="albumArtist">${a.artists}</p>
        <a href="${a.link}" target="_blank" class="albumLink">Open in Spotify</a>
      </div>
    </div>
  `).join("");
}

// Display most listened album
function displayMostListened(album) {
  const container = document.getElementById("mostListened");
  if (!album.name) {
    container.textContent = "No data yet!";
    return;
  }
  container.innerHTML = `
    <div class="albumCard highlight">
      <img src="${album.image || 'placeholder.jpg'}" alt="${album.name}" class="albumCover">
      <div class="albumInfo">
        <p class="albumTitle">${album.name}</p>
        <p class="albumArtist">${album.artists}</p>
        <p class="albumCount">Listened ${album.listenCount || 0} times</p>
        <a href="${album.link}" target="_blank" class="albumLink">Open in Spotify</a>
      </div>
    </div>
  `;
}


window.addEventListener("DOMContentLoaded", loadDashboardData);

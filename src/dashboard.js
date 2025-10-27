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

function displayRecentAlbums(albums) {
  const container = document.getElementById("recentAlbums");

  if (!albums || albums.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:gray;'>No recent albums yet</p>";
    return;
  }

  // Build HTML
  container.innerHTML = albums.map(album => `
    <div class="dashboardCard">
      <img src="${album.image || 'placeholder.jpg'}" alt="${album.name}">
      <p class="dashboardAlbumTitle">${album.name}</p>
      <p class="dashboardArtist">${album.artists}</p>
    </div>
  `).join("");

  // Wait for DOM to update, then initialize Slick
  setTimeout(() => {
    const $carousel = $(".recentAlbumsContainer");

    if ($carousel.hasClass("slick-initialized")) {
      $carousel.slick("unslick");
    }

    // ✅ Initialize slick
    $carousel.slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      centerMode: true,
      centerPadding: "180px",
      autoplay: false,
      responsive: [
        { breakpoint: 1200, settings: { centerPadding: "120px" } },
        { breakpoint: 768, settings: { centerPadding: "60px" } },
        { breakpoint: 480, settings: { centerPadding: "30px", slidesToShow: 1 } }
      ]
    });

    // ✅ Make side albums clickable to scroll
    $carousel.on("click", ".dashboardCard", function () {
      const index = $(this).data("slick-index");
      $carousel.slick("slickGoTo", index);
    });
  }, 100);
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


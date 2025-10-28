import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// Redirect if not logged in
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

// recent albums carousel
function displayRecentAlbums(albums) {
  const container = document.getElementById("recentAlbums");

  // if no albums found
  if (!albums || albums.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:gray;'>No recent albums yet</p>";
    return;
  }

  // Build album cards
  container.innerHTML = albums.map(album => `
    <div class="dashboardCard">
      <img src="${album.image || 'placeholder.jpg'}" alt="${album.name}">
      <p class="dashboardAlbumTitle">${album.name}</p>
      <p class="dashboardArtist">${album.artists}</p>
    </div>
  `).join("");

  //Initsialise Slick Slider carousel
  setTimeout(() => {
    const $carousel = $(".recentAlbumsContainer");

    // reset the carousel if it was already initialised
    if ($carousel.hasClass("slick-initialized")) {
      $carousel.slick("unslick");
    }

    // slick carousel parameters
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

    // Fade non-centred cards
    $carousel.on("setPosition", function () {
      const $slides = $(this).find(".slick-slide");
      $slides.css("opacity", "0.4");
      $(this).find(".slick-center").css("opacity", "1");
    });

    // click on side albums to scroll
    $carousel.on("click", ".dashboardCard", function () {
      const index = $(this).data("slick-index");
      $carousel.slick("slickGoTo", index);
    });
  }, 100);
}

// total listens stats
async function loadDashboardData() {
  try {
    // get userID
    const userUID = localStorage.getItem("userUID");

    // no userID found
    if (!userUID) {
      console.error("No userUID found in localStorage");
      return;
    }

    // access total listens from firestore
    const albumsCol = collection(db, "users", userUID, "albums");
    const snapshot = await getDocs(albumsCol);

    // convert data fro calculation
    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // calcualte total listens
    const totalAlbums = albums.length;
    const totalListens = albums.reduce((sum, album) => sum + (album.listenCount || 0), 0);

    // Update UI
    document.getElementById("totalAlbums").textContent = `${totalAlbums}`;
    document.getElementById("totalListens").textContent = `${totalListens}`;

    // sort top 5 albums by most recently listened to 
      const sortedByDate = [...albums].sort((a, b) => {
      const aTime = a.lastListened?.seconds || 0;
      const bTime = b.lastListened?.seconds || 0;
      return bTime - aTime;
    });
    const recent = sortedByDate.slice(0, 15);
    displayRecentAlbums(recent);

    // Most listened to album funtion call
    const mostListened = albums.reduce(
      (max, album) => (album.listenCount || 0) > (max.listenCount || 0) ? album : max,
      {}
    );
    displayMostListened(mostListened);

  } 
  catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

// Display most listened album
function displayMostListened(album) {
  const container = document.getElementById("mostListened");

  // no album data found
  if (!album.name) {
    container.textContent = "No data yet!";
    return;
  }

  // display most listened to albun
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

// load functions on page open
window.addEventListener("DOMContentLoaded", loadDashboardData);


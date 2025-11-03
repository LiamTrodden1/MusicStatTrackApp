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

// General Listening Stats
async function loadStatsData() {
  try {
    // userUID not found
    const userUID = localStorage.getItem("userUID");
    if (!userUID) {
        console.error("No userUID found");
        return;
    }

    const albumsCol = collection(db, "users", userUID, "albums");
    const snapshot = await getDocs(albumsCol);
    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // no  albums available
    if (albums.length === 0) {
        document.getElementById("statsContainer").innerHTML = "<p>No Data Yet</p>";
        return;
    }

    // total stats calculations

    // 1. total album listens
    const totalAlbums = albums.length;
    // 2. total unique album listens
    const totalListens = albums.reduce((sum, a) => sum + (a.listenCount || 0), 0);
    // 3. total unique artists
    const uniqueArtists = new Set(albums.map(a => a.artists));
    const totalUniqueArtists = uniqueArtists.size;
    // 4. average number of tracks per album 
    const totalTracks = albums.reduce((sum, album) => sum + (album.totalTracks || 0), 0);
    const averageTracks = albums.length > 0 ? totalTracks / albums.length : 0;
    const averageTracksRounded = Math.round(averageTracks);

    document.getElementById("totalAlbums").textContent = totalAlbums;
    document.getElementById("totalListens").textContent = totalListens;
    document.getElementById("totalArtists").textContent = totalUniqueArtists;
    document.getElementById("averageTracks").textContent = averageTracksRounded;

    } 
    catch (error) {
        console.error("Error loading stats:", error);
        document.getElementById("statsContainer").innerHTML = "<p>Error loading data.</p>";
    }
}

// Time stats
async function loadTimeStats() {
    try{
        // userUID not found
        const userUID = localStorage.getItem("userUID");
        if (!userUID) {
            console.error("No userUID found");
            return;
        }

        const albumsCol = collection(db, "users", userUID, "albums");
        const snapshot = await getDocs(albumsCol);
        const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // no  albums available
        if (albums.length === 0) {
            document.getElementById("statsContainer").innerHTML = "<p>No Data Yet</p>";
            return;
        }

        // Extract and flatten listen data
        const listens = [];
        albums.forEach(album => {
        if (album.lastListened) {
            const listenDate = album.lastListened.toDate ? album.lastListened.toDate() : new Date(album.lastListened);
            // Push once for each listenCount to reflect multiple plays
            for (let i = 0; i < (album.listenCount || 1); i++) {
            listens.push(listenDate);
            }
        }
        });

        // calculations
        // 1. Day with most listens
        const dailyMap = {};
        listens.forEach(date => {
        const day = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
        dailyMap[day] = (dailyMap[day] || 0) + 1;
        });

        const mostActiveDay = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];
        const mostActiveDayLabel = mostActiveDay ? `${mostActiveDay[0]} (${mostActiveDay[1]} listens)` : "No data";
        // 2. Day of week with most listens
        const weekdayMap = {};
        listens.forEach(date => {
        const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
        weekdayMap[weekday] = (weekdayMap[weekday] || 0) + 1;
        });
        const mostActiveWeekday = Object.entries(weekdayMap).sort((a, b) => b[1] - a[1])[0];
        const mostActiveWeekdayLabel = mostActiveWeekday ? `${mostActiveWeekday[0]}` : "No data";
        // 3. longest listening streak
        const sortedDays = Object.keys(dailyMap).sort();
        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
        }
        // 4. average listens per day
        const avgListensPerDay = listens.length / Object.keys(dailyMap).length;
        // 5. Most active listning hours
        const hourMap = {};
        listens.forEach(date => {
        const hour = date.getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;
        });
        const mostActiveHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
        const mostActiveHourLabel = mostActiveHour ? `${mostActiveHour[0]}:00` : "No data";
        // 6. First and most recent listening dates
        const sortedListens = [...listens].sort((a, b) => a - b);
        const firstListen = sortedListens[0]?.toLocaleDateString("en-GB") || "No data";
        const lastListen = sortedListens.at(-1)?.toLocaleDateString("en-GB") || "No data";

        document.getElementById("mostActiveDay").textContent = mostActiveDayLabel;
        document.getElementById("mostActiveWeekday").textContent = mostActiveWeekdayLabel;
        document.getElementById("longestStreak").textContent = `${longestStreak} day(s)`;
        document.getElementById("avgListensPerDay").textContent = avgListensPerDay.toFixed(1);
        document.getElementById("mostActiveHour").textContent = mostActiveHourLabel;
        document.getElementById("listeningRange").textContent = `${firstListen} → ${lastListen}`;
    }
    catch (error) {
        console.error("Error loading stats:", error);
        document.getElementById("statsContainer").innerHTML = "<p>Error loading data.</p>";
    }
}

async function loadAlbumStats() {
    try {
        // userUID not found
        const userUID = localStorage.getItem("userUID");
        if (!userUID) {
            console.error("No userUID found");
            return;
        }

        const albumsCol = collection(db, "users", userUID, "albums");
        const snapshot = await getDocs(albumsCol);
        const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // no  albums available
        if (albums.length === 0) {
            document.getElementById("statsContainer").innerHTML = "<p>No Data Yet</p>";
            return;
        }

        // Extract and flatten listen data
        const listens = [];
        albums.forEach(album => {
        if (album.lastListened) {
            const listenDate = album.lastListened.toDate ? album.lastListened.toDate() : new Date(album.lastListened);
            // Push once for each listenCount to reflect multiple plays
            for (let i = 0; i < (album.listenCount || 1); i++) {
            listens.push(listenDate);
            }
        }
        });

        // Calculations
        // 1. most replayed album
        const mostReplayed = albums.reduce((max, album) => 
        album.listenCount > (max?.listenCount || 0) ? album : max, null
        );

        const mostReplayedName = mostReplayed ? mostReplayed.name : "No data";
        const mostReplayedCount = mostReplayed ? mostReplayed.listenCount : 0;

        document.getElementById("mostReplayed").textContent = `${mostReplayedName} (${mostReplayedCount} plays)`;
    }
    catch (error) {
        console.error("Error loading stats:", error);
        document.getElementById("statsContainer").innerHTML = "<p>Error loading data.</p>";
    }
}

// ---------- Display album cards ----------
function displayAlbumCard(album, containerId) {
  const container = document.getElementById(containerId);
  if (!album) {
    container.textContent = "No data";
    return;
  }
  container.innerHTML = `
    <div class="albumCard">
      <img src="${album.image || 'placeholder.jpg'}" alt="${album.name}" class="albumCover">
      <div class="albumInfo">
        <p class="albumTitle">${album.name}</p>
        <p class="albumArtist">${album.artists}</p>
        <p class="albumDuration">${album.duration ? (album.duration / 60).toFixed(1) + " min" : "Unknown length"}</p>
      </div>
    </div>
  `;
}

async function loadMilestoneStats() {
  try {
    const userUID = localStorage.getItem("userUID");
    if (!userUID) return console.error("No userUID found");

    const albumsCol = collection(db, "users", userUID, "albums");
    const snapshot = await getDocs(albumsCol);
    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (albums.length === 0) {
      document.getElementById("statsContainer").innerHTML = "<p>No Data Yet</p>";
      return;
    }

    // --- Total listens ---
    const totalListens = albums.reduce((sum, a) => sum + (a.listenCount || 0), 0);

    // --- Unique artists ---
    const uniqueArtists = new Set(albums.map(a => a.artists));
    const totalArtists = uniqueArtists.size;

    // --- Albums discovered this month ---
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const discoveredThisMonth = albums.filter(a => {
      if (!a.firstListen) return false;
      const date = a.firstListen.toDate ? a.firstListen.toDate() : new Date(a.firstListen);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    // --- Update HTML text values ---
    document.getElementById("amountListens").textContent = totalListens;
    document.getElementById("amountArtists").textContent = totalArtists;
    document.getElementById("discoveredPerMonth").textContent = discoveredThisMonth;

    // --- Milestone definitions ---
    const listenMilestones = [
      { level: 10, name: "bronze" },
      { level: 50, name: "silver" },
      { level: 100, name: "gold" },
    ];
    const artistMilestones = [
      { level: 10, name: "bronze" },
      { level: 50, name: "silver" },
      { level: 100, name: "gold" },
    ];
    const discoveredMilestones = [
      { level: 3, name: "bronze" },
      { level: 5, name: "silver" },
      { level: 10, name: "gold" },
    ];

    // --- Helper to append badges ---
    function createBadgeContainer(milestones, value) {
      const container = document.createElement("div");
      container.classList.add("badgeContainer");
      milestones.forEach(milestone => {
        const badge = document.createElement("img");
        const unlocked = value >= milestone.level;
        badge.src = unlocked
          ? `/images/badges/${milestone.level}${milestone.name}.png`
          : `/images/badges/nullbadge.png`;
        badge.alt = unlocked
          ? `${milestone.level} milestone badge`
          : `${milestone.level} milestone empty slot`;
        badge.classList.add(unlocked ? "badgeUnlocked" : "badgeLocked");
        container.appendChild(badge);
      });
      return container;
    }

    // --- Append badges ---
    document.querySelector("#amountListens").parentElement.appendChild(
      createBadgeContainer(listenMilestones, totalListens)
    );
    document.querySelector("#amountArtists").parentElement.appendChild(
      createBadgeContainer(artistMilestones, totalArtists)
    );
    document.querySelector("#discoveredPerMonth").parentElement.appendChild(
      createBadgeContainer(discoveredMilestones, discoveredThisMonth)
    );

  } catch (error) {
    console.error("Error loading milestone stats:", error);
    document.getElementById("statsContainer").innerHTML = "<p>Error loading data.</p>";
  }
}


// ---------- Run on page load ----------
window.addEventListener("DOMContentLoaded", () => {
    loadStatsData();
    loadTimeStats();
    loadAlbumStats();
    loadMilestoneStats();
});


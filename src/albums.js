// Firebase setup
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment} from "firebase/firestore";

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

// inputs
const searchButton = document.getElementById("searchButton1");
const searchInput = document.getElementById("searchInput1");
const resultsContainer = document.getElementById("albumResults");

// Search when Enter is pressed
searchInput.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") return;

  const albumName = searchInput.value.trim();
  if (!albumName) {
    alert("Please enter an album name!");
    return;
  }

  try {
    // Get Spotify token from backend
    const tokenResponse = await fetch("http://localhost:3000/token");

    if (!tokenResponse.ok) {
        throw new Error("Failed to get token from backend");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // get top 5 results from spotify
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album&limit=5`;
    const searchResponse = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    // check if search failed
    if (!searchResponse.ok) {
        throw new Error("Spotify search failed");
    }

    // get results
    const searchData = await searchResponse.json();
    const albums = searchData.albums.items;

    // Clear previous results
    resultsContainer.innerHTML = "";

    // Extract info from search result
    albums.forEach(album => {
        const albumInfo = {
            name: album.name,
            artists: album.artists.map(artist => artist.name).join(", "),
            totalTracks: album.total_tracks,
            albumType: album.album_type,
            releaseDate: album.release_date,
            image: album.images[0]?.url,
            link: `https://open.spotify.com/album/${album.id}`,
            id: album.id,
        };

        // Display results
        const albumDiv = document.createElement("div");
        albumDiv.classList.add("album");
        albumDiv.innerHTML = `
          <img src="${albumInfo.image}" alt="${albumInfo.name}" width="200" height="200">
          <div class="albumInfo">
              <h3>${albumInfo.name}</h3>
              <p><strong>Artist(s):</strong> ${albumInfo.artists}</p>
              <p><strong>Released:</strong> ${albumInfo.releaseDate}</p>
              <p><strong>Type:</strong> ${albumInfo.albumType}</p>
              <p><strong>Tracks:</strong> ${albumInfo.totalTracks}</p>
              <a href="${albumInfo.link}" target="_blank">Open in Spotify</a>
          </div>
          <button class="addButton">Add Album</button>
        `;

        // Add album on click
        const addButton = albumDiv.querySelector(".addButton");
        addButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            console.log(`Album added: ${albumInfo.name} by ${albumInfo.artists}`);
            console.log("albumID", albumInfo.id);

            // get logged in user id
            const userUID = localStorage.getItem("userUID");
            if (!userUID) {
                console.error("User not logged in");
                return;
            }

            try {
                // store in firestore
                const albumStore = doc(db, "users", userUID, "albums", albumInfo.id);
                
                // check if albums already stored
                const existingAlbum = await getDoc(albumStore);

                if (existingAlbum.exists()) {
                    await updateDoc(albumStore, {
                        listenCount: increment(1)
                    });
                    console.log("Listen Count Updated")
                }
                else {
                    await setDoc(albumStore, {
                        ...albumInfo,
                        listenCount:1
                    });
                    console.log("New album stored")
                }

                // Added animation
                albumDiv.classList.add("added");
                setTimeout(() => {
                    albumDiv.classList.remove("added");
                }, 500);
            }
            catch (error) {
                console.error("Error adding album:", error);
            }

        });

        resultsContainer.appendChild(albumDiv);
    });

    searchInput.value = "";

    // Hover over album cards
    const albumDivs = Array.from(resultsContainer.querySelectorAll(".album"));
    albumDivs.forEach((album, i) => {
        // stack so first card is at the bottom
        album.style.zIndex = i + 1;

        // bring hovered card to front
        album.addEventListener("mouseenter", () => {
            album.style.transform = "translateY(-10px) scale(1.02)";
            album.style.zIndex = 100;
        });

        // return hovered to its original position
        album.addEventListener("mouseleave", () => {
            album.style.transform = "translateY(0) scale(1)";
            album.style.zIndex = i + 1;
        });
    });

    } 
    // error in search  
    catch (error) {
        console.error("Error searching album:", error);
    }
});

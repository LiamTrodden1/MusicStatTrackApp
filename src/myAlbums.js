import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
    measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

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

// Confirm remove message
function showConfirmPopup(message) {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.classList.add("confirmOverlay");

        // Create popup box
        const popup = document.createElement("div");
        popup.classList.add("confirmPopup");
        popup.innerHTML = `
            <p>${message}</p>
            <div class="confirmButtons">
                <button class="confirmYes">Yes</button>
                <button class="confirmNo">Cancel</button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Button events
        popup.querySelector(".confirmYes").addEventListener("click", () => {
            resolve(true);
            overlay.remove();
        });

        popup.querySelector(".confirmNo").addEventListener("click", () => {
            resolve(false);
            overlay.remove();
        });
    });
}

// DOM Element
const albumContainer = document.querySelector(".albumContainer");

async function getAlbums() {
    try {
        // loading Albums
        albumContainer.innerHTML = `
            <div class="loadingState">
                <div class="loadingSpinner"></div>
                <p>Loading your albums...</p>
            </div>
        `;

        // check userID from local storage
        const userID = localStorage.getItem("userUID");
        if (!userID) {
            albumContainer.innerHTML = "<p>No user ID found.</p>";
            return;
        }

        // get all the users stored albums
        const albumsRef = collection(db, "users", userID, "albums");
        const snapshot = await getDocs(albumsRef);

        // clear albums and display loading albums message
        albumContainer.innerHTML = "";
        if (snapshot.empty) {
            albumContainer.innerHTML = `
                <div class="emptyAlbums">
                    <p class="emptyText">No albums yet</p>
                    <p class="emptySub">Start listening to add your first one!</p>
                </div>
            `;
            return;
        }

        // loop through all stored albums
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const albumID = docSnap.id;

            // create album cards to display 
            const card = document.createElement("div");
            card.classList.add("albumCard");
            card.innerHTML = `
                <a href="${data.link}" target="_blank">
                    <img src="${data.image || 'default-cover.png'}" alt="${data.name}" />
                </a>
                <h3 class="albumTitle">${data.name}</h3>
                <p class="albumArtist">${data.artists}</p>
                <p class="albumInfo">
                    <span>${data.albumType}</span> • 
                    <span>${data.totalTracks} tracks</span> • 
                    <span>${data.releaseDate}</span>
                </p>
                <p class="listenCount">Listened ${data.listenCount || 0} times</p>
                <button class="removeBtn">Remove</button>
            `;

            // remove albums from storage
            const removeBtn = card.querySelector(".removeBtn");
            const listenCountElem = card.querySelector(".listenCount");
            removeBtn.addEventListener("click", async () => {
                const albumRef = doc(db, "users", userID, "albums", albumID);

                try {
                    // default count as 1
                    let currentCount = data.listenCount || 1;
                    
                    // confirm message
                    const confirmRemove = await showConfirmPopup(
                        `Remove <strong>${data.name}</strong> from your albums?`
                    );

                    // decrement if greater than 0
                    if (currentCount > 0) {
                        if (confirmRemove) {
                            currentCount--;
                        }
                    }

                    // remove if value is 0
                    if (currentCount <= 0) {
                        if (confirmRemove) {
                            await deleteDoc(albumRef);
                            card.remove();
                            console.log(`Deleted album "${data.name}"`);
                        }
                    } 
                    else {
                        // update the remove localy and in firestore
                        await updateDoc(albumRef, { listenCount: currentCount });
                        listenCountElem.textContent = `Listened ${currentCount} times`;
                        data.listenCount = currentCount; // update local data
                    }
                } 
                catch (err) {
                    console.error("Error updating/removing album:", err);
                    alert("Something went wrong while updating this album.");
                }
            });

            albumContainer.appendChild(card);
        });
    } 
    catch (error) {
        console.error("Error reading albums:", error);
        albumContainer.innerHTML = "<p>Failed to load albums.</p>";
    }
}

getAlbums();

// Redirect to login if user not logged in
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

// DOM elements
const searchButton = document.getElementById("searchButton1");
const searchInput = document.getElementById("searchInput1");
const resultsContainer = document.getElementById("albumResults");

// Handle search button click
searchButton.addEventListener("click", async () => {
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

    // Search Spotify for album
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album&limit=1`;

    const searchResponse = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!searchResponse.ok) {
        throw new Error("Spotify search failed");
    }

    const searchData = await searchResponse.json();
    const albums = searchData.albums.items;

    // Clear previous results
    resultsContainer.innerHTML = "";

    // Display album results
    albums.forEach(album => {
        const albumInfo = {
            name: album.name,
            artists: album.artists.map(artist => artist.name).join(", "),
            totalTracks: album.total_tracks,
            albumType: album.album_type,
            releaseDate: album.release_date,
            image: album.images[0]?.url,
            link: `https://open.spotify.com/album/${album.id}`,
        };

    // Create album element
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
    `;


        resultsContainer.appendChild(albumDiv);
    });
    searchInput.value="";

  } catch (error) {
    console.error("Error searching album:", error);
  }
});

// Check account user is logged in 
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

document.getElementById("searchButton1").addEventListener("click", async () => {
    // get the album from the input
    const albumName = document.getElementById("searchInput1").value;

    // Check if input is empty
    if (!albumName) {
        alert("Please enter an album name!");
        return;
    }

    try {
        // get token from backend
        const tokenResponse = await fetch("http://localhost:3000/token");
        if (!tokenResponse.ok) {
            throw new Error("Failed to get token from backend");
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // search for album on spotify
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(albumName)}&type=album&limit=1`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        // error getting results
        if (!searchResponse.ok) {
            throw new Error("Spotify search failed");
        }

        const searchData = await searchResponse.json();

        const albums = searchData.albums.items;



        const container = document.getElementById("albumResults");

        albums.forEach(album => {
            const albumInfo = {
                name: album.name,
                artists: album.artists.map(artist => artist.name).join(", "),
                totalTracks: album.total_tracks,
                albumType: album.album_type,
                releaseDate: album.release_date,
                uri: album.uri,
                images: album.images[0]?.url

            };

            console.log(albumInfo)

            // wrapper for albums
            const albumDiv = document.createElement("div");
            albumDiv.classList.add("album");

            // album title
            const title = document.createElement("h3");
            title.textContent = albumInfo.name;

            // album cover
            const img = document.createElement("img");
            img.src = albumInfo.images;
            img.height = 200;
            img.width = 200;

            // artists
            const artist = document.createElement("p");
            artist.textContent = `Artist(s): ${albumInfo.artists}`;
            
            // release date
            const release = document.createElement("p");
            release.textContent = `Released: ${albumInfo.releaseDate}`;

            // album type
            const type = document.createElement("p");
            type.textContent = `Type: ${albumInfo.albumType}`;

            // total tracks
            const tracks = document.createElement("p");
            tracks.textContent = `Tracks: ${albumInfo.totalTracks}`;

            // spotify link
            const link = document.createElement("a");
            link.href = `https://open.spotify.com/album/${album.id}`;
            link.target = "_blank";
            link.textContent = "Open in Spotify";

            // append to albumDiv
            albumDiv.appendChild(title);
            albumDiv.appendChild(img);
            albumDiv.appendChild(artist);
            albumDiv.appendChild(release);
            albumDiv.appendChild(type);
            albumDiv.appendChild(tracks);
            albumDiv.appendChild(link);

            container.appendChild(albumDiv);
        })
    }
    catch (error){
        console.error("Error searching album", error);
    }


});



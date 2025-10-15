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
        })

        // console.log(searchData);
    }
    catch (error){
        console.error("Error searching album", error);
    }


});



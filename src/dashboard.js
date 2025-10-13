// Check account user is logged in 
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

// temp Values
const albums = [
    { title: "AM", artist: "Arctic Monkeys" }
];

// Calculate total
const totalAlbums = albums.length;

// display on page
document.getElementById("totalAlbums").textContent = totalAlbums;

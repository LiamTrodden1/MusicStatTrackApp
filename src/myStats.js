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
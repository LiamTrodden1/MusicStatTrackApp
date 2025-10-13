// Check account user is logged in 
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}
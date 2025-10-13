// Check account user is logged in 
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
}

console.log("Loaded Albums Page");

document.getElementById("searchButton1").addEventListener("click", function(){
    const input = document.getElementById("searchInput1").value;
    document.getElementById("result").textContent = "You entered: " + input;
});


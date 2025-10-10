console.log("Loaded Albums Page");

document.getElementById("searchButton1").addEventListener("click", function(){
    const input = document.getElementById("searchInput1").value;
    document.getElementById("result").textContent = "You entered: " + input;
});


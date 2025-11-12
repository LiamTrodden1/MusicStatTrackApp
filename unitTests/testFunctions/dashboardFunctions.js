// recent albums carousel
export function displayRecentAlbums(albums) {
  const container = document.getElementById("recentAlbums");

  // No albums added
  if (!albums || albums.length === 0) {
    container.innerHTML = `
      <div class="emptyState">
        <img src="images/noALbumArt.png" alt="No albums illustration" class="emptyIcon">
        <h3>Nothing here yet</h3>
        <p>Add your first album to start tracking your music journey.</p>
        <a href="albums.html" class="emptyButton">
          <i class="fa-solid fa-plus"></i> Add Album
        </a>
      </div>
    `;
    return;
  }

  // if no albums found
  if (!albums || albums.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:gray;'>No recent albums yet</p>";
    return;
  }

  // Build album cards
  container.innerHTML = albums.map(album => `
    <div class="dashboardCard">
      <img src="${album.image || 'placeholder.jpg'}" alt="${album.name}">
      <p class="dashboardAlbumTitle">${album.name}</p>
      <p class="dashboardArtist">${album.artists}</p>
    </div>
  `).join("");

  //Initsialise Slick Slider carousel
  setTimeout(() => {
    const $carousel = $(".recentAlbumsContainer");

    // reset the carousel if it was already initialised
    if ($carousel.hasClass("slick-initialized")) {
      $carousel.slick("unslick");
    }

    // slick carousel parameters
    $carousel.slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: true,
      dots: false,
      centerMode: true,
      centerPadding: "180px",
      autoplay: false,
      responsive: [
        { breakpoint: 1200, settings: { centerPadding: "120px" } },
        { breakpoint: 768, settings: { centerPadding: "60px" } },
        { breakpoint: 480, settings: { centerPadding: "30px", slidesToShow: 1 } }
      ]
    });

    // Fade non-centred cards
    $carousel.on("setPosition", function () {
      const $slides = $(this).find(".slick-slide");
      $slides.css("opacity", "0.4");
      $(this).find(".slick-center").css("opacity", "1");
    });

    // click on side albums to scroll
    $carousel.on("click", ".dashboardCard", function () {
      const index = $(this).data("slick-index");
      $carousel.slick("slickGoTo", index);
    });
  }, 100);
}



// total listens stats
export async function loadDashboardData() {
  try {
    // get userID
    const userUID = localStorage.getItem("userUID");

    // no userID found
    if (!userUID) {
      console.error("No userUID found in localStorage");
      return;
    }

    // access total listens from firestore
    const albumsCol = collection(db, "users", userUID, "albums");
    const snapshot = await getDocs(albumsCol);

    // convert data for calculation
    const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // calcualte total listens
    const totalAlbums = albums.length;
    const totalListens = albums.reduce((sum, album) => sum + (album.listenCount || 0), 0);

    // Update UI
    document.getElementById("totalAlbums").textContent = `${totalAlbums}`;
    document.getElementById("totalListens").textContent = `${totalListens}`;

    // sort top 5 albums by most recently listened to 
      const sortedByDate = [...albums].sort((a, b) => {
      const aTime = a.lastListened?.seconds || 0;
      const bTime = b.lastListened?.seconds || 0;
      return bTime - aTime;
    });
    const recent = sortedByDate.slice(0, 15);
    displayRecentAlbums(recent);

    // Most listened to album funtion call
    const mostListened = albums.reduce(
      (max, album) => (album.listenCount || 0) > (max.listenCount || 0) ? album : max,
      {}
    );
    displayMostListened(mostListened);

  } 
  catch (error) {
    console.error("Error loading dashboard:", error);
  }
}
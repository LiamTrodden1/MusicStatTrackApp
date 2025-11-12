import { doc, getDoc } from "firebase/firestore";

// theme test
export async function loadAndApplyTheme() {
  const userUID = localStorage.getItem("userUID");
  if (!userUID) return;

  try {
    const userRef = doc(db, "users", userUID);
    const userSnap = await getDoc(userRef);

    let themeName = ":root"; // default fallback
    if (userSnap.exists() && userSnap.data().theme) {
      themeName = userSnap.data().theme; // e.g. "theme-dark", "theme-sunset"
    }

    // Apply the theme immediately
    document.body.className = themeName;

    // Cache locally for speed
    localStorage.setItem("theme", themeName);
  } catch (err) {
    console.error("Error loading theme:", err);
  }
}
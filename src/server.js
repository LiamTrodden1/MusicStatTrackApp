import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors()); 

// client credentials
const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;

app.get("/token", async (req, res) => {
  try {
    // POST access token to spotify
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    // get access token and send to frontend
    const data = await response.json();
    res.json(data);
  } 
  // Catch error getting token   
  catch (error) {
    console.error("Error getting token:", error);
    res.status(500).json({ error: "Failed to get token" });
  }
});

// Start the server
app.listen(3000, () => console.log("Running on http://localhost:3000"));

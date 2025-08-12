const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// YT API key 
const API_KEY = "AIzaSyDUm69fGERkDUR5hQiERkYFp3JFh7nRFE0";

// Function to shuffle array
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Search songs endpoint
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(
        query
      )}&key=${API_KEY}`
    );
    const data = await ytRes.json();

    let results = data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId
    }));

    // Shuffle so it looks new on every refresh
    results = shuffleArray(results);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from YouTube" });
  }
});

// Trending songs endpoint (with shuffle for refresh)
app.get("/trending", async (req, res) => {
  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&videoCategoryId=10&maxResults=10&key=${API_KEY}`
    );
    const data = await ytRes.json();

    let results = data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id
    }));

    // Shuffle results for refresh effect
    results = shuffleArray(results);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});

// Playlist system (simple in-memory storage)
let playlist = [];

app.get("/playlist", (req, res) => {
  res.json(playlist);
});

app.post("/playlist/add", (req, res) => {
  const { videoId, title } = req.body;
  if (!videoId || !title) return res.status(400).json({ error: "Missing data" });

  playlist.push({ videoId, title });
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
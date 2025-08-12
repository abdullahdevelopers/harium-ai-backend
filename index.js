const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// Playlist Schema
const playlistSchema = new mongoose.Schema({
    name: String,
    songs: [Object] // Store song details as objects
});
const Playlist = mongoose.model("Playlist", playlistSchema);

// Search Songs from YouTube
app.get("/api/search", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing search query" });

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`;
        const response = await axios.get(url);

        const songs = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        res.json(songs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "YouTube API error" });
    }
});

// Save Playlist
app.post("/api/playlist", async (req, res) => {
    const { name, songs } = req.body;
    if (!name || !songs) return res.status(400).json({ error: "Missing data" });

    try {
        const playlist = new Playlist({ name, songs });
        await playlist.save();
        res.json({ message: "Playlist saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get Playlists
app.get("/api/playlist", async (req, res) => {
    try {
        const playlists = await Playlist.find();
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(process.env.PORT || 10000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 10000}`);
});
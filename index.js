// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./lib/mongodb.js";
import rateLimit from "express-rate-limit";

import login from './auth/login.js';
import register from './auth/register.js';
import valid from './auth/valid.js';
import verification from './auth/verification.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_SITE_URL || true,
    credentials: true,
  })
);

// Connect once (single DB connection)
connectDB().catch((err) => {
  console.error("Failed to connect DB at startup:", err);
  process.exit(1);
});

/* -------------------------
   Rate limiters
------------------------- */
// Stricter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // max 5 requests per IP
  message: "Too many attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// More generous for search/trending
const ytLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 50,
  message: "Too many requests to YouTube API, slow down.",
});

/* -------------------------
   YouTube endpoints
------------------------- */
const API_KEY = process.env.YOUTUBE_API_KEY || "YOUR_YT_KEY";

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

app.get("/search", ytLimiter, async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=10&q=${encodeURIComponent(query)}&key=${API_KEY}`
    );
    const data = await ytRes.json();

    let results = (data.items || []).map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
    }));

    results = shuffleArray(results);
    res.json(results);
  } catch (err) {
    console.error("YT search error:", err);
    res.status(500).json({ error: "Failed to fetch from YouTube" });
  }
});

app.get("/trending", ytLimiter, async (req, res) => {
  try {
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&videoCategoryId=10&maxResults=10&key=${API_KEY}`
    );
    const data = await ytRes.json();

    let results = (data.items || []).map((item) => ({
      title: item.snippet.title,
      videoId: item.id,
    }));

    results = shuffleArray(results);
    res.json(results);
  } catch (err) {
    console.error("YT trending error:", err);
    res.status(500).json({ error: "Failed to fetch trending songs" });
  }
});

// simple in-memory playlist
let playlist = [];
app.get("/playlist", (req, res) => res.json(playlist));
app.post("/playlist/add", (req, res) => {
  const { videoId, title } = req.body;
  if (!videoId || !title) return res.status(400).json({ error: "Missing data" });
  playlist.push({ videoId, title });
  res.json({ success: true });
});

/* -------------------------
   Mount API routes with auth limiter
------------------------- */
app.use( authLimiter, login);
app.use( authLimiter, register);
app.use( valid);
app.use( verification);

/* -------------------------
   Start server
------------------------- */
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

// ---------------- CONFIG ----------------
const GEMINI_API_KEY = "AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8";
const MONGODB_URI = "mongodb+srv://Abdullahchohan:abdullah36572515@cluster0.dz9g34v.mongodb.net/chohanai?retryWrites=true&w=majority&appName=Cluster0";

// --------------- INIT -------------------
const app = express();
app.use(cors());
app.use(express.json());

// Gemini AI Init
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Chat Schema
const chatSchema = new mongoose.Schema({
    userMessage: String,
    aiResponse: String,
    timestamp: { type: Date, default: Date.now }
});
const Chat = mongoose.model("Chat", chatSchema);

// ----------------- API ROUTES -----------------
app.post("/ask", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        // AI Instructions
        const prompt = `
        You are an AI assistant created by Abdullah Developers called 'Harium AI'.
        Never mention Google. If someone asks who made you, say 'Chohan Space'.
        Respond politely, informatively, and in a helpful tone.

        User: ${message}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const aiText = result.response.text();

        // Save to DB
        const newChat = new Chat({ userMessage: message, aiResponse: aiText });
        await newChat.save();

        res.json({ reply: aiText });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ----------------- SERVER START -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
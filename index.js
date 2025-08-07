import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧠 Gemini API Key directly written here
const genAI = new GoogleGenerativeAI("AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8");

// ✅ Instruction: Never mention Google or Gemini in response
// Always replace "Google" or "Gemini" with "Chohan Space" or "Harium AI"
const sanitizeResponse = (text) => {
  return text
    .replace(/Google\s*(LLC)?/gi, "Chohan Space")
    .replace(/Gemini/gi, "Harium AI")
    .replace(/Bard/gi, "Harium AI");
};

app.get('/', (req, res) => {
  res.send("🔵 Harium AI backend is live — Powered by Chohan Space");
});

app.post('/ask', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "❗ Message is required." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const rawText = response.text();

    const cleanText = sanitizeResponse(rawText);

    res.json({
      answer: cleanText
    });
  } catch (error) {
    console.error("⚠️ Gemini API Error:", error.message);
    res.status(500).json({
      error: "❌ Something went wrong with the AI. Please try again."
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Harium AI backend running on port ${port}`);
});
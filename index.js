// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://hariumai.netlify.app'
}));
app.use(express.json());

// Load Gemini using Google Generative AI SDK
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyA0HmIGcoRsFiixWVQaCnWB5IDnLBIiPSc"); // ✅ Your key

app.get('/', (req, res) => {
  res.send('Harium AI backend is running with Gemini AI');
});

app.post('/ask', async (req, res) => {
  const { message } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    res.json({ answer: text });
  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.json({ answer: "❌ Gemini AI error. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Harium AI running with Gemini on port ${port}`);
});
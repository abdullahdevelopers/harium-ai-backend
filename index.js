// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// ✅ Allow only Netlify frontend
app.use(cors({
  origin: 'https://hariumai.netlify.app'  // ✅ Your actual Netlify frontend
}));

app.use(express.json());

// ✅ Google Gemini integration
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyA0HmIGcoRsFiixWVQaCnWB5IDnLBIiPSc");  // ✅ Your Gemini API key

// Root route
app.get('/', (req, res) => {
  res.send('Harium AI backend is running with Gemini AI');
});

// AI chat route
app.post('/ask', async (req, res) => {
  const { message } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = result.response;
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
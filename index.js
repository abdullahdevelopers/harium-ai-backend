const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://hariumai.netlify.app'
}));
app.use(express.json());

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyC37PTY_mKxosK9iIjnMdyzHBpde0U1Eqw"); // ✅ NEW KEY

app.get('/', (req, res) => {
  res.send('Harium AI backend is running with Gemini AI ✅');
});

app.post('/ask', async (req, res) => {
  const { message } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const text = result.response.text();
    res.json({ answer: text });
  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.json({ answer: "❌ Gemini AI error. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Harium AI running on port ${port}`);
});
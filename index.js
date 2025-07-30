const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
  const userPrompt = req.body.prompt;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{ parts: [{ text: userPrompt }] }]
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get Gemini response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

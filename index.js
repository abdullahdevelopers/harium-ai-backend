const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 3000;
const apiKey = "AIzaSyCTtt4tDaNldJJktJ-Mg0e7lbrww9r2LPw"; // your real API key

app.use(bodyParser.json());

// Default route
app.get('/', (req, res) => {
  res.send('✅ Harium AI Backend is running!');
});

// AI chat route
app.post('/ask', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: userMessage }],
            role: 'user'
          }
        ]
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
    res.json({ answer: reply });
  } catch (err) {
    console.error('Gemini API error:', err.message);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`Harium AI backend is live on port ${port}`);
});
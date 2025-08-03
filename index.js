const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

require('dotenv').config();

app.use(cors({
  origin: 'https://hariumai.netlify.app'
}));
app.use(express.json());

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.get('/', (req, res) => {
  res.send('✅ Harium AI backend running with GPT');
});

app.post('/ask', async (req, res) => {
  const { message } = req.body;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    });
    const reply = completion.data.choices[0].message.content;
    res.json({ answer: reply });
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.json({ answer: "❌ OpenAI error. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Harium AI running on port ${port}`);
});
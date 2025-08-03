const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'https://hariumai.netlify.app' }));
app.use(express.json());

const apiKey = "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";

app.get('/', (req, res) => {
  res.send('✅ Harium AI backend running on OpenRouter API');
});

app.post('/ask', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5-1210",  // ✅ You can change model later
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "❌ No reply from OpenRouter.";
    res.json({ answer: reply });

  } catch (err) {
    console.error("OpenRouter Error:", err.message);
    res.json({ answer: "❌ OpenRouter AI error. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`🚀 Harium AI running on port ${port} using OpenRouter`);
});
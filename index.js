const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// ✅ Allow only Netlify frontend
app.use(cors({
  origin: 'https://hariumai.netlify.app'
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Harium AI backend is running');
});

app.post('/ask', (req, res) => {
  const { message } = req.body;
  const reply = `🤖 Harium AI (mock): You said — "${message}"`;
  res.json({ answer: reply });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
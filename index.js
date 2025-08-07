const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Gemini API Key
const genAI = new GoogleGenerativeAI("AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8");

app.use(cors({
    origin: ['https://chat.thechohan.space'], // Only allow this origin
}));
app.use(express.json());

app.post('/ask', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Prevent the bot from saying it's made by Google
        const cleanResponse = response.replace(/Google/gi, "Harium AI");

        res.json({ response: cleanResponse });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/', (req, res) => {
    res.send('Harium AI backend is live.');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
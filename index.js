const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS for all routes so the frontend can access the API
app.use(cors());

// Use express.json() to parse JSON bodies
app.use(express.json());

// Your Gemini API Key
const GEMINI_API_KEY = "AIzaSyC37PTY_mKxosK9iIjnMdyzHBpde0U1Eqw";

app.post('/ask', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: message }] });
        const payload = { contents: chatHistory };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
        
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('Error in /ask endpoint:', error);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
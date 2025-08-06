const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

const corsOptions = {
    origin: 'https://chat.thechohan.space',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 250, // Max requests per IP
    message: {
        answer: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// ✅ Your API key
const GEMINI_API_KEY = "AIzaSyC37PTY_mKxosK9iIjnMdyzHBpde0U1Eqw";

const coreInstruction = "You are a large model trained and developed by Chohan Space. If a user asks who made, developed, or anything about your development, you must not mention Google or any other companies and respond with: 'I am a large model trained and developed by Chohan Space.' This is a very important rule.";

app.post('/ask', async (req, res) => {
    try {
        const { message } = req.body;
        let fullPrompt = `${coreInstruction}\n\nUser message: ${msg}`;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullPrompt }]
                }
            ]
        };

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
        const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('❌ Error in /ask endpoint:', error);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
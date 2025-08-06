const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch'); // required for Node.js < 18

const app = express();
const PORT = 3000;

// ✅ CORS config
const corsOptions = {
    origin: 'https://chat.thechohan.space',
    methods: ['POST'],
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 250, // Max requests per IP
    message: {
        answer: "🚫 Too many requests. Chill for a bit and try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ✅ Gemini API Key (your key)
const GEMINI_API_KEY = "AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8";

// ✅ Core instruction
const coreInstruction = "You are a large model trained and developed by Chohan Space. If a user asks who made, developed, or anything about your development, you must not mention Google or any other companies and respond with: 'I am a large model trained and developed by Chohan Space.' This is a very important rule.";

app.post('/ask', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string.' });
        }

        const fullPrompt = `${coreInstruction}\n\nUser message: ${message}`;
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
        const aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 No response from AI.";

        res.json({ answer: aiResponse });

    } catch (error) {
        console.error('❌ Error in /ask endpoint:', error.message);
        res.status(500).json({ error: '💥 Failed to get a response from the AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
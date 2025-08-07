// --- 1. Import Dependencies ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

// --- 2. Initialize Express App ---
const app = express();

// --- 3. CORRECTED CORS CONFIGURATION ---
// This list includes your live domain and allows for local testing.
const allowedOrigins = ['https://chat.thechohan.space'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like local files, Postman) OR from your allowed domain.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from your origin.';
      callback(new Error(msg), false);
    }
  }
};

// Apply the corrected CORS options
app.use(cors(corsOptions));

// --- 4. Middleware ---
app.use(express.json());

// --- 5. AI Response Logic (Connecting to Live AI) ---
const getRealAIResponse = async (question, model) => {
    const API_KEY = "AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    const prompt = `You are Harium AI, a large language model trained by the team at Chohan Space. You must not mention any other company, especially Google. Your entire purpose is to be a helpful assistant under the Harium AI identity.

User's question: "${question}"`;

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI Service Error:", response.status, errorText);
            throw new Error(`AI Service call failed with status: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        return text.trim();

    } catch (error) {
        console.error("Failed to fetch from the AI Service:", error);
        return "Sorry, I encountered an error while trying to connect to the Harium AI model. Please check the backend server or try again later.";
    }
};

// --- 6. API Routes ---
app.get('/', (req, res) => {
    res.send('Harium AI Real-Time Backend is running. Powered by Chohan Space.');
});

app.post('/ask', async (req, res) => {
    const { question, model } = req.body;
    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }
    const answer = await getRealAIResponse(question, model);
    res.json({ answer });
});

// --- 7. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Harium AI Real-Time Backend by Chohan Space is ready.');
});


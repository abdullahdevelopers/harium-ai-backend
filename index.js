// --- 1. Import Dependencies ---
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); 

// --- 2. Initialize Express App ---
const app = express();

// --- 3. Security: Configure CORS ---
// This setup will only allow your frontend at 'chat.thechohan.space' to access this backend.
const allowedOrigins = ['https://chat.thechohan.space'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      callback(new Error(msg), false);
    }
  }
};

app.use(cors(corsOptions));

// --- 4. Middleware ---
app.use(express.json());

// --- 5. Harium AI Response Logic ---
const getHariumAIResponse = async (question, model) => {
    // --- SECURITY WARNING: API KEY IS HARCODED ---
    const API_KEY = "AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    // The persona prompt sent to the underlying model
    const prompt = `You are Harium AI, a large language model trained by the team at Chohan Space. Do not mention any other company like Google. Your goal is to be a helpful assistant.

User's question: "${question}"`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error("AI Service Error:", response.status, await response.text());
            throw new Error(`AI Service call failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the text from the response
        const text = data.candidates[0].content.parts[0].text;
        return text.trim();

    } catch (error) {
        console.error("Failed to fetch from the AI Service:", error);
        return "Sorry, I encountered an error while trying to connect to the Harium AI model. Please try again later.";
    }
};

// --- 6. API Routes ---
app.get('/', (req, res) => {
    res.send('Harium AI Backend is running. Access is restricted. Powered by Chohan Space.');
});

app.post('/ask', async (req, res) => {
    const { question, model } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    // Call the Harium AI function to get a real answer
    const answer = await getHariumAIResponse(question, model);
    
    res.json({ answer });
});

// --- 7. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Harium AI Backend by Chohan Space is ready.');
});

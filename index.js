import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- 1. Initial Setup ---
const app = express();

// --- 2. Security: Configure CORS ---
const allowedOrigins = ['https://chat.thechohan.space'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allows your website and local testing (no origin) to connect.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// --- 3. AI Initialization with Hardcoded Key ---
// --- SECURITY WARNING: API Key is exposed here. ---
const GEMINI_API_KEY = "AIzaSyApGQHkupV6O7bhiMvN4p5SBwnANvMgsf8";

if (!GEMINI_API_KEY) {
  console.error("API Key is missing from the code.");
  process.exit(1); // Stop the server if the key is missing
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// --- 4. AI Response Logic ---
const getRealAIResponse = async (question) => {
  try {
    const prompt = `You are Harium AI, a large language model trained by the team at Chohan Space. You must not mention any other company, especially Google. Your entire purpose is to be a helpful assistant under the Harium AI identity.

User's question: "${question}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();

  } catch (error) {
    console.error("Error fetching from Google Generative AI:", error);
    return "Sorry, I encountered an error while trying to connect to the Harium AI model. Please check the backend server or try again later.";
  }
};

// --- 5. API Routes ---
app.get('/', (req, res) => {
  res.send('Harium AI Real-Time Backend is running. Powered by Chohan Space.');
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }
  const answer = await getRealAIResponse(question);
  res.json({ answer });
});

// --- 6. Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Harium AI Real-Time Backend by Chohan Space is ready.');
});


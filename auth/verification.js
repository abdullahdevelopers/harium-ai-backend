import express from "express";
import nodemailer from "nodemailer";
import { signToken, validateToken, decodeToken } from "../utilities/jwt.js";
import User from "../models/User.js";
import dotenv from 'dotenv'
import process from 'process'
dotenv.config();

const router = express.Router();
const production = process.env.PRODUCTION;

// POST: send verification email
router.post("/verification", async (req, res) => {
    const origin = req.headers.origin;
    if (origin !== process.env.NEXT_PUBLIC_SITE_URL) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const { to } = req.body;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "noreply.beatif@gmail.com",
                pass: "rvpjmulwmypusvtw ",
            },
        });

        const payload = { email: to, type: "verification" };
        const token = signToken(payload, "1d", "verification");
        const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/welcome?token=${token}`;

        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8" /><title>Verify your account</title></head>
      <body>
        <h1>📩 Verify Your Account</h1>
        <p>Click below to verify:</p>
        <a href="${verificationUrl}">Verify Account</a>
      </body>
      </html>
    `;

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject: "Account verification request!",
            text: `Verify your account: ${verificationUrl}`,
            html: htmlContent,
        });

        res.json({ message: "Verification email sent!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
});

// GET: verify token and activate account
router.get("/verification", async (req, res) => {
    const origin = req.headers["x-origin"];
    if (origin !== process.env.NEXT_PUBLIC_SITE_URL) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const token = req.query.token;
        if (!token) return res.status(400).json({ error: "Token not found" });

        const isValid = validateToken(token, "verification");
        if (!isValid) return res.status(403).json({ error: "Invalid token" });

        const { email } = decodeToken(token, "verification");
        const userDoc = await User.findOne({ email });
        if (!userDoc) return res.status(404).json({ error: "User not found" });

        await userDoc.updateOne({ verified: true });

        const accessPayload = { email, type: "access" };
        const refreshPayload = { email, type: "refresh" };

        const accessToken = signToken(accessPayload, "1d", "app");
        const refreshToken = signToken(refreshPayload, "7d", "app");

        res.cookie("access", accessToken, {
            httpOnly: true,
            secure:  false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.cookie("refresh", refreshToken, {
            httpOnly: true,
            secure:  false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ auth: true });
    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;

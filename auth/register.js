import express from "express";
import { hash } from "../utilities/hash.js";
import { signToken } from "../utilities/jwt.js";
import User from "../models/User.js";

const router = express.Router();

const payload = (type, role) => ({ type, role });

router.post("/register", async (req, res) => {
    const origin = req.headers.origin;
    const production = process.env.PRODUCTION;

    if (origin !== process.env.NEXT_PUBLIC_SITE_URL) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {

        const { email, password,name } = req.body;
        const userDoc = await User.findOne({ email }).lean();

        if (!userDoc) {
            const hashPassword = await hash(password);
            const newUser = new User({
                email,
                password: hashPassword,
                name,
                verified: false,
            });
            await newUser.save();

            const type = "register";
            const token = signToken(payload("access", "user"), "1h", type);
            const refreshToken = signToken(payload("refresh", "user"), "24h", type);

            res.cookie("access", token, {
                httpOnly: true,
                secure:  false,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 1000, // 1 hour
            });

            res.cookie("refresh", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 24 * 60 * 60 * 1000, 
            });

            return res.json({ redirectTo: "/welcome" });
        } else {
            return res.status(409).json({ err: "Account already exists" });
        }
    } catch (err) {
        console.error("❌ Server error:", err.message);
        return res.status(500).json({ error: "Server error" });
    }
});

export default router;

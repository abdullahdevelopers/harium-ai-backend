import express from "express";
import { signToken, validateToken } from "../utilities/jwt.js";

const router = express.Router();

router.get("/valid", async (req, res) => {
    const origin = req.headers["x-origin"];
    if (origin !== process.env.NEXT_PUBLIC_SITE_URL) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const type = req.headers["type"];
    if (!type) {
        return res.status(403).json({ auth: false });
    }

    const accessToken = req.cookies?.access;
    const production = process.env.PRODUCTION;

    if (!accessToken) {
        const refreshToken = req.cookies?.refresh;

        if (!refreshToken) {
            return res.json({ auth: false, redirectTo: "/login" });
        }

        const isRefreshValid = validateToken(refreshToken, type);
        if (!isRefreshValid) {
            return res.json({ auth: false, redirectTo: "/login" });
        }

        // Generate new tokens
        const accessPayload = { role: "user", type: "access" };
        const refreshPayload = { role: "user", type: "refresh" };

        const newAccessToken = signToken(accessPayload, "1h", type);
        const newRefreshToken = signToken(refreshPayload, "24h", type);

        res.cookie("access", newAccessToken, {
            httpOnly: true,
            secure:  false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.cookie("refresh", newRefreshToken, {
            httpOnly: true,
            secure:  false,
            sameSite: "lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });

        return res.status(200).json({ auth: true });
    } else {
        try {
            const isAccessValid = validateToken(accessToken, type);
            if (!isAccessValid) {
                return res.status(403).json({ auth: false });
            }
            return res.status(200).json({ auth: true });
        } catch (err) {
            console.error("❌ Error:", err.message);
            return res.status(403).json({ auth: false });
        }
    }
});

export default router;

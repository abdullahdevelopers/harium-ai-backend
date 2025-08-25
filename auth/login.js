import express from "express";
import axios from "axios";
import { valid } from "../utilities/hash.js";
import { signToken } from "../utilities/jwt.js";
import User from "../models/User.js";

const router = express.Router();

const payload = (type, role) => ({ type, role });

router.post("/login", async (req, res) => {
  const origin = req.headers.origin;
  const production = process.env.PRODUCTION;

  if (origin !== process.env.NEXT_PUBLIC_SITE_URL) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    const { email, password } = req.body;
    const userDoc = await User.findOne({ email }).lean();

    if (!userDoc) return res.status(404).json({ err: "User not found" });

    const isValid = await valid(userDoc.password, password);
    if (!isValid) return res.status(401).json({ err: "Invalid password" });

    // Check if verified
    if (!userDoc.verified) {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/verification`,
        { to: email },
        {
          headers: { "Content-Type": "application/json", origin: process.env.NEXT_PUBLIC_SITE_URL },
        }
      );

      if (response.status === 200) {
        const token = signToken({ email }, "1d", "verification");
        res.cookie("access", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 1000, // 1 hour
        });
        return res.status(200).json({ err: "User not verified", redirectTo: "/verification" });
      } else {
        console.log(response.data);
        return res.status(500).json({ err: "Failed to send verification email" });
      }
    }

    // If verified, send access & refresh tokens
    const type = "app";
    const token = signToken(payload("access", "user"), "1h", type);
    const refreshToken = signToken(payload("refresh", "user"), "24h", type);

    res.cookie("access", token, {
      httpOnly: true,
      secure:  false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("refresh", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ redirectTo: "/" });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true;
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
    }
};

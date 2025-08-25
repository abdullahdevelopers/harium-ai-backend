import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expireAt: {
        type: Date,
        default: function () {
            return this.verified ? null : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        }
    },
});

// TTL for unverified accounts
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });


userSchema.index({ email: 1 }, { unique: true });


userSchema.pre("save", function (next) {
    if (this.verified || this.name) {
        this.expireAt = null;
    } else if (!this.expireAt) {
        this.expireAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    }
    next();
});


const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

import jwt from "jsonwebtoken";

// Sign a JWT
export const signToken = (payload, time, type = "") => {
    try {
        let secret;
        switch (type) {
            case "register":
                secret = "1129db2ad27636567addf1895de13dab356f907e4b7d70c469371b75a7a8a828";
                break;
            case "app":
                secret = "86d0d4c7b5debd0d68294787ce0e3cea66c7915548109467a21f242aff0b8ac1";
                break;
            case "verification":
                secret = "f5a2cea0ae9878b686a5d86bd9f7d77d6e3da55eaea67b31301cad177f342e02";
                break;
            default:
                throw new Error("Invalid token type 🛑");
        }
        return jwt.sign(payload, secret, { expiresIn: time });
    } catch (err) {
        console.error("❌ Error signing token:", err.message);
    }
};

// Validate a JWT
export const validateToken = (token, type) => {
    try {
        let decoded;
        switch (type) {
            case "register":
                decoded = jwt.verify(token, '1129db2ad27636567addf1895de13dab356f907e4b7d70c469371b75a7a8a828');
                break;
            case "app":
                decoded = jwt.verify(token, '86d0d4c7b5debd0d68294787ce0e3cea66c7915548109467a21f242aff0b8ac1');
                break;
            case "verification":
                decoded = jwt.verify(token, 'f5a2cea0ae9878b686a5d86bd9f7d77d6e3da55eaea67b31301cad177f342e02');
                break;
            case "register-verification": {
                const secrets = ["1129db2ad27636567addf1895de13dab356f907e4b7d70c469371b75a7a8a828", '86d0d4c7b5debd0d68294787ce0e3cea66c7915548109467a21f242aff0b8ac1'];
                for (const secret of secrets) {
                    try {
                        decoded = jwt.verify(token, secret);
                        break;
                    } catch { }
                }
                if (!decoded) throw new Error("Invalid token");
                break;
            }
            default:
                throw new Error("Invalid token type 🛑");
        }
        return decoded;
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            console.log("EXPIRED ❌");
        } else {
            console.log("INVALID ❌", err.message);
        }
        return null;
    }
};

// Decode a JWT without verifying expiration
export const decodeToken = (token, type) => {
    try {
        let decoded;
        switch (type) {
            case 'register':
                decoded = jwt.verify(token, '1129db2ad27636567addf1895de13dab356f907e4b7d70c469371b75a7a8a828');
                break;
            case 'app':
                decoded = jwt.verify(token, '86d0d4c7b5debd0d68294787ce0e3cea66c7915548109467a21f242aff0b8ac1');
                break;
            case 'verification':
                decoded = jwt.verify(token, 'f5a2cea0ae9878b686a5d86bd9f7d77d6e3da55eaea67b31301cad177f342e02');
                break;


            default:
                throw new Error('Invalid token type 🛑');
        }
        decoded = jwt.decode(token);
        return decoded;
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}
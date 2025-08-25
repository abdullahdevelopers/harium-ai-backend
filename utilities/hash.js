import bcryptjs from "bcryptjs";

// Hash a password
export const hash = async (password) => {
    const salt = await bcryptjs.genSalt(12); // generate new salt per password
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
};

// Validate a password against a hash
export const valid = async (hashPassword, rawPassword) => {
    const isValid = await bcryptjs.compare(rawPassword, hashPassword);
    return isValid;
};

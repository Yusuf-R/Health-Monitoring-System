import crypto from 'crypto';
class AuthController {

    static async hashPassword(password) {
        try {
            const bcryptjs = require("bcryptjs");
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            console.error("Error hashing password:", error.message);
            throw new Error("Password hashing failed");
        }
    }

    static async comparePassword(plainPassword, hashedPassword) {
        try {
            const bcryptjs = require("bcryptjs");
            const isMatch = await bcryptjs.compare(plainPassword, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error("Error comparing passwords:", error.message);
            throw new Error("Password comparison failed");
        }
    }
    // Function to decrypt data (AES-GCM decryption) for Password and login operations
    static async decryptedCredentials(encryptedData) {
        const rawKey = process.env.DECRYPT_PRIVATE_KEY;
        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            const decrypted = crypto.privateDecrypt({
                key: rawKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
                buffer
            );
            const jsonString = decrypted.toString('utf8');
            // Parse the JSON string
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("Decryption error:", error);
            throw error;
        }
    }

    static async generatePEMKeyPair() {
        return crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
    }

}

export default AuthController;
import AuthController from "@/server/controllers/AuthController";
import dbClient from "@/server/db/mongoDb";
import getCareBaseModels from "@/server/models/CareBase/CareBase";
import { loginValidator, signUpValidator } from "@/validators/userValidators";
import mongoose from "mongoose";

const { ObjectId } = mongoose.Types;

class UserController {

    static async RegisterNew(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection

            const { encryptedData } = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the user input
            const { success, data } = signUpValidator.safeParse(decryptedData);
            if (!success) throw new Error("Validation failed");

            const { email, password } = data;

            // Get the User model
            const { User } = await getCareBaseModels(); 

            // Check if user already exists
            const existingUser = await User.findOne({ email }).select("+password");
            if (existingUser) throw new Error("User already exists");

            // Hash the password before saving the user
            const hashedPassword = await AuthController.hashPassword(password);

            // Create a new user
            const newUser = await User.create({
                email,
                password: hashedPassword,
            });

            return newUser; // Return the newly created user
        } catch (error) {
            console.error("Error in RegisterNew:", error.message);
            throw new Error('User registration failed');
        }
    }

    static async Login(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection

            const { encryptedData } = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the user input
            const { success, data } = loginValidator.safeParse(decryptedData);
            if (!success) throw new Error("Login-Validation failed");

            const { email, password } = data;

            // Get the User model
            const { User } = await getCareBaseModels(); // Get the User model

            // Find the user by email
            const user = await User.findOne({ email }).select("+password");
            if (!user) throw new Error("User not found");

            // Check if the password is correct
            const isPasswordValid = await AuthController.comparePassword(password, user.password);
            if (!isPasswordValid) throw new Error("Invalid credentials");

            return user; // Return the user
        } catch (error) {
            console.error("Error in Login:", error.message);
            throw new Error('User login failed');
        }
    }

    static async Profile(userId) {
        try {
            await dbClient.connect();

            // Check if userId is a valid ObjectId
            if (!ObjectId.isValid(userId)) throw new Error("Invalid user ID format");

            // Get the User model
            const { User } = await getCareBaseModels(); // Get the User model

            const userProfile = await User.findById(userId);
            if (!userProfile) throw new Error("User not found");

            return userProfile;
        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('User profile retrieval failed');
        }
    }
}

export default UserController;

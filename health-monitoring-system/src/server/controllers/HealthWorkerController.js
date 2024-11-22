import AuthController from "@/server/controllers/AuthController";
import dbClient from "@/server/db/mongoDb";
import getCareBaseModels from "@/server/models/CareBase/CareBase";
import {loginValidator, signUpValidator} from "@/validators/healthWorkerValidators";
import {beProfileUpdateValidator} from "@/validators/beProfileUpdateValidator";
import mongoose from "mongoose";
import {setLocationValidator} from "@/validators/locationValidator";

const {ObjectId} = mongoose.Types;
const {User} = await getCareBaseModels();

class HealthWorkerController {

    static async RegisterNew(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection

            const {encryptedData} = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the healthWorker input
            const {success, data} = signUpValidator.safeParse(decryptedData);
            if (!success) throw new Error("Validation failed");

            const {email, password} = data;

            // Check if healthWorker already exists
            const existingUser = await User.findOne({email}).select("+password");
            if (existingUser) throw new Error("User already exists");

            // Hash the password before saving the healthWorker
            const hashedPassword = await AuthController.hashPassword(password);

            // Create a new healthWorker
            const newUser = await User.create({
                email,
                password: hashedPassword,
            });

            return newUser; // Return the newly created healthWorker
        } catch (error) {
            console.error("Error in RegisterNew:", error.message);
            throw new Error('User registration failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }
    }

    static async Login(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection

            const {encryptedData} = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the healthWorker input
            const {success, data} = loginValidator.safeParse(decryptedData);
            if (!success) throw new Error("Login-Validation failed");

            const {email, password} = data;

            // Find the healthWorker by email
            const healthWorker = await User.findOne({email}).select("+password");
            if (!healthWorker) throw new Error("User not found");

            // Check if the password is correct
            const isPasswordValid = await AuthController.comparePassword(password, healthWorker.password);
            if (!isPasswordValid) throw new Error("Invalid credentials");

            return healthWorker; // Return the healthWorker
        } catch (error) {
            console.error("Error in Login:", error.message);
            throw new Error('User login failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }

    }

    static async Logout(userId) {
        try {
            await dbClient.connect();
            // Fetch the healthWorker profile from the database
            const userProfile = await User.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!userProfile) {
                throw new Error("User not found");
            }
            // Close the database connection
            await dbClient.close();
            return userProfile;
        } catch (error) {
            console.error("Error in Logout:", error.message);
            throw new Error('User logout failed');
        }
    }


    static async Profile(userId) {
        try {
            await dbClient.connect();

            // Check if userId is a valid ObjectId
            if (!ObjectId.isValid(userId)) throw new Error("Invalid healthWorker ID format");

            const userProfile = await User.findById(userId);
            if (!userProfile) throw new Error("User profile not found");
            return userProfile;
        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('User profile retrieval failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }
    }

    static async UpdateProfile(userId, obj) {
        try {
            await dbClient.connect();

            // Validate the userId
            if (!ObjectId.isValid(userId)) {
                return new Error("Invalid healthWorker ID format");
            }

            // Fetch the healthWorker's current profile
            const userProfile = await User.findById(userId);
            if (!userProfile) {
                return new Error("User not found");
            }

            // Validate input data using a Zod schema
            const {success, data} = beProfileUpdateValidator.safeParse(obj);
            if (!success) {
                return new Error("Validation failed");
            }

            // Merge the validated input with the existing profile
            Object.assign(userProfile, data);

            // Add missing fields based on the updated schema
            User.schema.eachPath((path) => {
                if (!userProfile[path] && User.schema.paths[path].defaultValue !== undefined) {
                    // Add missing fields with their default values
                    userProfile[path] = User.schema.paths[path].defaultValue;
                }
            });

            // Save the updated profile
            await userProfile.save();

            return userProfile;
        } catch (error) {
            console.error("Error in UpdateProfile:", error.message);
            throw new Error('User profile update failed');
        } finally {
            // Disconnect from the database
            await dbClient.close();
        }
    }

    static async AddLocation(userId, obj) {
        try {
            // Fetch the healthWorker profile from the database
            await dbClient.connect();
            const userProfile = await User.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!userProfile) {
                return new Error("User not found");
            }
            // validate the location data
            const {success, data} = setLocationValidator.safeParse(obj);
            if (!success) {
                return new Error("Location validation failed");
            }
            console.log({data});
            const newAddress = {
                category: data.category,
                latitude: data.locationCoords.latitude,
                longitude: data.locationCoords.longitude,
                locationName: data.locationName,
                description: data.description || "",
            };
            userProfile.geoLocation.push(newAddress);
            await userProfile.save();
            return userProfile;

        } catch (error) {
            console.error("Error in SetLocation:", error.message);
            throw new Error('Set location failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }
    }

    static async DeleteLocation(userId, addressId) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the healthWorker profile using the userId
            const userProfile = await User.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!userProfile) {
                throw new Error("User not found");
            }

            // Find the index of the address with the matching _id
            const geoIndex = userProfile.geoLocation.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(addressId))  // Use `equals` to compare ObjectIds
            );

            if (geoIndex === -1) {
                throw new Error("Address not found");
            }

            // Remove the address from the geoLocation array
            userProfile.geoLocation.splice(geoIndex, 1);

            // Save the updated profile
            await userProfile.save();

            // Close the database connection
            await dbClient.close();

            return userProfile;
        } catch (error) {
            console.error("Error in DeleteLocation:", error.message);
            throw new Error("Delete location failed");
        }
    }

    static async EditLocation(userId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();
            console.log({obj});

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the healthWorker profile using the userId
            const userProfile = await User.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!userProfile) {
                throw new Error("User not found");
            }

            console.log({obj});

            // Find the index of the address with the matching _id
            const geoIndex = userProfile.geoLocation.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(obj._id))  // Use `equals` to compare ObjectIds
            );

            if (geoIndex === -1) {
                throw new Error("Address not found");
            }

            // Update the address fields
            userProfile.geoLocation[geoIndex].category = obj.category;
            userProfile.geoLocation[geoIndex].latitude = obj.locationCoords.latitude;
            userProfile.geoLocation[geoIndex].longitude = obj.locationCoords.longitude;
            userProfile.geoLocation[geoIndex].locationName = obj.locationName || "";
            userProfile.geoLocation[geoIndex].description = obj.description || "";

            // Save the updated profile
            await userProfile.save();

            // Close the database connection
            await dbClient.close();

            return userProfile;
        } catch (error) {
            console.error("Error in updateLocation:", error.message);
            throw new Error("Update location failed");
        }
    }

    static async UpdateAvatar(userId, url) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Fetch the healthWorker profile using the userId
            const userProfile = await User.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!userProfile) {
                return new Error("User not found");
            }
            console.log("userProfile", userProfile);
            console.log("url", url);

            // Update the avatar URL
            userProfile.avatar = url;

            // Save the updated profile
            await userProfile.save();

            return userProfile;
        } catch (error) {
            console.error("Error in UpdateAvatar:", error.message);
            throw new Error("Update avatar failed");
        } finally {
            // disconnect db
            await dbClient.close();
        }

    }


}

export default HealthWorkerController;

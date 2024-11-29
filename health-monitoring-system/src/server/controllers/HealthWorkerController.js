import AuthController from "@/server/controllers/AuthController";
import dbClient from "@/server/db/mongoDb";
import getCareBaseModels from "@/server/models/CareBase/CareBase";
import {loginValidator, signUpValidator} from "@/validators/healthWorkerValidators";
import {beHealthWorkerProfileUpdateValidator} from "@/validators/beProfileUpdateValidator";
import mongoose from "mongoose";
import {setLocationValidator} from "@/validators/locationValidator";

const {ObjectId} = mongoose.Types;
const { HealthWorker } = await getCareBaseModels();

class HealthWorkerController {

    static async RegisterNew(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection

            const {encryptedData} = obj;
            const decryptedData = await AuthController.decryptedCredentials(encryptedData);

            // Validate the healthWorker input
            const {success, data} = signUpValidator.safeParse(decryptedData);
            if (!success) {
              return new Error("Validation failed");
            }

            const {email, password} = data;

            // Check if healthWorker already exists
            const existingUser = await HealthWorker.findOne({email}).select("+password");
            if (existingUser) {
              return new Error("HealthWorker already exists");
            }

            // Hash the password before saving the healthWorker
            const hashedPassword = await AuthController.hashPassword(password);

            // Create a new healthWorker
            const newUser = await HealthWorker.create({
                email,
                password: hashedPassword,
            });
            return newUser; // Return the newly created healthWorker
        } catch (error) {
            console.error("Error in RegisterNew:", error.message);
            throw new Error('HealthWorker registration failed');
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
            if (!success) {
              return new Error("Login-Validation failed");
            }

            const {email, password} = data;

            // Find the healthWorker by email
            const healthWorker = await HealthWorker.findOne({email}).select("+password");
            if (!healthWorker) {
              return new Error("HealthWorker not found");
            }

            // Check if the password is correct
            const isPasswordValid = await AuthController.comparePassword(password, healthWorker.password);
            if (!isPasswordValid) {
              return new Error("Invalid credentials");
            }
            // Set the user status to online
            healthWorker.status = "online";
            await healthWorker.save();
            return healthWorker; // Return the healthWorker
        } catch (error) {
            console.error("Error in Login:", error.message);
            throw new Error('HealthWorker login failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }

    }

    static async Logout(userId) {
        try {
            await dbClient.connect();
            // Fetch the healthWorker profile from the database
            const healthWorkerProfile = await HealthWorker.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!healthWorkerProfile) {
                return new Error("HealthWorker not found");
            }
            // set the user profile status to offline
            healthWorkerProfile.status = "offline";
            await healthWorkerProfile.save();
            // Close the database connection
            return healthWorkerProfile;
        } catch (error) {
            console.error("Error in Logout:", error.message);
            throw new Error('HealthWorker logout failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }
    }


    static async Profile(userId) {
        try {
            await dbClient.connect();

            // Check if userId is a valid ObjectId
            if (!ObjectId.isValid(userId)) {
              return new Error("Invalid healthWorker ID format");
            }

            const healthWorkerProfile = await HealthWorker.findById(userId);
            if (!healthWorkerProfile) {
              return new Error("HealthWorker profile not found");
            }
            // set the user profile status to online
            healthWorkerProfile.status = "online";
            await healthWorkerProfile.save();
            return healthWorkerProfile;
        } catch (error) {
            console.error("Error in Profile:", error.message);
            throw new Error('HealthWorker profile retrieval failed');
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
            const healthWorkerProfile = await HealthWorker.findById(userId);
            if (!healthWorkerProfile) {
                return new Error("HealthWorker not found");
            }

            // Validate input data using a Zod schema
            const {success, data} = beHealthWorkerProfileUpdateValidator.safeParse(obj);
            if (!success) {
                return new Error("Validation failed");
            }

            // Merge the validated input with the existing profile
            Object.assign(healthWorkerProfile, data);

            // Add missing fields based on the updated schema
            HealthWorker.schema.eachPath((path) => {
                if (!healthWorkerProfile[path] && HealthWorker.schema.paths[path].defaultValue !== undefined) {
                    // Add missing fields with their default values
                    healthWorkerProfile[path] = HealthWorker.schema.paths[path].defaultValue;
                }
            });

            // Save the updated profile
            await healthWorkerProfile.save();

            return healthWorkerProfile;
        } catch (error) {
            console.error("Error in UpdateProfile:", error.message);
            throw new Error('HealthWorker profile update failed');
        } finally {
            // Disconnect from the database
            await dbClient.close();
        }
    }

    static async AddLocation(userId, obj) {
        try {
            // Fetch the healthWorker profile from the database
            await dbClient.connect();
            const healthWorkerProfile = await HealthWorker.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!healthWorkerProfile) {
                return new Error("HealthWorker not found");
            }
            // validate the location data
            const {success, data} = setLocationValidator.safeParse(obj);
            if (!success) {
                return new Error("Location validation failed");
            }
            const newAddress = {
                category: data.category,
                latitude: data.locationCoords.latitude,
                longitude: data.locationCoords.longitude,
                locationName: data.locationName,
                description: data.description || "",
            };
            healthWorkerProfile.geoLocation.push(newAddress);
            await healthWorkerProfile.save();
            return healthWorkerProfile;

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
            const healthWorkerProfile = await HealthWorker.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!healthWorkerProfile) {
                return new Error("HealthWorker not found");
            }

            // Find the index of the address with the matching _id
            const geoIndex = healthWorkerProfile.geoLocation.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(addressId))  // Use `equals` to compare ObjectIds
            );

            if (geoIndex === -1) {
                return new Error("Address not found");
            }

            // Remove the address from the geoLocation array
            healthWorkerProfile.geoLocation.splice(geoIndex, 1);

            // Save the updated profile
            await healthWorkerProfile.save();

            // Close the database connection
            await dbClient.close();

            return healthWorkerProfile;
        } catch (error) {
            console.error("Error in DeleteLocation:", error.message);
            throw new Error("Delete location failed");
        } finally {
            // disconnect db
            await dbClient.close();
        }
    }

    static async EditLocation(userId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the healthWorker profile using the userId
            const healthWorkerProfile = await HealthWorker.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!healthWorkerProfile) {
                return new Error("HealthWorker not found");
            }
            // Find the index of the address with the matching _id
            const geoIndex = healthWorkerProfile.geoLocation.findIndex(
                (address) => address._id.equals(mongoose.Types.ObjectId.createFromHexString(obj._id))  // Use `equals` to compare ObjectIds
            );

            if (geoIndex === -1) {
                return new Error("Address not found");
            }

            // Update the address fields
            healthWorkerProfile.geoLocation[geoIndex].category = obj.category;
            healthWorkerProfile.geoLocation[geoIndex].latitude = obj.locationCoords.latitude;
            healthWorkerProfile.geoLocation[geoIndex].longitude = obj.locationCoords.longitude;
            healthWorkerProfile.geoLocation[geoIndex].locationName = obj.locationName || "";
            healthWorkerProfile.geoLocation[geoIndex].description = obj.description || "";

            // Save the updated profile
            await healthWorkerProfile.save();

            // Close the database connection
            await dbClient.close();

            return healthWorkerProfile;
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
            const healthWorkerProfile = await HealthWorker.findById(mongoose.Types.ObjectId.createFromHexString(userId));
            if (!healthWorkerProfile) {
                return new Error("HealthWorker not found");
            }
            console.log("healthWorkerProfile", healthWorkerProfile);
            console.log("url", url);

            // Update the avatar URL
            healthWorkerProfile.avatar = url;

            // Save the updated profile
            await healthWorkerProfile.save();

            return healthWorkerProfile;
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

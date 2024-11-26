import dbClient from "@/server/db/mongoDb";
import MedicalHistory from "@/server/models/MedicalHistiory/MedicalHistory";
import mongoose from "mongoose";
import {validateMedicalHistory} from "@/validators/medicalHistoryValidator";

const {ObjectId} = mongoose.Types;

class MedicalHistoryController {

    static async NewRecord(obj) {
        try {
            await dbClient.connect(); // Ensure DB connection
            // Validate input data
            const validation = validateMedicalHistory(obj);
            if (!validation.success) {
                return new Error("Validation failed");
            }
            return await MedicalHistory.create(validation.data);
        } catch (error) {
            console.error("Error in RegisterNew:", error.message);
            throw new Error('User registration failed');
        } finally {
            // disconnect db
            await dbClient.close();
        }
    }

    static async UpdateRecord(userId, obj) {
        try {
            await dbClient.connect();

            // Validate the userId
            if (!ObjectId.isValid(userId)) {
                return new Error("Invalid user ID format");
            }

            // Fetch the user's current profile
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

    static async DeleteRecord(userId, addressId) {
        try {
            // Connect to the database
            await dbClient.connect();

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the user profile using the userId
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

    static async GetRecord(userId, obj) {
        try {
            // Connect to the database
            await dbClient.connect();
            console.log({obj});

            // Convert userId and addressId to ObjectId if they are strings
            // Fetch the user profile using the userId
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

}

export default MedicalHistoryController;

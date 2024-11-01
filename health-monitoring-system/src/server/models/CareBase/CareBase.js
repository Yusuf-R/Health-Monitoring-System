// src/lib/models/CareBase.js
import mongoose from "mongoose";
import dbClient from "@/server/db/mongoDb";

const { Schema, model } = mongoose;

// Ensure DB is connected before model initialization
const connectDB = async () => {
    if (mongoose.connection.readyState !== 1) {
        await dbClient.connect();
    }
};

// Base CareBase schema with discriminator key
const options = {
    discriminatorKey: 'role', // Differentiate between User, HealthWorker, StakeHolder, Admin
    timestamps: true,
};

// Define the base schema
const CareBaseSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Email is invalid",
        ],
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId && !this.githubId && !this.facebookId;
        },
    },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    middleName: { type: String, default: null },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
    emergencyContacts: { type: [String], default: [] },
    profileStatus: { type: String, enum: ['Incomplete', 'Active'], default: 'Incomplete' },
    missingFields: { type: [String], default: [] },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Deactivated', 'Suspended', 'Pending', 'Banned', 'Deleted', 'Blocked'],
        default: 'Active',
    },
    avatar: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    country: { type: String, default: null },
    address: { type: String, default: null },
    stateOfOrigin: { type: String, default: null },
    lga: { type: String, default: null },
    stateOfResidence: { type: String, default: null },
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
    geoLocation: {
        type: {
            type: String, // Specifies that the 'type' is 'Point'
            enum: ['Point'], // GeoJSON supports only 'Point' for now
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
}, options);

// Virtual for fullName
CareBaseSchema.virtual("fullName")
    .get(function () {
        return `${this.firstName || ''} ${this.middleName || ''} ${this.lastName || ''}`.trim();
    })
    .set(function (name) {
        const [firstName, middleName, lastName] = name.split(" ");
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
    });

// Middleware to update profileStatus based on completeness
CareBaseSchema.pre("save", function (next) {
    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'emergencyContacts', 'maritalStatus'];
    this.missingFields = requiredFields.filter(field => !this[field] || (field === 'emergencyContacts' && this.emergencyContacts.length === 0));

    this.profileStatus = this.missingFields.length === 0 ? 'Active' : 'Incomplete';
    next();
});

// Initialize CareBase and its child models
const getCareBaseModels = async () => {
    await connectDB();

    // Define the base CareBase model if it hasn't been created
    const CareBase = mongoose.models.CareBase || model("CareBase", CareBaseSchema);

    // User-specific schema
    const UserSchema = new Schema({
        wellnessCheckHistory: { type: [String], default: [] },
        healthRecords: { type: [String], default: [] },
    });

    // HealthWorker-specific schema
    const HealthWorkerSchema = new Schema({
        certifications: { type: [String], default: [] },
        assignedPatients: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
        department: { type: String, default: null },
    });

    // StakeHolder-specific schema
    const StakeHolderSchema = new Schema({
        organization: { type: String, required: true },
        permissions: { type: [String], default: ["view-reports"] },
        reports: { type: [String], default: [] },
    });

    // Admin-specific schema
    const AdminSchema = new Schema({
        permissions: { type: [String], default: ["manage-users", "view-reports", "manage-site"] }, // Admin-specific permissions
        roleLevel: { type: String, default: "SuperAdmin" }, // Admin role level, e.g., "SuperAdmin" or "Manager"
        lastLogin: { type: Date, default: null }, // Tracks last login for audit
    });

    // Define discriminators for User, HealthWorker, StakeHolder, and Admin
    const User = mongoose.models.User || CareBase.discriminator('User', UserSchema);
    const HealthWorker = mongoose.models.HealthWorker || CareBase.discriminator('HealthWorker', HealthWorkerSchema);
    const StakeHolder = mongoose.models.StakeHolder || CareBase.discriminator('StakeHolder', StakeHolderSchema);
    const Admin = mongoose.models.Admin || CareBase.discriminator('Admin', AdminSchema);

    return { CareBase, User, HealthWorker, StakeHolder, Admin };
};

export default getCareBaseModels;

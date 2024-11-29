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
    dob: { type: String, default: null },
    emergencyContacts: { type: [String], default: [] },
    profileStatus: { type: String, enum: ['Incomplete', 'Active'], default: 'Incomplete' },
    religion: { type: String, enum: [
            "Christianity",
            "Islam",
            "Hinduism",
            "Buddhism",
            "Judaism",
            "Sikhism",
            "Agnostic",
            "Atheist",
            "Other", // Allow text input if selected
        ], default:  null },
    missingFields: { type: [String], default: [] },
    accountStatus: {
        type: String,
        enum: ['Active', 'Inactive', 'Deactivated', 'Suspended', 'Pending', 'Banned', 'Deleted', 'Blocked'],
        default: 'Active',
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy'],
        default: 'online',
    },
    avatar: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    nationality: { type: String, default: null },
    occupation: { type: String, default: null },
    employer: { type: String, default: null },
    companyPhone: { type: String, default: null },
    country: { type: String, default: null },
    address: { type: String, default: null },
    stateOfOrigin: { type: String, default: null },
    lga: { type: String, default: null },
    currlga: { type: String, default: null },
    stateOfResidence: { type: String, default: null },
    nextOfKin: { type: String, default: null },
    nextOfKinRelationship: { type: String, default: null },
    nextOfKinPhone: { type: String, default: null },
    googleId: { type: String, default: null },
    githubId: { type: String, default: null },
}, options);


// Virtual for fullName
CareBaseSchema.virtual('fullName')
    .get(function () {
        return [
            this.firstName || '',
            this.middleName || '',
            this.lastName || '',
        ]
            .filter((part) => part.trim() !== '')
            .join(' ')
            .trim();
    })
    .set(function (fullName) {
        const parts = fullName.split(' ').filter((part) => part.trim() !== '');
        this.firstName = parts[0] || null;
        this.middleName = parts.length > 2 ? parts[1] : null;
        this.lastName = parts.length > 1 ? parts[parts.length - 1] : null;
    });

// Middleware to automatically generate and store fullName
CareBaseSchema.pre('save', function (next) {
    if (this.firstName || this.middleName || this.lastName) {
        this.fullName = [
            this.firstName || '',
            this.middleName || '',
            this.lastName || '',
        ]
            .filter((part) => part.trim() !== '')
            .join(' ')
            .trim();
    }
    next();
});


// Remove the pre-save hook for fullName

// Middleware to update profileStatus based on completeness
CareBaseSchema.pre("save", function (next) {
    const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'emergencyContacts', 'maritalStatus'];
    this.missingFields = requiredFields.filter(field => !this[field] || (field === 'emergencyContacts' && this.emergencyContacts.length === 0));

    this.profileStatus = this.missingFields.length === 0 ? 'Active' : 'Incomplete';
    next();
});

// Define the Address schema for categorized addresses
const GeoLocationSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"],
        required: null,
    },
    latitude: { type: Number, required: null },
    longitude: { type: Number, required: null },
    locationName: { type: String, required: null },
    description: { type: String, default: "" },
}, { _id: true });


// Initialize CareBase and its child models
const getCareBaseModels = async () => {
    await connectDB();

    // Define the base CareBase model if it hasn't been created
    const CareBase = mongoose.models.CareBase || model("CareBase", CareBaseSchema);

    // User-specific schema
    const UserSchema = new Schema({
        geoLocation: {
            type: [GeoLocationSchema], // Store multiple addresses for quick access
            default: [],
        },
        wellnessCheckHistory: { type: [String], default: [] },
        healthRecords: { type: [String], default: [] },
        bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
        genotype: { type: String, enum: ['AA', 'AS', 'AC', 'SS', 'SC', 'CC', 'Unknown'], default: 'Unknown' },
        allergies: { type: [String], default: [] },
        medication: { type: [String], default: [] },
        familyHistory: { type: [String], default: [] },
        dietaryRequirements: { type: [String], default: [] },
        pregnancyStatus: { type: String, enum: ['Yes', 'No', 'Unknown'], default: 'Unknown' },
    });

    // HealthWorker-specific schema
    const HealthWorkerSchema = new Schema({
        geoLocation: {
            type: [GeoLocationSchema], // Store multiple addresses for quick access
            default: [],
        },
        certifications: { type: [String], default: [] },
        licenseNumber:{ type: String, required: null },
        assignedPatients: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
        department: { type: String, default: null },
        specialization: {
            type: String,
            enum:  [
                "General Medicine",
                "Pediatrics",
                "Obstetrics and Gynecology",
                "Cardiology",
                "Neurology",
                "Orthopedics",
                "Psychiatry",
                "Dermatology",
                "Dentistry",
                "Ophthalmology",
                "ENT (Ear, Nose, and Throat)",
                "Physiotherapy",
                "Nutrition and Dietetics",
                "Public Health",
                "Other", // Allow text input if selected
            ],
            default: null
        },
        experienceLevel : {
            type: String,
            enum:  [
                "Intern",
                "Junior Health Worker (1–2 years)",
                "Mid-Level Health Worker (3–5 years)",
                "Senior Health Worker (6–10 years)",
                "Expert/Consultant (10+ years)",
            ],
            default: null
        },

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

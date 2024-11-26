import { z } from 'zod';

// Custom validator for MongoDB ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const ObjectId = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

// Medical History Schema Validator
export const medicalHistoryValidator = z.object({
    // Required fields
    userId: ObjectId.describe('User ID reference'),
    healthIssueId: z.string().min(1, 'Health issue ID is required'),
    conditionTitle: z.string().min(1, 'Condition title is required'),
    category: z.string().min(1, 'Category is required'),

    // Optional fields with defaults
    message: z.string().nullable().optional().default(null),
    status: z.enum(['pending', 'in-progress', 'resolved', 'cancelled'])
        .default('pending')
        .describe('Current status of the medical condition'),
    specialistNotes: z.string().nullable().optional().default(null),
    followUpDate: z.date().nullable().optional().default(null),
    severity: z.enum(['low', 'medium', 'high'])
        .default('medium')
        .describe('Severity level of the condition'),
    resolved: z.boolean().default(false),
});

// Partial validator for updates
export const medicalHistoryUpdateValidator = medicalHistoryValidator.partial();

// Response validator for medical history records
export const medicalHistoryResponseValidator = medicalHistoryValidator.extend({
    _id: ObjectId,
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Validator for query parameters
export const medicalHistoryQueryValidator = z.object({
    userId: ObjectId.optional(),
    status: z.enum(['pending', 'in-progress', 'resolved', 'cancelled']).optional(),
    severity: z.enum(['low', 'medium', 'high']).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
});

// Helper function to validate medical history data
export const validateMedicalHistory = (data) => {
    try {
        return {
            success: true,
            data: medicalHistoryValidator.parse(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        };
    }
};

// Helper function to validate update data
export const validateMedicalHistoryUpdate = (data) => {
    try {
        return {
            success: true,
            data: medicalHistoryUpdateValidator.parse(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        };
    }
};

// Helper function to validate query parameters
export const validateMedicalHistoryQuery = (query) => {
    try {
        return {
            success: true,
            data: medicalHistoryQueryValidator.parse(query)
        };
    } catch (error) {
        return {
            success: false,
            error: error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }))
        };
    }
};

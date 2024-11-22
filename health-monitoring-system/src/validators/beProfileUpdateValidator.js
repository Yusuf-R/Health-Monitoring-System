import { z } from "zod";

export const beProfileUpdateValidator = z.object({
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .optional()
        .or(z.literal(null)), // Allow null for optional fields
    middleName: z
        .string()
        .min(2, "Middle name must be at least 2 characters")
        .optional()
        .or(z.literal(null)),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .optional()
        .or(z.literal(null)),
    maritalStatus: z
        .enum(["Single", "Married", "Divorced", "Widowed"])
        .optional(),
    emergencyContacts: z
        .array(z.string().min(10, "Contact number must be at least 10 digits"))
        .optional(),
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/), // Basic regex for phone number without `react-phone-number-input`
    nextOfKin: z.string().min(1),
    nextOfKinRelationship: z.string().min(1),
    nextOfKinPhone: z.string().regex(/^\+[1-9]\d{1,14}$/),
    dob: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
    country: z.string().min(2, "Country must be at least 2 characters").optional().or(z.literal(null)),
    address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal(null)),
    stateOfOrigin: z
        .string()
        .min(2, "State of Origin must be at least 2 characters")
        .optional()
        .or(z.literal(null)),
    lga: z.string().min(2, "LGA must be at least 2 characters").optional().or(z.literal(null)),
    currlga: z
        .string()
        .min(2, "Current LGA must be at least 2 characters")
        .optional()
        .or(z.literal(null)),
    stateOfResidence: z
        .string()
        .min(2, "State of Residence must be at least 2 characters")
        .optional()
        .or(z.literal(null)),

});


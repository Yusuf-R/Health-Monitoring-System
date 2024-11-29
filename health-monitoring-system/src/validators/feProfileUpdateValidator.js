import { isValidPhoneNumber } from 'react-phone-number-input';
import { z } from "zod";

export const feProfileUpdateValidator = z.object({
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
        .array(
            z.object({
                name: z.string().min(2, "Contact name must be at least 2 characters"),
                phoneNo: z
                    .string()
                    .regex(/^\+?[0-9]{10,15}$/, "Phone number must be between 10-15 digits"),
            })
        )
        .optional(), // Emergency contacts array
    phoneNumber: z.string()
        .nullable()
        .refine((value) => {
            if (!value) {
              return true;
            } // Allow null/empty
            return isValidPhoneNumber(value);
        }, { message: 'Invalid phone number' }),
    dob: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
    nextOfKin: z.string().min(1, 'Next of kin name is required').max(100, 'Name is too long').nullable(),
    nextOfKinRelationship: z.enum([
        'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse', 'Wife', 'Husband', 'Uncle',
        'Aunt', 'Cousin', 'Nephew', 'Niece', 'Grandfather', 'Grandmother', 'Others'
    ]).nullable(),
    nextOfKinPhone: z.string().nullable().refine((value) => {
        if (!value) {
          return true;
        } // Allow null/empty
        return isValidPhoneNumber(value);
    }, { message: 'Invalid phone number' }),
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


export const feHealthWorkerProfileUpdateValidator = z.object({
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
        .array(
            z.object({
                name: z.string().min(2, "Contact name must be at least 2 characters"),
                phoneNo: z
                    .string()
                    .regex(/^\+?[0-9]{10,15}$/, "Phone number must be between 10-15 digits"),
            })
        )
        .optional(), // Emergency contacts array
    phoneNumber: z.string()
        .nullable()
        .refine((value) => {
            if (!value) {
                return true;
            } // Allow null/empty
            return isValidPhoneNumber(value);
        }, { message: 'Invalid phone number' }),
    dob: z.string(),
    gender: z.enum(["Male", "Female", "Other"]),
    nextOfKin: z.string().min(1, 'Next of kin name is required').max(100, 'Name is too long').nullable(),
    nextOfKinRelationship: z.enum([
        'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse', 'Wife', 'Husband', 'Uncle',
        'Aunt', 'Cousin', 'Nephew', 'Niece', 'Grandfather', 'Grandmother', 'Others'
    ]).nullable(),
    nextOfKinPhone: z.string().nullable().refine((value) => {
        if (!value) {
            return true;
        } // Allow null/empty
        return isValidPhoneNumber(value);
    }, { message: 'Invalid phone number' }),
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
    licenseNumber: z.string().min(5, "License number must be at least 5 characters"),
    specialization:z.string().min(2, "Specialization must be at least 2 characters"),
    experienceLevel: z.string().min(2, "Experience Level must be at least 2 characters"),
    hospitalAffiliation: z.string().min(2, "Hospital Affliation must be at least 2 characters"),
});
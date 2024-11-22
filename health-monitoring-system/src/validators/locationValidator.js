import { z } from "zod";

// Location schema with preprocessing for category validation
export const setLocationValidator = z.object({
    category: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.enum(["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"])
            .refine((val) => val !== undefined, { message: "Category is required" })
    ),
    description: z.string().optional(),
    locationCoords: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    locationName: z.string(),
});


export const editLocationValidator = z.object({
    category: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.enum(["Home", "School", "Office", "MarketPlace", "Mosque", "Church", "Hospital", "Hotel", "SuperMarket", "Others"])
            .refine((val) => val !== undefined, { message: "Category is required" })
    ),
    description: z.string().optional(),
    locationCoords: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    locationName: z.string(),

});


import { z } from "zod";

const currentYear = new Date().getFullYear();

export const completeProfileSchema = z.object({
  role: z
    .string()
    .min(1, "Please select a role.")
    .refine((val) => ["student", "alumni"].includes(val), {
      message: "Invalid role selected.",
    }),

  batchYear: z
    .string()
    .min(1, "Batch year is required.")
    .transform((val) => Number(val))
    .refine((num) => !isNaN(num) && num >= 1900 && num <= currentYear + 5, {
      message: `Batch year must be between 1900 and ${currentYear + 5}.`,
    }),

  registrationNumber: z
    .string()
    .min(1, "Registration number is required.")
    .transform((val) => Number(val))
    .refine((num) => !isNaN(num) && num > 0, {
      message: "Registration number must be a positive number.",
    }),

  department: z
    .string()
    .min(2, "Department must be at least 2 characters.")
    .max(100, "Department must be under 100 characters."),

  skills: z.array(z.string().min(1)).max(20, "You can add up to 20 skills."),

  interests: z
    .array(z.string().min(1))
    .max(20, "You can add up to 20 interests."),
});

export type CompleteProfileSchemaType = z.infer<typeof completeProfileSchema>;

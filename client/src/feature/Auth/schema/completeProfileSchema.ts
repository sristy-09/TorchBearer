import { z } from "zod";

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
    .refine((num) => !isNaN(num) && num >= 2076 && num <= 2084, {
      message: "Batch year must be between 2076 and 2084.",
    }),

  registrationNumber: z
    .string()
    .regex(
      /^\d-\d-\d{2}-\d{3}-\d{4}$/,
      "Registration number should be like: 5-2-48-483-2018"
    ),


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

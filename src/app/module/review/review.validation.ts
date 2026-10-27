import z from "zod";

export const createReviewZodSchema = z.object({
  contentId: z.string().min(1, "Content id is required"),
  rating: z.number().int().min(1).max(10, "Rating cannot be more than 10"),
  body: z.string().trim().min(10, "Review is too short").max(2000),
  tags: z
    .array(z.string().trim().toLowerCase().min(1).max(10))
    .min(1, "At least one tag is required")
    .max(5, "Maximum 5 tags allowed"),
  spoiler: z.boolean().optional(),
});

export const updateReviewZodSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1)
    .max(10, "Rating cannot be more than 10")
    .optional(),
  body: z.string().trim().min(10, "Review is too short").max(2000).optional(),
  tags: z
    .array(z.string().trim().toLowerCase().min(1).max(10))
    .min(1, "At least one tag is required")
    .max(5, "Maximum 5 tags allowed")
    .optional(),
  spoiler: z.boolean().optional(),
});

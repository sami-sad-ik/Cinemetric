import z from "zod";

export const updateMyProfileZodSchema = z
  .object({
    name: z.string().optional(),
    profileImage: z.string().nullable().optional(),
  })
  .strict();

export const updateUserByAdminZodSchema = z
  .object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  })
  .strict();

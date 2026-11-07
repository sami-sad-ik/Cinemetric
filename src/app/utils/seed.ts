import { envVars } from "../../config/env";
import { Role } from "../../generated/prisma/schema/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        role: "SUPER_ADMIN",
      },
    });
    if (isSuperAdminExists) {
      console.log("Super admin already exists, skipping seeding!");
      return;
    }
    const superAdmin = await auth.api.signUpEmail({
      body: {
        email: envVars.SUPER_ADMIN_EMAIL,
        password: envVars.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        role: Role.SUPER_ADMIN,
        rememberMe: false,
      },
    });
    console.log("super admin seeded successfully!", superAdmin.user);
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};

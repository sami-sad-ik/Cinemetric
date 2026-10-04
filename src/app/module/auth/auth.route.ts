import { Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";

const router = Router();

router.post("/sign-up/email", authController.registerUser);
router.post("/sign-in/email", authController.loginUser);
router.get(
  "/me",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  authController.getMe,
);

export const authRoutes = router;

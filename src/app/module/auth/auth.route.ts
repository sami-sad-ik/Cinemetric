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
router.post("/refresh-token", authController.getNewAccessToken);
router.post(
  "/change-password",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.USER),
  authController.changePassword,
);

router.post(
  "/logout",
  checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),
  authController.logoutUser,
);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password", authController.resetPassword);

export const authRoutes = router;

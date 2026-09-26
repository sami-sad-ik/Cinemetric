import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/sign-up/email", authController.registerUser);
router.post("/sign-in/email", authController.loginUser);

export const authRoutes = router;

import { Router } from "express";
import { contentRoutes } from "../module/content/content.route";
import { authRoutes } from "../module/auth/auth.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/content", contentRoutes);

export const indexRoutes = router;

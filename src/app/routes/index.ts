import { Router } from "express";
import { contentRoutes } from "../module/content/content.route";
import { authRoutes } from "../module/auth/auth.route";
import { reviewRoutes } from "../module/review/review.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/content", contentRoutes);
router.use("/review", reviewRoutes);

export const indexRoutes = router;

import { Router } from "express";
import { contentRoutes } from "../module/content/content.route";

const router = Router();

router.use("/content", contentRoutes);

export const indexRoutes = router;

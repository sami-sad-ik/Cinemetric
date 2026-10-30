import { Router } from "express";
import { contentRoutes } from "../module/content/content.route";
import { authRoutes } from "../module/auth/auth.route";
import { reviewRoutes } from "../module/review/review.route";
import { likeRoutes } from "../module/Like/like.route";
import { commentRoutes } from "../module/comment/comment.route";
import { watchlistRoutes } from "../module/watchlist/watchlist.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/content", contentRoutes);
router.use("/review", reviewRoutes);
router.use("/like", likeRoutes);
router.use("/comment", commentRoutes);
router.use("/watchList", watchlistRoutes);

export const indexRoutes = router;

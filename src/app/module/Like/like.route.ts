import { Router } from "express";
import { likeController } from "./like.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";

const router = Router();

router.post("/:id", checkAuth(Role.USER), likeController.toggleLike);
router.get("/:id", likeController.getLikeCountByReviewId);
router.get("/me/:id", checkAuth(Role.USER), likeController.hasUserLiked);

export const likeRoutes = router;

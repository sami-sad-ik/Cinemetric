import { Router } from "express";
import { Role } from "../../../generated/prisma/schema/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../shared/validateRequest";
import { commentController } from "./comment.controller";
import { createCommentZodSchema } from "./comment.validation";

const router = Router();

router.get("/count/:reviewId", commentController.getCommentCountByReviewId);
router.get("/replies/:commentId", commentController.getRepliesByCommentId);
router.get("/:reviewId", commentController.getCommentsByReviewId);
router.post(
  "/:reviewId",
  checkAuth(Role.USER),
  validateRequest(createCommentZodSchema),
  commentController.createComment,
);
router.patch(
  "/:commentId",
  checkAuth(Role.USER),
  commentController.updateComment,
);
router.delete(
  "/:commentId",
  checkAuth(Role.USER),
  commentController.deleteComment,
);

export const commentRoutes = router;

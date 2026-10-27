import { Router } from "express";
import { reviewController } from "./review.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";
import { validateRequest } from "../../shared/validateRequest";
import {
  createReviewZodSchema,
  updateReviewZodSchema,
} from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER),
  validateRequest(createReviewZodSchema),
  reviewController.createReview,
);
router.get("/:id", reviewController.getPublishedReviewsByContent);
router.get("/me", checkAuth(Role.USER), reviewController.getMyReviews);
router.put(
  "/:id",
  checkAuth(Role.USER),
  validateRequest(updateReviewZodSchema),
  reviewController.updateMyReview,
);
router.delete("/:id", checkAuth(Role.USER), reviewController.deleteMyReview);
router.get(
  "/pending",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  reviewController.getPendingReviews,
);

router.patch(
  "/:id/approve",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  reviewController.approveReview,
);

router.patch(
  "/:id/reject",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  reviewController.rejectReview,
);

router.patch(
  "/:id/unpublish",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  reviewController.unpublishReview,
);

router.delete(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  reviewController.deleteReview,
);

export const reviewRoutes = router;

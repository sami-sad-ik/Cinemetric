import { Router } from "express";
import { reviewController } from "./review.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";
import { validateRequest } from "../../shared/validateRequest";
import { createReviewZodSchema } from "./review.validation";

const router = Router();

router.post(
  "/review",
  checkAuth(Role.USER),
  validateRequest(createReviewZodSchema),
  reviewController.createReview,
);

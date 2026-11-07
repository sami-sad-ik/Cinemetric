import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";
import { validateRequest } from "../../shared/validateRequest";
import { multerUpload } from "../../../config/multer.config";
import {
  updateMyProfileZodSchema,
  updateUserByAdminZodSchema,
} from "./user.validation";

const router = Router();

router.get(
  "/me",
  checkAuth(Role.USER, Role.SUPER_ADMIN, Role.ADMIN),
  userController.getMe,
);
router.patch(
  "/me",
  checkAuth(Role.USER, Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(updateMyProfileZodSchema),
  userController.updateMyProfile,
);
router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  validateRequest(updateUserByAdminZodSchema),
  userController.updateUserByAdmin,
);
router.post("/subscription", userController.handleSubscription);

export const userRoutes = router;

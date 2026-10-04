import { Router } from "express";
import { contentController } from "./content.controller";
import { validateRequest } from "../../shared/validateRequest";
import { createContentZodSchema } from "./content.validation";

import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";

const router = Router();

router.post(
  "/",

  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createContentZodSchema),
  contentController.createContent,
);
router.get("/", contentController.getAllContent);
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  contentController.deleteContent,
);

export const contentRoutes = router;

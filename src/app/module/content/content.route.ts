import { Router } from "express";
import { contentController } from "./content.controller";
import { validateRequest } from "../../shared/validateRequest";
import { createContentZodSchema } from "./content.validation";

const router = Router();

router.post(
  "/",
  validateRequest(createContentZodSchema),
  contentController.createContent,
);
router.get("/", contentController.getAllContent);
router.delete("/:id", contentController.deleteContent);

export const contentRoutes = router;

import { Router } from "express";
import { contentController } from "./content.controller";

const router = Router();

router.post("/", contentController.createContent);
router.get("/", contentController.getAllContent);
router.delete("/:id", contentController.deleteContent);

export const contentRoutes = router;

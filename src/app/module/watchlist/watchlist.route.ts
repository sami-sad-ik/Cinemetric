import { Router } from "express";
import { watchlistController } from "./watchlist.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/schema/enums";

const router = Router();

router.get("/", checkAuth(Role.USER), watchlistController.getMyWatchlist);
router.get(
  "/:contentId",
  checkAuth(Role.USER),
  watchlistController.isInWatchlist,
);
router.post(
  "/:contentId",
  checkAuth(Role.USER),
  watchlistController.addToWatchlist,
);
router.delete(
  "/:contentId",
  checkAuth(Role.USER),
  watchlistController.removeFromWatchlist,
);

export const watchlistRoutes = router;

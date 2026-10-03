/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response, Router } from "express";
import { contentController } from "./content.controller";
import { validateRequest } from "../../shared/validateRequest";
import { createContentZodSchema } from "./content.validation";
import { cookieUtils } from "../../utils/cookie";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../../config/env";

const router = Router();

router.post(
  "/",
  validateRequest(createContentZodSchema),
  contentController.createContent,
);
router.get(
  "/",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = cookieUtils.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access : Access token is missing",
        );
      }
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (verifiedToken.data?.role !== "admin") {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access : You do not have permission to access this resource",
        );
      }
      next();
    } catch (error: any) {
      next(error);
    }
  },
  contentController.getAllContent,
);
router.delete("/:id", contentController.deleteContent);

export const contentRoutes = router;

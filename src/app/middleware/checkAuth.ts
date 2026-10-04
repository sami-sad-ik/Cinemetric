/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/schema/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth =
  (...roles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access : Session token is missing",
        );
      }

      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });
      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;

        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifetime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentageRemaining = (timeRemaining / sessionLifetime) * 100;
        if (percentageRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-at", expiresAt.toISOString());
          res.setHeader("X-Session-time-remaining", timeRemaining.toString());
          console.log("Token expiring soon");
        }

        if (
          user.status === "BLOCKED" ||
          user.status === "DELETED" ||
          user.isDeleted
        ) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access : User is blocked or deleted",
          );
        }
        if (roles.length > 0 && !roles.includes(user.role)) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden access : You do not have permission to access this resource",
          );
        }
        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email,
        };
      }

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

      if (
        roles.length > 0 &&
        !roles.includes(verifiedToken.data?.role as Role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access : You do not have permission to access this resource",
        );
      }
    } catch (error: any) {
      next(error);
    }
  };

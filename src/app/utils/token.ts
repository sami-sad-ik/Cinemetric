import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";

const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return accessToken;
};

const getRefreshToken = (payload: JwtPayload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
  );
  return refreshToken;
};

const setAccessToken = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day in seconds
  });
};

const setRefreshToken = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7  days in seconds
  });
};

const setBetterAuthSessionToken = (res: Response, token: string) => {
  cookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1  days in seconds
  });
};

export const tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setBetterAuthSessionToken,
};

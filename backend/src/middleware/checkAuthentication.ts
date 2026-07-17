import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, type JwtPayload } from "../utils/jwt";

function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authHeader.split(" ")[1];
  }


  const queryToken = req.query.token;
  if (typeof queryToken === "string") {
    return queryToken;
  }

  return undefined;
}

export const checkAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    (req as any).user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
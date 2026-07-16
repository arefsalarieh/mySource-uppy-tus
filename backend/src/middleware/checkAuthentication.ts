import type { Request, Response, NextFunction } from "express";

export const checkAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token = req.headers.authorization;
  token = token?.split(" ")[1];
  if (!token) throw new Error("token dont exist");
  else if (token) {
    const authReq = req as any;

    authReq.user = {
      id: token,
    };

    next();
  }
};

import type { Request, Response, NextFunction } from "express";
import { tusServer } from "../middleware/tus";

export const addFileToDb = async (req: Request, res: Response) => {
  try {
  await tusServer.handle(req, res);
    

    return res.json({
      message: "uploaded",
    });
  } catch (error) {}
};

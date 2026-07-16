import type { Request, Response } from "express";
import { createTusServer } from "../middleware/tus";
import { prisma } from "../utils/prisma";

const tusServer = createTusServer({
  routePath: "/api/file/upload",
  subfolder: "courses",
  onSaved: async (info) => {
    await prisma.file.create({ data: info });
  },
});

export const uploadCourseFile = async (req: Request, res: Response) => {
  try {
    await tusServer.handle(req, res);
  } catch (error) {
    console.error("tus handle error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Upload failed" });
    }
  }
};
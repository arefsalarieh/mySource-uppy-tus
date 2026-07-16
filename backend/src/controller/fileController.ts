import type { Request, Response } from "express";
import { createTusServer } from "../utils/tus";
import { prisma } from "../utils/prisma";

const tusServer = createTusServer<{ courseId: string; sessionNumber: number }>({
  routePath: "/api/file/upload",
  subfolder: "courses",

  buildData: async ({ upload, base }) => {
    const courseId = upload.metadata?.courseId;
    const sessionNumberRaw = upload.metadata?.sessionNumber;

    if (!courseId) {
      throw new Error("courseId is missing in upload metadata.");
    }

    if (!sessionNumberRaw) {
      throw new Error("sessionNumber is missing in upload metadata.");
    }

    const sessionNumber = Number(sessionNumberRaw);

    if (Number.isNaN(sessionNumber)) {
      throw new Error("sessionNumber must be a valid number.");
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new Error("Course not found.");
    }

    if (course.userId !== base.userId) {
      throw new Error("You are not allowed to upload to this course.");
    }

    return { courseId, sessionNumber };
  },

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
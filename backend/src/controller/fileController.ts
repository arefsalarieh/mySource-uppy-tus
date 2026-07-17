import type { Request, Response } from "express";
import { createTusServer, uploadContext, type UploadFinalData } from "../utils/tus";
import { prisma } from "../utils/prisma";

type CourseUploadExtra = { courseId: string; sessionNumber: number };

const tusServer = createTusServer<CourseUploadExtra>({
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
});

export const uploadCourseFile = async (req: Request, res: Response) => {
  const store: { result?: UploadFinalData<CourseUploadExtra> } = {};

  try {
    await uploadContext.run(store, () => tusServer.handle(req, res));

    if (store.result) {
      await prisma.file.create({ data: store.result });
    }
  } catch (error) {
    console.error("tus handle error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Upload failed" });
    }
  }
};
import fs from "node:fs";
import type { Request, Response } from "express";
import { createTusServer, uploadContext, type UploadFinalData } from "../utils/tus";
import { toAbsolutePath } from "../utils/storage";
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

export const streamFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const fileRecord = await prisma.file.findUnique({
      where: { id: String(fileId) },
    });

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found." });
    }

    const filePath = toAbsolutePath(fileRecord.path);

    if (!fs.existsSync(filePath)) {
      console.error("[streamFile] file missing on disk at:", filePath);
      return res.status(404).json({ message: "File not found on storage." });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const mimeType = fileRecord.mimeType || "application/octet-stream";

    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error("Stream file error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to stream file." });
    }
  }
};
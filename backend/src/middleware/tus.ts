import path from "node:path";
import fs from "node:fs/promises";

import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import jwt from "jsonwebtoken";

import {
  getExtension,
  generateFilename,
  getFileDestination,
} from "../utils/CorrectName";
import { JWT_SECRET, type JwtPayload } from "../utils/jwt";

type SavedFileInfo = {
  filename: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  userId: string;
};

interface CreateTusServerOptions {
  routePath: string;
  subfolder: string;
  onSaved?: (info: SavedFileInfo) => Promise<void>;
}


function getUserIdFromRequest(req: any): string | null {
  try {
    const authHeader =
      typeof req.headers?.get === "function"
        ? req.headers.get("authorization")
        : req.headers?.authorization;

    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

export function createTusServer({
  routePath,
  subfolder,
  onSaved,
}: CreateTusServerOptions) {
  return new Server({
    path: routePath,

    datastore: new FileStore({
      directory: path.join(process.cwd(), "uploads"),
    }),

    async onUploadFinish(req, upload) {
      if (!upload.metadata?.filename) {
        throw new Error("Filename is missing.");
      }

      const userId = getUserIdFromRequest(req);

      if (!userId) {
        throw new Error("Unauthorized: invalid or missing token.");
      }

      const filename = upload.metadata.filename;
      const extension = getExtension(filename);
      const newFilename = generateFilename(filename);

      const oldPath = path.join(process.cwd(), "uploads", upload.id);
      const newPath = getFileDestination(subfolder, newFilename);

      try {
        await fs.mkdir(path.dirname(newPath), { recursive: true });
        await fs.rename(oldPath, newPath);
        await fs.unlink(oldPath + ".json").catch(() => {});

        if (onSaved) {
          await onSaved({
            filename: newFilename,
            originalName: filename,
            extension,
            mimeType: upload.metadata?.filetype || "",
            size: upload.size ?? 0,
            path: newPath,
            url: `/${subfolder}/${newFilename}`,
            userId,
          });
        }

        console.log({ filename: newFilename, extension, path: newPath, userId });
      } catch (err) {
        console.error("Upload finish failed:", err);
        throw err;
      }

      return {};
    },
  });
}
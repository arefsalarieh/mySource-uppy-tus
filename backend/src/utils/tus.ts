import path from "node:path";
import fs from "node:fs/promises";
import { AsyncLocalStorage } from "node:async_hooks";

import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import jwt from "jsonwebtoken";

import {
  getExtension,
  generateFilename,
  getRelativeFileDestination,
  getAbsoluteFileDestination,
} from "./CorrectName";
import { JWT_SECRET, type JwtPayload } from "./jwt";

type BaseFileInfo = {
  filename: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string; 
  url: string;
  userId: string;
};

type BuildDataContext = {
  req: any;
  upload: any;
  base: BaseFileInfo;
};

interface CreateTusServerOptions<T extends Record<string, unknown> = {}> {
  routePath: string;
  subfolder: string;
  buildData?: (ctx: BuildDataContext) => T | Promise<T>;
}

type UploadResultStore<T extends Record<string, unknown> = {}> = {
  result?: BaseFileInfo & T;
};

export const uploadContext = new AsyncLocalStorage<UploadResultStore<any>>();

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

export function createTusServer<T extends Record<string, unknown> = {}>({
  routePath,
  subfolder,
  buildData,
}: CreateTusServerOptions<T>) {
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
      const absoluteNewPath = getAbsoluteFileDestination(subfolder, newFilename);
      const relativeNewPath = getRelativeFileDestination(subfolder, newFilename);

      try {
        await fs.mkdir(path.dirname(absoluteNewPath), { recursive: true });
        await fs.rename(oldPath, absoluteNewPath);
        await fs.unlink(oldPath + ".json").catch(() => {});

        const base: BaseFileInfo = {
          filename: newFilename,
          originalName: filename,
          extension,
          mimeType: upload.metadata?.filetype || "",
          size: upload.size ?? 0,
          path: relativeNewPath,
          url: `/${subfolder}/${newFilename}`,
          userId,
        };

        const extra = buildData ? await buildData({ req, upload, base }) : ({} as T);
        const finalData = { ...base, ...extra };

        const store = uploadContext.getStore();
        if (store) {
          store.result = finalData;
        }
      } catch (err) {
        console.error("Upload finish failed:", err);
        throw err;
      }

      return {};
    },
  });
}

export type UploadFinalData<T extends Record<string, unknown> = {}> = BaseFileInfo & T;
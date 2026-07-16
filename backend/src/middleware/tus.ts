import path from "node:path";
import fs from "node:fs/promises";

import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";

import {
  getExtension,
  generateFilename,
  getFileDestination,
} from "../utils/CorrectName";

type SavedFileInfo = {
  filename: string;
  originalName: string;
  extension: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
};

interface CreateTusServerOptions {
  routePath: string;        
  subfolder: string;       
  onSaved?: (info: SavedFileInfo) => Promise<void>; 
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
          });
        }

        console.log({ filename: newFilename, extension, path: newPath });
      } catch (err) {
        console.error("Upload finish failed:", err);
        throw err;
      }

      return {};
    },
  });
}
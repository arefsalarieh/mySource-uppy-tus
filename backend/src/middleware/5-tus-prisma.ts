import path from "node:path";
import fs from "node:fs/promises";

import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";

import {
  getExtension,
  generateFilename,
  getVideoDestination,
} from "../utils/3-CorrectName";
import { prisma } from "../config/prisma";

export const tusServer = new Server({
  path: "/files",

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
    const newPath = getVideoDestination(newFilename);

    try {
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.rename(oldPath, newPath);
      await fs.unlink(oldPath + ".json").catch(() => {});

      const record = await prisma.file.create({
        data: {
          filename: newFilename,
          originalName: filename,
          mimeType: upload.metadata.filetype || "",
          extension,
          size: upload.size ?? 0,
          path: newPath,
          url: `/videos/${newFilename}`,
        },
      });

      console.log("Saved to DB:", record);

    } catch (err) {
      console.error("Rename failed:", err);
      throw err;
    }

    return {};
  },
});

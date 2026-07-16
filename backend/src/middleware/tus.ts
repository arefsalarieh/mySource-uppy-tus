import path from "node:path";
import fs from "node:fs/promises";

import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";

import {
  getExtension,
  generateFilename,
  getVideoDestination,
} from "../utils/CorrectName";

export const tusServer = new Server({
  path: "/api/file/upload",

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

      console.log({
        filename: newFilename,
        extension,
        path: newPath,
        size: upload.size,
      });
    } catch (err) {
      console.error("Rename failed:", err);
      throw err;
    }

    return {};
  },
});

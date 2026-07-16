import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export function getExtension(filename: string) {
  return path.extname(filename);
}

export function generateFilename(filename: string) {
  const extension = getExtension(filename);

  return crypto.randomUUID() + extension;
}

export function getVideoDestination(filename: string) {
  return path.join(
    process.cwd(),
    "storage",
    "videos",
    filename
  );
}
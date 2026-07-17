import path from "node:path";
import crypto from "node:crypto";
import { STORAGE_ROOT } from "./storage";

export function getExtension(filename: string) {
  return path.extname(filename);
}

export function generateFilename(filename: string) {
  const extension = getExtension(filename);
  return crypto.randomUUID() + extension;
}

export function getRelativeFileDestination(subfolder: string, filename: string) {
  return path.join(subfolder, filename);
}

export function getAbsoluteFileDestination(subfolder: string, filename: string) {
  return path.join(STORAGE_ROOT, subfolder, filename);
}
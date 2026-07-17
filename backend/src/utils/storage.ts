import path from "node:path";


export const STORAGE_ROOT = path.join(process.cwd(), "storage");

export function toAbsolutePath(relativePath: string): string {
  return path.join(STORAGE_ROOT, relativePath);
}
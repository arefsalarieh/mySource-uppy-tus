import express from "express";
import { checkAuthentication } from "../middleware/checkAuthentication";
import { uploadCourseFile } from "../controller/fileController";

const fileRoutes = express.Router();

fileRoutes.use(
  "/upload",
  checkAuthentication,
  uploadCourseFile,
);

export { fileRoutes };

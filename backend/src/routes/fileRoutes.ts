import express from "express";
import { checkAuthentication } from "../middleware/checkAuthentication";
import { uploadCourseFile, streamFile } from "../controller/fileController";

const fileRoutes = express.Router();

fileRoutes.all("/upload", checkAuthentication, uploadCourseFile);
fileRoutes.all("/upload/:id", checkAuthentication, uploadCourseFile);

fileRoutes.get("/stream/:fileId", streamFile);

export { fileRoutes };
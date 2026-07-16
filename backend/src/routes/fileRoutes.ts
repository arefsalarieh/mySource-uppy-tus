import express from "express";
import { checkAuthentication } from "../middleware/checkAuthentication";
import { addFileToDb } from "../controller/fileController";

const fileRoutes = express.Router();

fileRoutes.use(
  "/upload",
  checkAuthentication,
  addFileToDb,
);

export { fileRoutes };

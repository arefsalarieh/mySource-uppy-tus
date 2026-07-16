import express from "express";
import { checkAuthentication } from "../middleware/checkAuthentication";
import { createCourse, getCourses } from "../controller/courseController";

const courseRoutes = express.Router();

courseRoutes.post("/", checkAuthentication, createCourse);
courseRoutes.get("/", getCourses);

export { courseRoutes };
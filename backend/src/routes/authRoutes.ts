import express from "express";
import { handleRegister, handleLogin } from "../controller/authController";

const authRoutes = express.Router();

authRoutes.post("/register", handleRegister);
authRoutes.post("/login", handleLogin);

export { authRoutes };
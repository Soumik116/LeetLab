import express from "express";
import { authMiddleware, checkAdmin } from "../middleware/auth.middleware.js";
import { createproblem } from "../controllers/problem.controller.js";

const problemRoutes = express.Router();

problemRoutes.post("/create-problem", authMiddleware, checkAdmin, createproblem)

export default problemRoutes;

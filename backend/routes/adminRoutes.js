import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/dashboard", protect, getDashboardStats);

export default router;
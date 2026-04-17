import express from "express";
import { getCommerceDashboard } from "../controllers/CommerceDashboard.controller.js";

const router = express.Router();

router.get("/commercer-dashboard", getCommerceDashboard);

export default router;
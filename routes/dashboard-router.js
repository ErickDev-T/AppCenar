import express from "express";
import { getDashboard } from "../controllers/DashboardController.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getDashboard);
router.get("/client", requireAuth, getDashboard);
router.get("/delivery", requireAuth, getDashboard);
router.get("/commerce", requireAuth, getDashboard);
router.get("/Admin", requireAuth, getDashboard);

export default router;

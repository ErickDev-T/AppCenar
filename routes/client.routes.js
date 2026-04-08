import { Router } from "express";
import {
  getAddresses,
  getDashboard,
  getFavorites,
  getOrders,
  getProfile
} from "../controllers/client.controller.js";
import { Roles } from "../utils/enums/roles.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole(Roles.CLIENT));

router.get("/dashboard", getDashboard);
router.get("/dashboard/index", getDashboard);
router.get("/profile", getProfile);
router.get("/orders", getOrders);
router.get("/addresses", getAddresses);
router.get("/favorites", getFavorites);

export default router;

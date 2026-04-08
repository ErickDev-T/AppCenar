import { Router } from "express";
import {
  getCategories,
  getDashboard,
  getProducts,
  getProfile
} from "../controllers/commerce.controller.js";
import { Roles } from "../utils/enums/roles.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole(Roles.COMMERCE));

router.get("/", getDashboard);
router.get("/dashboard", getDashboard);
router.get("/dashboard/index", getDashboard);
router.get("/profile", getProfile);
router.get("/categories", getCategories);
router.get("/products", getProducts);

export default router;

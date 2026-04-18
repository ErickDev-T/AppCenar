import { Router } from "express";
import {
  getCategories,
  getDashboard,
  getOrderDetail,
  getProducts,
  postAssignDelivery,
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
router.get("/orders/:orderId", getOrderDetail);
router.post("/orders/:orderId/assign-delivery", postAssignDelivery);

export default router;

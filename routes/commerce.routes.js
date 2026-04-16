import { Router } from "express";
import {
  getCreateCategory,
  getCategories,
  getDashboard,
  getEditCategory,
  getOrderDetail,
  getProducts,
  postAssignDelivery,
  postCreateCategory,
  postDeleteCategory,
  postEditCategory,
  getProfile,
  postProfile
} from "../controllers/commerce.controller.js";
import { Roles } from "../utils/enums/roles.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(requireAuth, requireRole(Roles.COMMERCE));

router.get("/", getDashboard);
router.get("/dashboard", getDashboard);
router.get("/dashboard/index", getDashboard);
router.get("/profile", getProfile);
router.post("/profile", uploadProfileImage, postProfile);
router.get("/categories", getCategories);
router.get("/categories/new", getCreateCategory);
router.post("/categories/new", postCreateCategory);
router.get("/categories/:categoryId/edit", getEditCategory);
router.post("/categories/:categoryId/edit", postEditCategory);
router.post("/categories/:categoryId/delete", postDeleteCategory);
router.get("/products", getProducts);
router.get("/orders/:orderId", getOrderDetail);
router.post("/orders/:orderId/assign-delivery", postAssignDelivery);

export default router;

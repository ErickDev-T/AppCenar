import express from "express";
import { PostCreate, GetDetail } from "../controllers/orders.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { handleValidationErrors } from "../middlewares/handleValidation.js";
import { Roles } from "../utils/enums/roles.js";
import { validatePostCreate, validateGetDetail } from "./validations/ordersValidations.js";

const router = express.Router();

router.post(
  "/create",
  requireAuth,
  requireRole(Roles.CLIENT),
  validatePostCreate,
  handleValidationErrors("/client/home"),
  PostCreate
);

router.get(
  "/detail/:orderId",
  requireAuth,
  requireRole(Roles.CLIENT),
  validateGetDetail,
  handleValidationErrors("/client/orders"),
  GetDetail
);

export default router;
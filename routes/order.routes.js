import express from "express";
import { PostCreate } from "../controllers/orders.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { Roles } from "../utils/enums/roles.js";
import { validatePostCreate } from "./validations/ordersValidations.js";


import { PostCreate, GetDetail } from "../controllers/orders.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { handleValidationErrors } from "../middlewares/handleValidation.js";
import { Roles } from "../utils/enums/roles.js";
import { validatePostCreate, validateGetDetail } from "./validations/ordersValidations.js";

const router = express.Router();

function attachSessionUser(req, res, next) {
  const sessionUser = req.session?.user;

  req.user = {
    id: sessionUser?._id || sessionUser?.id,
    role: sessionUser?.role
  };

  next();
}

function handleValidationErrors(req, res, next) {
  const errors = req.orderValidationErrors || [];

  if (errors.length > 0) {
    req.flash("errors", errors);
    return res.redirect("/commerce/dashboard");
  }

  next();
}

router.post(
  "/create",
  requireAuth,
  requireRole(Roles.COMMERCE),
  attachSessionUser,
  validatePostCreate,
  handleValidationErrors,
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

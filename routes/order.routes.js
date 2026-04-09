import express from "express";
import { PostCreate } from "../controllers/orders.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { Roles } from "../utils/enums/roles.js";
import { validatePostCreate } from "./validations/ordersValidations.js";

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

export default router;

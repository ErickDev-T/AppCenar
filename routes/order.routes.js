import express from "express";
import { PostCreate } from "../controllers/OrdersController.js";
import isAuth from "../middlewares/isAuth.js";
import { handleValidationErrors } from "../middlewares/handleValidation.js";
import { validatePostCreate } from "./validations/ordersValidation.js";

const router = express.Router();

router.post(
  "/create",
  isAuth,
  validatePostCreate,
  handleValidationErrors((req) => `/client/home`),
  PostCreate
);

export default router;
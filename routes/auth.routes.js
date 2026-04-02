import { Router } from "express";
import {
  activateAccount,
  logout,
  register,
  renderLoginPage,
  renderRegisterPage,
  registerCommerce,
  renderRegisterCommercePage
} from "../controllers/auth.controller.js";
import { requireGuest } from "../middlewares/auth.middleware.js";

import { uploadProfileImage } from "../middlewares/upload.middleware.js";

const authRouter = Router();

authRouter.get("/login", requireGuest, renderLoginPage);
authRouter.get("/register", requireGuest, renderRegisterPage);
authRouter.get("/activate/:token", activateAccount);
authRouter.get("/register-commerce", requireGuest, renderRegisterCommercePage);
authRouter.post("/register", requireGuest, uploadProfileImage, register);
authRouter.post("/register-commerce", requireGuest, uploadProfileImage, registerCommerce);
authRouter.post("/logout", logout);

export default authRouter;

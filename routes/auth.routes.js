import { Router } from "express";
import {
  activateAccount,
  login,
  logout,
  register,
  renderLoginPage,
  renderRegisterPage
} from "../controllers/auth.controller.js";
import { requireGuest } from "../middlewares/auth.middleware.js";

import { uploadProfileImage } from "../middlewares/upload.middleware.js";

const authRouter = Router();

authRouter.get("/login", requireGuest, renderLoginPage);
authRouter.get("/register", requireGuest, renderRegisterPage);
authRouter.get("/activate/:token", activateAccount);
authRouter.post("/login", requireGuest, login);
authRouter.post("/register", requireGuest, uploadProfileImage, register);
authRouter.post("/logout", logout);

export default authRouter;

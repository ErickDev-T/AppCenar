import express from "express";
import {
     GetLogin,
     GetRegister, 
    } from "../controllers/AuthController.js";

const router = express.Router();

router.get("/login", GetLogin);
router.get("/register", GetRegister);

export default router;

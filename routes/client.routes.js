import clientController from "../controllers/AuthController.js";
import { Router } from "express";

const router = Router();
    
router.get("/dashboard", clientController.getDashboard);
router.get("/profile", clientController.getProfile);
router.get("/orders", clientController.getOrders);
router.get("/addresses", clientController.getAddresses);
router.get("/favorites", clientController.getFavorites);

export default router;
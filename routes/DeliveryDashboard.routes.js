import express from 'express';
import { getDeliveryDashboard, postStatusDelivery } from '../controllers/DeliveryDashboard.controller.js';


const router = express.Router();

router.get("/", getDeliveryDashboard);
router.post("/status/:id", postStatusDelivery);

export default router;

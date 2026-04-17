import express from 'express';
import { getDeliveryDashboard, postStatusDelivery } from '../controllers/DeliveryDashboard.controller.js';


const router = express.Router();

router.get("/delivery-list", getDeliveryDashboard);
router.post("/delivery/DeliveryDashboardAdmin", postStatusDelivery);

export default router;
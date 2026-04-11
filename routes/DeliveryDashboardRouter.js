import express from 'express';
import { getDeliveryDashboard, postStatusDelivery } from '../controllers/DeliveryDashboardController.js';


const router = express.Router();

router.get("/delivery/DeliveryDashboardAdmin", getDeliveryDashboard);
router.post("/delivery/DeliveryDashboardAdmin", postStatusDelivery);

export default router;
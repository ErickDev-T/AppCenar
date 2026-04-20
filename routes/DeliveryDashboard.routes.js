import express from 'express';
import { getDeliveryDashboard, postStatusDelivery } from '../controllers/DeliveryDashboard.controller.js';


const router = express.Router();

router.get("/", getDeliveryDashboard);
router.post("/", postStatusDelivery);

export default router;
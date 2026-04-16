import express from 'express';
import { getClientsDashboard } from '../controllers/ClientDashboard.controller.js';

const router = express.Router();

router.get('/client-dashboard', getClientsDashboard);

export default router;
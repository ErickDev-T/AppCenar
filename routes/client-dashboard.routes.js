import express from 'express';
import { getClientsDashboard } from '../controllers/ClientDashboard.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { Roles } from '../utils/enums/roles.js';

const router = express.Router();

router.get('/client-dashboard', getClientsDashboard);

export default router;
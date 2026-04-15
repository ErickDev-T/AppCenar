import { getAdminDashboard } from '../controllers/AdminDashboard.controller.js';
import express from 'express';

const router = express.Router();

router.get('Admin/Dashboard', getAdminDashboard);

export default router;
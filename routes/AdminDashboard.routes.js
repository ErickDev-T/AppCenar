import { getHomeDashboard } from '../controllers/AdminDashboard.controller.js';
import express from 'express';

const router = express.Router();

router.get('/AdminDashboard', getHomeDashboard);

export default router;
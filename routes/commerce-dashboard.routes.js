import express from "express";
import {
  getCommerceDashboard,
  postStatus
} from "../controllers/CommerceDashboard.controller.js";

const router = express.Router();

router.get("/", getCommerceDashboard);
router.post("/status/:id", postStatus);

export default router;

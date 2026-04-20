import express from "express";

import {
  getAdminDashboard,
  getAdminSave,
  postAdminSave,
  getAdminEdit,
  postAdminEdit,
  postAdminStatus
} from "../controllers/AdminController.js";

const router = express.Router();

router.get("/", getAdminDashboard);

router.get("/create", getAdminSave);
router.post("/create", postAdminSave);

router.get("/edit/:id", getAdminEdit);
router.post("/edit", postAdminEdit);

router.post("/status/:id", postAdminStatus);


export default router;
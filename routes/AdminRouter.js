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

router.get("/admin/create", getAdminSave);
router.post("/admin/create", postAdminSave);

router.get("/admin/edit/:id", getAdminEdit);
router.post("/admin/edit", postAdminEdit);

router.post("/admin/status/:id", postAdminStatus);


export default router;
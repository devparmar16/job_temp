import express from "express";
import {
  deleteApplication,
  getMyApplications,
  getJobApplications,
  postApplication,
  getSingleApplication,
  checkAts
} from "../controllers/applicationController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/getmyapplications", isAuthenticated, getMyApplications);
router.post("/post", isAuthenticated, upload.single("resume"), postApplication);
router.post("/check-ats", isAuthenticated, upload.single("resume"), checkAts);
router.get("/job/:jobId", isAuthenticated, getJobApplications);
router.delete("/delete/:id", isAuthenticated, deleteApplication);
router.get("/:id", isAuthenticated, getSingleApplication);

export default router; 
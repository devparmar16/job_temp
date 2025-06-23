import express from "express";
import { getChatMessages } from "../controllers/chatController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/:applicationId", isAuthenticated, getChatMessages);

export default router; 
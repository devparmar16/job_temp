import express from "express";
import { generateChatReply } from "../controllers/aiChatController.js";

const router = express.Router();

router.post("/chat", generateChatReply);

export default router; 
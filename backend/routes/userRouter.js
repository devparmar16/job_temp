import express from "express";
import {
  register,
  login,
  logout,
  getUser,
  updateUserProfile,
  updateProfilePicture,
  removeProfilePicture,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getUser);
router.put("/profile/update", isAuthenticated, updateUserProfile);
router.put("/profile/picture/update", isAuthenticated, upload.single('profilePicture'), updateProfilePicture);
router.delete("/profile/picture/remove", isAuthenticated, removeProfilePicture);

export default router; 
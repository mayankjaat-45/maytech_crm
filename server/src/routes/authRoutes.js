import express from "express";
import {
  getMe,
  getUsers,
  loginUser,
  registerUser,
} from "../controllers/authController.js";
import { mainAdmins, protect } from "../middleware/authMiddleware.js";

const authRoutes = express.Router();

authRoutes.post("/setup-founder", registerUser);

authRoutes.post("/login", loginUser);

// only founder and co-founder can create teammates
authRoutes.post("/register", protect, mainAdmins, registerUser);

authRoutes.get("/me", protect, getMe);

// important: all logged-in users can load users for Assigned To dropdown
authRoutes.get("/users", protect, getUsers);

export default authRoutes;

import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Register a user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

export default router;
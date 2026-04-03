import express from "express";
import {
    getAllUsers,
    getSingleUser,
    deleteUser
} from "../controllers/admin.controller.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all users
router.get("/users", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
// Get single user
router.get("/user/:id", isAuthenticatedUser, authorizeRoles("admin"), getSingleUser);
// Delete user
router.delete("/user/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
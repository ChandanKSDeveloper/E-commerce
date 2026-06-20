import express from "express";
import {
    getAllUsers,
    getSingleUser,
    deleteUser,
    getAdminDashboardStats,
    updateUserRole
} from "../controllers/admin.controller.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get dashboard stats
router.get("/admin/stats", isAuthenticatedUser, authorizeRoles("admin"), getAdminDashboardStats);

// Get all users
router.get("/users", isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);
// Get single user, Update role, and Delete user
router.route("/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
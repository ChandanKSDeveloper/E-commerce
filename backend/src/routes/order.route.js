import express from "express";

import { 
    createOrder, 
    getSingleOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrder, 
    deleteOrder,
} from "../controllers/order.controller.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// user routes
router.route("/order/new").post(isAuthenticatedUser, createOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, getMyOrders);

// admin routes
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);
router.route("/admin/order/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder);
router.route("/admin/order/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);
export default router;
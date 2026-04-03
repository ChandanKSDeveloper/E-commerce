import { Router } from "express";
import {
    newProduct, 
    getProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteProductReview
} from "../controllers/product.controller.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.middleware.js";
 
const router = Router();

// Debug route to verify this router is reachable
router.get("/test", (req, res) => res.json({ message: "Product route is active" }));

// All products
router.get("/products", getProducts);

// New product
router.post("/admin/product/new", isAuthenticatedUser, authorizeRoles("admin"), newProduct);

// Single product (Get, Update, Delete)
router.route("/product/:id")
    .get(getProductById)
router.route("/admin/product/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

// Review
router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/reviews").get(getProductReviews);
router.route("/reviews").delete(isAuthenticatedUser, deleteProductReview);

export default router;  
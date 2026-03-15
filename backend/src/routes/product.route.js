import { Router } from "express";
import { newProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { isAuthenticatedUser } from "../middlewares/auth.middleware.js";
 
const router = Router();

// Debug route to verify this router is reachable
router.get("/test", (req, res) => res.json({ message: "Product route is active" }));

// All products
router.get("/products", getProducts);

// New product
router.post("/admin/product/new", isAuthenticatedUser, newProduct);

// Single product (Get, Update, Delete)
router.route("/product/:id")
    .get(getProductById)
router.route("/admin/product/:id")
    .put(isAuthenticatedUser, updateProduct)
    .delete(isAuthenticatedUser, deleteProduct);

export default router;  
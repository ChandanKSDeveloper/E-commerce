import { Router } from "express";
import { newProduct, getProducts, getProductById, updateProduct, deleteProduct } from "../controllers/product.controller.js";

const router = Router();

// Debug route to verify this router is reachable
router.get("/test", (req, res) => res.json({ message: "Product route is active" }));

// All products
router.get("/products", getProducts);

// New product
router.post("/product/new", newProduct);

// Single product (Get, Update, Delete)
router.route("/product/:id")
    .get(getProductById)
router.route("/admin/product/:id")
    .put(updateProduct)
    .delete(deleteProduct);

export default router;  
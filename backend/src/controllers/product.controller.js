import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";

/**
 * @desc    Create new product
 * @route   POST /api/v1/product/new
 * @access  Private/Admin
 * 
 * NOTE: Using asyncHandler allows us to remove the try-catch block.
 * Errors are automatically caught and passed to the global error middleware.
 */
const newProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
});

/**
 * @desc    Get all products
 * @route   GET /api/v1/product
 * @access  Public
 * 
 * PROFESSIONAL TIP: Always include the count when returning lists of items.
 */
const getProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

/**
 * @desc    Get single product details
 * @route   GET /api/v1/product/:id
 * @access  Public
 * 
 * BEGINNER MISTAKE FIXED: Removed redundant checks like `product === null`.
 * Used ErrorHandler for clear, standardized error responses.
 */
const getProductById = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        // next(new ErrorHandler("Message", Status)) is the professional way to handle 404s
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        product
    });
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/product/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res, next) => {
    // TIP: Always fetch and check if product exists BEFORE updating if you need pre-update logic
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        returnDocument: 'after', // Replacement for deprecated 'new: true'
        runValidators: true, // Ensure the update respects the schema rules
    });

    res.status(200).json({
        success: true,
        product
    });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/product/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });
});

export {
    newProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};

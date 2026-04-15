import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import ApiFeatures from "../utils/ApiFeatures.js";

/**
 * @desc    Create new product
 * @route   POST /api/v1/product/new
 * @access  Private/Admin
 * 
 * NOTE: Using asyncHandler allows us to remove the try-catch block.
 * Errors are automatically caught and passed to the global error middleware.
 */
const newProduct = asyncHandler(async (req, res, next) => {

    // req.user.id is available because of the auth middleware (user.model.js in jwt.sign({ id: this._id }) that runs before this controller
    req.body.user = req.user.id; // Attach the authenticated user's ID to the product data, got from auth middleware so that we can track which admin created the product

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
});

/**
 * @desc    Get all products
 * @route   GET /api/v1/product
 * @query   ?keyword=value
 * @access  Public
 * 
 * PROFESSIONAL TIP: Always include the count when returning lists of items.
 */
const getProducts = asyncHandler(async (req, res, next) => {

    const resultPerPage = 10;
    const page = parseInt(req.query.page) || 1;

    const productsCount = await Product.countDocuments(); // total number of products in database so that we can calculate total number of pages on frontend

    const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const products = await apiFeatures.query; // execute the query

    const totalPages = Math.ceil(productsCount / resultPerPage);

    res.status(200).json({
        success: true,
        count: products.length,
        products,
        productsCount,
        resultPerPage,
        totalPages,
        currentPage : page
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


// Product review
/**
 * @desc    Create new Product review
 * @route   POST /api/v1/review
 * @access  Public
 */

const createProductReview = asyncHandler(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user?._id,
        name: req.user?.name,
        rating: Number(rating),
        comment
    };

    console.log(review)

    const product = await Product.findById(productId);
    console.log("product founded", product)

    if (product) {
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user?._id.toString()
        );

        if (alreadyReviewed) {
            product.reviews.forEach(review => {
                if (review.user.toString() === req.user?._id.toString()) {
                    review.rating = rating;
                    review.comment = comment;
                }
            });
        } else {
            product.reviews.push(review);
            product.numberOfReviews = product.reviews.length;
        }

        // Calculate the new average rating
        let sum = 0;
        product.reviews.forEach(review => {
            sum += review.rating;
        });
        product.rating = sum / product.numberOfReviews;

        await product.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
            message: "Review added successfully"
        });
    } else {
        return next(new ErrorHandler("Product not found", 404));
    }
});

// get all reviews
/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */

const getProductReviews = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Review fetched successfully",
        reviews: product.reviews
    });
});

// Delete review
/**
 * @desc    Delete review
 * @route   DELETE /api/v1/review
 * @access  Public
 */

const deleteProductReview = asyncHandler(async (req, res, next) => {
    console.log("delete product review hit")

    const productId = req.query.productId;
    const reviewId = req.query.id;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    console.log("Product ID:", productId);
    console.log("Review ID to delete:", reviewId);

    const reviews = product.reviews.filter(r => r._id.toString() !== reviewId.toString());

    console.log("reviews after filter:", reviews);

    if (reviews.length === product.reviews.length) {
        return next(new ErrorHandler("Review not found", 404));
    }
    console.log("reviews length:", reviews.length);

    const numberOfReviews = reviews.length;

    // Calculate rating - handle empty reviews array
    let rating = 0;
    if (numberOfReviews > 0) {
        rating = reviews.reduce((acc, item) => item.rating + acc, 0) / numberOfReviews;
    }

    console.log("New rating:", rating);
    console.log("New numberOfReviews:", numberOfReviews);

    const updatedProduct = await Product.findByIdAndUpdate(productId, {
        reviews,
        numberOfReviews,
        rating
    }, {
        returnDocument: 'after',
        runValidators: true
    });

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        reviews: updatedProduct.reviews,
        numberOfReviews: updatedProduct.numberOfReviews,
        rating: updatedProduct.rating
    });
});

export {
    newProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteProductReview
};

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create new order
/**
 * @desc    Create new order
 * @route   POST /api/v1/order/new
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res, next) => {
    const { 
        orderItems, 
        shippingInfo, 
        paymentInfo, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice 
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});

// Get single order
/**
 * @desc    Get single order
 * @route   GET /api/v1/order/:id
 * @access  Private
 */
const getSingleOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });
});

// Get all orders of logged in user
/**
 * @desc    Get all orders of logged in user
 * @route   GET /api/v1/orders/me
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        orders,
    });
});

// Get all orders (admin)
/**
 * @desc    Get all orders (admin)
 * @route   GET /api/v1/admin/orders
 * @access  Private
 */
const getAllOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        orders,
    });
});

// Update / process order (admin)
/**
 * @desc    Update / process order (admin)
 * @route   PUT /api/v1/admin/order/:id
 * @access  Private
 */
const updateOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("Order already delivered", 400));
    }

    order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
    });
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
        success: true,
        order
    });
});

// update stock
async function updateStock(id, quantity) {
    const product = await Product.findById(id);

    product.stock -= quantity;

    await product.save({validateBeforeSave: false});
}

// Delete order (admin)
/**
 * @desc    Delete order (admin)
 * @route   DELETE /api/v1/admin/order/:id
 * @access  Private
 */
const deleteOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
});

export { 
    createOrder, 
    getSingleOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrder, 
    deleteOrder 
};
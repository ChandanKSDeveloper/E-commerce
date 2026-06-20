import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// Get all users
/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users,
    });
});

// Get single user
/**
 * @desc    Get single user
 * @route   GET /api/v1/admin/user/:id
 * @access  Private
 */
const getSingleUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Delete user
/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/user/:id
 * @access  Private
 */
const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // remove avatar from cloudinary -- TODO
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});

// Get admin stats / dashboard summary
/**
 * @desc    Get dashboard stats
 * @route   GET /api/v1/admin/stats
 * @access  Private
 */
const getAdminDashboardStats = asyncHandler(async (req, res, next) => {
    const productsCount = await Product.countDocuments();
    const orders = await Order.find();
    const usersCount = await User.countDocuments();

    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });

    res.status(200).json({
        success: true,
        productsCount,
        ordersCount: orders.length,
        usersCount,
        totalAmount,
        orders
    });
});

// Update user role
/**
 * @desc    Update user role
 * @route   PUT /api/v1/admin/user/:id
 * @access  Private
 */
const updateUserRole = asyncHandler(async (req, res, next) => {
    const { name, email, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        user
    });
});

export { 
    getAllUsers,
    getSingleUser,
    deleteUser,
    getAdminDashboardStats,
    updateUserRole
};
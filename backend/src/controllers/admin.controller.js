import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../models/user.model.js";

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

export { 
    getAllUsers,
    getSingleUser,
    deleteUser 
};
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendToken from "../utils/jwtToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Register a user
/**
 * @desc    Register a user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name, // name of the user
        email, // email of the user
        password, // password of the user
        avatar: {
            public_id: "images-to-pdf/evew90bvgz5ivagx4xo1",
            url: "https://res.cloudinary.com/dtm2oy9i9/image/upload/v1764265657/images-to-pdf/evew90bvgz5ivagx4xo1.png"
        }
    });

    sendToken(user, 201, res); // send token to the user

});

// Login user
/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password", 401));
    }

    /* 
    const token = user.getJWTToken();

     res.status(200).json({
         success: true,
         token
     }); 
    */ 

    sendToken(user, 201, res); 
});

// Logout user
/**
 * @desc    Logout user
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});

// Forgot password
/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/password/forgot
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link
    const resetUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = `Your password reset token is: \n\n ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

    try{

        await sendEmail({
            email: user.email,
            subject: "E-commerce Password Recovery",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;   

        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Failed to send email", 500));
    }
});

// Reset password
/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/password/reset/:token
 * @access  Public  
 */
const resetPassword = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired token", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// get current user profile
/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});


// update password
/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/password/update
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    console.log(req.body.newPassword);
    console.log(req.body.oldPassword);
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password", 401));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
});

// update profile
/**
 * @desc    Update profile
 * @route   PUT /api/v1/auth/me/update
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // update avatar todo

    user.name = req.body.name;
    user.email = req.body.email;

    await user.save();

    sendToken(user, 200, res);
});

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    forgotPassword, 
    resetPassword,
    getUserProfile,
    updatePassword,
    updateProfile 
};
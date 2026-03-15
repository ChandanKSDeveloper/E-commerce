import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendToken from "../utils/jwtToken.js";

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

export { registerUser, loginUser, logoutUser };
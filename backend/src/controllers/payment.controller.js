import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * @desc    Process a stripe payment intent
 * @route   POST /api/v1/payment/process
 * @access  Private
 */
const processPayment = asyncHandler(async (req, res, next) => {
    const { amount, method } = req.body;

    if (method === "skip" || method === "cod" || method === "mock") {
        return res.status(200).json({
            success: true,
            isMock: true,
            paymentInfo: {
                id: `mock_${method}_${Date.now()}`,
                status: "succeeded"
            }
        });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return next(new ErrorHandler("Stripe Secret Key is not configured in backend .env", 500));
    }

    if (!amount) {
        return next(new ErrorHandler("Payment amount is required", 400));
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // must be integer (e.g. paisa/cents)
        currency: 'inr',
        payment_method_types: ['card', 'upi', 'netbanking', 'google_pay', 'apple_pay'],
        metadata: {
            integration_check: "accept_a_payment",
        },
    });

    res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret
    });
});

/**
 * @desc    Get Stripe publishable key
 * @route   GET /api/v1/payment/config
 * @access  Private
 */
const getStripeConfig = asyncHandler(async (req, res, next) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_API_KEY;
    if (!publishableKey) {
        return next(new ErrorHandler("Stripe Publishable Key is not configured in backend .env", 500));
    }
    res.status(200).json({
        success: true,
        publishableKey
    });
});

export { processPayment, getStripeConfig };
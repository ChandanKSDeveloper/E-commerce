import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/ErrorHandler.js";

import stripe from 'stripe'

const processPayment = asyncHandler(async (req, res, next) => {
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',

        metadata: {
            integration_check: "accept_a_payment",
        },
    })

    res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret
    })
})


/**
 * @desc    Get Stripe publishable key
 * @route   GET /api/v1/payment/config
 * @access  Public
 */
const getStripeConfig = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

export {processPayment, getStripeConfig}
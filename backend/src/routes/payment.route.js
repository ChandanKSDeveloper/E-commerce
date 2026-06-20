import { Router } from 'express'
import { isAuthenticatedUser } from '../middlewares/auth.middleware.js'
import { processPayment, getStripeConfig } from '../controllers/payment.controller.js'

const router = Router()

router.route('/payment/process').post(isAuthenticatedUser, processPayment)
router.route('/payment/config').get(isAuthenticatedUser, getStripeConfig)

export default router 
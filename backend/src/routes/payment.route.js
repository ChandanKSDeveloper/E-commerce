import {Router} from 'express'
import { isAuthenticated } from '../middlewares/auth.js'
import { processPayment, getStripeConfig } from '../controllers/payment.controller.js'

const router = Router()

router.route('/payment/process').post(isAuthenticated, processPayment)
router.route('/payment/config').get(isAuthenticated, getStripeConfig)

export default router 
import { Router } from 'express'
import authController from '../controllers/authController.js'
import authValidator from '../validators/authValidator.js'
import validateMiddleware from '../middlewares/validateMiddleware.js'
import rateLimit from '../middlewares/rateLimit.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const authRouter = Router()

authRouter.use(rateLimit)
authRouter.route('/register').post(authValidator.validateRegistrationForm, validateMiddleware.validate, authController.register)
authRouter.route('/verify-email').post(authValidator.validateOtp, validateMiddleware.validate, authController.verifyEmail)
authRouter.route('/login').post(authValidator.validateLogin, validateMiddleware.validate, authController.login)
authRouter.route('/refresh-token').post(authController.refreshToken)
authRouter.route('/check-auth').get(authMiddleware.authenticate, authController.checkAuth)
authRouter.route('/logout').post(authMiddleware.authenticate, authController.logout)

export default authRouter

import { body } from 'express-validator'
import responseMessage from '../constants/responseMessage.js'

export default {
     validateRegistrationForm: [
          body('fullName')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: fullName is required`)
               .isString()
               .withMessage(`${responseMessage.INVALID_INPUT}: fullName must be a string`),

          body('email')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: Email is required`)
               .isEmail()
               .withMessage(`${responseMessage.INVALID_INPUT}: Invalid email format`),

          body('password')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: Password is required`)
               .isLength({ min: 6 })
               .withMessage(`${responseMessage.INVALID_INPUT}: Password must be at least 6 characters long`)
     ],

     validateOtp: [
          body('email')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: Email is required`)
               .isEmail()
               .withMessage(`${responseMessage.INVALID_INPUT}: Invalid email format`),

          body('otp')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: OTP is required`)
               .isString()
               .withMessage(`${responseMessage.INVALID_INPUT}: OTP must be a string`)
               .isLength({ min: 6, max: 6 })
               .withMessage(`${responseMessage.INVALID_INPUT}: OTP must be 6 digits long`)
     ],
     validateLogin: [
          body('email')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: Email is required`)
               .isEmail()
               .withMessage(`${responseMessage.INVALID_INPUT}: Invalid email format`),

          body('password')
               .notEmpty()
               .withMessage(`${responseMessage.INVALID_INPUT}: Password is required`)
               .isLength({ min: 6 })
               .withMessage(`${responseMessage.INVALID_INPUT}: Password must be at least 6 characters long`)
     ]
}

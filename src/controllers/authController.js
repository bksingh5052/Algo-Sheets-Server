import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import bcrypt from 'bcryptjs'
import httpResponse from '../utils/httpResponse.js'
import otpGenerator from 'otp-generator'
import { sendMail } from '../services/mailService.js'
import emailVerification from '../views/email-verification.js'
import quicker from '../utils/quicker.js'
import config from '../configs/config.js'
import { User, RefreshToken } from '../models/index.js'

export default {
     register: async (req, res, next) => {
          try {
               const { fullName, email, password } = req.body

               const existingUser = await User.findOne({ email })

               if (existingUser?.isVerified) {
                    return httpError(next, new Error(responseMessage.USER_ALREADY_EXISTS_WITH('email')), req, 409)
               }

               const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false
               })

               const salt = await bcrypt.genSalt(10)
               const hashedPassword = await bcrypt.hash(password, salt)
               const otpExpiresAt = new Date(Date.now() + 1000 * 60 * 10) // 10 minutes

               if (existingUser && existingUser.isVerified === false) {
                    if (existingUser.otpExpiresAt > new Date()) {
                         return httpError(next, new Error(responseMessage.OTP_ALREADY_SENT), req, 409)
                    }

                    // Update existing unverified user
                    existingUser.otp = otp
                    existingUser.otpExpiresAt = otpExpiresAt
                    existingUser.password = hashedPassword
                    existingUser.fullName = fullName
                    existingUser.isVerified = false

                    await existingUser.save()
               } else {
                    // Create new user
                    await User.create({
                         email,
                         fullName,
                         password: hashedPassword,
                         otp,
                         otpExpiresAt,
                         isVerified: false
                    })
               }

               const { error } = await sendMail(email, 'Verify your email', emailVerification({ otp }))

               if (error) {
                    return httpError(next, new Error(error.message), req, error.statusCode)
               }

               return httpResponse(req, res, 200, responseMessage.OTP_SENT)
          } catch (err) {
               return httpError(next, err, req, 500)
          }
     },

     verifyEmail: async (req, res, next) => {
          try {
               const { email, otp } = req.body

               const existingUser = await User.findOne({ email })

               if (!existingUser) {
                    return httpError(next, new Error(responseMessage.USER_NOT_FOUND('email')), req, 404)
               }

               if (existingUser.isVerified) {
                    return httpError(next, new Error(responseMessage.USER_ALREADY_EXISTS_WITH('email')), req, 409)
               }

               if (existingUser.otp !== otp) {
                    return httpError(next, new Error(responseMessage.INVALID('OTP')), req, 400)
               }

               if (existingUser.otpExpiresAt < new Date()) {
                    return httpError(next, new Error(responseMessage.OTP_EXPIRED), req, 400)
               }

               // Update user
               existingUser.isVerified = true
               existingUser.otp = null
               existingUser.otpExpiresAt = null
               existingUser.lastLoginAt = new Date()

               const updatedUser = await existingUser.save()

               // Generate tokens
               const accessToken = quicker.generateToken({ userId: updatedUser._id }, config.ACCESS_TOKEN_SECRET, Number(config.ACCESS_TOKEN_EXPIRY))

               const refreshToken = quicker.generateToken(
                    { userId: updatedUser._id },
                    config.REFRESH_TOKEN_SECRET,
                    Number(config.REFRESH_TOKEN_EXPIRY)
               )

               // Save refresh token
               await RefreshToken.create({
                    userId: updatedUser._id,
                    token: refreshToken,
                    expiresAt: new Date(Date.now() + Number(config.REFRESH_TOKEN_EXPIRY) * 1000)
               })

               // Handle Cookies
               const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
               res.cookie('accessToken', accessToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'none',
                    maxAge: 1000 * Number(config.ACCESS_TOKEN_EXPIRY),
                    httpOnly: true,
                    secure: true
               }).cookie('refreshToken', refreshToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'none',
                    maxAge: 1000 * Number(config.REFRESH_TOKEN_EXPIRY),
                    httpOnly: true,
                    secure: true
               })

               const data = {
                    _id: updatedUser._id,
                    fullName: updatedUser.fullName,
                    role: updatedUser.role,
                    email: updatedUser.email
               }

               return httpResponse(req, res, 200, responseMessage.OTP_VERIFIED, data)
          } catch (err) {
               return httpError(next, err, req, 500)
          }
     },

     login: async (req, res, next) => {
          try {
               const { email, password } = req.body

               const existingUser = await User.findOne({ email })

               if (!existingUser) {
                    return httpError(next, new Error(responseMessage.USER_NOT_FOUND('email')), req, 404)
               }

               if (!existingUser.isVerified) {
                    return httpError(next, new Error(responseMessage.EMAIL_NOT_VERIFIED), req, 403)
               }

               const isPasswordValid = await bcrypt.compare(password, existingUser.password)

               if (!isPasswordValid) {
                    return httpError(next, new Error(responseMessage.INVALID('password')), req, 400)
               }

               // Update last login
               existingUser.lastLoginAt = new Date()
               await existingUser.save()

               // Generate tokens
               const accessToken = quicker.generateToken({ userId: existingUser._id }, config.ACCESS_TOKEN_SECRET, Number(config.ACCESS_TOKEN_EXPIRY))

               const refreshToken = quicker.generateToken(
                    { userId: existingUser._id },
                    config.REFRESH_TOKEN_SECRET,
                    Number(config.REFRESH_TOKEN_EXPIRY)
               )

               // Save refresh token
               await RefreshToken.create({
                    userId: existingUser._id,
                    token: refreshToken,
                    expiresAt: new Date(Date.now() + Number(config.REFRESH_TOKEN_EXPIRY) * 1000)
               })

               // Handle Cookies
               const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
               res.cookie('accessToken', accessToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'none',
                    maxAge: 1000 * Number(config.ACCESS_TOKEN_EXPIRY),
                    httpOnly: true,
                    secure: true
               }).cookie('refreshToken', refreshToken, {
                    path: '/api/v1',
                    domain: DOMAIN,
                    sameSite: 'none',
                    maxAge: 1000 * Number(config.REFRESH_TOKEN_EXPIRY),
                    httpOnly: true,
                    secure: true
               })

               const data = {
                    _id: existingUser._id,
                    fullName: existingUser.fullName,
                    role: existingUser.role,
                    email: existingUser.email
               }

               return httpResponse(req, res, 200, responseMessage.SUCCESS, data)
          } catch (err) {
               return httpError(next, err, req, 500)
          }
     },

     refreshToken: async (req, res, next) => {
          try {
               const { accessToken, refreshToken } = req.cookies

               if (refreshToken) {
                    if (accessToken) {
                         return httpResponse(req, res, 200, responseMessage.SUCCESS)
                    }

                    const rft = await RefreshToken.findOne({ token: refreshToken })

                    if (rft) {
                         if (rft.expiresAt > new Date()) {
                              const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
                              const decryptedJwt = quicker.verifyToken(refreshToken, config.REFRESH_TOKEN_SECRET)

                              const user = await User.findById(decryptedJwt.userId)

                              if (user) {
                                   const newAccessToken = quicker.generateToken(
                                        { userId: user._id },
                                        config.ACCESS_TOKEN_SECRET,
                                        Number(config.ACCESS_TOKEN_EXPIRY)
                                   )

                                   res.cookie('accessToken', newAccessToken, {
                                        path: '/api/v1',
                                        domain: DOMAIN,
                                        sameSite: 'none',
                                        maxAge: 1000 * Number(config.ACCESS_TOKEN_EXPIRY),
                                        httpOnly: true,
                                        secure: true
                                   })

                                   return httpResponse(req, res, 200, responseMessage.SUCCESS)
                              }
                         }

                         // Delete expired refresh token
                         await RefreshToken.findByIdAndDelete(rft._id)
                    }
               }

               return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
          } catch (err) {
               return httpError(next, err, req, 500)
          }
     },

     logout: async (req, res, next) => {
          try {
               const { refreshToken } = req.cookies

               if (refreshToken) {
                    // Delete refresh token from database
                    await RefreshToken.findOneAndDelete({ token: refreshToken })

                    const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)

                    // Clear cookies
                    res.clearCookie('accessToken', {
                         path: '/api/v1',
                         domain: DOMAIN,
                         sameSite: 'none',
                         httpOnly: true,
                         secure: true
                    }).clearCookie('refreshToken', {
                         path: '/api/v1',
                         domain: DOMAIN,
                         sameSite: 'none',
                         httpOnly: true,
                         secure: true
                    })

                    return httpResponse(req, res, 200, responseMessage.SUCCESS)
               }

               return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
          } catch (err) {
               return httpError(next, err, req, 500)
          }
     },

     checkAuth: async (req, res, next) => {
          try {
               const { authenticatedUser } = req

               const data = {
                    _id: authenticatedUser._id,
                    fullName: authenticatedUser.fullName,
                    role: authenticatedUser.role,
                    email: authenticatedUser.email
               }

               return httpResponse(req, res, 200, responseMessage.SUCCESS, data)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     // Additional utility methods that might be useful

     resendOTP: async (req, res, next) => {
          try {
               const { email } = req.body

               const user = await User.findOne({ email })

               if (!user) {
                    return httpError(next, new Error(responseMessage.USER_NOT_FOUND('email')), req, 404)
               }

               if (user.isVerified) {
                    return httpError(next, new Error(responseMessage.USER_ALREADY_EXISTS_WITH('email')), req, 409)
               }

               if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
                    return httpError(next, new Error(responseMessage.OTP_ALREADY_SENT), req, 409)
               }

               // Generate new OTP
               const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false
               })

               const otpExpiresAt = new Date(Date.now() + 1000 * 60 * 10) // 10 minutes

               // Update user with new OTP
               user.otp = otp
               user.otpExpiresAt = otpExpiresAt
               await user.save()

               // Send email
               const { error } = await sendMail(email, 'Verify your email', emailVerification({ otp }))

               if (error) {
                    return httpError(next, new Error(error.message), req, error.statusCode)
               }

               return httpResponse(req, res, 200, responseMessage.OTP_SENT)
          } catch (err) {
               return httpError(next, err, req, 500)
          }
     }
}

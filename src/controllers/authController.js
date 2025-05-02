import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import bcrypt from 'bcryptjs'
import httpResponse from '../utils/httpResponse.js'
import otpGenerator from 'otp-generator'
import { sendMail } from '../services/mailService.js'
import emailVerification from '../views/email-verification.js'
import { db } from '../libs/pg-db.js'
import quicker from '../utils/quicker.js'
import config from '../configs/config.js'

export default {
     register: async (req, res, next) => {
          try {
               const { fullName, email, password } = req.body

               const existingUser = await db.user.findUnique({
                    where: {
                         email
                    }
               })

               if (existingUser?.isVerified) {
                    return httpError(next, new Error(responseMessage.USER_ALREADY_EXISTS_WITH('email')), req, 409)
               }

               const otp = otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false
               })
               const salt = bcrypt.genSaltSync(10)
               const hashedPassword = bcrypt.hashSync(password, salt)
               const otpExpiresAt = Date.now() + 1000 * 60 * 10

               if (existingUser && existingUser.isVerified === false) {
                    if (existingUser.otpExpiresAt > Date.now()) {
                         return httpError(next, new Error(responseMessage.OTP_ALREADY_SENT), req, 409)
                    }

                    await db.user.update({
                         where: { id: existingUser.id },
                         data: {
                              otp,
                              otpExpiresAt: new Date(otpExpiresAt),
                              password: hashedPassword,
                              fullName,
                              isVerified: false
                         }
                    })
               } else {
                    await db.user.create({
                         data: {
                              email,
                              fullName,
                              password: hashedPassword,
                              otp,
                              otpExpiresAt: new Date(otpExpiresAt),
                              isVerified: false
                         }
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
               // const existingUser = await User.findOne({ email })
               const existingUser = await db.user.findUnique({
                    where: {
                         email
                    }
               })

               if (!existingUser) {
                    return httpError(next, new Error(responseMessage.USER_NOT_FOUND('email')), req, 404)
               }
               if (existingUser.isVerified) {
                    return httpError(next, new Error(responseMessage.USER_ALREADY_EXISTS_WITH('email')), req, 409)
               }
               if (existingUser.otp !== otp) {
                    return httpError(next, new Error(responseMessage.INVALID('OTP')), req, 400)
               }
               if (existingUser.otpExpiresAt < Date.now()) {
                    return httpError(next, new Error(responseMessage.OTP_EXPIRED), req, 400)
               }

               const updatedUser = await db.user.update({
                    where: { id: existingUser.id },
                    data: {
                         isVerified: true,
                         otp: null,
                         otpExpiresAt: null,
                         lastLoginAt: new Date(Date.now())
                    }
               })
               const accessToken = quicker.generateToken(
                    {
                         userId: updatedUser.id
                    },
                    config.ACCESS_TOKEN_SECRET,
                    Number(config.ACCESS_TOKEN_EXPIRY)
               )
               const refreshToken = quicker.generateToken(
                    {
                         userId: updatedUser.id
                    },
                    config.REFRESH_TOKEN_SECRET,
                    Number(config.REFRESH_TOKEN_EXPIRY)
               )
               await db.refreshToken.create({
                    data: {
                         userId: updatedUser.id,
                         token: refreshToken,
                         expiresAt: new Date(Date.now() + Number(config.REFRESH_TOKEN_EXPIRY) * 1000)
                    }
               })
               // * Handle Cookie
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
                    id: updatedUser.id,
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
               const existingUser = await db.user.findUnique({
                    where: {
                         email
                    }
               })

               if (!existingUser) {
                    return httpError(next, new Error(responseMessage.USER_NOT_FOUND('email')), req, 404)
               }
               if (!existingUser.isVerified) {
                    return httpError(next, new Error(responseMessage.EMAIL_NOT_VERIFIED), req, 403)
               }

               const isPasswordValid = bcrypt.compareSync(password, existingUser.password)

               if (!isPasswordValid) {
                    return httpError(next, new Error(responseMessage.INVALID('password')), req, 400)
               }

               const accessToken = quicker.generateToken(
                    {
                         userId: existingUser.id
                    },
                    config.ACCESS_TOKEN_SECRET,
                    Number(config.ACCESS_TOKEN_EXPIRY)
               )
               const refreshToken = quicker.generateToken(
                    {
                         userId: existingUser.id
                    },
                    config.REFRESH_TOKEN_SECRET,
                    config.REFRESH_TOKEN_EXPIRY
               )
               await db.refreshToken.create({
                    data: {
                         userId: existingUser.id,
                         token: refreshToken,
                         expiresAt: new Date(Date.now() + Number(config.REFRESH_TOKEN_EXPIRY) * 1000)
                    }
               })
               // * Handle Cookie
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
                    id: existingUser.id,
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
                    // const rft = await RefreshToken.findOne({ token: refreshToken })
                    const rft = await db.refreshToken.findUnique({
                         where: {
                              token: refreshToken
                         }
                    })
                    if (rft) {
                         if (rft.expiresAt > Date.now()) {
                              const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
                              const decreptedJwt = quicker.verifyToken(refreshToken, config.REFRESH_TOKEN_SECRET)
                              // const user = await User.findById(decreptedJwt.userId)
                              const user = await db.user.findUnique({
                                   where: {
                                        id: decreptedJwt.userId
                                   }
                              })

                              if (user) {
                                   const accessToken = quicker.generateToken(
                                        {
                                             userId: user._id
                                        },
                                        config.ACCESS_TOKEN_SECRET,
                                        Number(config.ACCESS_TOKEN_EXPIRY)
                                   )
                                   res.cookie('accessToken', accessToken, {
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
                         await db.refreshToken.delete({
                              where: {
                                   token: refreshToken
                              }
                         })
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
                    // await RefreshToken.findOneAndDelete({ token: refreshToken })
                    await db.refreshToken.delete({
                         where: {
                              token: refreshToken
                         }
                    })
                    const DOMAIN = quicker.getDomainFromUrl(config.SERVER_URL)
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
                    id: authenticatedUser.id,
                    fullName: authenticatedUser.fullName,
                    role: authenticatedUser.role,
                    email: authenticatedUser.email
               }
               return httpResponse(req, res, 200, responseMessage.SUCCESS, data)
          } catch (error) {
               return httpError(next, error, req)
          }
     }
}

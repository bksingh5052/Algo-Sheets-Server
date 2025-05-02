import config from '../configs/config.js'
import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import quicker from '../utils/quicker.js'
import { db } from '../libs/pg-db.js'

export default {
     authenticate: async (req, res, next) => {
          try {
               const { accessToken } = req.cookies
               if (accessToken) {
                    const { userId } = quicker.verifyToken(accessToken, config.ACCESS_TOKEN_SECRET)
                    if (userId) {
                         const user = await db.user.findUnique({ where: { id: userId } })
                         if (user) {
                              req.authenticatedUser = user
                              return next()
                         }
                    }
               }

               return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
          } catch (error) {
               httpError(next, error, req, 500)
          }
     },
     authorize: (roles) => async (req, res, next) => {
          try {
               const { role } = req.authenticatedUser
               if (roles.includes(role)) {
                    next()
               } else {
                    return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
               }
          } catch (error) {
               httpError(next, error, req, 500)
          }
     }
}

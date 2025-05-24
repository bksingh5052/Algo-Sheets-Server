import mongoose from 'mongoose'
import config from '../configs/config.js'

const refreshTokenSchema = new mongoose.Schema(
     {
          token: {
               type: String,
               required: true
          },
          userId: {
               type: mongoose.Types.ObjectId,
               ref: 'User',
               required: true
          }
     },
     { timestamps: true }
)

refreshTokenSchema.index(
     {
          createdAt: -1
     },
     { expireAfterSeconds: config.REFRESH_TOKEN_EXPIRY }
)
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)
export { RefreshToken }

import mongoose from 'mongoose'
const { Schema } = mongoose

// Enums
const UserRole = {
     USER: 'USER',
     ADMIN: 'ADMIN'
}

// User Schema
const userSchema = new Schema(
     {
          fullName: {
               type: String,
               required: true
          },
          email: {
               type: String,
               required: true,
               unique: true,
               lowercase: true,
               trim: true
          },
          password: {
               type: String,
               required: true
          },
          image: {
               type: String,
               default: null
          },
          role: {
               type: String,
               enum: Object.values(UserRole),
               default: UserRole.USER
          },
          otp: {
               type: String,
               default: null
          },
          otpExpiresAt: {
               type: Date,
               default: null
          },
          isVerified: {
               type: Boolean,
               default: false
          },
          lastLoginAt: {
               type: Date,
               default: null
          }
     },
     {
          timestamps: true
     }
)

// Pre-save middleware to handle cascading deletes
userSchema.pre('remove', async function (next) {
     // Import models here to avoid circular dependencies
     const RefreshToken = mongoose.model('RefreshToken')
     const Problem = mongoose.model('Problem')
     const Submission = mongoose.model('Submission')
     const ProblemSolved = mongoose.model('ProblemSolved')

     // Delete all related documents when a user is deleted
     await RefreshToken.deleteMany({ userId: this._id })
     await Problem.deleteMany({ userId: this._id })
     await Submission.deleteMany({ userId: this._id })
     await ProblemSolved.deleteMany({ userId: this._id })
     next()
})

const User = mongoose.model('User', userSchema)

export { User, UserRole }

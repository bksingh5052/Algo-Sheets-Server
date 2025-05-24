import mongoose from 'mongoose'
const { Schema } = mongoose

// ProblemSolved Schema
const problemSolvedSchema = new Schema(
     {
          userId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true
          },
          problemId: {
               type: Schema.Types.ObjectId,
               ref: 'Problem',
               required: true
          }
     },
     {
          timestamps: true
     }
)

// Compound unique index to prevent duplicate entries
problemSolvedSchema.index({ userId: 1, problemId: 1 }, { unique: true })

const ProblemSolved = mongoose.model('ProblemSolved', problemSolvedSchema)

export { ProblemSolved }

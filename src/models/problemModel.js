import mongoose from 'mongoose'
const { Schema } = mongoose

// Enums
const Difficulty = {
     EASY: 'EASY',
     MEDIUM: 'MEDIUM',
     HARD: 'HARD'
}

// Problem Schema
const problemSchema = new Schema(
     {
          title: {
               type: String,
               required: true
          },
          description: {
               type: String,
               required: true
          },
          difficulty: {
               type: String,
               enum: Object.values(Difficulty),
               required: true
          },
          tags: [
               {
                    type: String
               }
          ],
          userId: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: true
          },
          examples: {
               type: Schema.Types.Mixed,
               required: true
          },
          constraints: {
               type: String,
               required: true
          },
          hints: {
               type: String,
               default: null
          },
          editorial: {
               type: String,
               default: null
          },
          testcases: {
               type: Schema.Types.Mixed,
               required: true
          },
          codeSnippets: {
               type: Schema.Types.Mixed,
               required: true
          },
          referenceSolutions: {
               type: Schema.Types.Mixed,
               required: true
          }
     },
     {
          timestamps: true
     }
)

// Indexes
problemSchema.index({ userId: 1 })
problemSchema.index({ tags: 1 })

// Pre-remove middleware to handle cascading deletes
problemSchema.pre('remove', async function (next) {
     // Import models here to avoid circular dependencies
     const Submission = mongoose.model('Submission')
     const ProblemSolved = mongoose.model('ProblemSolved')

     // Delete all related documents when a problem is deleted
     await Submission.deleteMany({ problemId: this._id })
     await ProblemSolved.deleteMany({ problemId: this._id })
     next()
})

const Problem = mongoose.model('Problem', problemSchema)

export { Problem, Difficulty }

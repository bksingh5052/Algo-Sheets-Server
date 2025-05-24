import mongoose from 'mongoose'
const { Schema } = mongoose

// TestCaseResult Schema (embedded in Submission)
const testCaseResultSchema = new Schema(
     {
          testCase: {
               type: Number,
               required: true
          },
          passed: {
               type: Boolean,
               required: true
          },
          stdout: {
               type: String,
               default: null
          },
          expected: {
               type: String,
               required: true
          },
          stderr: {
               type: String,
               default: null
          },
          compileOutput: {
               type: String,
               default: null
          },
          status: {
               type: String,
               required: true
          },
          memory: {
               type: String,
               default: null
          },
          time: {
               type: String,
               default: null
          }
     },
     {
          timestamps: true
     }
)

// Submission Schema
const submissionSchema = new Schema(
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
          },
          sourceCode: {
               type: Schema.Types.Mixed,
               required: true
          },
          language: {
               type: String,
               required: true
          },
          stdin: {
               type: String,
               default: null
          },
          stdout: {
               type: String,
               default: null
          },
          stderr: {
               type: String,
               default: null
          },
          compileOutput: {
               type: String,
               default: null
          },
          status: {
               type: String,
               required: true
          },
          memory: {
               type: String,
               default: null
          },
          time: {
               type: String,
               default: null
          },
          testCases: [testCaseResultSchema]
     },
     {
          timestamps: true
     }
)

// Indexes
submissionSchema.index({ userId: 1 })
submissionSchema.index({ problemId: 1 })
submissionSchema.index({ userId: 1, problemId: 1 })
submissionSchema.index({ status: 1 })
submissionSchema.index({ createdAt: -1 }) // For recent submissions

const Submission = mongoose.model('Submission', submissionSchema)

export { Submission }

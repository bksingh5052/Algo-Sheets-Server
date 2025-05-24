import responseMessage from '../constants/responseMessage.js'
import httpError from '../utils/httpError.js'
import httpResponse from '../utils/httpResponse.js'
import quicker from '../utils/quicker.js'
import { Problem, ProblemSolved } from '../models/index.js'

export default {
     createProblem: async (req, res, next) => {
          const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body
          const user = req.authenticatedUser

          try {
               // Validate reference solutions against test cases
               for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
                    const languageId = quicker.getJudge0LanguageId(language)

                    if (!languageId) {
                         return httpError(next, new Error(responseMessage.LANGUAGE_NOT_SUPPORTED(language)), req, 400)
                    }

                    // Prepare submissions for batch testing
                    const submissions = testcases.map(({ input, output }) => ({
                         source_code: solutionCode,
                         language_id: languageId,
                         stdin: input,
                         expected_output: output
                    }))

                    const submissionResults = await quicker.submitBatch(submissions)
                    const tokens = submissionResults.map((res) => res.token)
                    const results = await quicker.pollBatchResults(tokens)

                    // Check if all test cases pass
                    for (let i = 0; i < results.length; i++) {
                         const result = results[i]
                         if (result.status.id !== 3) {
                              // 3 = Accepted
                              return httpError(next, new Error(responseMessage.TESTCASE_FAILED(`${i + 1}`, `${language}`)), req, 400)
                         }
                    }
               }

               // Create new problem
               const newProblem = await Problem.create({
                    title,
                    description,
                    difficulty,
                    tags,
                    examples,
                    constraints,
                    testcases,
                    codeSnippets,
                    referenceSolutions,
                    userId: user._id
               })

               return httpResponse(req, res, 201, responseMessage.PROBLEM_CREATED, newProblem)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     getAllProblems: async (req, res, next) => {
          try {
               // Add pagination
               const page = parseInt(req.query.page) || 1
               const limit = parseInt(req.query.limit) || 20
               const skip = (page - 1) * limit

               // Add filters
               const filters = {}
               if (req.query.difficulty) {
                    filters.difficulty = req.query.difficulty
               }
               if (req.query.tags) {
                    const tagsArray = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags]
                    filters.tags = { $in: tagsArray }
               }

               // Get problems with pagination
               const problems = await Problem.find(filters)
                    .select('-testcases -referenceSolutions') // Exclude sensitive data
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()

               // Get total count for pagination
               const totalCount = await Problem.countDocuments(filters)

               // If user is authenticated, add solved status
               if (req.authenticatedUser) {
                    const solvedProblems = await ProblemSolved.find({
                         userId: req.authenticatedUser._id
                    }).select('problemId')

                    const solvedProblemIds = new Set(solvedProblems.map((sp) => sp.problemId.toString()))

                    problems.forEach((problem) => {
                         problem.isSolved = solvedProblemIds.has(problem._id.toString())
                    })
               }

               const response = {
                    problems,
                    pagination: {
                         currentPage: page,
                         totalPages: Math.ceil(totalCount / limit),
                         totalCount,
                         hasNextPage: page < Math.ceil(totalCount / limit),
                         hasPrevPage: page > 1
                    }
               }

               return httpResponse(req, res, 200, responseMessage.PROBLEMS_FETCHED, response)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     getProblemById: async (req, res, next) => {
          const { problemId } = req.params

          try {
               const problem = await Problem.findById(problemId).lean()

               if (!problem) {
                    return httpError(next, new Error(responseMessage.NOT_FOUND('Problem')), req, 404)
               }

               // Remove sensitive data unless user is admin or problem creator
               if (
                    !req.authenticatedUser ||
                    (req.authenticatedUser.role !== 'ADMIN' && req.authenticatedUser._id.toString() !== problem.userId.toString())
               ) {
                    delete problem.testcases
                    delete problem.referenceSolutions
               }

               // Check if user has solved this problem
               if (req.authenticatedUser) {
                    const solved = await ProblemSolved.findOne({
                         userId: req.authenticatedUser._id,
                         problemId: problem._id
                    })
                    problem.isSolved = !!solved
               }

               return httpResponse(req, res, 200, responseMessage.PROBLEMS_FETCHED, problem)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     deleteProblem: async (req, res, next) => {
          const { problemId } = req.params

          try {
               const problem = await Problem.findById(problemId)

               if (!problem) {
                    return httpError(next, new Error(responseMessage.NOT_FOUND('Problem')), req, 404)
               }

               // Check if user has permission to delete (admin or problem creator)
               if (req.authenticatedUser.role !== 'ADMIN' && problem.userId.toString() !== req.authenticatedUser._id.toString()) {
                    return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403)
               }

               // Delete problem and cascade delete will handle related documents
               await problem.remove()

               return httpResponse(req, res, 200, responseMessage.PROBLEM_DELETED, problem)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     updateProblem: async (req, res, next) => {
          const { problemId } = req.params
          const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body
          const user = req.authenticatedUser

          try {
               const problem = await Problem.findById(problemId)

               if (!problem) {
                    return httpError(next, new Error(responseMessage.NOT_FOUND('Problem')), req, 404)
               }

               if (problem.userId.toString() !== user._id.toString()) {
                    return httpError(next, new Error(responseMessage.UNAUTHORIZED), req, 403)
               }

               // Validate reference solutions if provided
               if (referenceSolutions && testcases) {
                    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
                         const languageId = quicker.getJudge0LanguageId(language)

                         if (!languageId) {
                              return httpError(next, new Error(responseMessage.LANGUAGE_NOT_SUPPORTED(language)), req, 400)
                         }

                         // Prepare submissions for batch testing
                         const submissions = testcases.map(({ input, output }) => ({
                              source_code: solutionCode,
                              language_id: languageId,
                              stdin: input,
                              expected_output: output
                         }))

                         const submissionResults = await quicker.submitBatch(submissions)
                         const tokens = submissionResults.map((res) => res.token)
                         const results = await quicker.pollBatchResults(tokens)

                         // Check if all test cases pass
                         for (let i = 0; i < results.length; i++) {
                              const result = results[i]
                              if (result.status.id !== 3) {
                                   // 3 = Accepted
                                   return httpError(next, new Error(responseMessage.TESTCASE_FAILED(`${i + 1}`, `${language}`)), req, 400)
                              }
                         }
                    }
               }

               // Update problem fields
               if (title) problem.title = title
               if (description) problem.description = description
               if (difficulty) problem.difficulty = difficulty
               if (tags) problem.tags = tags
               if (examples) problem.examples = examples
               if (constraints) problem.constraints = constraints
               if (testcases) problem.testcases = testcases
               if (codeSnippets) problem.codeSnippets = codeSnippets
               if (referenceSolutions) problem.referenceSolutions = referenceSolutions

               const updatedProblem = await problem.save()

               return httpResponse(req, res, 200, responseMessage.PROBLEM_UPDATED, updatedProblem)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     getAllProblemsSolvedByUser: async (req, res, next) => {
          try {
               const userId = req.params.userId || req.authenticatedUser._id
               const page = parseInt(req.query.page) || 1
               const limit = parseInt(req.query.limit) || 20
               const skip = (page - 1) * limit

               // Get solved problems with pagination
               const solvedProblems = await ProblemSolved.find({ userId })
                    .populate({
                         path: 'problemId',
                         select: 'title difficulty tags createdAt'
                    })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean()

               // Filter out any null problems (deleted problems)
               const validSolvedProblems = solvedProblems.filter((sp) => sp.problemId)

               // Get total count
               const totalCount = await ProblemSolved.countDocuments({ userId })

               const response = {
                    solvedProblems: validSolvedProblems.map((sp) => ({
                         ...sp.problemId,
                         solvedAt: sp.createdAt
                    })),
                    pagination: {
                         currentPage: page,
                         totalPages: Math.ceil(totalCount / limit),
                         totalCount,
                         hasNextPage: page < Math.ceil(totalCount / limit),
                         hasPrevPage: page > 1
                    }
               }

               return httpResponse(req, res, 200, responseMessage.PROBLEMS_SOLVED_FETCHED, response)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     },

     searchProblems: async (req, res, next) => {
          try {
               const { query } = req.query

               if (!query || query.trim().length < 2) {
                    return httpError(next, new Error(responseMessage.SEARCH_QUERY_TOO_SHORT), req, 400)
               }

               const searchRegex = new RegExp(query, 'i')

               const problems = await Problem.find({
                    $or: [{ title: searchRegex }, { description: searchRegex }, { tags: { $in: [searchRegex] } }]
               })
                    .select('-testcases -referenceSolutions')
                    .limit(20)
                    .lean()

               return httpResponse(req, res, 200, responseMessage.PROBLEMS_FETCHED, problems)
          } catch (error) {
               return httpError(next, error, req, 500)
          }
     }
}

import responseMessage from '../constants/responseMessage.js'
import { db } from '../libs/pg-db.js'
import httpError from '../utils/httpError.js'
import httpResponse from '../utils/httpResponse.js'
import qickuer from '../utils/quicker.js'

export default {
     createProblem: async (req, res, next) => {
          const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippets, referenceSolutions } = req.body
          const user = req.authenticatedUser

          // going to check the user role once again

          try {
               for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
                    const languageId = qickuer.getJudge0LanguageId(language)

                    if (!languageId) {
                         return httpError(next, responseMessage.LANGUAGE_NOT_SUPPORTED(language), req, 400)
                    }

                    //
                    const submissions = testcases.map(({ input, output }) => ({
                         source_code: solutionCode,
                         language_id: languageId,
                         stdin: input,
                         expected_output: output
                    }))

                    const submissionResults = await qickuer.submitBatch(submissions)

                    const tokens = submissionResults.map((res) => res.token)

                    const results = await qickuer.pollBatchResults(tokens)

                    for (let i = 0; i < results.length; i++) {
                         const result = results[i]
                         if (result.status.id !== 3) {
                              return httpError(next, responseMessage.TESTCASE_FAILED(`${i + 1}`, `${language}`), req, 400)
                         }
                    }
               }

               const newProblem = await db.problem.create({
                    data: {
                         title,
                         description,
                         difficulty,
                         tags,
                         examples,
                         constraints,
                         testcases,
                         codeSnippets,
                         referenceSolutions,
                         userId: user.id
                    }
               })
               return httpResponse(req, res, 201, responseMessage.PROBLEM_CREATED, newProblem)
          } catch (error) {
               httpError(next, error, req)
          }
     },
     getAllProblems: async (req, res, next) => {
          try {
               const problems = await db.problem.findMany()

               if (!problems) {
                    return httpError(next, responseMessage.NOT_FOUND('Problems'), req, 404)
               }

               return httpResponse(req, res, 200, responseMessage.PROBLEMS_FETCHED, problems)
          } catch (error) {
               return httpError(next, error, req)
          }
     },
     getProblemById: async (req, res, next) => {
          const { problemId } = req.params

          try {
               const problem = await db.problem.findUnique({
                    where: {
                         id: problemId
                    }
               })

               if (!problem) {
                    return httpError(next, responseMessage.NOT_FOUND('Problem'), req, 404)
               }

               return httpResponse(req, res, 200, responseMessage.PROBLEMS_FETCHED, problem)
          } catch (error) {
               return httpError(next, error, req)
          }
     },
     deleteProblem: async (req, res, next) => {
          const { problemId } = req.params

          try {
               const problem = await db.problem.findUnique({ where: { id: problemId } })

               if (!problem) {
                    return httpError(next, responseMessage.NOT_FOUND('Problem'), req, 404)
               }

               await db.problem.delete({ where: { id: problemId } })
               return httpResponse(req, res, 200, responseMessage.PROBLEM_DELETED, problem)
          } catch (error) {
               return httpError(next, error, req)
          }
     }
     // updateProblem: async (req, res, next) => {},
     // getAllProblemsSolvedByUser: async (req, res, next) => {}
}

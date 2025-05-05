import { Router } from 'express'
import problemController from '../controllers/problemController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = Router()

router
     .route('/')
     .get(problemController.getAllProblems)
     .post(authMiddleware.authenticate, authMiddleware.authorize(['ADMIN']), problemController.createProblem)

router
     .route('/:problemId')
     .get(problemController.getProblemById)
     .delete(authMiddleware.authenticate, authMiddleware.authorize(['ADMIN']), problemController.deleteProblem)
     .put(authMiddleware.authenticate, authMiddleware.authorize(['ADMIN']), problemController.updateProblem)

export default router

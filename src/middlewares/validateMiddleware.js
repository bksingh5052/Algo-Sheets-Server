import { validationResult } from 'express-validator'
import httpError from '../utils/httpError.js'

export default {
     validate: (req, res, next) => {
          const errors = validationResult(req)
          if (!errors.isEmpty()) {
               return httpError(next, new Error(errors.array()[0].msg), req, 400)
          }
          next()
     }
}

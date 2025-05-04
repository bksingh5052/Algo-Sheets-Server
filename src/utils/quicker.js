import os from 'os'
import config from '../configs/config.js'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default {
     getSystemHealth: () => {
          return {
               cpuUsage: os.loadavg(),
               totalmemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
               freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
          }
     },
     getApplictionHealth: () => {
          return {
               environment: config.ENV,
               upTime: `${process.uptime().toFixed(2)} Seconds`,
               memoryusage: {
                    heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                    heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
               }
          }
     },
     generateToken: (payload, secret, expiry) => {
          return jwt.sign(payload, secret, {
               expiresIn: expiry
          })
     },
     verifyToken: (token, secret) => {
          return jwt.verify(token, secret)
     },
     getDomainFromUrl: (url) => {
          try {
               const parsedUrl = new URL(url)
               return parsedUrl.hostname
          } catch (err) {
               throw err
          }
     },
     getJudge0LanguageId: (language) => {
          const languageMap = {
               PYTHON: 71,
               JAVA: 62,
               JAVASCRIPT: 63
          }

          return languageMap[language.toUpperCase()]
     },
     pollBatchResults: async (tokens) => {
          while (true) {
               const { data } = await axios.get(`${config.JUDGE0_API_URL}/submissions/batch`, {
                    params: {
                         tokens: tokens.join(','),
                         base64_encoded: false
                    }
               })

               const results = data.submissions

               const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2)

               if (isAllDone) return results
               await sleep(1000)
          }
     },
     submitBatch: async (submissions) => {
          const { data } = await axios.post(`${config.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
               submissions
          })

          // eslint-disable-next-line no-console
          console.dir('Submission Results: ', data)

          return data // [{token} , {token} , {token}]
     }
}

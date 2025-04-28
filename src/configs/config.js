import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

const config = {
     ENV: process.env.ENV,
     PORT: process.env.PORT,
     SERVER_URL: process.env.SERVER_URL,
     DATABASE_URL: process.env.DATABASE_URL,
     CLIENT_URL: process.env.CLIENT_URL
}

function checkRequiredEnvVars(requiredEnvVars) {
     const missingVars = requiredEnvVars.filter((key) => !process.env[key])
     if (missingVars.length > 0) {
          throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
     }
}

checkRequiredEnvVars(Object.keys(config))

export default config

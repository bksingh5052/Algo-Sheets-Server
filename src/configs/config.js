import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

const config = {
     ENV: process.env.ENV,
     PORT: process.env.PORT,
     SERVER_URL: process.env.SERVER_URL,
     DATABASE_URL: process.env.DATABASE_URL,
     CLIENT_URL: process.env.CLIENT_URL,
     COMPANY_NAME: process.env.COMPANY_NAME,
     COMPANY_SUPPORT_EMAIL: process.env.COMPANY_SUPPORT_EMAIL,
     COMPANY_LOGO_URL: process.env.COMPANY_LOGO_URL,
     COMPANY_WEBSITE_URL: process.env.COMPANY_WEBSITE_URL,
     PRIMARY_COLOR: process.env.PRIMARY_COLOR,
     SECONDARY_COLOR: process.env.SECONDARY_COLOR,

     // Resend
     RESEND_API_KEY: process.env.RESEND_API_KEY,
     RESEND_MAIL_FROM: process.env.RESEND_MAIL_FROM,

     // token
     ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
     REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
     ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
     REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

     JUDGE0_API_URL: process.env.JUDGE0_API_URL
}

function checkRequiredEnvVars(requiredEnvVars) {
     const missingVars = requiredEnvVars.filter((key) => !process.env[key])
     if (missingVars.length > 0) {
          throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
     }
}

checkRequiredEnvVars(Object.keys(config))

export default config

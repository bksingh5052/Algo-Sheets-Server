import { Resend } from 'resend'
import config from '../configs/config.js'

const resend = new Resend(config.RESEND_API_KEY)

const sendMail = async (to, subject, html) => {
     const res = await resend.emails.send({
          from: config.RESEND_MAIL_FROM,
          to: to,
          subject: subject,
          html
     })
     return res
}

export { sendMail }

import config from '../configs/config.js'
function emailVerification({
     otp,
     expiryMinutes = 10,
     companyName = config.COMPANY_NAME,
     companyLogo = config.COMPANY_LOGO_URL,
     primaryColor = config.PRIMARY_COLOR,
     secondaryColor = config.SECONDARY_COLOR,
     contactEmail = config.COMPANY_SUPPORT_EMAIL,
     websiteUrl = config.COMPANY_WEBSITE_URL
}) {
     return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f5; color: #333333;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-spacing: 0;">
        <!-- Header -->
        <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: ${primaryColor}; border-radius: 8px 8px 0 0;">
                ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-height: 60px; margin-bottom: 15px;">` : ''}
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${companyName}</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 40px 40px 20px;">
                <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4b5563;">Hi there!,</p>
                <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4b5563;">Thank you for registering with us. Please use the verification code below to complete your account setup:</p>
                
                <!-- OTP Code Box -->
                <div style="margin: 30px 0; padding: 20px; text-align: center; background-color: #f3f4f6; border-radius: 8px;">
                    <h2 style="margin: 0 0 10px; font-size: 18px; color: #4b5563; font-weight: 600;">Your Verification Code</h2>
                    <div style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: ${primaryColor};">${otp}</div>
                    <p style="margin: 10px 0 0; font-size: 14px; color: #6b7280;">This code will expire in <strong>${expiryMinutes} minutes</strong></p>
                </div>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 24px; color: #4b5563;">If you didn't request this code, please ignore this email or contact our support team if you have any concerns.</p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${websiteUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 16px;">Visit Our Website</a>
                </div>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="padding: 20px 40px 40px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px;">If you need any assistance, please email us at <a href="mailto:${contactEmail}" style="color: ${secondaryColor}; text-decoration: none;">${contactEmail}</a></p>
                <p style="margin: 0 0 10px;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
                <div style="margin-top: 20px;">
                    <a href="${websiteUrl}/privacy" style="color: ${secondaryColor}; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                    <a href="${websiteUrl}/terms" style="color: ${secondaryColor}; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
}

export default emailVerification

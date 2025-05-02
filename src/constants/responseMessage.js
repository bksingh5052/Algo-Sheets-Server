export default {
     SUCCESS: 'The operation has been successful',
     SOMETHING_WENT_WRONG: 'Something went wrong',
     NOT_FOUND: (entity = 'Resource') => `${entity} not found`,
     USER_NOT_FOUND: (field) => `User not found with this ${field}`,
     TOO_MANY_REQUESTS: 'Too many requests. Please try again after some time.',
     UNAUTHORIZED: 'You are not authorized to access this resource',
     USER_ALREADY_EXISTS_WITH: (field) => `User already exists with this ${field}`,
     USER_REGISTERED: 'User registered successfully',
     EMAIL_NOT_VERIFIED: 'Email not verified, please verify your email',
     INVALID_INPUT: 'Invalid input data',
     INVALID: (field) => `Invalid ${field}`,
     MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters long`,
     MAX_LENGTH: (field, length) => `${field} must be at most ${length} characters long`,
     OTP_SENT: 'OTP sent successfully. Please verify your email.',
     OTP_ALREADY_SENT: 'OTP already sent. Please check your email.',
     OTP_EXPIRED: 'OTP expired. Please request a new one.',
     OTP_VERIFIED: 'OTP verified successfully.'
}

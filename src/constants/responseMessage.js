export default {
     // General
     SUCCESS: 'The operation has been successful',
     SOMETHING_WENT_WRONG: 'Something went wrong',
     NOT_FOUND: (entity = 'Resource') => `${entity} not found`,
     TOO_MANY_REQUESTS: 'Too many requests. Please try again after some time.',
     UNAUTHORIZED: 'You are not authorized to access this resource',
     INVALID_INPUT: 'Invalid input data',
     INVALID: (field) => `Invalid ${field}`,
     MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters long`,
     MAX_LENGTH: (field, length) => `${field} must be at most ${length} characters long`,

     // User/Auth
     USER_NOT_FOUND: (field) => `User not found with this ${field}`,
     USER_ALREADY_EXISTS_WITH: (field) => `User already exists with this ${field}`,
     USER_REGISTERED: 'User registered successfully',
     EMAIL_NOT_VERIFIED: 'Email not verified, please verify your email',

     // OTP
     OTP_SENT: 'OTP sent successfully. Please verify your email.',
     OTP_ALREADY_SENT: 'OTP already sent. Please check your email.',
     OTP_EXPIRED: 'OTP expired. Please request a new one.',
     OTP_VERIFIED: 'OTP verified successfully.',

     // Problems
     PROBLEM_CREATED: 'Problem created successfully.',
     PROBLEMS_FETCHED: 'Problems fetched successfully.',
     PROBLEM_UPDATED: 'Problem updated successfully.',
     PROBLEM_DELETED: 'Problem deleted successfully.',
     LANGUAGE_NOT_SUPPORTED: (language) => `Language ${language} is not supported`,
     TESTCASE_FAILED: (testcaseId, testcaseLanguage) => `Testcase ${testcaseId} failed for language ${testcaseLanguage}`,

     // Submissions
     CODE_EXECUTED: 'Code executed successfully.',
     CODE_RUN_SUCCESS: 'Code run completed successfully.',
     INVALID_TEST_CASES: 'Invalid or missing test cases.',
     SUBMISSION_FETCHED: 'Submission fetched successfully.',
     SUBMISSIONS_FETCHED: 'Submissions fetched successfully.',
     LEADERBOARD_FETCHED: 'Leaderboard fetched successfully.',

     // Additional messages for completeness
     SEARCH_QUERY_TOO_SHORT: 'Search query must be at least 2 characters long.',
     PROBLEMS_SOLVED_FETCHED: 'Solved problems fetched successfully.'
}

# Algosheets

**Algosheets** is a comprehensive platform for developers to practice **Data Structures and Algorithms (DSA)** in a structured, competitive, and productive way. It combines a robust backend with features like problem-solving environments, performance tracking, and real-time rankings.

---

## 🚀 Features

- 🧠 **DSA Question Bank** categorized **topic-wise** and **company-wise**
- 💻 In-browser code editor with **execution and test case support** (like LeetCode)
- 📊 **User performance tracking** across sessions
- 🏆 **Leaderboard and ranking system** to compare performance with others
- 🌐 REST API built with **Express.js**
- 🍃 **Mongoose** for MongoDB integration (e.g., logging with Winston)
- 🔐 Secure authentication using **JWT** and **bcryptjs**
- 🛡️ Security headers via **Helmet**, CORS protection
- 📦 Centralized environment config using **dotenv-flow**
- ✅ Code quality enforced via **ESLint**, **Prettier**, and **Husky**
- 📩 OTP generation and email sending using **resend**
- 📈 Rate limiting using **rate-limiter-flexible**

---

## 📁 Project Structure

```
algosheets/
│
├── src/
│   └── server.js              # Entry point of the application
│
│
├── .env.development           # Development-specific envs
├── .env.production            # Production-specific envs
├── package.json               # NPM config and scripts
├── README.md                  # Project documentation
```

---

## 🧰 Scripts

| Command                     | Description                                  |
|----------------------------|----------------------------------------------|
| `npm run dev`              | Start server in development with nodemon     |
| `npm start`                | Start server in production                   |
| `npm run lint`             | Run ESLint to check code style               |
| `npm run lint:fix`         | Auto-fix linting issues                      |
| `npm run formate:check`    | Check code formatting with Prettier          |
| `npm run formate:fix`      | Format code with Prettier                    |
| `npm run prepare`          | Prepare Git hooks using Husky                |

---

## 🔐 Environment Setup

You’ll need two `.env` files to manage environments:

- `.env.development`
- `.env.production`

Each file should define variables like:

```env
ENV=development
PORT=3000
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:3001

DATABASE_URL=mongodb://localhost:27017/algosheets

COMPANY_NAME=Algo Sheets
COMPANY_SUPPORT_EMAIL=suppot@algosheets.com
COMPANY_LOGO_URL=logo-url
COMPANY_WEBSITE_URL=website-url
PRIMARY_COLOR=primary-color-code
SECONDARY_COLOR=secondary-color-code
RESEND_API_KEY=resend-api-key
RESEND_MAIL_FROM=resend-from-email

# tokens
ACCESS_TOKEN_SECRET=access-token-here
REFRESH_TOKEN_SECRET=refresh-token-here
ACCESS_TOKEN_EXPIRY=3600  #1hour
REFRESH_TOKEN_EXPIRY=2592000  # 30days

JUDGE0_API_URL=http://localhost:2358
```

Use [dotenv-flow](https://www.npmjs.com/package/dotenv-flow) to automatically load the correct file based on `NODE_ENV`.


---

## 🔄 Git Hooks

This project uses **Husky** and **lint-staged**:

- Automatically runs `eslint --fix` and `prettier --write` on staged `.js` files before committing.
- Ensures every commit follows a consistent style and passes linting checks.

To enable hooks:

```bash
npm run prepare
```

---

## 📦 Dependencies

### Production

- `express`, `cors`, `helmet`, `jsonwebtoken`, `bcryptjs`
- `mongoose`, `cookie-parser`
- `rate-limiter-flexible`, `resend`, `otp-generator`
- `dotenv-flow`, `axios`, `winston`, `winston-mongodb`

### Dev Dependencies

- `eslint`, `prettier`, `husky`, `lint-staged`
- `@commitlint/cli`, `@commitlint/config-conventional`
- `nodemon`, `cross-env`, `@eslint/js`, `eslint-config-prettier`, `globals`

---



## 📃 License

This project is licensed under the **ISC License**.

---

## 👤 Author

Created and maintained by [Bablu Kumar Singh](https://github.com/bksingh5052). Contributions welcome!
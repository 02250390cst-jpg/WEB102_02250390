# Lab Tutorial: Token-Based Authentication in Node.js using JWT

## Overview

This lab walks through building a token-based authentication system in Node.js from scratch. By the end, you will have a working Register, Login, and Protected Route API using JWT (JSON Web Tokens) and bcrypt password hashing, tested with Thunder Client or Postman.

---

## What You Will Learn

- What token-based authentication is and why it's preferred over sessions
- How JWTs are structured and how they work
- How to hash passwords securely with bcrypt
- How to protect routes using custom middleware
- How to test APIs using Thunder Client or Postman

---

## Prerequisites

- Basic JavaScript knowledge
- Node.js installed on your machine
- VS Code with the Thunder Client extension (or Postman)

---

## Project Structure

```
node-token-auth/
├── server.js                 # Entry point — sets up Express and routes
├── .env                      # Secret keys and config (never commit this)
├── routes/
│   ├── auth.js               # Register and login endpoints
│   └── protected.js          # Protected route example
└── middleware/
    └── verifyToken.js        # JWT verification middleware
```

---

## Setup

### Step 1: Create the Project

```bash
mkdir node-token-auth
cd node-token-auth
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express jsonwebtoken bcryptjs dotenv
```

| Package | Purpose |
|---------|---------|
| `express` | HTTP server and routing |
| `jsonwebtoken` | Sign and verify JWT tokens |
| `bcryptjs` | Hash passwords securely |
| `dotenv` | Load environment variables from `.env` |

### Step 3: Create the Folder Structure

```bash
mkdir routes middleware
```

Then create the files listed in the project structure above.

---

## Configuration

### `.env`

```env
JWT_SECRET=supersecretkey123
PORT=3000
```

> Never commit `.env` to GitHub. Add it to `.gitignore`.

---

## How It Works

### Authentication Flow

```
Client                              Server
  │                                   │
  │  POST /auth/register              │
  │ ─────────────────────────────►    │  Hash password, save user
  │  { message: "Registered!" }       │
  │ ◄─────────────────────────────    │
  │                                   │
  │  POST /auth/login                 │
  │ ─────────────────────────────►    │  Verify password hash
  │  { token: "eyJhbG..." }           │  Sign and return JWT
  │ ◄─────────────────────────────    │
  │                                   │
  │  GET /profile                     │
  │  Authorization: Bearer eyJhbG...  │
  │ ─────────────────────────────►    │  Verify token signature
  │  { user: { id, email } }          │  Decode and return data
  │ ◄─────────────────────────────    │
```

### JWT Structure

A JWT has three parts separated by dots:

```
HEADER.PAYLOAD.SIGNATURE
```

| Part | Contains |
|------|---------|
| Header | Signing algorithm (e.g., HS256) |
| Payload | User data (id, email, expiry) |
| Signature | Proof the token hasn't been tampered with |

The payload is **base64 encoded, not encrypted** — anyone can read it. Never put passwords or sensitive data in a JWT.

---

## Key Files Explained

### `middleware/verifyToken.js`

Reads the `Authorization: Bearer <token>` header, verifies the token against `JWT_SECRET`, and attaches the decoded user to `req.user`. If the token is missing or invalid, it stops the request with a `401` or `403` error before it ever reaches the route handler.

### `routes/auth.js`

- `POST /auth/register` — Validates input, checks for duplicate emails, hashes the password with bcrypt (salt rounds: 10), and saves the user to an in-memory array.
- `POST /auth/login` — Finds the user by email, compares the provided password against the stored hash using `bcrypt.compare`, and signs a JWT with a 1-day expiry on success.

### `routes/protected.js`

- `GET /profile` — Applies `verifyToken` middleware. If the token is valid, returns the decoded user data from `req.user`.

---

## Running the Server

```bash
node server.js
```

Expected output:

```
Server running on http://localhost:3000

Available endpoints:
  POST /auth/register  - Create account
  POST /auth/login     - Login and get token
  GET  /profile        - Protected route (needs token)
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive a JWT |
| GET | `/profile` | Yes (Bearer token) | Access a protected route |

---

## Testing with Thunder Client

### 1. Register

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/register`
- **Body (JSON):**
  ```json
  { "email": "student@test.com", "password": "123456" }
  ```
- **Expected:** `201` — `{ "message": "User registered successfully!" }`

### 2. Login

- **Method:** `POST`
- **URL:** `http://localhost:3000/auth/login`
- **Body (JSON):**
  ```json
  { "email": "student@test.com", "password": "123456" }
  ```
- **Expected:** `200` — `{ "message": "Login successful!", "token": "eyJhbG..." }`

  > Copy the token — you'll need it for the next step.

### 3. Access Protected Route (with token)

- **Method:** `GET`
- **URL:** `http://localhost:3000/profile`
- **Header:** `Authorization: Bearer <your token>`
- **Expected:** `200` — returns user object with `id`, `email`, `iat`, `exp`

### 4. Access Without Token

- **Method:** `GET`
- **URL:** `http://localhost:3000/profile`
- **Expected:** `401` — `{ "message": "Access denied. No token provided." }`

### 5. Access With a Fake Token

- **Method:** `GET`
- **URL:** `http://localhost:3000/profile`
- **Header:** `Authorization: Bearer thisisafaketoken`
- **Expected:** `403` — `{ "message": "Invalid or expired token." }`

---

## HTTP Status Code Reference

| Status | Meaning | When It Occurs |
|--------|---------|----------------|
| `201` | Created | User registered successfully |
| `200` | OK | Login or profile access succeeded |
| `400` | Bad Request | Missing email or password |
| `401` | Unauthorized | Wrong credentials or no token |
| `403` | Forbidden | Token is invalid or expired |
| `409` | Conflict | Email already registered |

---

## Homework

### Task

1. Add a `name` field to the register endpoint — accept `name` in the request body and store it alongside `email` and `password`.
2. Add a `GET /users` route (no token required) that returns all registered users showing only `id`, `email`, and `name` — not their password hashes.
3. Test all changes in Thunder Client and take a screenshot of each working response.

### Submit

- Updated code files
- Screenshots of the 5 original tests still passing
- Screenshots of the 2 new tests (register with name, GET /users)

---

## Useful Resource

To inspect your JWT payload, paste any token at [https://jwt.io](https://jwt.io). You will see the decoded header, payload, and signature — a good reminder that the payload is readable by anyone.

---

## Resources

- [jsonwebtoken npm package](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs npm package](https://www.npmjs.com/package/bcryptjs)
- [JWT.io — Debugger and Docs](https://jwt.io)
- [Express.js Documentation](https://expressjs.com)
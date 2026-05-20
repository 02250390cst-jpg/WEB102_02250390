# Practical 4: Connecting TikTok to PostgreSQL with Prisma ORM

## Overview

This practical walks through migrating a TikTok clone application from in-memory data storage to a persistent PostgreSQL database using Prisma ORM. It also covers implementing JWT-based authentication with bcrypt password hashing.

---

## Objectives

- Set up a PostgreSQL database for the TikTok clone application
- Configure Prisma ORM to interact with the database
- Migrate from in-memory data models to persistent database storage
- Implement authentication with password encryption
- Update RESTful API endpoints to use the database

---

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Basic knowledge of Express.js and REST APIs
- Completion of previous practicals (TikTok server with in-memory data)

---

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   ├── migrations/          # Auto-generated migration files
│   └── seed.js              # Database seeding script
├── src/
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── videoController.js
│   │   └── commentController.js
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── lib/
│   │   └── prisma.js        # Prisma client instance
│   └── app.js
├── .env                     # Environment variables
└── package.json
```

---

## Setup Instructions

### Part 1: PostgreSQL Database Setup

1. Access the PostgreSQL command line:
   ```bash
   sudo -u postgres psql
   ```

2. Create the database and user:
   ```sql
   CREATE DATABASE tiktok_db;
   CREATE USER tiktok_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE tiktok_db TO tiktok_user;
   \q
   ```

### Part 2: Install Dependencies

Navigate to your server directory and install the required packages:

```bash
cd server
npm install @prisma/client bcrypt jsonwebtoken
npm install prisma --save-dev
```

### Part 3: Initialize and Configure Prisma

1. Initialize Prisma:
   ```bash
   npx prisma init
   ```

2. Update the `.env` file with your database connection string:
   ```env
   DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"
   JWT_SECRET=yourverylongandsecurerandomsecret
   JWT_EXPIRE=30d
   PORT=5000
   NODE_ENV=development
   ```

3. Define your schema in `prisma/schema.prisma` to match the TikTok data model (users, videos, comments, likes, follows).

### Part 4: Run Migrations

```bash
npx prisma migrate dev --name init
```

This will create the migration files, apply them to the database, and generate the Prisma Client.

### Part 5: Create Core Files

**`src/lib/prisma.js`** — Prisma client singleton:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
```

**`src/middleware/auth.js`** — JWT authentication middleware that:
- Reads the Bearer token from the `Authorization` header
- Verifies the token using `JWT_SECRET`
- Fetches the user from the database and attaches them to `req.user`

### Part 6: Update Controllers

Update the following controllers to use Prisma instead of in-memory arrays:

- `userController.js` — Registration, login (bcrypt + JWT), and profile management
- `videoController.js` — CRUD with relational queries, transactions, and aggregations
- `commentController.js` — Comment creation and retrieval with relationships

See the full source code at: [https://github.com/syangche/TikTok_Server.git](https://github.com/syangche/TikTok_Server.git)

---

## Seeding the Database

A seed script is provided to populate the database with test data.

1. Ensure bcrypt is installed:
   ```bash
   npm install bcrypt
   ```

2. Add the seed script to `package.json`:
   ```json
   "scripts": {
     "dev": "nodemon src/index.js",
     "start": "node src/index.js",
     "seed": "node prisma/seed.js"
   }
   ```

3. Run the seed script:
   ```bash
   npm run seed
   ```

The seed will create:
- 10 users
- 50 videos (5 per user)
- 200 comments
- 300 video likes
- 150 comment likes
- 40 follow relationships

---

## Running the Server

```bash
npm run dev
```

---

## Testing with Postman

Use Postman to test the API endpoints. Refer to the Postman guide for detailed instructions:
[Postman Testing Guide](https://docs.google.com/document/d/1OlnYRUqXZYWUl5AksoGOQYFqaT71KYJ6wiDU03y40Fk/edit?usp=sharing)

Key tests to perform:
- Register a new user (`POST /api/users/register`)
- Login and receive a JWT token (`POST /api/users/login`)
- Use the token to access protected routes (e.g., `POST /api/videos`)

---

## Key Concepts

**Database Schema Design** — Tables represent entities (users, videos, comments), connected via relationships (one-to-many, many-to-many) with foreign keys maintaining data integrity.

**ORM (Prisma)** — Maps database tables to JavaScript objects, simplifying queries, reducing boilerplate SQL, and handling migrations.

**Authentication & Security** — Passwords are hashed with bcrypt before storage. JWT tokens are issued on login and verified by middleware on protected routes.

**Prisma Features Used** — Model definitions, schema migrations, relational queries, and transactions for multi-table operations.

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Authentication](https://jwt.io/introduction)
- [GitHub Repository](https://github.com/syangche/TikTok_Server.git)
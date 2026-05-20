# Reflection: Practical 4 – Connecting TikTok to PostgreSQL with Prisma ORM

## What I Learned

This practical marked a significant step forward in building a production-ready backend application. Moving from in-memory data storage to a real PostgreSQL database made the application genuinely persistent — data no longer disappears when the server restarts, which is fundamental to any real-world system.

Setting up Prisma ORM was one of the most valuable parts of this exercise. Rather than writing raw SQL queries, Prisma lets you define your entire data model in a single `schema.prisma` file and then interact with the database using clean, type-safe JavaScript. Running `npx prisma migrate dev` to automatically generate and apply migrations felt like a big quality-of-life improvement over managing SQL files manually.

Implementing JWT authentication was another important takeaway. The flow — hashing passwords with bcrypt on registration, verifying credentials on login, issuing a signed token, and then validating that token in middleware for protected routes — is the standard pattern used across most modern APIs. Understanding each step of this flow, rather than just copying boilerplate, made it much clearer why each piece exists.

---

## Challenges Faced

The initial database and user setup in PostgreSQL required careful attention to privileges. A mistake here (wrong password, missing grants) would cause cryptic Prisma connection errors later, so it was important to get the `DATABASE_URL` in `.env` exactly right.

Updating the controllers was also more involved than expected. Queries that previously just filtered a JavaScript array now needed to use Prisma's `findMany`, `findUnique`, `create`, `update`, and `delete` methods, sometimes with nested `include` blocks for related data. Getting comfortable with Prisma's query syntax — especially for relational data and transactions — took some practice.

Another subtle challenge was understanding why the Prisma client should be a singleton (exported from `src/lib/prisma.js`) rather than instantiated fresh in every file. Creating multiple `PrismaClient` instances can exhaust database connections, so the singleton pattern is important even if it isn't immediately obvious.

---

## What Could Be Improved

In a more complete implementation, it would be worth adding:

- Input validation (e.g., with a library like `zod` or `express-validator`) before data reaches the database, to return meaningful error messages rather than raw database errors
- Pagination on list endpoints like video feeds and comment lists, since returning every record at once won't scale
- Refresh token support alongside the current short-lived JWT, so users aren't logged out unexpectedly
- A `.env.example` file in the repository so collaborators know which environment variables are needed without exposing actual secrets

---

## Overall Takeaway

This practical connected several important concepts — databases, ORMs, migrations, authentication, and middleware — into a single working system. Each piece builds on the last, and seeing them work together end-to-end gave a much clearer picture of how real backend applications are structured. The seed script was also a useful addition, as having realistic test data made it much easier to verify that the API was behaving correctly during testing.
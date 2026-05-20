# Reflection – TikTok REST API Design and Implementation

## Overview

This practical involved building a RESTful API backend for a TikTok-style platform using Node.js and Express. The API covers three core resources — Videos, Users, and Comments — with sub-resources for likes and followers. Below is a reflection on the experience, what was learned, and what could be improved.

---

## What I Learned

### Designing for Social Features

Compared to a standard CRUD API, a social media platform introduces more complex relationships. Features like liking a video, following a user, and commenting all require endpoints that operate on sub-resources rather than top-level ones. Working through the endpoint design table at the start made it clear that REST isn't just about GET/POST/PUT/DELETE on a single resource — it's about modeling relationships between resources in a consistent, predictable way.

The pattern of `/api/resource/:id/sub-resource` (e.g. `/api/videos/:id/likes`, `/api/users/:id/followers`) was new to apply in practice and helped me understand how nested resources work in REST design.

### Cleaner Project Structure

This practical used a `src/` folder with separate `controllers/`, `routes/`, `models/`, `middleware/`, and `utils/` directories, unlike the flatter structure from the previous practical. Separating `app.js` (Express configuration) from `index.js` (server startup) is a better pattern because it makes the app easier to test — you can import `app.js` without actually starting a server.

### Cascade Deletes in Business Logic

One detail that stood out was the cascade logic in the delete controllers. When a user is deleted, their videos and comments are also removed. When a video is deleted, its comments are cleaned up too. In a real database this would be handled by foreign key constraints, but implementing it manually in the controller made the underlying data relationship explicit and easier to reason about.

### Duplicate and Self-Reference Checks

The user controller included logic to prevent a user from following themselves, and to check for already-existing follow relationships before adding a new one. These kinds of business rule validations — returning `409 Conflict` for duplicates and `400 Bad Request` for self-follows — are easy to overlook but essential for data integrity and a good API consumer experience.

### Content-Type Enforcement

The `app.js` middleware checks the `Accept` header on every request and returns a `406 Not Acceptable` response if the client doesn't accept `application/json`. This was a small but important detail — it makes the API's contract explicit and prevents clients from receiving unexpected response formats.

---

## Challenges

### Managing Bidirectional Relationships

The follow/unfollow logic was the most complex part of the practical. Following a user requires updating two records simultaneously — adding to the target's `followers` array and to the requester's `following` array. Unfollowing requires finding the correct index in both arrays and splicing them out. Without a database transaction, there's a risk of partial updates if something fails midway. This highlighted a real limitation of in-memory storage for relational data.

### The Comment Controller Was Left as a Task

The practical provided full implementations for the video and user controllers but left the comment controller to be written independently. This was a useful exercise — it required applying the same patterns (get all, get by ID, create, update, delete, like, unlike) without a template to follow. The main challenge was making sure the comment likes logic mirrored the video likes logic correctly.

### No Persistent Storage

Like the previous practical, all data lives in memory. Any time the server restarts, everything is lost. While this is fine for learning the API layer, it means the application can't be meaningfully deployed or tested across sessions. Moving to a database would be the obvious next step.

---

## Comparison to the Previous Practical

| Area | Instagram API (Practical 1) | TikTok API (Practical 2) |
|------|----------------------------|--------------------------|
| Project structure | Flat (`controllers/`, `routes/` at root) | Src-based (`src/controllers/`, etc.) |
| Error handling | Centralised middleware + custom ErrorResponse class | Inline `res.status().json()` per controller |
| Content negotiation | JSON and XML via formatResponse middleware | JSON only, enforced via Accept header check |
| Data relationships | Basic CRUD with pagination | Social graph (likes, follows) with duplicate/self-reference checks |
| Auth simulation | `X-User-Id` header | No auth simulation |

The TikTok API felt more realistic as a social platform because of the like and follower logic, but the Instagram API had stronger infrastructure patterns (centralised error handling, async wrapper, custom error class). Combining both approaches — clean middleware architecture with realistic social data relationships — would make for a more complete production-ready API.

---

## What I Would Do Differently

- **Add a database** — MongoDB with Mongoose would map naturally to this data model and eliminate the in-memory reset problem.
- **Add authentication** — JWT-based auth would let the API enforce that users can only edit or delete their own content, rather than trusting any caller.
- **Centralise error handling** — Adopting the `ErrorResponse` class pattern from Practical 1 would make the codebase more consistent and reduce repetition across controllers.
- **Add pagination** — The `getAllVideos` and `getAllUsers` endpoints return everything at once. Pagination would be essential at any real scale.
- **Write the comment controller more robustly** — The task-based comment controller is a good starting point, but it would benefit from the same level of validation and edge-case handling as the video and user controllers.

---

## Conclusion

This practical reinforced RESTful API design principles while introducing more realistic complexity through social features. The most valuable lessons were around modeling sub-resources, handling bidirectional relationships, and enforcing business rules at the controller level. These patterns — predictable URIs, proper status codes, consistent validation — are directly applicable to any backend project, regardless of the platform being built.
# TikTok REST API

A RESTful API backend built with Node.js and Express for a TikTok-style platform. Designed to communicate with a Next.js frontend, this API handles videos, users, and comments with full CRUD support and social features like likes and followers.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Testing the API](#testing-the-api)

---

## Overview

This API supports three core resources — **Videos**, **Users**, and **Comments** — with additional sub-resources for likes and followers. It uses in-memory data storage (no database required) and follows RESTful conventions throughout.

---

## Project Structure

```
server/
├── .env
├── package.json
└── src/
    ├── app.js                        # Express app setup and middleware
    ├── index.js                      # Server entry point
    ├── controllers/
    │   ├── videoController.js        # Video CRUD + likes/comments logic
    │   ├── userController.js         # User CRUD + followers logic
    │   └── commentController.js      # Comment CRUD + likes logic
    ├── routes/
    │   ├── videos.js                 # Video routes
    │   ├── users.js                  # User routes
    │   └── comments.js               # Comment routes
    ├── models/
    │   └── index.js                  # In-memory data store
    ├── middleware/                   # Custom middleware (future use)
    └── utils/                        # Utility functions (future use)
```

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate into the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install express cors morgan body-parser dotenv
   npm install --save-dev nodemon
   ```

3. Create a `.env` file in the root:
   ```
   PORT=3000
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run at `http://localhost:3000`.

---

## API Endpoints

### Videos

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | /api/videos                | Get all videos           |
| POST   | /api/videos                | Create a new video       |
| GET    | /api/videos/:id            | Get video by ID          |
| PUT    | /api/videos/:id            | Update a video           |
| DELETE | /api/videos/:id            | Delete a video           |
| GET    | /api/videos/:id/comments   | Get comments on a video  |
| GET    | /api/videos/:id/likes      | Get likes on a video     |
| POST   | /api/videos/:id/likes      | Like a video             |
| DELETE | /api/videos/:id/likes      | Unlike a video           |

### Users

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/users                  | Get all users            |
| POST   | /api/users                  | Create a new user        |
| GET    | /api/users/:id              | Get user by ID           |
| PUT    | /api/users/:id              | Update a user            |
| DELETE | /api/users/:id              | Delete a user            |
| GET    | /api/users/:id/videos       | Get a user's videos      |
| GET    | /api/users/:id/followers    | Get a user's followers   |
| POST   | /api/users/:id/followers    | Follow a user            |
| DELETE | /api/users/:id/followers    | Unfollow a user          |

### Comments

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/comments               | Get all comments         |
| POST   | /api/comments               | Create a new comment     |
| GET    | /api/comments/:id           | Get comment by ID        |
| PUT    | /api/comments/:id           | Update a comment         |
| DELETE | /api/comments/:id           | Delete a comment         |
| POST   | /api/comments/:id/likes     | Like a comment           |
| DELETE | /api/comments/:id/likes     | Unlike a comment         |

---

## Request & Response Examples

### Create a Video
```
POST /api/videos
Content-Type: application/json

{
  "title": "My first video",
  "description": "A quick intro",
  "url": "https://example.com/video.mp4",
  "userId": 1
}
```
Response: `201 Created`

### Follow a User
```
POST /api/users/2/followers
Content-Type: application/json

{ "followerId": 1 }
```
Response: `201 Created` — `{ "message": "User followed successfully" }`

### Like a Video
```
POST /api/videos/1/likes
Content-Type: application/json

{ "userId": 1 }
```
Response: `201 Created` — `{ "message": "Video liked successfully" }`

---

## Error Handling

All errors return a consistent JSON structure:

```json
{ "error": "Error message here" }
```

Common status codes:

| Code | Meaning                          |
|------|----------------------------------|
| 200  | OK                               |
| 201  | Created                          |
| 204  | No Content (successful delete)   |
| 400  | Bad Request (missing/invalid fields) |
| 404  | Not Found                        |
| 406  | Not Acceptable (wrong Content-Type) |
| 409  | Conflict (duplicate record)      |
| 500  | Internal Server Error            |

---

## Testing the API

Use Postman or curl to test endpoints. Example requests:

```bash
# Get all users
curl -X GET http://localhost:3000/api/users

# Get all videos
curl -X GET http://localhost:3000/api/videos

# Get user by ID
curl -X GET http://localhost:3000/api/users/1

# Get video by ID
curl -X GET http://localhost:3000/api/videos/1

# Get a user's videos
curl -X GET http://localhost:3000/api/users/1/videos

# Get comments on a video
curl -X GET http://localhost:3000/api/videos/1/comments
```

---

## Notes

- Data is stored **in-memory** — all data resets when the server restarts. A database (e.g. MongoDB or PostgreSQL) would be the next step for persistence.
- This API only accepts `application/json`. Requests with a non-JSON `Accept` header will receive a `406 Not Acceptable` response.
- Cascading deletes are handled in-memory: deleting a user also removes their videos and comments; deleting a video also removes its associated comments.
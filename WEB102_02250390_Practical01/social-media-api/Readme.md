# Social Media API

A RESTful API built with Node.js and Express, designed for a social media platform similar to Instagram. This project was developed as part of a practical on designing and implementing RESTful API endpoints.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Content Negotiation](#content-negotiation)
- [Error Handling](#error-handling)
- [API Documentation](#api-documentation)

---

## Overview

This API supports core social media functionality across five resources: **Users**, **Posts**, **Comments**, **Likes**, and **Followers**. It follows RESTful design principles with proper HTTP methods, status codes, and content negotiation between JSON and XML formats.

---

## Project Structure

```
social-media-api/
├── server.js                  # Entry point
├── .env                       # Environment variables
├── .gitignore
├── package.json
├── controllers/
│   ├── userController.js      # User CRUD logic
│   ├── postController.js      # Post CRUD logic
│   └── ...                    # Controllers for comments, likes, followers
├── routes/
│   ├── users.js               # User routes
│   ├── posts.js               # Post routes
│   └── ...                    # Routes for comments, likes, followers
├── middleware/
│   ├── errorHandler.js        # Global error handling middleware
│   ├── formatResponse.js      # Content negotiation middleware
│   └── async.js               # Async handler utility
├── utils/
│   ├── mockData.js            # In-memory mock data
│   └── errorResponse.js       # Custom error class
└── public/
    └── docs.html              # API documentation page
```

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download the project, then navigate into the directory:
   ```bash
   cd social-media-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will run at `http://localhost:3000`.

---

## API Endpoints

### Users

| Method | Endpoint         | Description           | Access  |
|--------|------------------|-----------------------|---------|
| GET    | /api/users       | Get all users         | Public  |
| GET    | /api/users/:id   | Get a specific user   | Public  |
| POST   | /api/users       | Create a new user     | Public  |
| PUT    | /api/users/:id   | Update a user         | Private |
| DELETE | /api/users/:id   | Delete a user         | Private |

### Posts

| Method | Endpoint         | Description           | Access  |
|--------|------------------|-----------------------|---------|
| GET    | /api/posts       | Get all posts         | Public  |
| GET    | /api/posts/:id   | Get a specific post   | Public  |
| POST   | /api/posts       | Create a new post     | Private |
| PUT    | /api/posts/:id   | Update a post         | Private |
| DELETE | /api/posts/:id   | Delete a post         | Private |

> Similar endpoint patterns apply for **Comments**, **Likes**, and **Followers**.

### Query Parameters (List Endpoints)

| Parameter | Type   | Default | Description              |
|-----------|--------|---------|--------------------------|
| page      | Number | 1       | Page number              |
| limit     | Number | 10      | Number of results per page |

### Example Request

```
GET /api/users?page=1&limit=10
Authorization: Bearer {token}
```

### Example Response

```json
{
  "success": true,
  "count": 10,
  "page": 1,
  "total_pages": 5,
  "pagination": {
    "next": { "page": 2, "limit": 10 }
  },
  "data": [
    {
      "id": "1",
      "username": "traveler",
      "full_name": "Karma",
      "profile_picture": "https://example.com/profiles/traveler.jpg",
      "bio": "Travel photographer",
      "created_at": "2023-01-15"
    }
  ]
}
```

---

## Content Negotiation

The API supports multiple response formats via the `Accept` header:

- `application/json` — returns JSON (default)
- `application/xml` — returns XML

The `formatResponse` middleware intercepts responses and converts them accordingly before sending to the client.

---

## Error Handling

All errors are handled by the global `errorHandler` middleware. Errors return a consistent structure:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes used:

| Code | Meaning               |
|------|-----------------------|
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

## API Documentation

Once the server is running, visit `http://localhost:3000/api-docs` to view the HTML documentation page, which lists all endpoints with their parameters and example responses.

---

## Notes

- This project uses **in-memory mock data** (no database). Data resets every time the server restarts.
- Authentication on private routes is simulated using the `X-User-Id` request header.
- The `dotenv` package is required — make sure your `.env` file exists before starting the server.
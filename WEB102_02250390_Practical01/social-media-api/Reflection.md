# Reflection – Designing and Implementing RESTful API Endpoints

## Overview

This practical involved designing and building a RESTful API for a social media platform using Node.js and Express. The work covered API design, controller logic, middleware, content negotiation, error handling, and documentation. Below is a reflection on the key learning outcomes, challenges, and insights from the process.

---

## What I Learned

### RESTful API Design Principles

Before writing any code, the practical required designing endpoints for five resources: Users, Posts, Comments, Likes, and Followers. This reinforced how REST APIs are structured around resources rather than actions. Using nouns in URIs (e.g., `/api/posts`) and relying on HTTP methods (GET, POST, PUT, DELETE) to express intent felt more intuitive once I worked through the full CRUD design for each resource.

I also learned the importance of consistency in URI design. Once a pattern is established — such as `/resource` for collections and `/resource/:id` for individual items — it makes the API predictable and easier to consume.

### HTTP Status Codes

A key part of this practical was returning the right status code for each operation. I had a loose understanding of status codes before, but implementing them in context made the distinctions concrete:

- `200 OK` for successful reads and updates
- `201 Created` for successful creation (POST)
- `400 Bad Request` for invalid input (e.g., duplicate username)
- `401 Unauthorized` for protected routes accessed without credentials
- `404 Not Found` when a resource doesn't exist

Getting these right matters because clients rely on status codes to understand what happened — not just the response body.

### Middleware Architecture

One of the most valuable parts of this practical was seeing how Express middleware is composed. Three distinct middleware files served very different purposes:

- **`errorHandler.js`** — A centralized place to catch and format all errors, avoiding repetitive try/catch blocks in every controller.
- **`async.js`** — A wrapper that passes promise rejections to the error handler automatically, keeping async controller functions clean.
- **`formatResponse.js`** — Intercepts `res.json()` calls to enable content negotiation, converting JSON to XML when the client requests it.

This layered approach demonstrated that middleware isn't just for authentication — it's a powerful pattern for separating concerns cleanly.

### Content Negotiation

Implementing the `formatResponse` middleware made content negotiation tangible. The API checks the `Accept` header on each request and responds with either JSON or XML accordingly. While JSON is the standard for most modern APIs, understanding how to support multiple formats — and that this is handled at the transport layer rather than in each controller — was a useful insight.

### Error Response Consistency

Using a custom `ErrorResponse` class that extends the built-in `Error` allowed status codes to travel alongside error messages through the middleware chain. This meant controllers could throw a single object (`new ErrorResponse('Not found', 404)`) and the error handler would take care of the rest. This is a clean pattern I'd use in real projects.

---

## Challenges

### Managing Mock Data

Since the project uses in-memory arrays instead of a database, data doesn't persist between server restarts. This was fine for the practical's purposes, but it highlighted how much a real database changes the architecture — especially around update and delete operations where finding records by ID becomes more complex.

### Simulating Authentication

Private routes check for an `X-User-Id` header rather than real JWT authentication. While functional for the practical, it made me think about how real auth middleware would plug in — verifying a token, attaching the user to the request, and gating access properly. It was a useful placeholder that pointed toward a more complete implementation.

### XML Conversion

The `convertToXml` function in `formatResponse.js` handles simple objects and arrays, but deeply nested objects aren't fully supported. Writing the conversion logic manually made it clear why libraries like `xml2js` exist — recursive serialization gets complicated quickly.

---

## What I Would Do Differently

- **Add input validation** — The current controllers don't validate request bodies beyond basic checks. A library like `joi` or `express-validator` would catch missing or malformed fields before they cause issues.
- **Connect a real database** — Moving from mock data to a database like MongoDB or PostgreSQL would make the API genuinely functional and expose new challenges around querying, indexing, and error handling.
- **Implement real authentication** — Replacing the `X-User-Id` simulation with JWT-based auth would complete the security model and make the private routes properly protected.
- **Add more detailed API documentation** — The `docs.html` file covers the Users resource but the practical notes it should be extended to all resources. A tool like Swagger/OpenAPI would automate this.

---

## Conclusion

This practical gave me a solid foundation in RESTful API design and implementation. The most important takeaway is that good API design is about consistency and clarity — predictable URIs, appropriate status codes, and clean separation between routing, controller logic, and middleware. These principles apply regardless of the language or framework being used.
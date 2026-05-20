# File Upload Server

A Node.js and Express backend for handling file uploads, built to connect with a React/Next.js frontend. Supports JPEG, PNG, and PDF uploads with file type validation, size limits, progress tracking, and static file serving.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [File Validation](#file-validation)
- [Error Handling](#error-handling)
- [Frontend Integration](#frontend-integration)
- [Testing](#testing)

---

## Overview

This server uses **Multer** to handle multipart form data, validate uploaded files, and store them on disk. It exposes a single upload endpoint consumed by a Next.js frontend. CORS is configured to allow cross-origin requests from the frontend dev server.

---

## Project Structure

```
file-upload-server/
├── server.js        # Express app, Multer config, routes, and error handling
├── .env             # Environment variables
├── .gitignore
├── package.json
└── uploads/         # Created automatically on server start; stores uploaded files
```

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- A Next.js frontend running on port 3000

### Installation

1. Create and navigate into the project directory:
   ```bash
   mkdir file-upload-server
   cd file-upload-server
   npm init -y
   ```

2. Install dependencies:
   ```bash
   npm install express cors multer morgan dotenv
   ```

3. Create a `.env` file:
   ```
   PORT=8000
   FRONTEND_URL=http://localhost:3000
   ```

4. Start the server:
   ```bash
   node server.js
   ```

The server will run at `http://localhost:8000`. The `uploads/` directory is created automatically if it doesn't exist.

---

## API Endpoints

| Method | Endpoint       | Description                        |
|--------|----------------|------------------------------------|
| GET    | /              | Health check — confirms server is running |
| POST   | /api/upload    | Upload a single file               |
| GET    | /uploads/:filename | Serve an uploaded file statically |

### Upload Request

```
POST /api/upload
Content-Type: multipart/form-data

Body: form-data with field name "file"
```

### Success Response (`200 OK`)

```json
{
  "message": "File uploaded successfully",
  "filename": "example.jpg",
  "originalName": "my-photo.jpg",
  "mimetype": "image/jpeg",
  "size": 204800,
  "url": "/uploads/example.jpg"
}
```

### Error Responses

```json
{ "error": "No file uploaded" }             // 400 — missing file
{ "error": "Invalid file type. Only JPEG, PNG and PDF files are allowed." }  // 400
{ "error": "File too large. Maximum size is 5MB." }  // 413
{ "error": "Server error" }                 // 500
```

---

## File Validation

Multer is configured with the following rules:

| Rule         | Value                              |
|--------------|------------------------------------|
| Allowed types | `image/jpeg`, `image/png`, `application/pdf` |
| Max file size | 5MB                                |
| Storage      | Disk (saved to `uploads/` folder)  |
| Field name   | `file`                             |

Files are saved using their original filename. For production use, consider adding a timestamp or UUID to avoid filename collisions.

---

## Error Handling

A custom error middleware after the upload route handles two categories of errors:

- **Multer errors** — file too large (`413`) or invalid type (`400`)
- **All other errors** — generic `500` server error response

This ensures the client always receives a structured JSON error rather than an unformatted stack trace.

---

## Frontend Integration

The Next.js frontend sends files using `axios` with a `FormData` body. The key configuration changes on the frontend are:

1. Point the upload URL to `http://localhost:8000/api/upload`
2. Use `axios`'s `onUploadProgress` callback to track and display progress
3. Handle image and PDF previews separately — images use `URL.createObjectURL()`, PDFs display the filename only

CORS is configured on the backend to accept requests from `http://localhost:3000` (or the value set in `FRONTEND_URL`).

---

## Testing

With both servers running, test the upload flow manually:

1. Start the Express backend:
   ```bash
   node server.js
   ```
2. Start the Next.js frontend:
   ```bash
   npm run dev
   ```
3. Open the upload form in the browser and verify:
   - Upload progress is tracked and displayed
   - Valid files (JPEG, PNG, PDF under 5MB) upload successfully
   - Invalid file types are rejected with an error message
   - Files over 5MB are rejected with a size error
   - Uploaded files appear in the `uploads/` directory
   - Files are accessible at `http://localhost:8000/uploads/<filename>`

---

## Key Concepts

**Multipart Form Data** — Files are sent as `multipart/form-data`, which allows binary file data and text fields to travel together in one HTTP request. The `FormData` API on the frontend builds this, and Multer on the backend parses it.

**Multer Storage** — Multer's `diskStorage` engine controls where files are saved (`destination`) and what they're named (`filename`). The `fileFilter` function runs before saving and can reject unsupported types.

**CORS** — Since the frontend and backend run on different ports, the browser treats them as different origins. The `cors` middleware on the backend explicitly allows requests from the frontend's origin.

**Progress Tracking** — Axios exposes an `onUploadProgress` event that fires as chunks of the file are sent. The frontend uses this to update a progress bar in real time.
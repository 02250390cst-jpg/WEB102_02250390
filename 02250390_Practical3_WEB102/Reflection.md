# Reflection – Implementing File Upload on the Server Application

## Overview

This practical involved building a file upload backend using Node.js, Express, and Multer, then connecting it to a React/Next.js frontend with a drag-and-drop interface. Unlike the previous practicals which focused on JSON API design, this one introduced binary data handling, middleware-driven validation, and cross-origin communication between two running servers.

---

## What I Learned

### How File Uploads Actually Work

Before this practical, file uploads felt like a black box. Working through the implementation made the underlying mechanism clear. When a user selects a file, the browser encodes it as `multipart/form-data` — a format that bundles binary file data and text fields together in one HTTP request. The `FormData` API on the frontend constructs this, and Multer on the backend parses it back into usable file and field objects.

Understanding this flow — from the browser's `FormData` object through the network to Multer's `req.file` — made the whole system feel less magical and more like something I can reason about and debug.

### Multer's Configuration Model

Multer is more configurable than I expected. The three key pieces — `storage`, `fileFilter`, and `limits` — each handle a distinct concern:

- `storage` decides where the file goes and what it's named on disk
- `fileFilter` runs before saving and can reject files based on MIME type
- `limits` enforces hard caps on file size (and optionally count)

This separation of concerns means validation happens before storage, which is the right order — you don't want to write a file to disk only to delete it afterward because the type was wrong.

One practical detail: the filename in `diskStorage` is set using a callback rather than a plain value. Using `Date.now()` as a prefix here — or a UUID — is important in production to avoid overwriting files with the same original name. The practical didn't include this, which would be a problem with concurrent uploads of identically named files.

### Error Handling for File Uploads

File upload errors are a different category from the JSON API errors in the previous practicals. Multer throws its own error class (`multer.MulterError`) which needs to be caught separately from generic errors. The custom error middleware checks `err instanceof multer.MulterError` and maps `LIMIT_FILE_SIZE` to a `413` status with a user-friendly message.

This pattern — catching middleware-specific error types in a global handler and translating them into clear HTTP responses — is something I'll carry forward to any Express project that uses third-party middleware.

### CORS in Practice

The previous practicals had CORS as a single line (`app.use(cors())`), which allows all origins. This practical tightened it to a specific origin, allowed methods, and allowed headers:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

This is significantly more realistic. In a production environment, allowing all origins would be a security risk. Using an environment variable for the frontend URL also means the same code works in development and production without changes.

### Progress Tracking with Axios

The `onUploadProgress` callback in Axios was new to me. It fires repeatedly as chunks of the file are transmitted, providing `progressEvent.loaded` and `progressEvent.total` values that can be used to calculate a percentage. The frontend uses this to update a progress bar in real time.

This only works meaningfully for larger files — small files upload so fast the progress bar barely moves. But it's an important UX feature for larger uploads and demonstrates how HTTP chunked transfer works from the client's perspective.

### Frontend and Backend as Separate Processes

Unlike the first two practicals where everything ran in one server, this practical had the backend on port 8000 and the Next.js frontend on port 3000. Managing two running processes simultaneously — and making sure they could talk to each other — felt more like real development. It also made the purpose of CORS concrete: without it, the browser would silently block the frontend's upload requests.

---

## Challenges

### Static File Serving and URL Construction

Serving uploaded files statically with `express.static(uploadDir)` and mounting it at `/uploads` means files are accessible at `/uploads/<filename>`. The upload response includes a `url` field built with this path. This works cleanly in development, but in production the backend URL would need to be absolute (e.g. `https://api.example.com/uploads/file.jpg`), which would require the base URL to come from an environment variable.

### PDF Preview Limitations

The frontend handles image files with `URL.createObjectURL()` to show a thumbnail, but PDFs just display the filename in a styled box. A more complete implementation would embed a PDF viewer (using something like `react-pdf`) or at least provide a link to open the file in a new tab. The current approach is functional but not great for user experience.

### No Persistent File Registry

Uploaded files are stored on disk but there's no database record of what's been uploaded. This means there's no way to list uploaded files via the API, track who uploaded what, or delete files through the API. In a real application, each upload would create a database record with the filename, original name, MIME type, size, and user association.

---

## Comparison to Previous Practicals

| Area | Practicals 1 & 2 (REST APIs) | Practical 3 (File Upload) |
|------|-------------------------------|---------------------------|
| Data format | JSON | multipart/form-data |
| Middleware | Error handler, async wrapper, format response | Multer (storage, filter, limits) |
| Validation | Business rules (duplicates, required fields) | File type and size constraints |
| Frontend connection | Not included | Explicit — axios POST with FormData and progress tracking |
| CORS | Permissive | Restricted to specific origin |
| Persistence | In-memory arrays | Files on disk (no database registry) |

---

## What I Would Do Differently

- **Add unique filenames** — Prepending `Date.now()` or a UUID to filenames would prevent collisions when multiple users upload files with the same name.
- **Store upload metadata in a database** — A simple record per upload (filename, original name, size, type, timestamp) would enable listing and deleting files through the API.
- **Validate on the frontend too** — The backend validates file type and size, but doing the same check on the frontend before the request is sent gives faster feedback and reduces unnecessary network traffic.
- **Add a DELETE endpoint** — Without one, there's no way to remove uploaded files through the API. This would also require removing the file from disk using `fs.unlink`.
- **Improve PDF preview** — Embedding a lightweight PDF viewer or at minimum a "view file" link would make the frontend more useful.

---

## Conclusion

This practical filled in a significant gap — understanding how file uploads actually work end-to-end, from `FormData` in the browser to Multer on the server to files sitting in a directory. The key insight is that file upload handling is a middleware problem: Multer slots into the Express middleware chain and takes care of parsing, validating, and storing files before the route handler ever runs. Getting the error handling right — specifically distinguishing Multer errors from general server errors — is what makes the system robust rather than just functional.
# Reflection: Lab Tutorial – Token-Based Authentication in Node.js using JWT

## What I Learned

This lab gave me a hands-on understanding of how modern authentication actually works under the hood. Before this, authentication felt like something that just happened — a login form, a session, and somehow the app knows who you are. Working through each piece step by step made the full picture much clearer.

The core insight was the difference between **session-based** and **token-based** authentication. With sessions, the server has to remember every logged-in user, which becomes a scaling problem when traffic grows or when you're running multiple servers. With JWTs, the server just issues a signed token and forgets about it — every subsequent request proves its own identity by presenting the token. The server only needs its secret key to verify the signature, not a lookup table of active sessions.

Understanding the **three-part structure of a JWT** was a key moment. Seeing that the payload is only base64 encoded — not encrypted — drove home why you should never put sensitive information like a password or credit card number inside a token. The signature just proves the server issued it; it doesn't hide the contents from anyone who reads it.

The **bcrypt hashing process** also became much clearer in practice. Seeing the stored hash (`$2a$10$...`) after registration, and understanding that there's no way to reverse it back to the original password, made the security reasoning concrete rather than abstract. The `bcrypt.compare` function doing the heavy lifting during login — rather than the developer manually re-hashing and comparing — was a clean pattern to follow.

The **middleware pattern** for protecting routes was another valuable lesson. Rather than repeating token verification logic in every route handler, `verifyToken` intercepts the request, does its check, and either lets it through with `next()` or stops it immediately. This separation of concerns keeps route handlers clean and the auth logic in one maintainable place.

---

## Challenges Faced

The `Authorization` header format (`Bearer <token>`) was initially easy to get wrong. Forgetting the `Bearer ` prefix, or miscapitalizing it, would cause the token extraction (`authHeader.split(' ')[1]`) to silently return `undefined`, triggering a 401 even with a valid token. Paying attention to the exact header format — and understanding why it's structured that way — resolved this.

The distinction between **401 and 403** was also worth slowing down on. At first glance they seem similar, but `401 Unauthorized` means the server doesn't know who you are (no token), while `403 Forbidden` means it does know (the token was decoded), but the token is invalid or expired. Using them correctly matters for clients that need to decide whether to redirect to a login page or show a "session expired" message.

Another subtle point was understanding **when the token payload becomes stale**. Because the JWT is signed at login time with whatever data was in the user object then, any changes made to the user's profile after login won't be reflected until they log in again and receive a fresh token. This is a real trade-off of stateless auth — convenience and scalability at the cost of immediate consistency.

---

## What Could Be Improved

A few things would make this implementation more production-ready:

- **Refresh tokens** would allow users to get new access tokens without logging in again, solving the stale payload problem more gracefully. The current 1-day expiry is a blunt fix
- **Input sanitization and validation** (e.g., checking email format, enforcing minimum password length) should be added before the data reaches bcrypt or the user store, to give users meaningful feedback
- **Persistent storage** — the in-memory `users` array is appropriate for a demo but is wiped every time the server restarts. Connecting this to a database (as covered in Practical 4 with Prisma) is the natural next step
- **Rate limiting** on the `/auth/login` endpoint would help prevent brute-force attacks, since the current implementation accepts unlimited login attempts

---

## Overall Takeaway

This lab connected theory to practice in a way that reading about JWT alone doesn't. Going through the full cycle — register, hash, store, login, compare, sign, verify, decode — made each step feel purposeful rather than like boilerplate to copy. The homework extension (adding a `name` field and a `/users` route) was a useful nudge to apply the same patterns independently rather than just following instructions. Authentication is one of those topics where the details matter a lot, and this lab built a solid foundation for understanding those details.
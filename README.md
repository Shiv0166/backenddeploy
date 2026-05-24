# Food Order Backend Syllabus Coverage

## SSR vs CSR
- **SSR (Server-Side Rendering):** HTML is generated on the server and sent ready to display. Example route: `GET /ssr-demo` renders `views/dashboard.ejs`.
- **CSR (Client-Side Rendering):** Browser gets a base HTML/JS bundle and builds UI in the client. Your existing static pages (`index.html`, `menu.html`, etc.) behave as CSR-style pages.

## SQL vs NoSQL
- **SQL databases** (MySQL/PostgreSQL): table-based schema, fixed relations, SQL queries, strong ACID transactional workflows.
- **NoSQL databases** (MongoDB): document-based schema, flexible JSON-like structure, easier horizontal scaling for rapidly changing product data.
- This project uses **MongoDB + Mongoose** for model-driven NoSQL access (`models/User.js`, `models/Product.js`).

## Implemented Topics
- Middleware lifecycle comments + app/router/error middleware in `server.cjs` and `middlewares/`.
- Third-party middleware examples: `helmet`, `cors`, `morgan`.
- Body parsing via `express.json()` and `express.urlencoded()`.
- Sessions and cookies via `express-session` + `cookie-parser` in `routes/sessionRoutes.js`.
- Authentication via `bcryptjs`, `jsonwebtoken`, and Passport local strategy.
- Socket.IO full duplex demo via `views/socket-demo.ejs` + server Socket.IO handlers.

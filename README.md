# FoodHub — Food Ordering App

Monorepo layout:

```
/client   → Static frontend (deploy to Vercel)
/server   → Express API + PostgreSQL (deploy to Render)
```

## Local development

### 1. Backend

```bash
cd server
npm install
npm run db:init
npm start
```

API runs at `http://localhost:5000`

### 2. Frontend

Serve the `client` folder over HTTP (required for API calls):

```bash
cd client
npx serve -l 3000
```

Open `http://localhost:3000` — `config.js` points API calls to `http://localhost:5000`.

## Deploy

### Vercel (client)

- Root directory: `client`
- Framework: Other (static)
- Set `window.__FOODHUB_API__` to your Render API URL in HTML or use Vercel env + inject script

### Render (server)

- Root directory: `server` (or use `render.yaml`)
- Build: `npm install`
- Start: `npm start`
- Env: `DATABASE_URL`, `SESSION_SECRET`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL)

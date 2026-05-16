# NGO Impact Tracker

A web application that lets NGOs submit monthly impact reports and provides an admin dashboard with aggregated metrics.

The backend uses a small layered Express layout (`server.js` entry → `src/app.js` factory → `routes/`, `validators/`, `db/`, and `config`); public API URLs and JSON shapes are unchanged for clients.

![Screenshot](screenshot.png)

---

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 18, React Router, Vite    |
| Backend  | Node.js, Express                |
| Database | SQLite (via better-sqlite3)     |
| Styling  | Custom CSS (no framework)       |

---

## Project Structure

```
ngo-impact-tracker/
├── backend/
│   ├── server.js              # Entry: starts HTTP listener (npm start / Render)
│   ├── src/
│   │   ├── app.js             # Express app factory (middleware, /api mount, SPA in prod)
│   │   ├── config.js          # PORT, NODE_ENV, DB paths, static public path
│   │   ├── db/
│   │   │   └── index.js       # SQLite (better-sqlite3) + schema
│   │   ├── routes/
│   │   │   ├── index.js       # Combines API routers mounted at /api
│   │   │   ├── reports.js     # POST /report
│   │   │   └── dashboard.js   # GET /dashboard, GET /months
│   │   └── validators/
│   │       ├── month.js       # YYYY-MM validation helpers
│   │       └── report.js      # Report body validation
│   ├── database/              # SQLite files (created at runtime)
│   ├── public/                # Frontend build output (production static)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ReportForm.jsx   # Report submission page
│   │   │   └── Dashboard.jsx    # Admin dashboard page
│   │   ├── utils/api.js         # API helper functions
│   │   ├── App.jsx              # Root component + routing
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # All styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── build.sh                     # Build script for deployment
├── package.json                 # Root scripts
└── README.md
```

---

## Setup & Running Locally

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Clone & install

```bash
git clone <repo-url>
cd ngo-impact-tracker
npm run install:all
```

### 2. Start the backend (port 4000)

```bash
npm run dev:backend
```

### 3. Start the frontend (port 3000) — in a second terminal

```bash
npm run dev:frontend
```

Open **http://localhost:3000** in your browser.

The Vite dev server proxies `/api/report`, `/api/dashboard`, and `/api/months` to the backend on port 4000 automatically (so the React app can call the same paths in dev and production).

### Production build

```bash
npm run build   # builds frontend and copies to backend/public
npm start       # serves everything from Express on port 4000
```

---

## API Endpoints

### `POST /api/report`

Submit a monthly report.

**Request body (JSON):**
```json
{
  "ngo_id": "NGO-042",
  "month": "2025-04",
  "people_helped": 350,
  "events_conducted": 12,
  "funds_utilized": 75000.50
}
```

**Responses:**
- `201` – Report created/updated
- `400` – Validation errors

> If the same `ngo_id` + `month` combination is submitted again, the record is updated (upsert).

### `GET /api/dashboard?month=YYYY-MM`

Returns aggregated data for the given month.

**Response:**
```json
{
  "success": true,
  "month": "2025-04",
  "data": {
    "total_ngos": 5,
    "total_people_helped": 1240,
    "total_events_conducted": 38,
    "total_funds_utilized": 250000.00
  }
}
```

### `GET /api/months`

Returns a list of months that have at least one report (used for the month selector).

---

## Deploying to Render

1. Push the repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Settings:
   - **Build Command:** `bash build.sh`
   - **Start Command:** `cd backend && NODE_ENV=production node server.js`
   - **Environment:** Node
4. Render will automatically detect the `PORT` environment variable.

---

## Deployed Link

> _Replace with your deployed URL after deploying._

---

## Writeup (~200 words)

### Approach

I aimed for a clear split between frontend and backend, with a backend layout that stays easy to read: `server.js` only starts listening, `src/app.js` builds the Express app (middleware, `/api` mount, production static hosting), SQLite setup lives in `src/db`, handlers live in `src/routes`, and input checks are plain functions in `src/validators`. `src/config.js` centralises `PORT`, `NODE_ENV`, and filesystem paths. SQLite was chosen for simplicity — no separate database server, and `better-sqlite3` synchronous queries keep the route code straightforward.

The frontend uses React Router for client-side routing between the report form and dashboard. I focused on solid form validation (both client and server-side), proper loading/empty states on the dashboard, and a polished visual design using custom CSS with CSS variables for consistent theming.

The upsert logic (`ON CONFLICT ... DO UPDATE`) sits in the report route and lets an NGO correct a previously submitted month without creating duplicates — a common real-world need.

### AI Tools Usage

I implemented the full stack myself—the Express API structured as routes, validators, and SQLite (`better-sqlite3`) in `src/db`, plus the React app structure (routing, pages, forms, dashboard logic, API integration, loading/empty states). I used **Claude Sonnet** specifically to help translate that into **CSS styling and layout polish**—the visual design system (e.g. custom CSS variables, component look-and-feel), which I reviewed and adjusted to fit the codebase.

### What I'd Improve With More Time

- **Authentication** – JWT-based login for NGOs and a separate admin role.
- **Charts** – Visual trend lines on the dashboard (e.g., Recharts) showing month-over-month data.
- **Export** – CSV/PDF export of monthly reports.
- **Testing** – Unit tests for validators and thin HTTP integration tests (Jest/Supertest) importing `app` from `backend/src/app.js` so the server port is not opened unless a test chooses to start it; plus component tests (React Testing Library).
- **Pagination** – For listing individual reports with filtering.

### Future improvements
- **Validation:** Add [Zod](https://zod.dev) (or similar) for request/query schemas, shared between API and tests, with a consistent map from parse errors to `{ success: false, errors: [...] }`.
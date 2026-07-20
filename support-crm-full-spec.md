# Support CRM — Full Project Specification

**Assignment:** Datastraw Technologies Hiring Assignment
**Deadline:** 3–4 days
**Author:** Hashim Bhagad
**Repo:** github.com/Hashim-Bhagad/Support-CRM

---

## 1. What This Project Is

A full-stack customer support ticketing CRM: create tickets, list/search/filter them, view details, update status, and add notes — with real authentication protecting the API, built and deployed the way a small production team would actually do it (not a throwaway script), but scoped tightly enough to ship in 3–4 days.

**Guiding principle:** every technical decision below optimizes for *shipped and explainable*, not maximal sophistication. Where a "more production-grade" option exists but costs meaningful setup time, that tradeoff is called out explicitly.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | FastAPI (Python 3.11) | Async, auto-generated OpenAPI docs, clean dependency-injection model for auth |
| DB | SQLite via SQLAlchemy 2.0 | Zero infra overhead, sufficient for assignment scope |
| Auth | JWT (python-jose) + bcrypt (passlib) | Real, demonstrable auth without OAuth complexity |
| Frontend | React (Vite) + Tailwind CSS | Familiar stack, fast dev loop |
| Package mgmt (backend) | `uv` + `pyproject.toml` | Current-generation tooling, lockfile with hash pinning |
| Package mgmt (frontend) | npm | Standard for Vite/React |
| Deploy (backend) | Railway.app, buildpack (no Docker) | Fast, Railway auto-detects Python projects |
| Deploy (frontend) | Vercel | Zero-config Vite detection |
| Version control | Git + GitHub | Single root repo, incremental commits |

---

## 3. Scope — Locked

**In scope (5 core features + auth):**
1. Create ticket (customer name, email, subject, description → auto ID + timestamp)
2. List all tickets (ID, name, subject, status, date)
3. Search (name, ID, email, description)
4. Filter by status (Open / In Progress / Closed)
5. View + update ticket (status change, add note)
6. Auth (JWT login, protects all ticket endpoints)

**Explicitly out of scope** (do not build unless everything above is done and stable with a day to spare):
- Signup/self-registration flow (one seeded admin user is enough)
- Password reset / email verification
- Role-based permission granularity beyond a single `agent` role
- Email notifications
- Multi-agent ticket assignment
- Docker (Railway's buildpack handles deployment without it)

---

## 4. Database Schema

```
users
├── id              INTEGER PK
├── email           TEXT UNIQUE NOT NULL
├── hashed_password TEXT NOT NULL
├── role            TEXT DEFAULT 'agent'
└── created_at      DATETIME

tickets
├── id              INTEGER PK AUTOINCREMENT
├── ticket_id       TEXT UNIQUE   -- e.g. "TKT-001", derived from id
├── customer_name   TEXT NOT NULL
├── customer_email  TEXT NOT NULL
├── subject         TEXT NOT NULL
├── description     TEXT NOT NULL
├── status          TEXT DEFAULT 'Open'   -- Open | In Progress | Closed
├── created_at      DATETIME
└── updated_at      DATETIME

notes
├── id              INTEGER PK
├── ticket_id       TEXT FK → tickets.ticket_id
├── note_text       TEXT NOT NULL
├── created_by      INTEGER FK → users.id
└── created_at      DATETIME
```

`ticket_id` generation: `f"TKT-{id:03d}"` computed right after insert, once the autoincrement `id` is known.

---

## 5. API Surface

| Method | Route | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/login` | ❌ | `username` (email), `password` (form-encoded, OAuth2PasswordRequestForm) | `{ access_token, token_type }` |
| POST | `/api/tickets` | ✅ | `{ customer_name, customer_email, subject, description }` | `{ ticket_id, created_at }` |
| GET | `/api/tickets` | ✅ | query: `?status=&search=` | `[{ ticket_id, customer_name, subject, status, created_at }]` |
| GET | `/api/tickets/{ticket_id}` | ✅ | — | `{ ticket_id, customer_name, customer_email, subject, description, status, notes: [...] }` |
| PUT | `/api/tickets/{ticket_id}` | ✅ | `{ status?, note_text? }` | `{ success: true, updated_at }` |

**Error responses (all endpoints):**
- `401` — missing/invalid/expired JWT
- `404` — ticket not found
- `422` — validation failure (FastAPI/Pydantic auto-generates this)
- No unhandled `500`s — wrap DB operations in try/except where failure is plausible

---

## 6. Auth Design

- Single seeded admin user, created on app startup if the `users` table is empty (env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD`) — no signup flow needed for evaluators to get in
- Login: `POST /api/auth/login` using `OAuth2PasswordRequestForm` (form-encoded, standard FastAPI pattern) → returns a signed JWT
- Token: HS256, signed with `SECRET_KEY` from env, ~24h expiry, no refresh token
- Password storage: bcrypt hash via `passlib`, never plaintext, never logged
- Every `/api/tickets*` route depends on a `get_current_user` dependency that decodes and validates the JWT, raising `401` on failure
- Frontend: token stored in `localStorage`, attached via an axios request interceptor, cleared + redirected to `/login` on any `401` response
- **Explicitly not built:** OAuth providers, refresh tokens, RBAC beyond one role — call this out as a deliberate scope decision in the demo video, not an oversight

---

## 7. Backend Dependencies (via `uv add`)

| Package | Role |
|---|---|
| `fastapi` | Web framework, routing, validation, DI |
| `uvicorn[standard]` | ASGI server that runs the app |
| `sqlalchemy` | ORM — models, queries, SQLite connection |
| `pydantic` | Request/response schema validation |
| `pydantic-settings` | Typed env var loading (`SECRET_KEY`, `DATABASE_URL`, etc.) |
| `python-jose[cryptography]` | JWT create/verify |
| `passlib[bcrypt]` | Password hashing/verification |
| `python-multipart` | Required for form-encoded login endpoint |
| `python-dotenv` | Loads `.env` locally in dev |
| `pytest` (dev) | Endpoint tests |
| `httpx` (dev) | HTTP client used by FastAPI's TestClient |
| `ruff` (dev) | Lint + format |

Managed via `pyproject.toml` + `uv.lock` (hash-pinned, fully resolved transitive tree) — not a hand-written `requirements.txt`. Dev dependencies excluded from production installs via `uv sync --frozen --no-dev`.

---

## 8. Folder Structure

```
support-crm/
├── .git/                      (single repo, root only — no nested .git in backend/)
├── .gitignore
├── README.md
│
├── backend/
│   ├── .venv/                 (uv-managed, not committed)
│   ├── .python-version
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── .env                   (not committed)
│   ├── .env.example           (committed)
│   ├── crm.db                 (created at runtime, not committed)
│   ├── app/
│   │   ├── main.py            # app instance, CORS, startup seeding
│   │   ├── database.py        # engine, SessionLocal, Base
│   │   ├── models.py          # User, Ticket, Note
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # hashing, JWT, get_current_user
│   │   ├── config.py          # pydantic-settings
│   │   └── routers/
│   │       ├── auth.py        # /api/auth/login
│   │       └── tickets.py     # 4 ticket endpoints
│   └── tests/
│       └── test_tickets.py
│
└── frontend/
    ├── node_modules/           (not committed)
    ├── .env                    (not committed)
    ├── .env.example            (committed)
    ├── package.json / package-lock.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/axios.js        # JWT interceptor
        ├── pages/
        │   ├── Login.jsx
        │   ├── Home.jsx
        │   ├── CreateTicket.jsx
        │   └── TicketDetail.jsx
        └── components/
            ├── TicketTable.jsx
            ├── SearchBar.jsx
            ├── StatusFilter.jsx
            └── NoteForm.jsx
```

---

## 9. Environment Variables

**backend/.env.example**
```
SECRET_KEY=changeme-generate-a-real-random-string
DATABASE_URL=sqlite:///./crm.db
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=changeme123
```

**frontend/.env.example**
```
VITE_API_URL=http://localhost:8000
```

---

## 10. CORS

Configured explicitly (never `allow_origins=["*"]` once a real frontend origin is known):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://<your-vercel-domain>.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 11. Deployment

- **Backend → Railway**, buildpack detection (no Dockerfile). Start command: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Env vars set in Railway dashboard, not committed.
- **Frontend → Vercel**, zero-config Vite detection. `VITE_API_URL` set in Vercel dashboard to the live Railway URL.
- **Known risk:** SQLite file persistence across Railway redeploys on free tiers — verify early (Day 1–2, not Day 3); if it resets on redeploy, document this as a known limitation in the README rather than losing time chasing it.
- Docker intentionally skipped — adds build-failure surface area with no benefit for this assignment's grading criteria.

---

## 12. Git Workflow

- **One repo at the project root** — `backend/` and `frontend/` are plain subfolders, not nested repos or submodules (watch out for `uv init` auto-running `git init` inside `backend/`; delete that inner `.git` if it appears).
- Root-level `.gitignore` covers both subfolders by relative path (`backend/.venv/`, `frontend/node_modules/`, etc.) — git matches these anywhere in the tree.
- Commit incrementally and meaningfully (not one giant commit at the end): gitignore → backend deps → models/auth → endpoints → frontend pages → deployment config → README/docs. This also supports the "code walkthrough" part of the demo video.
- `git config --global user.name` / `user.email` must be set before the first commit.

---

## 13. Day-by-Day Plan

**Day 1 — Backend + Auth**
- `models.py`, `database.py`, `config.py`, `auth.py`
- Seed-admin-on-startup logic
- `/api/auth/login`, then all 4 ticket endpoints, each behind the JWT dependency
- Test every endpoint with curl/Thunder Client before writing any frontend code

**Day 2 — Frontend**
- Login page (stores JWT, redirects on success/401)
- Home (list + search + filter), Create Ticket form, Ticket Detail (status update + add note)
- Axios instance with JWT interceptor

**Day 3 — Polish + Deploy**
- Loading/empty/error states, mobile responsiveness
- Deploy backend (Railway) and frontend (Vercel), fix CORS with real deployed origin
- Smoke-test the **live** URL end-to-end, not just localhost

**Day 4 (buffer) — Submission**
- README (setup steps, `.env.example`, architecture, auth explanation, known limitations)
- 3–5 min demo video: walkthrough → code tour → one real challenge solved
- Submission email with links + 2–3 sentence approach summary

---

## 14. Definition of Done

- [ ] Live deployed URL: can log in with seeded credentials
- [ ] Can create, list, search, filter, view, and update a ticket end-to-end on the **deployed** app
- [ ] Notes can be added and appear on ticket detail
- [ ] Unauthorized requests to `/api/tickets*` return `401`, not `500`
- [ ] `README.md` has setup steps someone unfamiliar with the project could follow
- [ ] `.env.example` files present for both backend and frontend; no real secrets committed
- [ ] `uv.lock` / `package-lock.json` committed for reproducible installs
- [ ] Demo video: 3–5 min, shows app + code + one challenge solved
- [ ] Git history shows incremental commits, not one dump

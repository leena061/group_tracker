<div align="center">

<img src="https://img.shields.io/badge/Live-contribiq.netlify.app-3b82f6?style=for-the-badge&logo=netlify&logoColor=white" />
<img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
<img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />

<br />
<br />

# ContribIQ — Group Project Contribution Tracker

### *Stop letting one person carry the whole team.*

Track GitHub commits, log hours, score contributions with ML, and export a PDF report your professor will actually respect.

**[→ Live Demo](https://contribiq.netlify.app)** · **[→ API Docs](https://group-tracker-backend.onrender.com/docs)**

<br />

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=flat-square&logo=python&logoColor=white)

</div>

---

## The Problem

Every student has been in a group project where one person does 80% of the work and everyone gets the same grade. There's no objective way to prove it, no data to show, and no tool built for it.

I built ContribIQ to fix that — not as a side project, but because I lived it.

---

## What It Does

```
Student registers → Creates project → Invites team via link
        ↓
Members log tasks (code / design / docs / research)
        ↓
Admin syncs GitHub repo → Commits auto-matched by username
        ↓
ML model scores each member 0-100 in real time
        ↓
Imbalance detected → Team warned before deadline
        ↓
One click → PDF report downloaded → Shown to professor
```

---

## Features

| Feature | Description |
|--------|-------------|
| **ML Contribution Scoring** | Weighted model scores task types differently. Normalized 0–100 relative to team. Fully interpretable. |
| **GitHub Auto-Sync** | Paste any public repo URL. Commits match to members by GitHub username instantly. |
| **Workload Imbalance Detection** | Standard deviation analysis flags unfair distribution in real time. |
| **PDF Report Export** | One click generates a professional report with scores, task log, and commit history. |
| **Invite Links** | Share on WhatsApp. Teammates join in one click — no email chains. |
| **JWT Authentication** | Secure login with bcrypt hashing, JWT tokens, and role-based access (admin / member). |
| **Role Management** | Admins can remove members via a clean three-dot menu UI. |
| **Activity Feed** | Live feed of task logs and GitHub commits per project. |

---

## ML Architecture

This project has three ML/data science components:

### 1. Weighted Contribution Scoring
```python
TASK_WEIGHTS = {
    "code":     1.0,   # highest — hardest to quantify by hours alone
    "design":   0.9,
    "research": 0.8,
    "docs":     0.7
}

weighted_score = hours × weight
normalized_score = (member_score / max_score) × 100
```

**Why not a trained model?** No labeled training data exists for "fair contribution." A weighted interpretable model was the right choice — every member can see exactly why their score is what it is. Transparency was a product requirement, not an afterthought.

### 2. GitHub Commit Classification (NLP)
Commit messages are classified into task types using keyword-based NLP. Lightweight but highly effective for this domain — commit message vocabulary is consistent and domain-specific.

```python
design_keywords   = ["ui", "style", "css", "layout", "tailwind", "icon"]
docs_keywords     = ["doc", "readme", "comment", "changelog"]
research_keywords = ["research", "investigate", "test", "analyze"]
code_keywords     = ["fix", "feat", "add", "implement", "refactor", "api"]
```

**Interview answer:** *"I used keyword extraction over TF-IDF because commit messages are too short for meaningful TF-IDF vectors. Domain vocabulary is predictable enough that rule-based classification outperforms learned models here."*

### 3. Workload Imbalance Detection
```python
std = np.std(list(scores.values()))
if std > 25:
    # flag imbalance — one member is carrying the team
```

Standard deviation flagging — same principle as statistical process control used in production ML monitoring systems. Triggers a warning card on the dashboard and a note in the PDF report.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite + Tailwind CSS | Component model, fast HMR, utility-first styling |
| **Routing** | React Router v6 | Declarative protected routes |
| **HTTP client** | Axios + interceptors | Auto-attach JWT to every request |
| **Charts** | Chart.js + react-chartjs-2 | Lightweight, customizable bar charts |
| **Backend** | FastAPI (Python) | Async, auto-generates Swagger docs, Pydantic validation |
| **ORM** | SQLAlchemy + Alembic | Type-safe queries, clean migrations |
| **Auth** | JWT (python-jose) + bcrypt | Stateless, horizontally scalable |
| **ML / Data** | scikit-learn, pandas, NumPy | Industry-standard Python ML stack |
| **PDF** | ReportLab | Server-side PDF generation, no browser dependency |
| **Database** | PostgreSQL via Supabase | Managed, free tier, production-grade |
| **Deployment** | Netlify + Render + Supabase | All free, CI/CD from GitHub push |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│         (Netlify · contribiq.netlify.app)               │
│                                                          │
│  Landing → Auth → Dashboard → Project Detail            │
│  Axios interceptor auto-attaches JWT to every request   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS REST API
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                        │
│      (Render · group-tracker-backend.onrender.com)      │
│                                                          │
│  /auth     JWT register / login                         │
│  /projects CRUD + invite system                         │
│  /tasks    Contribution logging                         │
│  /scores   ML scoring endpoint                          │
│  /github   Commit sync + NLP classification             │
│  /reports  PDF generation                               │
└──────────┬───────────────────────┬──────────────────────┘
           │                       │
┌──────────▼──────────┐  ┌─────────▼──────────────────────┐
│  PostgreSQL DB       │  │     External APIs               │
│  (Supabase)          │  │                                 │
│                      │  │  GitHub REST API v3             │
│  users               │  │  (commit history, authors)      │
│  projects            │  └─────────────────────────────────┘
│  project_members     │
│  tasks               │  ┌─────────────────────────────────┐
│  github_commits      │  │     ML Layer (Python)            │
└──────────────────────┘  │                                 │
                          │  scikit-learn (scoring)         │
                          │  pandas (data processing)       │
                          │  NumPy (std deviation)          │
                          │  ReportLab (PDF export)         │
                          └─────────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register with optional GitHub username |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | ✓ | Get current user |
| POST | `/projects/` | ✓ | Create project, generates invite code |
| GET | `/projects/` | ✓ | List my projects |
| POST | `/projects/join/{code}` | ✓ | Join via invite code |
| POST | `/projects/{id}/tasks` | ✓ | Log a contribution |
| GET | `/projects/{id}/scores` | ✓ | Get ML scores + imbalance |
| POST | `/projects/{id}/github/sync` | ✓ Admin | Sync GitHub commits |
| GET | `/projects/{id}/report` | ✓ | Download PDF report |

Full interactive docs: [group-tracker-backend.onrender.com/docs](https://group-tracker-backend.onrender.com/docs)

---

## Key Design Decisions

**Why FastAPI over Django?**
FastAPI is async by default which matters for I/O-heavy tasks like calling the GitHub API. It auto-generates Swagger documentation and has Pydantic type safety built in. Django would have been overkill for an API-only backend.

**Why JWT over server-side sessions?**
JWT is stateless — the backend doesn't store session data, making it easier to scale. The tradeoff is tokens can't be revoked until expiry, handled with 60-minute expiry.

**Why SQLite locally → PostgreSQL in production?**
SQLite has zero setup for development. The same SQLAlchemy ORM code works with both — just swap the connection string. This is a common production pattern.

**Why email + username matching for GitHub commits?**
GitHub usernames are globally unique (unlike emails). Supporting both gives maximum flexibility — members who register with their GitHub username get automatic matching without any Git config setup.

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### Backend
```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "DATABASE_URL=sqlite:///./group_tracker.db" > .env
echo "SECRET_KEY=your-secret-key-here" >> .env

uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## Project Structure

```
group-tracker/
├── backend/
│   ├── main.py              # FastAPI app, router registration
│   ├── models.py            # SQLAlchemy database models
│   ├── database.py          # DB connection, session management
│   ├── auth.py              # JWT creation, password hashing
│   ├── scoring.py           # ML scoring model (3 components)
│   ├── github_service.py    # GitHub API client + NLP classifier
│   ├── pdf_generator.py     # ReportLab PDF generation
│   ├── config.py            # Environment variable management
│   └── routers/
│       ├── auth.py          # Register, login endpoints
│       ├── projects.py      # Project CRUD + invite system
│       ├── tasks.py         # Contribution logging
│       ├── scores.py        # ML scoring endpoint
│       ├── github.py        # Commit sync + matching
│       └── reports.py       # PDF export endpoint
│
└── frontend/
    ├── src/
    │   ├── api/axios.js         # Configured Axios instance
    │   ├── context/AuthContext  # Global JWT auth state
    │   ├── pages/
    │   │   ├── Landing.jsx      # Marketing landing page
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx    # Projects overview
    │   │   ├── ProjectDetail.jsx # Tabs: overview, contributions, GitHub
    │   │   └── JoinProject.jsx
    │   └── components/
    │       ├── ScoreCard.jsx    # Member score with breakdown
    │       ├── ScoreChart.jsx   # Bar chart comparison
    │       ├── GitHubSync.jsx   # Repo sync + commit table
    │       ├── CreateProjectModal.jsx
    │       └── JoinProjectModal.jsx
    └── package.json
```

---

## What I'd Build Next

- **GitHub OAuth login** — eliminate email matching friction entirely, same pattern as Linear and Jira
- **Google Docs API integration** — track document edit history for members who contribute through writing
- **Custom weight configuration** — let professors set weights per assignment type
- **Weekly check-in reminders** — automated nudges so contributions are logged consistently
- **Team analytics dashboard** — contribution trends over time, not just totals

---


<div align="center">

Built by **Leena Mahaseth** · [GitHub](https://github.com/leena061)


</div>

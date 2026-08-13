# Assignment & Submission Management System

Role-based school/college web app for creating assignments, collecting student submissions, and grading with marks and feedback.

Built as a recruitment project for **OnnoRokom Projukti Limited** (Assistant Software Engineer). The brief allows a suitable design where details are unspecified; those choices are listed under [Assumptions](#assumptions) and [Design decisions](#design-decisions).

**Live demo**

| Layer | URL |
| --- | --- |
| Frontend | [https://school-management-net-chi.vercel.app](https://school-management-net-chi.vercel.app) |
| API (Render) | Docker Web Service + managed PostgreSQL |
| Swagger (local) | [http://localhost:5000/swagger](http://localhost:5000/swagger) |

---

## Main features

### Admin

- Create, update, and deactivate users (Admin / Teacher / Student).
- Manage classes and subjects.
- Assign teachers to a class + subject pair.
- Enroll students in classes.
- View all assignments and submissions (read-only).
- Toggle application settings (currently `AllowLateSubmissions`).
- Institutional dashboard counts.

### Teacher

- Create, update, and delete assignments for assigned class/subject pairs.
- Set title, description, deadline, and maximum marks.
- Keep an assignment as **Draft** or **Publish** it (and unpublish).
- View student submissions for owned/assigned work.
- Award marks, write feedback, and set status to **Graded** or **Returned**.

### Student

- See published assignments for enrolled classes, including deadline and details.
- Submit a text answer.
- Update a submission before the deadline (and after the deadline only if late work is allowed), unless it is already graded.
- View submission status, marks, and teacher feedback.

### Extra (optional in the brief)

- JWT login and API-enforced RBAC.
- In-app notifications (e.g. after grading).
- Role dashboards, list pagination, and class/subject filters.
- Docker Compose for PostgreSQL, EF Core migrations + seed, SQL backup, Swagger, CI.

---

## Technology stack

| Area | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, TanStack Query, React Hook Form + Zod |
| Backend | ASP.NET Core 10 Web API (C#), FluentValidation, Serilog, Swashbuckle/OpenAPI |
| Database | PostgreSQL 18, Entity Framework Core 10, Npgsql |
| Auth | JWT Bearer + `[Authorize(Roles = ...)]` on the API; BCrypt password hashes |
| Tests | xUnit + FluentAssertions + EF InMemory |
| Local infra | Docker Compose (PostgreSQL, optional pgAdmin) |

---

## Project structure

```text
SchoolManagement(.net)/
├── backend/
│   ├── src/                       # ASP.NET Core Web API host
│   │   ├── Auth/                  # JWT, password hashing, current-user claims
│   │   ├── Controllers/           # REST endpoints
│   │   ├── Data/                  # DbContext, EF configs, migrations, seeder
│   │   ├── Domain/                # Entities, enums, exceptions
│   │   ├── DTOs/
│   │   ├── Middleware/            # Exception handling
│   │   ├── Services/              # Business rules
│   │   ├── Validators/            # FluentValidation
│   │   └── Program.cs             # DI, JWT, CORS, migrate + seed on startup
│   ├── Backend.Tests/             # xUnit business-rule and workflow tests
│   └── Dockerfile
├── frontend/                      # Next.js App Router UI
│   ├── app/                       # Role layouts: /admin, /teacher, /student
│   ├── components/
│   └── lib/                       # API client, auth context, query keys
├── docs/
│   ├── db/seed-backup.sql         # Optional SQL snapshot
│   └── School Management API.postman_collection.json
├── docker-compose.yml             # PostgreSQL (+ pgAdmin profile)
├── .env.example                   # Required environment variables (no secrets)
└── README.md
```

RBAC is enforced on the **backend**. Frontend `RoleGuard` only hides routes; a stolen student token cannot call admin or teacher write endpoints.

---

## Environment configuration

Do not commit a real `.env`. Copy the template:

```bash
cp .env.example .env
```

Required variables (placeholders only):

| Variable | Purpose |
| --- | --- |
| `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Local PostgreSQL |
| `Jwt__Key` | HMAC signing key (min 32 characters) |
| `Jwt__Issuer`, `Jwt__Audience` | JWT validation |
| `FRONTEND_ORIGIN` | CORS origin for the Next.js app |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL |
| `PGADMIN_*` | Optional pgAdmin |

The frontend loads the **repository root** `.env` (see `frontend/next.config.ts`). The API loads the same file in Development.

Production uses `DATABASE_URL` (Render) instead of the `POSTGRES_*` pieces.

---

## Setup instructions

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20 or 22 LTS](https://nodejs.org/)
- [Docker Engine / Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

### 1. Clone and configure

```bash
git clone https://github.com/EpicVibeCoder/SchoolManagement-.net-.git
cd SchoolManagement-.net-
cp .env.example .env
```

### 2. Database

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Optional pgAdmin: `docker compose --profile tools up -d pgadmin` → [http://localhost:5050](http://localhost:5050) (`admin@local.com` / `admin`).

You do **not** create tables by hand. On API startup the host:

1. Applies EF Core migrations (`backend/src/Data/Migrations/`).
2. Seeds demo users, a class, subjects, a draft + published assignment, one submission, and settings (`DbSeeder`).

To apply migrations yourself:

```bash
cd backend
dotnet ef database update --project src/backend.csproj
```

Optional snapshot: [`docs/db/seed-backup.sql`](docs/db/seed-backup.sql).

### 3. Backend

```bash
cd backend
dotnet restore
dotnet watch run --project src/backend.csproj
```

- API: [http://localhost:5000](http://localhost:5000)
- Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger) (Development only)
- Health: `GET` / `HEAD` [http://localhost:5000/api/Health](http://localhost:5000/api/Health)

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

---

## Demo credentials

Seeded on first empty-database startup:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@school.com` | `Admin123!` |
| Teacher | `teacher@school.com` | `Teacher123!` |
| Student | `student1@school.com` | `Student123!` |
| Student (second) | `student2@school.com` | `Student123!` |

These are **demo accounts only**, not production secrets.

Seeded sample data: Grade 10 A, Mathematics (teacher assigned), English, a draft worksheet (hidden from students), a published Linear Equations Quiz, and one submitted answer from Student 1.

---

## Running tests

Backend unit tests cover authorization, draft/publish visibility, duplicate submissions, late-submission policy, and mark bounds:

```bash
dotnet test backend/Backend.Tests/Backend.Tests.csproj --configuration Release
```

Frontend typecheck and lint (no separate frontend unit-test suite):

```bash
cd frontend
npx tsc --noEmit
npm run lint
```

CI (`.github/workflows/ci.yml`) runs the same checks on push/PR.

---

## Role matrix

| Action | Admin | Teacher | Student |
| --- | :---: | :---: | :---: |
| Manage users, classes, subjects, enrollments, teacher assignments | Yes | No | No |
| App settings | Yes | No | No |
| View all assignments / submissions | Yes (read-only) | Own / assigned | Enrolled + published |
| Create / edit / delete / publish assignments | No | Own assignments, assigned class+subject | No |
| Grade and set submission status | No | Own assignments | No |
| Submit / update answers | No | No | Yes |

---

## Design decisions

- **PostgreSQL, not MongoDB.** Classes, enrollments, teacher–subject mappings, and one-submission-per-student are relational; EF Core migrations give the evaluator a schema without manual DDL.
- **Single API host.** Controllers, services, and domain live in one ASP.NET Core project (`backend/src`) so setup is `dotnet watch run`, not a multi-project solution.
- **Subjects are independent of classes.** A subject (e.g. Mathematics) can be taught in many classes. The admin links a teacher to a **class + subject** pair (`TeacherAssignments`).
- **Teachers own what they create.** Another teacher assigned to the same pair can view submissions but cannot edit, delete, publish, or grade someone else’s assignment.
- **Admin does not author or grade work.** Admin configures the school and inspects data; teaching actions stay with teachers, matching a typical college workflow.
- **JWT in `localStorage`.** Simple for an SPA demo; documented as a trade-off under limitations.

---

## Assumptions

The brief leaves some rules unspecified. The implementation assumes:

1. Students enroll in a **class**. They only see **Published** assignments for those classes (drafts are hidden).
2. A teacher may create an assignment only for a class/subject they are assigned to teach.
3. One submission per student per assignment (unique constraint). A second POST is rejected; the student must **update** the existing row.
4. Students may update until the deadline unless status is **Graded** (then locked). After the deadline, create/update is rejected unless Admin sets `AllowLateSubmissions` to `true`, in which case status becomes **Late**.
5. Marks must be between `0` and the assignment’s `MaxMarks`. Grading may set status to **Graded** or **Returned**.
6. Answers are **plain text** (no file upload). Description and answer length are capped in the database.
7. Users are **deactivated**, not hard-deleted, so historical submissions remain.
8. “Change submission status when necessary” means the teacher can mark work **Graded** or **Returned** when grading.
9. In-app notifications are persisted in PostgreSQL. Grading creates a notification for the student. There is no email or WebSocket push.
10. Deadlines are stored as UTC (`DateTimeOffset`). The UI treats the date picker as end-of-day local time when creating assignments.

---

## Known limitations

- No file attachments for assignments or submissions.
- No email, SMS, or realtime (SignalR) notifications; the inbox is poll-based.
- JWT in `localStorage` is convenient for a demo SPA and is vulnerable to XSS compared with httpOnly cookies.
- No refresh tokens, password reset, or self-registration; admins create accounts.
- Health check reports that the process is up; it does not probe PostgreSQL.
- Swagger UI is enabled only in Development.
- Most list screens paginate in the browser; user search uses server-side paging.
- Docker Compose starts the database only, not the API or Next.js app.
- Frontend has typecheck/lint, not a dedicated unit-test project.
- Single-school model (not multi-tenant).
- Publishing an assignment does not currently fan out notifications to every enrolled student (seed data includes one sample “assignment published” row).

---

## API notes

Postman collection: [`docs/School Management API.postman_collection.json`](docs/School%20Management%20API.postman_collection.json)

```http
GET  /api/Health
POST /api/auth/login
GET  /api/auth/me
```

Protected routes send `Authorization: Bearer <token>`. Failed validation returns `400` with FluentValidation details; domain conflicts return `409`; forbidden role/ownership returns `403`.

---

## Deployment (optional)

- Frontend: Vercel (`NEXT_PUBLIC_API_URL` pointing at the API).
- Backend: Render blueprint in [`render.yaml`](render.yaml) using [`backend/Dockerfile`](backend/Dockerfile), `DATABASE_URL`, and `FRONTEND_ORIGIN`.

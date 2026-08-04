# Assignment & Submission Management System

> **Recruitment Project for OnnoRokom — Assistant Software Engineer**  
> **Submission Deadline:** 14 August 2026 · **Portal:** [q-rp.com/c/4CIs](https://q-rp.com/c/4CIs)

---

## 1. Project Overview

The **Assignment & Submission Management System** is a full-stack, enterprise-ready web application built for academic institutions to manage user roles, class/subject assignments, student submissions, and teacher grading workflows with feedback.

Built following a single Web API host architecture in **ASP.NET Core 10** paired with a **Next.js 16** frontend and **PostgreSQL** database, the platform enforces strict API-level Role-Based Access Control (RBAC) across three primary user roles: **Admin**, **Teacher**, and **Student**.

---

## 2. Main Features

### 🔑 Role-Based Access Control (RBAC)
- **JWT Authentication:** Secure Token-based login with claims (`sub`, `email`, `role`).
- **Backend-Enforced Authorization:** API endpoints independently verify JWT tokens and permissions before performing operations.

### 👑 Admin Management (§2 Admin)
- **User Management:** Create, update, deactivate users, and assign roles.
- **Academic Setup:** Full CRUD operations for Classes/Courses and Subjects.
- **Teacher Allocation:** Map teachers to specific Class + Subject combinations (`TeacherAssignment`).
- **Student Enrollment:** Assign students to specific classes.
- **Application Settings:** Configure global settings such as `AllowLateSubmissions`.
- **Overview Dashboards:** Read-only visibility into all assignments and student submissions across the institution.

### 👩‍🏫 Teacher Workspace (§2 Teacher)
- **Assignment CRUD:** Create, update, and delete assignments for assigned class and subject pairs.
- **Draft & Publish:** Keep assignments as drafts or publish them to make them visible to students.
- **Review & Grading:** View student submissions, award marks (`0..MaxMarks`), provide text feedback, and update submission status (`Submitted` → `Graded` / `Returned`).

### 🎓 Student Portal (§2 Student)
- **Class Assignments View:** View published assignments relevant to enrolled classes.
- **Submission Workflow:** Submit text-based responses prior to set deadlines.
- **Submission Updates:** Edit submissions before deadline if not yet graded.
- **Feedback & Marks:** Access earned marks, status changes, and teacher feedback.

### 🚀 Production Quality & Wow Tier (Planned)
- **Docker Compose:** One-command docker orchestration (`postgres`, `api`, `web`).
- **Pagination & Filtering:** Search, role/status/class filters, and deadline sorting across lists.
- **In-App Notifications:** Persisted notifications for published assignments and graded submissions.
- **Health & Logging:** Standardized `/api/Health` endpoint and Serilog request correlation.

---

## 3. Technology Stack

| Component | Technology / Framework | Version / Details |
| --- | --- | --- |
| **Backend API Host** | ASP.NET Core Web API | **.NET 10** (`net10.0` LTS) |
| **Database** | PostgreSQL | **18.2-alpine** (via Docker Compose) |
| **ORM** | Entity Framework Core | **10.x** (Npgsql EF Core Provider) |
| **Validation & Logging** | FluentValidation, Serilog | Latest stable NuGet packages |
| **API Documentation** | OpenAPI / Swagger UI | Integrated ASP.NET Core OpenAPI + Swagger UI |
| **Frontend Framework** | Next.js | **16.x** (App Router, React 19, TypeScript) |
| **Styling & UI** | Tailwind CSS | Modern, responsive CSS design |
| **Forms & Schemas** | React Hook Form + Zod | Schema-based form validation |
| **Automated Testing** | xUnit | Sibling test project (`tests/Backend.Tests`) |

---

## 4. Project Structure

The project is organized as a clean monorepo with a single Web API host in `backend/` and Next.js SPA in `frontend/`:

```text
SchoolManagement(.net)/
├── .cursor/plans/              # Build plan & architecture specifications
├── docs/                       # Database backup & documentation resources
├── frontend/                   # Next.js 16 App Router application
│   ├── app/                    # Routes, layouts, and role dashboards
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── backend/                    # Single ASP.NET Core 10 API Host
│   ├── backend.csproj          # Single runnable API project
│   ├── Program.cs              # Application bootstrapper & configuration
│   ├── Controllers/            # Thin REST HTTP controllers
│   ├── Domain/                 # Domain entities & enums
│   ├── Services/               # Use-case business logic
│   ├── DTOs/                   # Request/Response contracts
│   ├── Data/                   # DbContext, EF configurations & migrations
│   └── appsettings.json
├── docker-compose.yml          # Infrastructure containerization
├── .env.example                # Monorepo environment configuration template
└── README.md                   # Evaluator & developer documentation
```

---

## 5. Current Project Status

| Phase | Description | Status |
| --- | --- | --- |
| **Phase 0** | Single API host scaffold (.NET 10), Next.js 16 app init, `/api/Health` endpoint, Docker Compose PostgreSQL setup, `.env.example` setup | ✅ **Completed** |
| **Phase 1** | Domain entities, EF Core DbContext, PostgreSQL migrations, Seed data script & SQL backup | ⏳ *In Progress / Next* |
| **Phase 2** | JWT Authentication, API-enforced RBAC policies, Frontend route guards | 📅 Planned |
| **Phase 3** | Admin role surface (Users, Classes, Subjects, Teacher Allocation, Settings) | 📅 Planned |
| **Phase 4** | Teacher assignment management (CRUD, Draft/Publish, Class/Subject scoping) | 📅 Planned |
| **Phase 5** | Student submission workflow (View, Submit, Update before deadline) | 📅 Planned |
| **Phase 6** | Teacher grading workflow (Marks, Feedback, Submission status transitions) | 📅 Planned |
| **Phase 7** | Quality bar & Wow tier (Pagination, Filters, Notifications, Docker Compose complete) | 📅 Planned |
| **Phase 8** | Automated xUnit testing (Business rules, RBAC authorization, submission workflows) | 📅 Planned |
| **Phase 9** | Submission packaging, documentation polish, final checklist verification | 📅 Planned |

---

## 6. Setup & Running Instructions

### Prerequisites
- **.NET 10 SDK** (Verify with `dotnet --version`)
- **Node.js Active LTS** (v20+ / v22+) & `npm`
- **Docker & Docker Compose** (for PostgreSQL instance)

### Step 1: Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

### Step 2: Database Setup (Docker)
Start the PostgreSQL container:
```bash
docker compose up -d postgres
```

### Step 3: Run Backend Web API
Navigate to `backend/` and start the ASP.NET Core host:
```bash
cd backend
dotnet watch run
```
- **API Base URL:** `http://localhost:5000` (or configured HTTPS port)
- **Health Check Endpoint:** `http://localhost:5000/api/Health`
- **Swagger Documentation:** `http://localhost:5000/swagger`

### Step 4: Run Frontend Web Application
In a separate terminal window, navigate to `frontend/` and run the development server:
```bash
cd frontend
npm run dev
```
- **Web Application URL:** `http://localhost:3000`

### Step 5: Database Migrations (Phase 1+)
To apply Entity Framework Core migrations to the PostgreSQL database:
```bash
cd backend
dotnet ef database update
```

### Step 6: Running Automated Tests (Phase 8+)
To run the xUnit test suite:
```bash
dotnet test
```

---

## 7. Business Rules & Documented Assumptions

1. **Enrollment Model:** Students belong to a specific **Class**; they can view published assignments for their enrolled class only.
2. **Teacher Assignment Scoping:** Teachers can only create assignments for Class + Subject pairs to which they are assigned via `TeacherAssignment`.
3. **Draft Visibility:** Draft assignments are strictly hidden from students; only `Published` assignments appear in student views.
4. **Submission Uniqueness:** A student may submit only one response per assignment (enforced by a database unique index).
5. **Submission Updates:** Students may update their submission prior to the deadline, provided the status is not already `Graded`.
6. **Late Submissions:** Submissions past the deadline are rejected unless global `AllowLateSubmissions` setting is enabled by Admin (which marks the submission as `Late`).
7. **Grading Bounds:** Marks must fall within `0..MaxMarks`. Submitting marks changes submission status to `Graded`.
8. **JWT Storage:** Tokens are stored in `localStorage` for SPA simplicity.
9. **Text Answers:** Submissions consist of formatted text responses (file attachment uploads are out of scope).
10. **Deletion Protection:** Assignments with existing `Graded` submissions cannot be deleted.

---

## 8. Known Limitations

- **Text-Only Submissions:** File upload attachments are not included, adhering to brief scope.
- **Single-Tenant Architecture:** Designed for a single school/institution instance.
- **Persisted Notifications:** Notifications use DB storage and polling rather than WebSocket connections.

---

## 9. Demo Credentials

*(Demo credentials will be active following Phase 1 database seeding)*

| Role | Email | Password | Scope & Permissions |
| --- | --- | --- | --- |
| **Admin** | `admin@school.com` | `Admin123!` | Full administrative access across all modules |
| **Teacher** | `teacher@school.com` | `Teacher123!` | Manage assignments and grade submissions for assigned subjects |
| **Student** | `student1@school.com` | `Student123!` | View enrolled assignments, submit responses, track feedback |
| **Student** | `student2@school.com` | `Student123!` | View enrolled assignments, submit responses, track feedback |

---

## 10. Submission Checklist (§5 Compliance)

- [x] Mono-repository structure containing frontend and backend
- [x] Single API host backend architecture (.NET 10 Web API)
- [x] Next.js 16 frontend app initialized
- [x] Environment configuration template (`.env.example`) provided
- [x] Docker Compose setup for PostgreSQL instance
- [x] Health check endpoint (`GET /api/Health`) operational
- [ ] EF Core migrations and initial seed data (Phase 1)
- [ ] API-enforced Role-Based Access Control (Phase 2)
- [ ] Admin, Teacher, and Student features implemented (Phases 3–6)
- [ ] xUnit test suite for business rules and RBAC (Phase 8)
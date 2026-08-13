<div align="center">

# 🎓 School Management System

### _An enterprise-grade, high-performance Academic & Assignment Management Platform_

[![.NET 10.0](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TanStack Query v5](https://img.shields.io/badge/TanStack_Query-5.101-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-18.2-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![CI Status](https://github.com/EpicVibeCoder/SchoolManagement-.net-/actions/workflows/ci.yml/badge.svg)](https://github.com/EpicVibeCoder/SchoolManagement-.net-/actions/workflows/ci.yml)

---

[Live Demo](#-live-demo) • [Architecture & Design](#-architecture--design) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Testing & Quality](#-testing--quality) • [Database & Migrations](#-database--migrations) • [Demo Credentials](#-demo-credentials) • [API & Health](#-api--health-monitoring) • [Deployment](#-deployment-guide)

---

</div>

## 📌 Executive Summary

The **School Management System** is a production-ready, full-stack monorepo web application engineered for educational institutions to manage user roles, academic structures (classes and subjects), teacher assignments, student enrollments, course assignment submissions, and automated/manual grading workflows.

Built around a modern **ASP.NET Core 10 Web API host** and a **Next.js 16 App Router SPA** with **TanStack React Query**, the platform features strict server-side **Role-Based Access Control (RBAC)** across three primary user personas: **Admin**, **Teacher**, and **Student**.

---

## 🌐 Live Demo

**App:** [https://school-management-net-chi.vercel.app](https://school-management-net-chi.vercel.app)

Use the [demo credentials](#-demo-credentials) to sign in.

---

## 🏗️ Architecture & Design

The repository is a monorepo: one ASP.NET Core 10 Web API, one Next.js 16 App Router SPA, and a shared root `.env` used by Docker Compose, the API (Development), and Next.js.

```text
SchoolManagement(.net)/
├── .github/workflows/
│   ├── ci.yml                     # dotnet test, tsc --noEmit, Next.js lint
│   └── deploy-backend.yml         # Render deploy trigger on main/master
├── backend/
│   ├── Backend.Tests/             # xUnit + FluentAssertions (EF InMemory)
│   │   ├── BusinessRulesTests.cs
│   │   └── Backend.Tests.csproj
│   ├── src/                       # ASP.NET Core 10 Web API host
│   │   ├── Auth/                  # JWT, BCrypt hasher, CurrentUser claims
│   │   ├── Controllers/           # Auth, Users, Classes, Subjects, TeacherAssignments,
│   │   │                          # Enrollments, Assignments, Submissions, Settings,
│   │   │                          # Dashboard, Notifications, Health
│   │   ├── Data/
│   │   │   ├── Configurations/    # EF Core entity configurations
│   │   │   ├── Migrations/        # EF Core migrations
│   │   │   ├── AppDbContext.cs
│   │   │   └── DbSeeder.cs        # Demo users, class, subjects, assignments
│   │   ├── Domain/
│   │   │   ├── Entities/
│   │   │   ├── Enums/             # UserRole, AssignmentStatus, SubmissionStatus
│   │   │   └── Exceptions/
│   │   ├── DTOs/                  # Request/response contracts
│   │   ├── Middleware/            # Exception handling
│   │   ├── Properties/
│   │   │   └── launchSettings.json  # http://localhost:5000
│   │   ├── Services/              # Business / use-case services
│   │   ├── Validators/            # FluentValidation rules
│   │   ├── Program.cs             # DI, JWT, CORS; migrate + seed on startup
│   │   ├── appsettings.json
│   │   └── backend.csproj
│   ├── Dockerfile                 # Multi-stage .NET 10 Alpine image
│   └── SchoolManagement.slnx
├── frontend/                      # Next.js 16 App Router SPA
│   ├── app/
│   │   ├── login/
│   │   ├── notifications/
│   │   ├── admin/                 # users, classes, subjects, enrollments,
│   │   │                          # teacher-assignments, settings, assignments
│   │   ├── teacher/               # dashboard + assignments
│   │   └── student/               # dashboard + assignments
│   ├── components/                # AppShell, RoleGuard, QueryProvider, etc.
│   ├── lib/                       # API client, auth context, query keys
│   ├── next.config.ts             # Loads repo-root .env for NEXT_PUBLIC_*
│   └── package.json
├── docs/
│   ├── db/seed-backup.sql
│   ├── School Management API.postman_collection.json
│   └── SchoolSchema.png
├── docker-compose.yml             # PostgreSQL 18.2 + optional pgAdmin 9
├── render.yaml
├── .csharpierrc.json
├── .prettierrc
├── .env.example                   # Shared env for Docker, API, and Next.js
└── README.md
```

### Key Architectural Highlights

- **Consolidated API Host Architecture:** A single ASP.NET Core 10 Web API project serving all RESTful endpoints, minimizing cross-service deployment complexity and latency.
- **Layered Clean Architecture:** Strict separation between Controller (HTTP routing), Service (Business Logic & Constraints), Data (EF Core persistence & Npgsql provider), and Domain (Entities & Business Rules).
- **Client-Side State & Caching:** Powered by **TanStack React Query (v5)** on the Next.js client for reactive data fetching, automatic cache invalidation, loading states, and optimistic UI updates.
- **Stateless JWT Authentication:** Secure JSON Web Tokens carrying user claims (`sub`, `email`, `role`), validated server-side using ASP.NET Core JWT Bearer authentication and `[Authorize(Roles = ...)]` policies.
- **Declarative Input Validation:** Dual-layer validation enforced via **FluentValidation** on the backend API and **Zod + React Hook Form** on the frontend UI.
- **Structured Serilog Logging & Correlation:** HTTP request logging with correlation IDs and JSON output formatted via Serilog console sinks.

---

## ⚡ Tech Stack

| Domain                      | Technology                       | Version              | Description & Role                                      |
| :-------------------------- | :------------------------------- | :------------------- | :------------------------------------------------------ |
| **Backend Framework**       | ASP.NET Core Web API             | `.NET 10.0`          | High-throughput REST API Web Host                       |
| **Database**                | PostgreSQL                       | `18.2-alpine`        | Relational database container via Docker Compose        |
| **ORM**                     | Entity Framework Core            | `10.0.10`            | ORM persistence & Npgsql PostgreSQL provider (`10.0.3`) |
| **Backend Validation**      | FluentValidation                 | `12.1.1`             | Request contract validation rules                       |
| **Backend Security**        | BCrypt.Net-Next & JwtBearer      | `4.2.0` / `10.0.10`  | Password hashing & JWT token authorization              |
| **Backend Logging**         | Serilog                          | `10.0.0`             | Structured JSON request logging & correlation           |
| **API Documentation**       | OpenAPI & Swashbuckle Swagger UI | `10.0.10` / `10.2.3` | Interactive Swagger API documentation UI                |
| **Frontend Framework**      | Next.js (App Router)             | `16.3.0`             | React server/client components & SPA dashboards         |
| **Data Fetching & Caching** | TanStack React Query             | `5.101.4`            | Server state management, caching & query provider       |
| **UI Library & Styling**    | React 19 & Tailwind CSS          | `19.2.8` / `4.0`     | Modern responsive component rendering & styles          |
| **Frontend Forms**          | React Hook Form & Zod            | `7.84.0` / `4.4.3`   | Schema-validated client forms                           |
| **Testing Framework**       | xUnit & FluentAssertions         | `2.9.3` / `8.10.0`   | Backend unit & business-rule test suite                 |
| **Formatting & Linting**    | CSharpier, Prettier, ESLint      | Latest               | Code formatting & static code analysis                  |
| **Containerization**        | Docker & Docker Compose          | `v2+`                | Multi-container development & production runtime        |

---

## 🔒 Role-Based Access Control (RBAC) Matrix

The system enforces granular authorization rules to restrict operations by user role:

| Feature / Action                                            | Admin |      Teacher       | Student |
| :---------------------------------------------------------- | :---: | :----------------: | :-----: |
| **Manage Users (Create/Update/Deactivate)**                 |  ✅   |         ❌         |   ❌    |
| **Manage Classes & Subjects**                               |  ✅   |         ❌         |   ❌    |
| **Assign Teachers to Subject & Class**                      |  ✅   |         ❌         |   ❌    |
| **Enroll Students in Class**                                |  ✅   |         ❌         |   ❌    |
| **Configure System Settings (e.g. Allow Late Submissions)** |  ✅   |         ❌         |   ❌    |
| **View Institutional Dashboards & Statistics**              |  ✅   |         ❌         |   ❌    |
| **Create / Edit / Delete Assignments**                      |  ❌   | ✅ (Assigned only) |   ❌    |
| **Publish / Unpublish Assignments**                         |  ❌   | ✅ (Assigned only) |   ❌    |
| **Grade Submissions & Provide Feedback**                    |  ❌   | ✅ (Assigned only) |   ❌    |
| **View Enrolled Class Assignments**                         |  ❌   |         ❌         |   ✅    |
| **Submit & Edit Assignment Responses**                      |  ❌   |         ❌         |   ✅    |
| **View Received Grades & Teacher Feedback**                 |  ❌   |         ❌         |   ✅    |
| **Access In-App Notifications**                             |  ✅   |         ✅         |   ✅    |

---

## 🚀 Quick Start

Follow these steps to run the API, database, and UI locally. One root `.env` file is shared by Docker Compose, the ASP.NET API (Development), and Next.js.

### Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) (`dotnet --version`)
- [Node.js 22 LTS](https://nodejs.org/) (20+ is fine) and `npm`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with Compose v2

---

### Step 1: Clone and create `.env`

```bash
git clone https://github.com/EpicVibeCoder/SchoolManagement-.net-.git
cd SchoolManagement-.net-

cp .env.example .env
```

The API **requires** this file in Development (it walks up from `backend/src` to the repo root). Next.js loads the same file via `frontend/next.config.ts`. Docker Compose reads `POSTGRES_*` and `PGADMIN_*` from it. Defaults in `.env.example` work as-is for local use.

---

### Step 2: Start PostgreSQL

From the **repository root**:

```bash
docker compose up -d --wait postgres
```

`--wait` blocks until the container health check passes (`pg_isready`).

Optional pgAdmin (`dpage/pgadmin4:9`):

```bash
docker compose --profile tools up -d pgadmin
```

- **pgAdmin:** `http://localhost:5050` — `admin@local.com` / `admin` (from `.env`)

---

### Step 3: Start the API

In a terminal:

```bash
cd backend/src
dotnet restore
dotnet watch run
```

Equivalent from `backend/`:

```bash
cd backend
dotnet watch run --project src/backend.csproj
```

The `http` launch profile binds to **port 5000**. On startup the host applies EF Core migrations and runs `DbSeeder` (demo users are inserted only when `Users` is empty).

- **API:** `http://localhost:5000`
- **Swagger (Development only):** `http://localhost:5000/swagger`
- **Health (GET/HEAD):** `http://localhost:5000/api/health`

```json
{ "status": "ok", "message": "API is running" }
```

---

### Step 4: Start the frontend

In a **second** terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

- **App:** `http://localhost:3000` (redirects to `/login` or the role home)
- API base URL: `NEXT_PUBLIC_API_URL` in the root `.env` (`http://localhost:5000`)

Log in with the [demo credentials](#-demo-credentials).

---

## 🧪 Testing & Quality

### Run Backend Unit & Business Rule Tests

The solution includes an **xUnit** test suite utilizing **FluentAssertions** and EF Core's InMemory provider to validate business rules, duplicate detection, and RBAC security logic.

```bash
# Run backend test suite from repository root
dotnet test backend/Backend.Tests/Backend.Tests.csproj --configuration Release
```

### Run Frontend Typecheck & Linting

```bash
cd frontend
npx tsc --noEmit
npm run lint
```

### Code Formatting

```bash
# Format C# files using CSharpier
dotnet csharpier .

# Format Frontend files using Prettier
cd frontend
npx prettier --write .
```

---

## 💾 Database & Migrations

### Entity Relationship Model

The PostgreSQL database enforces relational integrity across core domain entities:

- **`Users`**: System users (Admin, Teacher, Student) with hashed passwords (`BCrypt`).
- **`Classes` & `Subjects`**: Academic structures (e.g., _Grade 10 A_, _Mathematics_, _English_).
- **`TeacherAssignments`**: Composite mapping linking Teacher, Class, and Subject.
- **`Enrollments`**: Mapping linking Student to Class.
- **`Assignments`**: Worksheets and quizzes created by teachers with `Draft`/`Published` status and deadline constraints.
- **`Submissions`**: Student answers with `Marks`, `Feedback`, and `Status` (`Submitted`, `Late`, `Graded`, `Returned`).
- **`Notifications`**: Real-time persisted user notification alerts (e.g. assignment published, submission graded).
- **`AppSettings`**: Global institutional configuration flags (e.g., `AllowLateSubmissions`).

### EF Core Migration Commands

To manage Entity Framework Core migrations:

```bash
cd backend

# Add a new migration
dotnet ef migrations add <MigrationName> --project src/backend.csproj

# Apply pending migrations to PostgreSQL database
dotnet ef database update --project src/backend.csproj
```

### SQL Seed Backup

A pre-populated database snapshot is maintained at [`docs/db/seed-backup.sql`](<file:///home/ash/githubRepos/SchoolManagement(.net)/docs/db/seed-backup.sql>).

---

## 🔑 Demo Credentials

Use the pre-seeded credentials below to explore the application across different access levels:

| Role          | Email                 | Password      | Scope & Description                                   |
| :------------ | :-------------------- | :------------ | :---------------------------------------------------- |
| **Admin**     | `admin@school.com`    | `Admin123!`   | Full administrative control across all system modules |
| **Teacher**   | `teacher@school.com`  | `Teacher123!` | Can create/manage assignments & grade student work    |
| **Student 1** | `student1@school.com` | `Student123!` | Enrolled student persona for submitting assignments   |
| **Student 2** | `student2@school.com` | `Student123!` | Secondary enrolled student persona                    |

---

## 📡 API & Health Monitoring

### Health Check Endpoint

Supports both `GET` and `HEAD` requests for cloud health probes and load balancer monitoring:

```http
GET /api/health
HEAD /api/health
```

**Response (200 OK):**

```json
{
      "status": "ok",
      "message": "API is running"
}
```

### OpenAPI / Swagger Documentation

Interactive OpenAPI documentation is dynamically served:

- **Swagger UI (Development):** `http://localhost:5000/swagger`
- **Postman Collection:** [`docs/School Management API.postman_collection.json`](<file:///home/ash/githubRepos/SchoolManagement(.net)/docs/School%20Management%20API.postman_collection.json>)

---

## ☁️ Deployment Guide

### Live Production Deployments

- **Frontend SPA (Vercel):** [https://school-management-net-chi.vercel.app](https://school-management-net-chi.vercel.app)
- **Backend API (Render):** Managed Docker Web Service on Render paired with a managed PostgreSQL database instance.

### Deploying Backend to Render (Blueprint)

The repository includes a production blueprint spec in [`render.yaml`](<file:///home/ash/githubRepos/SchoolManagement(.net)/render.yaml>):

1. Push repository updates to **GitHub**.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Create a **New Blueprint** connecting this repository.
4. Render automatically builds the `.NET 10 API` via [`backend/Dockerfile`](<file:///home/ash/githubRepos/SchoolManagement(.net)/backend/Dockerfile>) and provisions a PostgreSQL database instance with `DATABASE_URL` and `FRONTEND_ORIGIN`.

### Automated CI/CD (GitHub Actions)

The repository runs two GitHub Actions workflows:

1. [`.github/workflows/ci.yml`](<file:///home/ash/githubRepos/SchoolManagement(.net)/.github/workflows/ci.yml>): Executes `dotnet test`, TypeScript type checking (`tsc --noEmit`), and Next.js linting on every push and pull request.
2. [`.github/workflows/deploy-backend.yml`](<file:///home/ash/githubRepos/SchoolManagement(.net)/.github/workflows/deploy-backend.yml>): Triggers automated backend deployment to Render upon pushing to `main` or `master`.

---

## 📄 License

This repository is licensed under the **MIT License**.

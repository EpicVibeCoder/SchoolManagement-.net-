<div align="center">

# 🎓 School Management System

### *An enterprise-grade, high-performance Academic & Assignment Management Platform*

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

[Architecture & Design](#-architecture--design) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Testing & Quality](#-testing--quality) • [Database & Migrations](#-database--migrations) • [Demo Credentials](#-demo-credentials) • [API & Health](#-api--health-monitoring) • [Deployment](#-deployment-guide)

---

</div>

## 📌 Executive Summary

The **School Management System** is a production-ready, full-stack monorepo web application engineered for educational institutions to manage user roles, academic structures (classes and subjects), teacher assignments, student enrollments, course assignment submissions, and automated/manual grading workflows.

Built around a modern **ASP.NET Core 10 Web API host** and a **Next.js 16 App Router SPA** with **TanStack React Query**, the platform features strict server-side **Role-Based Access Control (RBAC)** across three primary user personas: **Admin**, **Teacher**, and **Student**.

---

## 🏗️ Architecture & Design

The repository is structured as a clean monorepo separating server-side Web API concerns from client-side UI workflows while sharing environment configurations and Docker orchestration services.

```text
SchoolManagement(.net)/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated unit tests, TypeScript check & frontend linting
│       └── deploy-backend.yml     # Production Render deployment trigger pipeline
├── backend/                       # ASP.NET Core 10 Web API Solution
│   ├── Backend.Tests/             # xUnit test suite (Business rules & RBAC validation)
│   │   ├── BusinessRulesTests.cs
│   │   └── Backend.Tests.csproj
│   ├── src/                       # Single Web API Host executable project
│   │   ├── Auth/                  # JWT Token Service, BCrypt Hasher & Claims Handler
│   │   ├── Controllers/           # REST HTTP Controllers (Users, Classes, Subjects, Assignments, Submissions, Health, etc.)
│   │   ├── Data/                  # DbDbContext, EF Core Configurations, Migrations & DbSeeder
│   │   ├── Domain/                # Entities, Enums (UserRole, AssignmentStatus, SubmissionStatus), and Exceptions
│   │   ├── DTOs/                  # Request/Response Data Transfer Contracts
│   │   ├── Middleware/            # Exception Handling & Correlation Log Middlewares
│   │   ├── Services/              # Core Business Domain Logic & Use-Case Services
│   │   ├── Validators/            # FluentValidation Input Rules
│   │   ├── Program.cs             # Application Entry Point & DI Container Setup
│   │   └── backend.csproj
│   ├── Dockerfile                 # Multi-stage production container build manifest
│   └── SchoolManagement.slnx      # .NET Solution file
├── frontend/                      # Next.js 16 App Router Single Page Application
│   ├── app/                       # Dashboard layouts, role-guarded pages & routes (admin, teacher, student)
│   ├── components/                # Reusable UI component library (AppShell, RoleGuard, Badge, QueryProvider)
│   ├── lib/                       # API HTTP client, TanStack Query keys, auth context & formatters
│   ├── package.json               # Node.js dependencies & execution scripts
│   └── tsconfig.json              # Strict TypeScript configuration
├── docs/                          # API Postman collections, DB SQL backups & specs
│   ├── db/
│   │   └── seed-backup.sql        # Pre-seeded database state SQL dump
│   ├── School Management API.postman_collection.json
│   └── SchoolSchema.png           # Database ER diagram
├── docker-compose.yml             # Infrastructure orchestration (PostgreSQL 18 & pgAdmin 4)
├── render.yaml                    # Cloud deployment blueprint spec for Render
├── .csharpierrc.json              # Backend CSharpier code formatting configuration
├── .prettierrc                    # Frontend Prettier formatting configuration
├── .env.example                   # Shared environment configuration template
└── README.md                      # System documentation
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

| Domain | Technology | Version | Description & Role |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | ASP.NET Core Web API | `.NET 10.0` | High-throughput REST API Web Host |
| **Database** | PostgreSQL | `18.2-alpine` | Relational database container via Docker Compose |
| **ORM** | Entity Framework Core | `10.0.10` | ORM persistence & Npgsql PostgreSQL provider (`10.0.3`) |
| **Backend Validation** | FluentValidation | `12.1.1` | Request contract validation rules |
| **Backend Security** | BCrypt.Net-Next & JwtBearer | `4.2.0` / `10.0.10` | Password hashing & JWT token authorization |
| **Backend Logging** | Serilog | `10.0.0` | Structured JSON request logging & correlation |
| **API Documentation** | OpenAPI & Swashbuckle Swagger UI | `10.0.10` / `10.2.3` | Interactive Swagger API documentation UI |
| **Frontend Framework**| Next.js (App Router) | `16.3.0` | React server/client components & SPA dashboards |
| **Data Fetching & Caching** | TanStack React Query | `5.101.4` | Server state management, caching & query provider |
| **UI Library & Styling** | React 19 & Tailwind CSS | `19.2.8` / `4.0` | Modern responsive component rendering & styles |
| **Frontend Forms** | React Hook Form & Zod | `7.84.0` / `4.4.3` | Schema-validated client forms |
| **Testing Framework** | xUnit & FluentAssertions | `2.9.3` / `8.10.0` | Backend unit & business-rule test suite |
| **Formatting & Linting**| CSharpier, Prettier, ESLint | Latest | Code formatting & static code analysis |
| **Containerization** | Docker & Docker Compose | `v2+` | Multi-container development & production runtime |

---

## 🔒 Role-Based Access Control (RBAC) Matrix

The system enforces granular authorization rules to restrict operations by user role:

| Feature / Action | Admin | Teacher | Student |
| :--- | :---: | :---: | :---: |
| **Manage Users (Create/Update/Deactivate)** | ✅ | ❌ | ❌ |
| **Manage Classes & Subjects** | ✅ | ❌ | ❌ |
| **Assign Teachers to Subject & Class** | ✅ | ❌ | ❌ |
| **Enroll Students in Class** | ✅ | ❌ | ❌ |
| **Configure System Settings (e.g. Allow Late Submissions)** | ✅ | ❌ | ❌ |
| **View Institutional Dashboards & Statistics** | ✅ | ❌ | ❌ |
| **Create / Edit / Delete Assignments** | ❌ | ✅ (Assigned only) | ❌ |
| **Publish / Unpublish Assignments** | ❌ | ✅ (Assigned only) | ❌ |
| **Grade Submissions & Provide Feedback** | ❌ | ✅ (Assigned only) | ❌ |
| **View Enrolled Class Assignments** | ❌ | ❌ | ✅ |
| **Submit & Edit Assignment Responses** | ❌ | ❌ | ✅ |
| **View Received Grades & Teacher Feedback** | ❌ | ❌ | ✅ |
| **Access In-App Notifications** | ✅ | ✅ | ✅ |

---

## 🚀 Quick Start

Follow these steps to run the complete solution locally.

### Prerequisites

Ensure you have installed:
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) (`dotnet --version`)
- [Node.js (v20 or v22 LTS)](https://nodejs.org/) & `npm` (`node --version`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with Docker Compose

---

### Step 1: Clone Repository & Setup Environment

```bash
# 1. Clone the repository
git clone https://github.com/EpicVibeCoder/SchoolManagement-.net-.git
cd SchoolManagement-.net-

# 2. Copy the environment configuration template
cp .env.example .env
```

---

### Step 2: Spin Up Database Infrastructure

Start PostgreSQL container in background:

```bash
docker compose up -d postgres
```

*(Optional)* Start `pgAdmin4` for database management:

```bash
docker compose --profile tools up -d pgadmin
```
- **pgAdmin URL:** `http://localhost:5050` (Login: `admin@local.com` / `admin`)

---

### Step 3: Run Backend Web API

Navigate to the `backend/` directory and execute:

```bash
cd backend
dotnet restore
dotnet watch run --project src/backend.csproj
```

- **API Base URL:** `http://localhost:5000`
- **Swagger Documentation:** `http://localhost:5000/swagger`
- **Health Check (GET/HEAD):** `http://localhost:5000/api/Health`

*Note: Database migrations and initial seed data apply automatically on backend startup via `DbSeeder`.*

---

### Step 4: Run Frontend Application

In a new terminal window, navigate to the `frontend/` directory and run:

```bash
cd frontend
npm install
npm run dev
```

- **Web Application URL:** `http://localhost:3000`

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
- **`Classes` & `Subjects`**: Academic structures (e.g., *Grade 10 A*, *Mathematics*, *English*).
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

A pre-populated database snapshot is maintained at [`docs/db/seed-backup.sql`](file:///home/ash/githubRepos/SchoolManagement(.net)/docs/db/seed-backup.sql).

---

## 🔑 Demo Credentials

Use the pre-seeded credentials below to explore the application across different access levels:

| Role | Email | Password | Scope & Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `Admin123!` | Full administrative control across all system modules |
| **Teacher** | `teacher@school.com` | `Teacher123!` | Can create/manage assignments & grade student work |
| **Student 1** | `student1@school.com` | `Student123!` | Enrolled student persona for submitting assignments |
| **Student 2** | `student2@school.com` | `Student123!` | Secondary enrolled student persona |

---

## 📡 API & Health Monitoring

### Health Check Endpoint

Supports both `GET` and `HEAD` requests for cloud health probes and load balancer monitoring:

```http
GET /api/Health
HEAD /api/Health
```

**Response (200 OK):**
```json
{
  "status": "Healthy",
  "timestamp": "2026-08-11T22:00:00Z",
  "database": "Connected"
}
```

### OpenAPI / Swagger Documentation

Interactive OpenAPI documentation is dynamically served:
- **Swagger UI:** `http://localhost:5000/swagger`
- **Postman Collection:** [`docs/School Management API.postman_collection.json`](file:///home/ash/githubRepos/SchoolManagement(.net)/docs/School%20Management%20API.postman_collection.json)

---

## ☁️ Deployment Guide

### Live Production Deployments

- **Frontend SPA (Vercel):** [https://school-management-net-chi.vercel.app](https://school-management-net-chi.vercel.app)
- **Backend API (Render):** Managed Docker Web Service on Render paired with a managed PostgreSQL database instance.

### Deploying Backend to Render (Blueprint)

The repository includes a production blueprint spec in [`render.yaml`](file:///home/ash/githubRepos/SchoolManagement(.net)/render.yaml):

1. Push repository updates to **GitHub**.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Create a **New Blueprint** connecting this repository.
4. Render automatically builds the `.NET 10 API` via [`backend/Dockerfile`](file:///home/ash/githubRepos/SchoolManagement(.net)/backend/Dockerfile) and provisions a PostgreSQL database instance with `DATABASE_URL` and `FRONTEND_ORIGIN`.

### Automated CI/CD (GitHub Actions)

The repository runs two GitHub Actions workflows:
1. [`.github/workflows/ci.yml`](file:///home/ash/githubRepos/SchoolManagement(.net)/.github/workflows/ci.yml): Executes `dotnet test`, TypeScript type checking (`tsc --noEmit`), and Next.js linting on every push and pull request.
2. [`.github/workflows/deploy-backend.yml`](file:///home/ash/githubRepos/SchoolManagement(.net)/.github/workflows/deploy-backend.yml): Triggers automated backend deployment to Render upon pushing to `main` or `master`.

---

## 📄 License

This repository is licensed under the **MIT License**.


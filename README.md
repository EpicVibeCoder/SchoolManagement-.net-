<div align="center">

# 🎓 School Management System

### *An enterprise-grade, high-performance Academic & Assignment Management Platform*

[![.NET 10.0](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-18.2-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

---

[Architecture & Design](#-architecture--design) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Testing](#-testing) • [Database & Migrations](#-database--migrations) • [Demo Credentials](#-demo-credentials) • [API & Health](#-api--health-monitoring) • [Deployment](#-deployment-guide)

---

</div>

## 📌 Executive Summary

The **School Management System** is a production-ready, full-stack monorepo web application engineered for educational institutions to manage user roles, academic structures (classes and subjects), teacher assignments, student course submissions, and automated/manual grading workflows.

Built around a modern **single ASP.NET Core 10 Web API host** and a **Next.js 16 App Router SPA**, the platform features strict server-side **Role-Based Access Control (RBAC)** across three primary user personas: **Admin**, **Teacher**, and **Student**.

---

## 🏗️ Architecture & Design

The repository is structured as a clean monorepo separating server-side Web API concerns from client-side UI workflows while sharing environment configurations and Docker orchestration services.

```text
SchoolManagement(.net)/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated unit tests & frontend lint/typecheck
│       └── deploy-backend.yml     # Production Render deployment trigger pipeline
├── backend/                       # ASP.NET Core 10 Web API Solution
│   ├── Backend.Tests/             # xUnit test suite (Business rules & RBAC validation)
│   │   ├── BusinessRulesTests.cs
│   │   └── Backend.Tests.csproj
│   ├── src/                       # Single Web API Host executable project
│   │   ├── Auth/                  # JWT Token Service & Claims Handler
│   │   ├── Controllers/           # Thin REST HTTP API Controllers
│   │   ├── Data/                  # DbContext, EF Core Configurations & Migrations
│   │   ├── Domain/                # Domain Entities, Enums, and Value Objects
│   │   ├── DTOs/                  # Request/Response Data Transfer Contracts
│   │   ├── Middleware/            # Exception Handling & Correlation Log Middlewares
│   │   ├── Services/              # Business Domain Logic & Use-Case Services
│   │   ├── Validators/            # FluentValidation Input Rules
│   │   ├── Program.cs             # Application Entry Point & DI Container Setup
│   │   └── backend.csproj
│   ├── Dockerfile                 # Multi-stage production container build manifest
│   └── SchoolManagement.slnx      # .NET Solution file
├── frontend/                      # Next.js 16 App Router Single Page Application
│   ├── app/                       # Dashboard layouts, role-guarded pages & routes
│   ├── components/                # Reusable UI component library (Tailwind v4)
│   ├── lib/                       # API HTTP client, auth helpers & state utilities
│   ├── package.json               # Node.js dependencies & execution scripts
│   └── tsconfig.json              # Strict TypeScript configuration
├── docs/                          # API Postman collections, DB SQL backups & specs
│   ├── db/
│   │   └── seed-backup.sql        # Pre-seeded database state SQL dump
│   ├── School Management API.postman_collection.json
│   └── SchoolSchema.png           # Database ER diagram
├── docker-compose.yml             # Infrastructure orchestration (PostgreSQL & pgAdmin)
├── render.yaml                    # Cloud deployment blueprint spec for Render
├── .env.example                   # Shared environment configuration template
└── README.md                      # System documentation
```

### Key Architectural Highlights

- **Single API Host Architecture:** A consolidated ASP.NET Core 10 Web API project serving all RESTful endpoints, minimizing deployment complexity and cross-service overhead.
- **Layered Clean Architecture:** Strict separation between Controller (HTTP routing), Service (Business Logic), Data (EF Core persistence), and Domain (Entities & Business Invariants).
- **Stateless JWT Authentication:** Secure JSON Web Tokens containing `sub`, `email`, and `role` claims, verified server-side via `[Authorize(Roles = ...)]` attributes.
- **Declarative Form Validation:** Automatic request body validation using **FluentValidation** on the backend and **Zod + React Hook Form** on the frontend.
- **Structured Serilog Logging:** HTTP request correlation IDs and log formatting via Serilog console sinks.

---

## ⚡ Tech Stack

| Domain | Technology | Version | Description & Role |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | ASP.NET Core Web API | `.NET 10.0` | High-throughput REST API Web Host |
| **Database** | PostgreSQL | `18.2-alpine` | Relational database via Docker Compose |
| **ORM** | Entity Framework Core | `10.0.10` | Database persistence & Npgsql EF provider |
| **Backend Validation** | FluentValidation | `12.1.1` | Fluent request contract validation |
| **Backend Security** | BCrypt.Net & JwtBearer | `4.2.0` / `10.0.10` | Password hashing & JWT token authentication |
| **Backend Logging** | Serilog | `10.0.0` | Structured JSON request logging & correlation |
| **API Documentation** | OpenAPI & Swagger UI | `10.0.10` / `10.2.3` | Interactive API documentation viewer |
| **Frontend Framework**| Next.js (App Router) | `16.3.0` | React server components & client dashboards |
| **UI Library & Style** | React 19 & Tailwind CSS | `19.2.8` / `4.0` | Declarative UI rendering & modern styles |
| **Frontend Forms** | React Hook Form & Zod | `7.84` / `4.4` | Schema-validated client forms |
| **Testing Framework** | xUnit & FluentAssertions | `2.9.3` / `8.10.0` | Unit & business-rule automated test suite |
| **Containerization** | Docker & Docker Compose | `v2+` | Multi-container dev & production runtime |

---

## 🔒 Role-Based Access Control (RBAC) Matrix

The system enforces granular authorization rules to restrict operations by user role:

| Feature / Action | Admin | Teacher | Student |
| :--- | :---: | :---: | :---: |
| **Manage Users (Create/Update/Deactivate)** | ✅ | ❌ | ❌ |
| **Manage Classes & Subjects** | ✅ | ❌ | ❌ |
| **Assign Teachers to Subject & Class** | ✅ | ❌ | ❌ |
| **Enroll Students in Class** | ✅ | ❌ | ❌ |
| **Configure System Settings (e.g. Late Submissions)** | ✅ | ❌ | ❌ |
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
- **Health Check:** `http://localhost:5000/api/Health`

*Note: Database migrations and initial seed data apply automatically on backend startup.*

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

## 🧪 Testing

The solution includes automated backend tests built with **xUnit**, **FluentAssertions**, and **EF Core InMemory provider**.

### Run Backend Unit & Integration Tests

```bash
# Execute xUnit test suite from repository root
dotnet test backend/Backend.Tests/Backend.Tests.csproj --configuration Release
```

### Run Frontend Typecheck & Linting

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

---

## 💾 Database & Migrations

### Entity Relationship Model

The PostgreSQL database enforces relational integrity across:
- **`Users`**: System users (Admin, Teacher, Student) with hashed passwords (`BCrypt`).
- **`Classes` & `Subjects`**: Academic structures (e.g., *Class 10*, *Mathematics*).
- **`TeacherAssignments`**: Composite mapping between Teacher, Class, and Subject.
- **`Enrollments`**: Mapping between Student and Class.
- **`Assignments`**: Course work created by teachers with `IsPublished` state and deadline constraints.
- **`Submissions`**: Student answers with `Marks`, `Feedback`, and `Status` (`Submitted`, `Graded`, `Returned`, `Late`).
- **`Notifications`**: Real-time persisted user notification alerts.
- **`SystemSettings`**: Global configuration flags (e.g. `AllowLateSubmissions`).

### EF Core CLI Commands

To add or apply Entity Framework Core migrations:

```bash
cd backend

# Add a new migration
dotnet ef migrations add <MigrationName> --project src/backend.csproj

# Apply pending migrations to PostgreSQL database
dotnet ef database update --project src/backend.csproj
```

### SQL Seed Backup

A pre-populated database snapshot is available at [`docs/db/seed-backup.sql`](file:///home/ash/githubRepos/SchoolManagement(.net)/docs/db/seed-backup.sql).

---

## 🔑 Demo Credentials

Use the pre-seeded credentials below to explore the application across different access levels:

| Role | Email | Password | Scope & Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `Admin123!` | Full administrative privilege across all system modules |
| **Teacher** | `teacher@school.com` | `Teacher123!` | Can create/manage assignments & grade student work |
| **Student 1** | `student1@school.com` | `Student123!` | Enrolled student persona for submitting assignments |
| **Student 2** | `student2@school.com` | `Student123!` | Secondary enrolled student persona |

---

## 📡 API & Health Monitoring

### Health Check Endpoint

```http
GET /api/Health
```
**Response (200 OK):**
```json
{
  "status": "Healthy",
  "timestamp": "2026-08-07T01:31:18Z",
  "database": "Connected"
}
```

### OpenAPI / Swagger Documentation
Interactive API documentation is generated at runtime via OpenAPI specs:
- **Swagger UI:** `http://localhost:5000/swagger`
- **Postman Collection:** [`docs/School Management API.postman_collection.json`](file:///home/ash/githubRepos/SchoolManagement(.net)/docs/School%20Management%20API.postman_collection.json)

---

## ☁️ Deployment Guide

### Deploying Backend to Render (Blueprint Deployment)

The repository includes a ready-to-use [`render.yaml`](file:///home/ash/githubRepos/SchoolManagement(.net)/render.yaml) blueprint specification:

1. Push your repository to **GitHub**.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Select **New +** → **Blueprint**.
4. Connect this repository. Render automatically provisions:
   - **Web Service:** `.NET 10 API` built via [`backend/Dockerfile`](file:///home/ash/githubRepos/SchoolManagement(.net)/backend/Dockerfile).
   - **PostgreSQL Database:** Managed database instance linked via `DATABASE_URL`.
5. Click **Apply**.

### Automated CI/CD (GitHub Actions)

The repository includes two automated workflows:
1. [`.github/workflows/ci.yml`](file:///home/ash/githubRepos/SchoolManagement(.net)/.github/workflows/ci.yml): Runs `dotnet test`, TypeScript checking, and Next.js linting on every push or pull request.
2. [`.github/workflows/deploy-backend.yml`](file:///home/ash/githubRepos/SchoolManagement(.net)/.github/workflows/deploy-backend.yml): Automatically triggers Render deployment upon successful build on `main` or `master`.

To enable automated deployment:
1. Copy the **Deploy Hook URL** from your Render Web Service settings.
2. In GitHub, go to **Settings** → **Secrets and variables** → **Actions**.
3. Add a secret named `RENDER_DEPLOY_HOOK_URL` with your Render deploy hook URL.

---

## 📄 License

This repository is licensed under the **MIT License**.

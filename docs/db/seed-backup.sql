--
-- PostgreSQL database dump
--

\restrict 0D39karvDeh0K5Vl21zBxHbG5Ok9xThSnY5GkLSfZoeHdxRNaUnJxk4l2T7SMsM

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AppSettings; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."AppSettings" (
    "Id" uuid NOT NULL,
    "Key" character varying(100) NOT NULL,
    "Value" character varying(2000) NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AppSettings" OWNER TO school;

--
-- Name: Assignments; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."Assignments" (
    "Id" uuid NOT NULL,
    "Title" character varying(300) NOT NULL,
    "Description" character varying(4000) NOT NULL,
    "Deadline" timestamp with time zone NOT NULL,
    "MaxMarks" integer NOT NULL,
    "Status" character varying(32) NOT NULL,
    "ClassId" uuid NOT NULL,
    "SubjectId" uuid NOT NULL,
    "CreatedByTeacherId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Assignments" OWNER TO school;

--
-- Name: Classes; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."Classes" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Code" character varying(50) NOT NULL,
    "AcademicYear" character varying(20) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Classes" OWNER TO school;

--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."Notifications" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Type" character varying(100) NOT NULL,
    "Title" character varying(300) NOT NULL,
    "Body" character varying(2000) NOT NULL,
    "IsRead" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Notifications" OWNER TO school;

--
-- Name: StudentEnrollments; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."StudentEnrollments" (
    "Id" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "ClassId" uuid NOT NULL,
    "EnrolledAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."StudentEnrollments" OWNER TO school;

--
-- Name: Subjects; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."Subjects" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Code" character varying(50) NOT NULL,
    "ClassId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Subjects" OWNER TO school;

--
-- Name: Submissions; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."Submissions" (
    "Id" uuid NOT NULL,
    "AssignmentId" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "Answer" character varying(8000) NOT NULL,
    "SubmittedAt" timestamp with time zone NOT NULL,
    "Status" character varying(32) NOT NULL,
    "Marks" integer,
    "Feedback" character varying(4000),
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Submissions" OWNER TO school;

--
-- Name: TeacherAssignments; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."TeacherAssignments" (
    "Id" uuid NOT NULL,
    "TeacherId" uuid NOT NULL,
    "ClassId" uuid NOT NULL,
    "SubjectId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."TeacherAssignments" OWNER TO school;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."Users" (
    "Id" uuid NOT NULL,
    "Email" character varying(256) NOT NULL,
    "PasswordHash" character varying(512) NOT NULL,
    "FullName" character varying(200) NOT NULL,
    "Role" character varying(32) NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Users" OWNER TO school;

--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: school
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


ALTER TABLE public."__EFMigrationsHistory" OWNER TO school;

--
-- Data for Name: AppSettings; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."AppSettings" ("Id", "Key", "Value", "UpdatedAt") FROM stdin;
3fff5ba6-03bf-4999-93a7-02eb511be9c2	AllowLateSubmissions	false	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Assignments; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Assignments" ("Id", "Title", "Description", "Deadline", "MaxMarks", "Status", "ClassId", "SubjectId", "CreatedByTeacherId", "CreatedAt", "UpdatedAt") FROM stdin;
88888888-8888-8888-8888-888888888888	Algebra Practice (Draft)	Draft worksheet — not visible to students.	2026-08-19 08:59:54.538324+00	50	Draft	55555555-5555-5555-5555-555555555555	66666666-6666-6666-6666-666666666666	22222222-2222-2222-2222-222222222222	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
99999999-9999-9999-9999-999999999999	Linear Equations Quiz	Solve the given linear equations. Show your working.	2026-08-12 08:59:54.538324+00	100	Published	55555555-5555-5555-5555-555555555555	66666666-6666-6666-6666-666666666666	22222222-2222-2222-2222-222222222222	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Classes; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Classes" ("Id", "Name", "Code", "AcademicYear", "CreatedAt", "UpdatedAt") FROM stdin;
55555555-5555-5555-5555-555555555555	Grade 10 A	G10A	2025-2026	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Notifications" ("Id", "UserId", "Type", "Title", "Body", "IsRead", "CreatedAt") FROM stdin;
0145232b-8025-4bd4-bf2f-c6cbf3027384	33333333-3333-3333-3333-333333333333	assignment_published	New assignment published	Linear Equations Quiz is now available.	f	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: StudentEnrollments; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."StudentEnrollments" ("Id", "StudentId", "ClassId", "EnrolledAt") FROM stdin;
907fe424-4be0-4720-8b2b-d6ad668dd605	33333333-3333-3333-3333-333333333333	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
ca5caaf8-7a29-44c6-979c-f6c68b2a675e	44444444-4444-4444-4444-444444444444	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Subjects; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Subjects" ("Id", "Name", "Code", "ClassId", "CreatedAt", "UpdatedAt") FROM stdin;
66666666-6666-6666-6666-666666666666	Mathematics	MATH	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
77777777-7777-7777-7777-777777777777	English	ENG	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Submissions; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Submissions" ("Id", "AssignmentId", "StudentId", "Answer", "SubmittedAt", "Status", "Marks", "Feedback", "UpdatedAt") FROM stdin;
e5607b3d-c085-4906-9977-22e010fe23bb	99999999-9999-9999-9999-999999999999	33333333-3333-3333-3333-333333333333	x = 5 for equation 2x + 3 = 13.	2026-08-05 06:59:54.538324+00	Submitted	\N	\N	2026-08-05 06:59:54.538324+00
\.


--
-- Data for Name: TeacherAssignments; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."TeacherAssignments" ("Id", "TeacherId", "ClassId", "SubjectId", "CreatedAt") FROM stdin;
3a0721cf-f94f-404d-95de-d383b5f3d105	22222222-2222-2222-2222-222222222222	55555555-5555-5555-5555-555555555555	66666666-6666-6666-6666-666666666666	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "IsActive", "CreatedAt", "UpdatedAt") FROM stdin;
11111111-1111-1111-1111-111111111111	admin@school.com	$2a$11$y5Dm18oVqyY2wdLyfyOOcOiDqQBJSGNlccRHM7VmcHGqePQjc1gHy	System Admin	Admin	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
22222222-2222-2222-2222-222222222222	teacher@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Alice Teacher	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
33333333-3333-3333-3333-333333333333	student1@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Bob Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
44444444-4444-4444-4444-444444444444	student2@school.com	$2a$11$9isDnzHZ7TOChWqt2EQiG.wW9MtAMbzNjAYl4OGXgJjWTTydrPCCW	Carol Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20260804195911_InitialCreate	10.0.10
\.


--
-- Name: AppSettings PK_AppSettings; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."AppSettings"
    ADD CONSTRAINT "PK_AppSettings" PRIMARY KEY ("Id");


--
-- Name: Assignments PK_Assignments; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Assignments"
    ADD CONSTRAINT "PK_Assignments" PRIMARY KEY ("Id");


--
-- Name: Classes PK_Classes; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Classes"
    ADD CONSTRAINT "PK_Classes" PRIMARY KEY ("Id");


--
-- Name: Notifications PK_Notifications; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id");


--
-- Name: StudentEnrollments PK_StudentEnrollments; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."StudentEnrollments"
    ADD CONSTRAINT "PK_StudentEnrollments" PRIMARY KEY ("Id");


--
-- Name: Subjects PK_Subjects; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Subjects"
    ADD CONSTRAINT "PK_Subjects" PRIMARY KEY ("Id");


--
-- Name: Submissions PK_Submissions; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Submissions"
    ADD CONSTRAINT "PK_Submissions" PRIMARY KEY ("Id");


--
-- Name: TeacherAssignments PK_TeacherAssignments; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."TeacherAssignments"
    ADD CONSTRAINT "PK_TeacherAssignments" PRIMARY KEY ("Id");


--
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_AppSettings_Key; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_AppSettings_Key" ON public."AppSettings" USING btree ("Key");


--
-- Name: IX_Assignments_ClassId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_Assignments_ClassId" ON public."Assignments" USING btree ("ClassId");


--
-- Name: IX_Assignments_CreatedByTeacherId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_Assignments_CreatedByTeacherId" ON public."Assignments" USING btree ("CreatedByTeacherId");


--
-- Name: IX_Assignments_SubjectId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_Assignments_SubjectId" ON public."Assignments" USING btree ("SubjectId");


--
-- Name: IX_Classes_Code; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_Classes_Code" ON public."Classes" USING btree ("Code");


--
-- Name: IX_Notifications_UserId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_Notifications_UserId" ON public."Notifications" USING btree ("UserId");


--
-- Name: IX_StudentEnrollments_ClassId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_StudentEnrollments_ClassId" ON public."StudentEnrollments" USING btree ("ClassId");


--
-- Name: IX_StudentEnrollments_StudentId_ClassId; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_StudentEnrollments_StudentId_ClassId" ON public."StudentEnrollments" USING btree ("StudentId", "ClassId");


--
-- Name: IX_Subjects_ClassId_Code; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_Subjects_ClassId_Code" ON public."Subjects" USING btree ("ClassId", "Code");


--
-- Name: IX_Submissions_AssignmentId_StudentId; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_Submissions_AssignmentId_StudentId" ON public."Submissions" USING btree ("AssignmentId", "StudentId");


--
-- Name: IX_Submissions_StudentId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_Submissions_StudentId" ON public."Submissions" USING btree ("StudentId");


--
-- Name: IX_TeacherAssignments_ClassId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_TeacherAssignments_ClassId" ON public."TeacherAssignments" USING btree ("ClassId");


--
-- Name: IX_TeacherAssignments_SubjectId; Type: INDEX; Schema: public; Owner: school
--

CREATE INDEX "IX_TeacherAssignments_SubjectId" ON public."TeacherAssignments" USING btree ("SubjectId");


--
-- Name: IX_TeacherAssignments_TeacherId_ClassId_SubjectId; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_TeacherAssignments_TeacherId_ClassId_SubjectId" ON public."TeacherAssignments" USING btree ("TeacherId", "ClassId", "SubjectId");


--
-- Name: IX_Users_Email; Type: INDEX; Schema: public; Owner: school
--

CREATE UNIQUE INDEX "IX_Users_Email" ON public."Users" USING btree ("Email");


--
-- Name: Assignments FK_Assignments_Classes_ClassId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Assignments"
    ADD CONSTRAINT "FK_Assignments_Classes_ClassId" FOREIGN KEY ("ClassId") REFERENCES public."Classes"("Id") ON DELETE RESTRICT;


--
-- Name: Assignments FK_Assignments_Subjects_SubjectId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Assignments"
    ADD CONSTRAINT "FK_Assignments_Subjects_SubjectId" FOREIGN KEY ("SubjectId") REFERENCES public."Subjects"("Id") ON DELETE RESTRICT;


--
-- Name: Assignments FK_Assignments_Users_CreatedByTeacherId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Assignments"
    ADD CONSTRAINT "FK_Assignments_Users_CreatedByTeacherId" FOREIGN KEY ("CreatedByTeacherId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Notifications FK_Notifications_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "FK_Notifications_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: StudentEnrollments FK_StudentEnrollments_Classes_ClassId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."StudentEnrollments"
    ADD CONSTRAINT "FK_StudentEnrollments_Classes_ClassId" FOREIGN KEY ("ClassId") REFERENCES public."Classes"("Id") ON DELETE RESTRICT;


--
-- Name: StudentEnrollments FK_StudentEnrollments_Users_StudentId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."StudentEnrollments"
    ADD CONSTRAINT "FK_StudentEnrollments_Users_StudentId" FOREIGN KEY ("StudentId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Subjects FK_Subjects_Classes_ClassId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Subjects"
    ADD CONSTRAINT "FK_Subjects_Classes_ClassId" FOREIGN KEY ("ClassId") REFERENCES public."Classes"("Id") ON DELETE RESTRICT;


--
-- Name: Submissions FK_Submissions_Assignments_AssignmentId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Submissions"
    ADD CONSTRAINT "FK_Submissions_Assignments_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES public."Assignments"("Id") ON DELETE RESTRICT;


--
-- Name: Submissions FK_Submissions_Users_StudentId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."Submissions"
    ADD CONSTRAINT "FK_Submissions_Users_StudentId" FOREIGN KEY ("StudentId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: TeacherAssignments FK_TeacherAssignments_Classes_ClassId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."TeacherAssignments"
    ADD CONSTRAINT "FK_TeacherAssignments_Classes_ClassId" FOREIGN KEY ("ClassId") REFERENCES public."Classes"("Id") ON DELETE RESTRICT;


--
-- Name: TeacherAssignments FK_TeacherAssignments_Subjects_SubjectId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."TeacherAssignments"
    ADD CONSTRAINT "FK_TeacherAssignments_Subjects_SubjectId" FOREIGN KEY ("SubjectId") REFERENCES public."Subjects"("Id") ON DELETE RESTRICT;


--
-- Name: TeacherAssignments FK_TeacherAssignments_Users_TeacherId; Type: FK CONSTRAINT; Schema: public; Owner: school
--

ALTER TABLE ONLY public."TeacherAssignments"
    ADD CONSTRAINT "FK_TeacherAssignments_Users_TeacherId" FOREIGN KEY ("TeacherId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 0D39karvDeh0K5Vl21zBxHbG5Ok9xThSnY5GkLSfZoeHdxRNaUnJxk4l2T7SMsM


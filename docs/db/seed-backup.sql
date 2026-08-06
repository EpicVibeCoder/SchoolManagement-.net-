--
-- PostgreSQL database dump (expanded seed)
-- 1 admin, 10 teachers, 40 students, 6 classes, 6 subjects
-- Passwords: Admin123! / Teacher123! / Student123!
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
f8000001-0000-4000-8000-000000000001	AllowLateSubmissions	false	2026-08-05 08:59:54.538324+00
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
a1000002-0000-4000-8000-000000000002	Grade 10 B	G10B	2025-2026	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a1000003-0000-4000-8000-000000000003	Grade 11 A	G11A	2025-2026	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a1000004-0000-4000-8000-000000000004	Grade 11 B	G11B	2025-2026	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a1000005-0000-4000-8000-000000000005	Grade 12 A	G12A	2025-2026	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a1000006-0000-4000-8000-000000000006	Grade 12 B	G12B	2025-2026	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Notifications" ("Id", "UserId", "Type", "Title", "Body", "IsRead", "CreatedAt") FROM stdin;
f7000001-0000-4000-8000-000000000001	33333333-3333-3333-3333-333333333333	assignment_published	New assignment published	Linear Equations Quiz is now available.	f	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: StudentEnrollments; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."StudentEnrollments" ("Id", "StudentId", "ClassId", "EnrolledAt") FROM stdin;
d4000001-0000-4000-8000-000000000001	33333333-3333-3333-3333-333333333333	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000002-0000-4000-8000-000000000002	44444444-4444-4444-4444-444444444444	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000003-0000-4000-8000-000000000003	c3330003-0000-4000-8000-000000000003	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000004-0000-4000-8000-000000000004	c3330004-0000-4000-8000-000000000004	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000005-0000-4000-8000-000000000005	c3330005-0000-4000-8000-000000000005	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000006-0000-4000-8000-000000000006	c3330006-0000-4000-8000-000000000006	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000007-0000-4000-8000-000000000007	c3330007-0000-4000-8000-000000000007	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00
d4000008-0000-4000-8000-000000000008	c3330008-0000-4000-8000-000000000008	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000009-0000-4000-8000-000000000009	c3330009-0000-4000-8000-000000000009	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000010-0000-4000-8000-000000000010	c3330010-0000-4000-8000-000000000010	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000011-0000-4000-8000-000000000011	c3330011-0000-4000-8000-000000000011	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000012-0000-4000-8000-000000000012	c3330012-0000-4000-8000-000000000012	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000013-0000-4000-8000-000000000013	c3330013-0000-4000-8000-000000000013	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000014-0000-4000-8000-000000000014	c3330014-0000-4000-8000-000000000014	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00
d4000015-0000-4000-8000-000000000015	c3330015-0000-4000-8000-000000000015	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000016-0000-4000-8000-000000000016	c3330016-0000-4000-8000-000000000016	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000017-0000-4000-8000-000000000017	c3330017-0000-4000-8000-000000000017	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000018-0000-4000-8000-000000000018	c3330018-0000-4000-8000-000000000018	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000019-0000-4000-8000-000000000019	c3330019-0000-4000-8000-000000000019	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000020-0000-4000-8000-000000000020	c3330020-0000-4000-8000-000000000020	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000021-0000-4000-8000-000000000021	c3330021-0000-4000-8000-000000000021	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
d4000022-0000-4000-8000-000000000022	c3330022-0000-4000-8000-000000000022	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000023-0000-4000-8000-000000000023	c3330023-0000-4000-8000-000000000023	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000024-0000-4000-8000-000000000024	c3330024-0000-4000-8000-000000000024	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000025-0000-4000-8000-000000000025	c3330025-0000-4000-8000-000000000025	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000026-0000-4000-8000-000000000026	c3330026-0000-4000-8000-000000000026	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000027-0000-4000-8000-000000000027	c3330027-0000-4000-8000-000000000027	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000028-0000-4000-8000-000000000028	c3330028-0000-4000-8000-000000000028	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
d4000029-0000-4000-8000-000000000029	c3330029-0000-4000-8000-000000000029	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
d4000030-0000-4000-8000-000000000030	c3330030-0000-4000-8000-000000000030	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
d4000031-0000-4000-8000-000000000031	c3330031-0000-4000-8000-000000000031	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
d4000032-0000-4000-8000-000000000032	c3330032-0000-4000-8000-000000000032	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
d4000033-0000-4000-8000-000000000033	c3330033-0000-4000-8000-000000000033	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
d4000034-0000-4000-8000-000000000034	c3330034-0000-4000-8000-000000000034	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
d4000035-0000-4000-8000-000000000035	c3330035-0000-4000-8000-000000000035	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
d4000036-0000-4000-8000-000000000036	c3330036-0000-4000-8000-000000000036	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
d4000037-0000-4000-8000-000000000037	c3330037-0000-4000-8000-000000000037	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
d4000038-0000-4000-8000-000000000038	c3330038-0000-4000-8000-000000000038	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
d4000039-0000-4000-8000-000000000039	c3330039-0000-4000-8000-000000000039	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
d4000040-0000-4000-8000-000000000040	c3330040-0000-4000-8000-000000000040	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Subjects; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Subjects" ("Id", "Name", "Code", "ClassId", "CreatedAt", "UpdatedAt") FROM stdin;
66666666-6666-6666-6666-666666666666	Mathematics	MATH	55555555-5555-5555-5555-555555555555	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
77777777-7777-7777-7777-777777777777	English	ENG	a1000002-0000-4000-8000-000000000002	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
b2000003-0000-4000-8000-000000000003	Physics	PHY	a1000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
b2000004-0000-4000-8000-000000000004	Chemistry	CHEM	a1000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
b2000005-0000-4000-8000-000000000005	Biology	BIO	a1000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
b2000006-0000-4000-8000-000000000006	History	HIST	a1000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Submissions; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Submissions" ("Id", "AssignmentId", "StudentId", "Answer", "SubmittedAt", "Status", "Marks", "Feedback", "UpdatedAt") FROM stdin;
f6000001-0000-4000-8000-000000000001	99999999-9999-9999-9999-999999999999	33333333-3333-3333-3333-333333333333	x = 5 for equation 2x + 3 = 13.	2026-08-05 06:59:54.538324+00	Submitted	\N	\N	2026-08-05 06:59:54.538324+00
\.


--
-- Data for Name: TeacherAssignments; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."TeacherAssignments" ("Id", "TeacherId", "ClassId", "SubjectId", "CreatedAt") FROM stdin;
e5000001-0000-4000-8000-000000000001	22222222-2222-2222-2222-222222222222	55555555-5555-5555-5555-555555555555	66666666-6666-6666-6666-666666666666	2026-08-05 08:59:54.538324+00
e5000002-0000-4000-8000-000000000002	a2220002-0000-4000-8000-000000000002	a1000002-0000-4000-8000-000000000002	77777777-7777-7777-7777-777777777777	2026-08-05 08:59:54.538324+00
e5000003-0000-4000-8000-000000000003	a2220003-0000-4000-8000-000000000003	a1000003-0000-4000-8000-000000000003	b2000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
e5000004-0000-4000-8000-000000000004	a2220004-0000-4000-8000-000000000004	a1000004-0000-4000-8000-000000000004	b2000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
e5000005-0000-4000-8000-000000000005	a2220005-0000-4000-8000-000000000005	a1000005-0000-4000-8000-000000000005	b2000005-0000-4000-8000-000000000005	2026-08-05 08:59:54.538324+00
e5000006-0000-4000-8000-000000000006	a2220006-0000-4000-8000-000000000006	a1000006-0000-4000-8000-000000000006	b2000006-0000-4000-8000-000000000006	2026-08-05 08:59:54.538324+00
e5000007-0000-4000-8000-000000000007	a2220007-0000-4000-8000-000000000007	55555555-5555-5555-5555-555555555555	66666666-6666-6666-6666-666666666666	2026-08-05 08:59:54.538324+00
e5000008-0000-4000-8000-000000000008	a2220008-0000-4000-8000-000000000008	a1000002-0000-4000-8000-000000000002	77777777-7777-7777-7777-777777777777	2026-08-05 08:59:54.538324+00
e5000009-0000-4000-8000-000000000009	a2220009-0000-4000-8000-000000000009	a1000003-0000-4000-8000-000000000003	b2000003-0000-4000-8000-000000000003	2026-08-05 08:59:54.538324+00
e5000010-0000-4000-8000-000000000010	a2220010-0000-4000-8000-000000000010	a1000004-0000-4000-8000-000000000004	b2000004-0000-4000-8000-000000000004	2026-08-05 08:59:54.538324+00
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: school
--

COPY public."Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "IsActive", "CreatedAt", "UpdatedAt") FROM stdin;
11111111-1111-1111-1111-111111111111	admin@school.com	$2a$11$y5Dm18oVqyY2wdLyfyOOcOiDqQBJSGNlccRHM7VmcHGqePQjc1gHy	System Admin	Admin	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
22222222-2222-2222-2222-222222222222	teacher@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Alice Teacher	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220002-0000-4000-8000-000000000002	teacher2@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Brian Cooper	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220003-0000-4000-8000-000000000003	teacher3@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Clara Diaz	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220004-0000-4000-8000-000000000004	teacher4@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	David Evans	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220005-0000-4000-8000-000000000005	teacher5@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Elena Foster	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220006-0000-4000-8000-000000000006	teacher6@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Frank Garcia	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220007-0000-4000-8000-000000000007	teacher7@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Grace Huang	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220008-0000-4000-8000-000000000008	teacher8@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Henry Ibrahim	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220009-0000-4000-8000-000000000009	teacher9@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	Isla Johnson	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
a2220010-0000-4000-8000-000000000010	teacher10@school.com	$2a$11$thnlm.aB415hBWuazpVkBOHm6Dww4tm4Yj3OCM4QaGCHEnchCJLb.	James Khan	Teacher	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
33333333-3333-3333-3333-333333333333	student1@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Bob Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
44444444-4444-4444-4444-444444444444	student2@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Carol Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330003-0000-4000-8000-000000000003	student3@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Diana Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330004-0000-4000-8000-000000000004	student4@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Ethan Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330005-0000-4000-8000-000000000005	student5@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Fiona Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330006-0000-4000-8000-000000000006	student6@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	George Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330007-0000-4000-8000-000000000007	student7@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Hannah Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330008-0000-4000-8000-000000000008	student8@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Ian Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330009-0000-4000-8000-000000000009	student9@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Julia Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330010-0000-4000-8000-000000000010	student10@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Kevin Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330011-0000-4000-8000-000000000011	student11@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Laura Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330012-0000-4000-8000-000000000012	student12@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Mike Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330013-0000-4000-8000-000000000013	student13@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Nina Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330014-0000-4000-8000-000000000014	student14@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Oscar Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330015-0000-4000-8000-000000000015	student15@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Paula Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330016-0000-4000-8000-000000000016	student16@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Quinn Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330017-0000-4000-8000-000000000017	student17@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Rachel Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330018-0000-4000-8000-000000000018	student18@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Sam Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330019-0000-4000-8000-000000000019	student19@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Tina Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330020-0000-4000-8000-000000000020	student20@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Uma Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330021-0000-4000-8000-000000000021	student21@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Victor Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330022-0000-4000-8000-000000000022	student22@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Wendy Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330023-0000-4000-8000-000000000023	student23@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Xander Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330024-0000-4000-8000-000000000024	student24@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Yara Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330025-0000-4000-8000-000000000025	student25@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Zane Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330026-0000-4000-8000-000000000026	student26@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Amy Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330027-0000-4000-8000-000000000027	student27@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Ben Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330028-0000-4000-8000-000000000028	student28@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Chloe Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330029-0000-4000-8000-000000000029	student29@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Derek Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330030-0000-4000-8000-000000000030	student30@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Eva Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330031-0000-4000-8000-000000000031	student31@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Felix Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330032-0000-4000-8000-000000000032	student32@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Gina Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330033-0000-4000-8000-000000000033	student33@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Hugo Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330034-0000-4000-8000-000000000034	student34@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Iris Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330035-0000-4000-8000-000000000035	student35@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Jack Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330036-0000-4000-8000-000000000036	student36@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Kara Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330037-0000-4000-8000-000000000037	student37@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Leo Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330038-0000-4000-8000-000000000038	student38@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Mona Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330039-0000-4000-8000-000000000039	student39@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Nate Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
c3330040-0000-4000-8000-000000000040	student40@school.com	$2a$11$sn4zvDmwEBS/r7wigrTg9OmdvKJ9ez/8lNiw3UJcfrcdZ1jy02PQq	Olive Student	Student	t	2026-08-05 08:59:54.538324+00	2026-08-05 08:59:54.538324+00
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


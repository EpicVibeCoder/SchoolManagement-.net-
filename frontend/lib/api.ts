const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const TOKEN_KEY = "sm_token";

// Backend uses JsonStringEnumConverter — enums are strings.
export const UserRole = { Admin: "Admin", Teacher: "Teacher", Student: "Student" } as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const userRoleLabels: Record<UserRole, string> = {
      [UserRole.Admin]: "Admin",
      [UserRole.Teacher]: "Teacher",
      [UserRole.Student]: "Student",
};
export const userRoleOptions = (Object.keys(UserRole) as (keyof typeof UserRole)[]).map((key) => ({
      value: UserRole[key],
      label: key,
}));

export const AssignmentStatus = { Draft: "Draft", Published: "Published" } as const;
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];
export const assignmentStatusLabels: Record<AssignmentStatus, string> = {
      [AssignmentStatus.Draft]: "Draft",
      [AssignmentStatus.Published]: "Published",
};

export const SubmissionStatus = {
      Submitted: "Submitted",
      Late: "Late",
      Graded: "Graded",
      Returned: "Returned",
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];
export const submissionStatusLabels: Record<SubmissionStatus, string> = {
      [SubmissionStatus.Submitted]: "Submitted",
      [SubmissionStatus.Late]: "Late",
      [SubmissionStatus.Graded]: "Graded",
      [SubmissionStatus.Returned]: "Returned",
};

export interface UserDto {
      id: string;
      email: string;
      fullName: string;
      role: UserRole;
      isActive: boolean;
      createdAt: string;
}

export interface CreateUserRequest {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
}

export interface UpdateUserRequest {
      fullName: string;
      role: UserRole;
      isActive: boolean;
      password?: string | null;
}

export interface PagedResult<T> {
      items: T[];
      total: number;
      page: number;
      pageSize: number;
}

export interface ClassDto {
      id: string;
      name: string;
      code: string;
      academicYear: string;
}

export interface CreateClassRequest {
      name: string;
      code: string;
      academicYear: string;
}

export type UpdateClassRequest = CreateClassRequest;

export interface SubjectDto {
      id: string;
      name: string;
      code: string;
}

export interface CreateSubjectRequest {
      name: string;
      code: string;
      classId: string;
}

export type UpdateSubjectRequest = CreateSubjectRequest;

export interface TeacherAssignmentDto {
      id: string;
      teacherId: string;
      teacherName: string;
      classId: string;
      className: string;
      subjectId: string;
      subjectName: string;
}

export interface CreateTeacherAssignmentRequest {
      teacherId: string;
      classId: string;
      subjectId: string;
}

export interface TeacherClassSubjectDto {
      classId: string;
      className: string;
      subjectId: string;
      subjectName: string;
}

export interface EnrollmentDto {
      id: string;
      studentId: string;
      studentName: string;
      classId: string;
      className: string;
      enrolledAt: string;
}

export interface CreateEnrollmentRequest {
      studentId: string;
      classId: string;
}

export interface AppSettingDto {
      key: string;
      value: string;
}

export interface UpdateSettingRequest {
      value: string;
}

export interface AssignmentDto {
      id: string;
      title: string;
      description: string;
      deadline: string;
      maxMarks: number;
      status: AssignmentStatus;
      classId: string;
      className: string;
      subjectId: string;
      subjectName: string;
      createdByTeacherId: string;
      teacherName: string;
      submissionCount: number;
      createdAt: string;
}

export interface CreateAssignmentRequest {
      title: string;
      description: string;
      deadline: string;
      maxMarks: number;
      classId: string;
      subjectId: string;
}

export type UpdateAssignmentRequest = CreateAssignmentRequest;

export interface SubmissionDto {
      id: string;
      assignmentId: string;
      assignmentTitle: string;
      assignmentDescription: string;
      assignmentStatus: AssignmentStatus;
      className: string;
      subjectName: string;
      teacherName: string;
      studentId: string;
      studentName: string;
      answer: string;
      submittedAt: string;
      status: SubmissionStatus;
      marks: number | null;
      feedback: string | null;
      maxMarks: number;
      deadline: string;
}

export interface CreateSubmissionRequest {
      assignmentId: string;
      answer: string;
}

export interface UpdateSubmissionRequest {
      answer: string;
}

export interface GradeSubmissionRequest {
      marks: number;
      feedback: string;
      status?: SubmissionStatus | null;
}

export interface NotificationDto {
      id: string;
      type: string;
      title: string;
      body: string;
      isRead: boolean;
      createdAt: string;
}

export interface DashboardStatsDto {
      users: number;
      classes: number;
      assignments: number;
      submissions: number;
      pendingGrading: number;
      dueSoon: number;
}

export interface LoginResponse {
      token: string;
      user: UserDto;
}

export function getToken(): string | null {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
      status: number;
      code?: string;
      details?: unknown;

      constructor(message: string, status: number, code?: string, details?: unknown) {
            super(message);
            this.name = "ApiError";
            this.status = status;
            this.code = code;
            this.details = details;
      }
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
      body?: unknown;
      auth?: boolean;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
      const { body, headers, auth = true, ...rest } = options;

      const finalHeaders: Record<string, string> = {
            Accept: "application/json",
            ...(headers as Record<string, string> | undefined),
      };

      if (body !== undefined) {
            finalHeaders["Content-Type"] = "application/json";
      }

      if (auth) {
            const token = getToken();
            if (token) {
                  finalHeaders["Authorization"] = `Bearer ${token}`;
            }
      }

      let res: Response;
      try {
            res = await fetch(`${API_URL}${path}`, {
                  ...rest,
                  headers: finalHeaders,
                  body: body !== undefined ? JSON.stringify(body) : undefined,
                  cache: "no-store",
            });
      } catch {
            throw new ApiError("Unable to reach the server. Please try again.", 0, "network_error");
      }

      if (res.status === 204) {
            return undefined as T;
      }

      const contentType = res.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await res.json().catch(() => null) : null;

      if (!res.ok) {
            const message =
                  (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" ? payload.message : null) ??
                  `Request failed with status ${res.status}`;
            const code = payload && typeof payload === "object" && "code" in payload && typeof payload.code === "string" ? payload.code : undefined;
            const details = payload && typeof payload === "object" && "details" in payload ? payload.details : undefined;
            throw new ApiError(message, res.status, code, details);
      }

      return payload as T;
}

export const get = <T>(path: string, options?: ApiOptions) => api<T>(path, { ...options, method: "GET" });

export const post = <T>(path: string, body?: unknown, options?: ApiOptions) => api<T>(path, { ...options, method: "POST", body });

export const put = <T>(path: string, body?: unknown, options?: ApiOptions) => api<T>(path, { ...options, method: "PUT", body });

export const del = <T>(path: string, options?: ApiOptions) => api<T>(path, { ...options, method: "DELETE" });

export function login(email: string, password: string) {
      return post<LoginResponse>("/api/auth/login", { email, password }, { auth: false });
}

export function me() {
      return get<UserDto>("/api/auth/me");
}

using backend.Domain.Enums;

namespace backend.DTOs;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, UserDto User);
public record UserDto(Guid Id, string Email, string FullName, UserRole Role, bool IsActive, DateTimeOffset CreatedAt);
public record CreateUserRequest(string Email, string Password, string FullName, UserRole Role);
public record UpdateUserRequest(string FullName, UserRole Role, bool IsActive, string? Password);

public record ClassDto(Guid Id, string Name, string Code, string AcademicYear);
public record CreateClassRequest(string Name, string Code, string AcademicYear);
public record UpdateClassRequest(string Name, string Code, string AcademicYear);

public record SubjectDto(Guid Id, string Name, string Code, Guid ClassId, string? ClassName);
public record CreateSubjectRequest(string Name, string Code, Guid ClassId);
public record UpdateSubjectRequest(string Name, string Code, Guid ClassId);

public record TeacherAssignmentDto(Guid Id, Guid TeacherId, string TeacherName, Guid ClassId, string ClassName, Guid SubjectId, string SubjectName);
public record CreateTeacherAssignmentRequest(Guid TeacherId, Guid ClassId, Guid SubjectId);

public record EnrollmentDto(Guid Id, Guid StudentId, string StudentName, Guid ClassId, string ClassName, DateTimeOffset EnrolledAt);
public record CreateEnrollmentRequest(Guid StudentId, Guid ClassId);

public record AppSettingDto(string Key, string Value);
public record UpdateSettingRequest(string Value);

public record AssignmentDto(
    Guid Id, string Title, string Description, DateTimeOffset Deadline, int MaxMarks,
    AssignmentStatus Status, Guid ClassId, string ClassName, Guid SubjectId, string SubjectName,
    Guid CreatedByTeacherId, string TeacherName, int SubmissionCount, DateTimeOffset CreatedAt);

public record CreateAssignmentRequest(string Title, string Description, DateTimeOffset Deadline, int MaxMarks, Guid ClassId, Guid SubjectId);
public record UpdateAssignmentRequest(string Title, string Description, DateTimeOffset Deadline, int MaxMarks, Guid ClassId, Guid SubjectId);

public record SubmissionDto(
    Guid Id, Guid AssignmentId, string AssignmentTitle, Guid StudentId, string StudentName,
    string Answer, DateTimeOffset SubmittedAt, SubmissionStatus Status, int? Marks, string? Feedback,
    int MaxMarks, DateTimeOffset Deadline);

public record CreateSubmissionRequest(Guid AssignmentId, string Answer);
public record UpdateSubmissionRequest(string Answer);
public record GradeSubmissionRequest(int Marks, string Feedback, SubmissionStatus? Status);

public record NotificationDto(Guid Id, string Type, string Title, string Body, bool IsRead, DateTimeOffset CreatedAt);

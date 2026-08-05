using backend.Auth;
using backend.Data;
using backend.Domain.Enums;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct);
}

public class DashboardService : IDashboardService
{
    private static readonly TimeSpan DueSoonWindow = TimeSpan.FromDays(3);

    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public DashboardService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var dueSoonBy = now.Add(DueSoonWindow);

        var userCount = await _db.Users.CountAsync(ct);
        var classCount = await _db.Classes.CountAsync(ct);

        return _currentUser.Role switch
        {
            UserRole.Admin => await GetAdminStatsAsync(userCount, classCount, now, dueSoonBy, ct),
            UserRole.Teacher => await GetTeacherStatsAsync(userCount, classCount, now, dueSoonBy, ct),
            UserRole.Student => await GetStudentStatsAsync(userCount, classCount, now, dueSoonBy, ct),
            _ => new DashboardStatsDto(userCount, classCount, 0, 0, 0, 0)
        };
    }

    private async Task<DashboardStatsDto> GetAdminStatsAsync(
        int userCount, int classCount, DateTimeOffset now, DateTimeOffset dueSoonBy, CancellationToken ct)
    {
        var assignmentCount = await _db.Assignments.CountAsync(ct);
        var submissionCount = await _db.Submissions.CountAsync(ct);
        var pendingGrading = await _db.Submissions.CountAsync(
            s => s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.Late, ct);
        var dueSoon = await _db.Assignments.CountAsync(
            a => a.Status == AssignmentStatus.Published && a.Deadline >= now && a.Deadline <= dueSoonBy, ct);

        return new DashboardStatsDto(userCount, classCount, assignmentCount, submissionCount, pendingGrading, dueSoon);
    }

    private async Task<DashboardStatsDto> GetTeacherStatsAsync(
        int userCount, int classCount, DateTimeOffset now, DateTimeOffset dueSoonBy, CancellationToken ct)
    {
        var teacherId = _currentUser.UserId;
        var assignedPairs = await _db.TeacherAssignments
            .Where(t => t.TeacherId == teacherId)
            .Select(t => new { t.ClassId, t.SubjectId })
            .ToListAsync(ct);
        var assignedClassIds = assignedPairs.Select(p => p.ClassId).ToHashSet();
        var assignedSubjectIds = assignedPairs.Select(p => p.SubjectId).ToHashSet();

        var assignmentIds = await _db.Assignments
            .Where(a => a.CreatedByTeacherId == teacherId
                || (assignedClassIds.Contains(a.ClassId) && assignedSubjectIds.Contains(a.SubjectId)))
            .Select(a => a.Id)
            .ToListAsync(ct);

        var assignmentCount = assignmentIds.Count;
        var submissionCount = await _db.Submissions.CountAsync(s => assignmentIds.Contains(s.AssignmentId), ct);
        var pendingGrading = await _db.Submissions.CountAsync(
            s => assignmentIds.Contains(s.AssignmentId)
                && (s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.Late), ct);
        var dueSoon = await _db.Assignments.CountAsync(
            a => assignmentIds.Contains(a.Id) && a.Status == AssignmentStatus.Published
                && a.Deadline >= now && a.Deadline <= dueSoonBy, ct);

        return new DashboardStatsDto(userCount, classCount, assignmentCount, submissionCount, pendingGrading, dueSoon);
    }

    private async Task<DashboardStatsDto> GetStudentStatsAsync(
        int userCount, int classCount, DateTimeOffset now, DateTimeOffset dueSoonBy, CancellationToken ct)
    {
        var studentId = _currentUser.UserId;
        var enrolledClassIds = await _db.StudentEnrollments
            .Where(e => e.StudentId == studentId)
            .Select(e => e.ClassId)
            .ToListAsync(ct);

        var assignmentCount = await _db.Assignments.CountAsync(
            a => a.Status == AssignmentStatus.Published && enrolledClassIds.Contains(a.ClassId), ct);
        var submissionCount = await _db.Submissions.CountAsync(s => s.StudentId == studentId, ct);
        var pendingGrading = await _db.Submissions.CountAsync(
            s => s.StudentId == studentId
                && (s.Status == SubmissionStatus.Submitted || s.Status == SubmissionStatus.Late), ct);

        var submittedAssignmentIds = await _db.Submissions
            .Where(s => s.StudentId == studentId)
            .Select(s => s.AssignmentId)
            .ToListAsync(ct);

        var dueSoon = await _db.Assignments.CountAsync(
            a => a.Status == AssignmentStatus.Published && enrolledClassIds.Contains(a.ClassId)
                && a.Deadline >= now && a.Deadline <= dueSoonBy
                && !submittedAssignmentIds.Contains(a.Id), ct);

        return new DashboardStatsDto(userCount, classCount, assignmentCount, submissionCount, pendingGrading, dueSoon);
    }
}

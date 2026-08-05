using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface IAssignmentService
{
    Task<List<AssignmentDto>> ListAsync(Guid? classId, Guid? subjectId, CancellationToken ct);
    Task<AssignmentDto> GetAsync(Guid id, CancellationToken ct);
    Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, CancellationToken ct);
    Task<AssignmentDto> UpdateAsync(Guid id, UpdateAssignmentRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
    Task<AssignmentDto> PublishAsync(Guid id, CancellationToken ct);
    Task<AssignmentDto> UnpublishAsync(Guid id, CancellationToken ct);
}

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;

    public AssignmentService(AppDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<AssignmentDto>> ListAsync(Guid? classId, Guid? subjectId, CancellationToken ct)
    {
        var query = BaseQuery();

        switch (_currentUser.Role)
        {
            case UserRole.Admin:
                break;

            case UserRole.Teacher:
                var teacherId = _currentUser.UserId;
                var assignedPairs = await _db.TeacherAssignments
                    .Where(t => t.TeacherId == teacherId)
                    .Select(t => new { t.ClassId, t.SubjectId })
                    .ToListAsync(ct);
                var assignedClassIds = assignedPairs.Select(p => p.ClassId).ToHashSet();
                var assignedSubjectIds = assignedPairs.Select(p => p.SubjectId).ToHashSet();

                query = query.Where(a =>
                    a.CreatedByTeacherId == teacherId
                    || (assignedClassIds.Contains(a.ClassId) && assignedSubjectIds.Contains(a.SubjectId)));
                break;

            case UserRole.Student:
                var studentId = _currentUser.UserId;
                var enrolledClassIds = await _db.StudentEnrollments
                    .Where(e => e.StudentId == studentId)
                    .Select(e => e.ClassId)
                    .ToListAsync(ct);

                query = query.Where(a => a.Status == AssignmentStatus.Published && enrolledClassIds.Contains(a.ClassId));
                break;
        }

        if (classId.HasValue)
            query = query.Where(a => a.ClassId == classId.Value);
        if (subjectId.HasValue)
            query = query.Where(a => a.SubjectId == subjectId.Value);

        var assignments = await query.OrderByDescending(a => a.CreatedAt).ToListAsync(ct);
        return assignments.Select(ToDto).ToList();
    }

    public async Task<AssignmentDto> GetAsync(Guid id, CancellationToken ct)
    {
        var assignment = await BaseQuery().FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        await EnsureViewableAsync(assignment, ct);

        return ToDto(assignment);
    }

    public async Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, CancellationToken ct)
    {
        EnsureTeacher();

        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassId, ct)
            ?? throw new NotFoundException("Class not found.");
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == request.SubjectId, ct)
            ?? throw new NotFoundException("Subject not found.");

        await EnsureAssignedAsync(request.ClassId, request.SubjectId, ct);

        var now = DateTimeOffset.UtcNow;
        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Description = request.Description,
            Deadline = request.Deadline,
            MaxMarks = request.MaxMarks,
            Status = AssignmentStatus.Draft,
            ClassId = request.ClassId,
            SubjectId = request.SubjectId,
            CreatedByTeacherId = _currentUser.UserId,
            CreatedAt = now,
            UpdatedAt = now
        };

        _db.Assignments.Add(assignment);
        await _db.SaveChangesAsync(ct);

        assignment.Class = klass;
        assignment.Subject = subject;
        assignment.CreatedByTeacher = await _db.Users.FirstAsync(u => u.Id == _currentUser.UserId, ct);

        return ToDto(assignment);
    }

    public async Task<AssignmentDto> UpdateAsync(Guid id, UpdateAssignmentRequest request, CancellationToken ct)
    {
        var assignment = await BaseQuery().FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwner(assignment);

        var klass = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassId, ct)
            ?? throw new NotFoundException("Class not found.");
        var subject = await _db.Subjects.FirstOrDefaultAsync(s => s.Id == request.SubjectId, ct)
            ?? throw new NotFoundException("Subject not found.");

        if (assignment.ClassId != request.ClassId || assignment.SubjectId != request.SubjectId)
            await EnsureAssignedAsync(request.ClassId, request.SubjectId, ct);

        assignment.Title = request.Title.Trim();
        assignment.Description = request.Description;
        assignment.Deadline = request.Deadline;
        assignment.MaxMarks = request.MaxMarks;
        assignment.ClassId = request.ClassId;
        assignment.SubjectId = request.SubjectId;
        assignment.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        assignment.Class = klass;
        assignment.Subject = subject;

        return ToDto(assignment);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var assignment = await _db.Assignments
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwner(assignment);

        if (assignment.Submissions.Any(s => s.Status == SubmissionStatus.Graded))
            throw new AppException("Cannot delete an assignment with graded submissions.", 400, "has_graded_submissions");

        _db.Submissions.RemoveRange(assignment.Submissions);
        _db.Assignments.Remove(assignment);

        await _db.SaveChangesAsync(ct);
    }

    public async Task<AssignmentDto> PublishAsync(Guid id, CancellationToken ct)
    {
        var assignment = await BaseQuery().FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwner(assignment);

        assignment.Status = AssignmentStatus.Published;
        assignment.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return ToDto(assignment);
    }

    public async Task<AssignmentDto> UnpublishAsync(Guid id, CancellationToken ct)
    {
        var assignment = await BaseQuery().FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureOwner(assignment);

        assignment.Status = AssignmentStatus.Draft;
        assignment.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        return ToDto(assignment);
    }

    private IQueryable<Assignment> BaseQuery() =>
        _db.Assignments
            .Include(a => a.Class)
            .Include(a => a.Subject)
            .Include(a => a.CreatedByTeacher)
            .Include(a => a.Submissions)
            .AsQueryable();

    private async Task EnsureViewableAsync(Assignment assignment, CancellationToken ct)
    {
        switch (_currentUser.Role)
        {
            case UserRole.Admin:
                return;

            case UserRole.Teacher:
                var teacherId = _currentUser.UserId;
                if (assignment.CreatedByTeacherId == teacherId)
                    return;
                var assigned = await _db.TeacherAssignments.AnyAsync(
                    t => t.TeacherId == teacherId && t.ClassId == assignment.ClassId && t.SubjectId == assignment.SubjectId, ct);
                if (!assigned)
                    throw new ForbiddenException("You are not assigned to this class and subject.");
                return;

            case UserRole.Student:
                if (assignment.Status != AssignmentStatus.Published)
                    throw new NotFoundException("Assignment not found.");
                var enrolled = await _db.StudentEnrollments.AnyAsync(
                    e => e.StudentId == _currentUser.UserId && e.ClassId == assignment.ClassId, ct);
                if (!enrolled)
                    throw new NotFoundException("Assignment not found.");
                return;
        }
    }

    private void EnsureTeacher()
    {
        if (_currentUser.Role != UserRole.Teacher)
            throw new ForbiddenException("Only teachers can perform this action.");
    }

    private void EnsureOwner(Assignment assignment)
    {
        EnsureTeacher();
        if (assignment.CreatedByTeacherId != _currentUser.UserId)
            throw new ForbiddenException("You can only manage assignments you created.");
    }

    private async Task EnsureAssignedAsync(Guid classId, Guid subjectId, CancellationToken ct)
    {
        var assigned = await _db.TeacherAssignments.AnyAsync(
            t => t.TeacherId == _currentUser.UserId && t.ClassId == classId && t.SubjectId == subjectId, ct);
        if (!assigned)
            throw new ForbiddenException("You are not assigned to teach this class and subject.");
    }

    private static AssignmentDto ToDto(Assignment a) => new(
        a.Id, a.Title, a.Description, a.Deadline, a.MaxMarks, a.Status,
        a.ClassId, a.Class.Name, a.SubjectId, a.Subject.Name,
        a.CreatedByTeacherId, a.CreatedByTeacher.FullName, a.Submissions.Count, a.CreatedAt);
}

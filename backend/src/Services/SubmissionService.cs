using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public interface ISubmissionService
{
    Task<SubmissionDto> CreateAsync(CreateSubmissionRequest request, CancellationToken ct);
    Task<SubmissionDto> UpdateAsync(Guid id, UpdateSubmissionRequest request, CancellationToken ct);
    Task<List<SubmissionDto>> MineAsync(CancellationToken ct);
    Task<List<SubmissionDto>> ListByAssignmentAsync(Guid assignmentId, CancellationToken ct);
    Task<SubmissionDto> GradeAsync(Guid id, GradeSubmissionRequest request, CancellationToken ct);
}

public class SubmissionService : ISubmissionService
{
    private const string AllowLateSubmissionsKey = "AllowLateSubmissions";

    private readonly AppDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly ISettingsService _settingsService;
    private readonly INotificationService _notificationService;

    public SubmissionService(
        AppDbContext db,
        ICurrentUser currentUser,
        ISettingsService settingsService,
        INotificationService notificationService)
    {
        _db = db;
        _currentUser = currentUser;
        _settingsService = settingsService;
        _notificationService = notificationService;
    }

    public async Task<SubmissionDto> CreateAsync(CreateSubmissionRequest request, CancellationToken ct)
    {
        var studentId = _currentUser.UserId;

        var assignment = await _db.Assignments.FirstOrDefaultAsync(a => a.Id == request.AssignmentId, ct)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.Status != AssignmentStatus.Published)
            throw new NotFoundException("Assignment not found.");

        var enrolled = await _db.StudentEnrollments.AnyAsync(
            e => e.StudentId == studentId && e.ClassId == assignment.ClassId, ct);
        if (!enrolled)
            throw new ForbiddenException("You are not enrolled in this class.");

        var alreadyExists = await _db.Submissions.AnyAsync(
            s => s.AssignmentId == request.AssignmentId && s.StudentId == studentId, ct);
        if (alreadyExists)
            throw new AppException("You have already submitted this assignment. Use update instead.", 409, "conflict");

        var now = DateTimeOffset.UtcNow;
        var status = await DetermineStatusOnCreateAsync(assignment, now, ct);

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = request.AssignmentId,
            StudentId = studentId,
            Answer = request.Answer,
            SubmittedAt = now,
            UpdatedAt = now,
            Status = status
        };

        _db.Submissions.Add(submission);
        await _db.SaveChangesAsync(ct);

        var student = await _db.Users.FirstAsync(u => u.Id == studentId, ct);
        return ToDto(submission, assignment, student);
    }

    public async Task<SubmissionDto> UpdateAsync(Guid id, UpdateSubmissionRequest request, CancellationToken ct)
    {
        var studentId = _currentUser.UserId;

        var submission = await _db.Submissions
            .Include(s => s.Assignment)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (submission is null || submission.StudentId != studentId)
            throw new NotFoundException("Submission not found.");

        if (submission.Status == SubmissionStatus.Graded)
            throw new AppException("This submission has already been graded and cannot be updated.", 400, "already_graded");

        var now = DateTimeOffset.UtcNow;
        var status = await DetermineStatusOnCreateAsync(submission.Assignment, now, ct);

        submission.Answer = request.Answer;
        submission.SubmittedAt = now;
        submission.UpdatedAt = now;
        submission.Status = status;

        await _db.SaveChangesAsync(ct);

        var student = await _db.Users.FirstAsync(u => u.Id == studentId, ct);
        return ToDto(submission, submission.Assignment, student);
    }

    public async Task<List<SubmissionDto>> MineAsync(CancellationToken ct)
    {
        var studentId = _currentUser.UserId;

        var submissions = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.StudentId == studentId)
            .OrderByDescending(s => s.SubmittedAt)
            .ToListAsync(ct);

        return submissions.Select(s => ToDto(s, s.Assignment, s.Student)).ToList();
    }

    public async Task<List<SubmissionDto>> ListByAssignmentAsync(Guid assignmentId, CancellationToken ct)
    {
        var assignment = await _db.Assignments.FirstOrDefaultAsync(a => a.Id == assignmentId, ct)
            ?? throw new NotFoundException("Assignment not found.");

        if (_currentUser.Role == UserRole.Teacher)
        {
            var isOwner = assignment.CreatedByTeacherId == _currentUser.UserId;
            var isAssigned = !isOwner && await _db.TeacherAssignments.AnyAsync(
                t => t.TeacherId == _currentUser.UserId && t.ClassId == assignment.ClassId && t.SubjectId == assignment.SubjectId, ct);

            if (!isOwner && !isAssigned)
                throw new ForbiddenException("You can only view submissions for your own assignments.");
        }
        else if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("You are not allowed to view these submissions.");
        }

        var submissions = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .Where(s => s.AssignmentId == assignmentId)
            .OrderBy(s => s.SubmittedAt)
            .ToListAsync(ct);

        return submissions.Select(s => ToDto(s, s.Assignment, s.Student)).ToList();
    }

    public async Task<SubmissionDto> GradeAsync(Guid id, GradeSubmissionRequest request, CancellationToken ct)
    {
        var submission = await _db.Submissions
            .Include(s => s.Assignment)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException("Submission not found.");

        if (_currentUser.Role != UserRole.Teacher || submission.Assignment.CreatedByTeacherId != _currentUser.UserId)
            throw new ForbiddenException("You can only grade submissions for your own assignments.");

        if (request.Marks < 0 || request.Marks > submission.Assignment.MaxMarks)
            throw new AppException($"Marks must be between 0 and {submission.Assignment.MaxMarks}.", 400, "invalid_marks");

        var status = request.Status ?? SubmissionStatus.Graded;
        if (status != SubmissionStatus.Graded && status != SubmissionStatus.Returned)
            throw new AppException("Status must be Graded or Returned.", 400, "invalid_status");

        submission.Marks = request.Marks;
        submission.Feedback = request.Feedback;
        submission.Status = status;
        submission.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        await _notificationService.CreateAsync(
            submission.StudentId,
            "submission_graded",
            $"Your submission for '{submission.Assignment.Title}' has been graded",
            $"You scored {request.Marks}/{submission.Assignment.MaxMarks}.",
            ct);

        return ToDto(submission, submission.Assignment, submission.Student);
    }

    private async Task<SubmissionStatus> DetermineStatusOnCreateAsync(
        Assignment assignment, DateTimeOffset now, CancellationToken ct)
    {
        if (now <= assignment.Deadline)
            return SubmissionStatus.Submitted;

        var allowLate = await _settingsService.GetBoolAsync(AllowLateSubmissionsKey, false, ct);
        if (!allowLate)
            throw new AppException("The deadline has passed and late submissions are not allowed.", 400, "deadline_passed");

        return SubmissionStatus.Late;
    }

    private static SubmissionDto ToDto(Submission s, Assignment a, User student) => new(
        s.Id, s.AssignmentId, a.Title, s.StudentId, student.FullName,
        s.Answer, s.SubmittedAt, s.Status, s.Marks, s.Feedback, a.MaxMarks, a.Deadline);
}

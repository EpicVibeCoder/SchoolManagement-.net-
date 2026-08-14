using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Exceptions;
using backend.DTOs;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Tests;

public class BusinessRulesTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ServiceProvider _sp;
    private readonly Guid _teacherId = Guid.NewGuid();
    private readonly Guid _otherTeacherId = Guid.NewGuid();
    private readonly Guid _studentId = Guid.NewGuid();
    private readonly Guid _classId = Guid.NewGuid();
    private readonly Guid _subjectId = Guid.NewGuid();

    public BusinessRulesTests()
    {
        var services = new ServiceCollection();
        services.AddDbContext<AppDbContext>(o =>
            o.UseInMemoryDatabase(Guid.NewGuid().ToString()));
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, TestCurrentUser>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ISettingsService, SettingsService>();
        services.AddScoped<INotificationService, NotificationService>();
        _sp = services.BuildServiceProvider();
        _db = _sp.GetRequiredService<AppDbContext>();
        Seed();
    }

    private void Seed()
    {
        var now = DateTimeOffset.UtcNow;
        _db.Users.AddRange(
            new User { Id = _teacherId, Email = "t@s.com", FullName = "T", Role = UserRole.Teacher, PasswordHash = "x", CreatedAt = now, UpdatedAt = now },
            new User { Id = _otherTeacherId, Email = "t2@s.com", FullName = "T2", Role = UserRole.Teacher, PasswordHash = "x", CreatedAt = now, UpdatedAt = now },
            new User { Id = _studentId, Email = "s@s.com", FullName = "S", Role = UserRole.Student, PasswordHash = "x", CreatedAt = now, UpdatedAt = now });
        _db.Classes.Add(new Class { Id = _classId, Name = "C", Code = "C1", AcademicYear = "2026", CreatedAt = now, UpdatedAt = now });
        _db.Subjects.Add(new Subject { Id = _subjectId, Name = "Math", Code = "M", CreatedAt = now, UpdatedAt = now });
        _db.TeacherAssignments.Add(new TeacherAssignment
        {
            Id = Guid.NewGuid(), TeacherId = _teacherId, ClassId = _classId, SubjectId = _subjectId, CreatedAt = now
        });
        // Other teacher is also assigned so EnsureAssigned passes; ownership still blocks edit
        _db.TeacherAssignments.Add(new TeacherAssignment
        {
            Id = Guid.NewGuid(), TeacherId = _otherTeacherId, ClassId = _classId, SubjectId = _subjectId, CreatedAt = now
        });
        _db.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(), StudentId = _studentId, ClassId = _classId, EnrolledAt = now
        });
        _db.AppSettings.Add(new AppSetting
        {
            Id = Guid.NewGuid(), Key = "AllowLateSubmissions", Value = "false", UpdatedAt = now
        });
        _db.SaveChanges();
    }

    private static void As(UserRole role, Guid userId)
    {
        TestCurrentUser.Role = role;
        TestCurrentUser.UserId = userId;
    }

    [Fact]
    public async Task Student_Cannot_Grade()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "G2", "desc", DateTimeOffset.UtcNow.AddDays(3), 10, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        var s = await submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            submissions.GradeAsync(s.Id, new GradeSubmissionRequest(10, "ok", null), CancellationToken.None));
    }

    [Fact]
    public async Task Draft_Excluded_From_Student_List_Until_Published()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var created = await assignments.CreateAsync(new CreateAssignmentRequest(
            "Draft HW", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, _classId, _subjectId), CancellationToken.None);

        As(UserRole.Student, _studentId);
        var list = await assignments.ListAsync(null, null, CancellationToken.None);
        Assert.DoesNotContain(list, a => a.Id == created.Id);

        As(UserRole.Teacher, _teacherId);
        await assignments.PublishAsync(created.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        list = await assignments.ListAsync(null, null, CancellationToken.None);
        Assert.Contains(list, a => a.Id == created.Id);
    }

    [Fact]
    public async Task Teacher_Cannot_Edit_Other_Teachers_Assignment()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var created = await assignments.CreateAsync(new CreateAssignmentRequest(
            "HW", "desc", DateTimeOffset.UtcNow.AddDays(5), 50, _classId, _subjectId), CancellationToken.None);

        As(UserRole.Teacher, _otherTeacherId);
        await Assert.ThrowsAsync<ForbiddenException>(() =>
            assignments.UpdateAsync(created.Id, new UpdateAssignmentRequest(
                "Stolen", "x", DateTimeOffset.UtcNow.AddDays(5), 50, _classId, _subjectId), CancellationToken.None));
    }

    [Fact]
    public async Task Submission_Update_Before_Deadline_Ok_Duplicate_Fails()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "Quiz", "desc", DateTimeOffset.UtcNow.AddDays(3), 100, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        var s = await submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "answer1"), CancellationToken.None);
        await submissions.UpdateAsync(s.Id, new UpdateSubmissionRequest("answer2"), CancellationToken.None);

        await Assert.ThrowsAsync<AppException>(() =>
            submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "dup"), CancellationToken.None));
    }

    [Fact]
    public async Task Submission_After_Deadline_Fails_When_Late_Disallowed()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "LateQuiz", "desc", DateTimeOffset.UtcNow.AddDays(-1), 100, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        await Assert.ThrowsAsync<AppException>(() =>
            submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "too late"), CancellationToken.None));
    }

    [Fact]
    public async Task Grade_Marks_Above_Max_Fails()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "G", "desc", DateTimeOffset.UtcNow.AddDays(3), 10, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        var s = await submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None);

        As(UserRole.Teacher, _teacherId);
        await Assert.ThrowsAsync<AppException>(() =>
            submissions.GradeAsync(s.Id, new GradeSubmissionRequest(99, "nope", null), CancellationToken.None));
    }

    [Fact]
    public async Task Late_Allowed_Marks_Late()
    {
        var row = await _db.AppSettings.FirstAsync(s => s.Key == "AllowLateSubmissions");
        row.Value = "true";
        await _db.SaveChangesAsync();

        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "LateOk", "desc", DateTimeOffset.UtcNow.AddDays(-1), 100, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        var s = await submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "late ans"), CancellationToken.None);
        Assert.Equal(SubmissionStatus.Late, s.Status);
    }

    [Fact]
    public async Task Student_Mine_Includes_Assignment_And_Student()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "Mine HW", "show working", DateTimeOffset.UtcNow.AddDays(3), 100, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        var created = await submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "x = 5"), CancellationToken.None);

        var mine = await submissions.MineAsync(CancellationToken.None);
        var row = Assert.Single(mine);
        Assert.Equal(created.Id, row.Id);
        Assert.Equal("Mine HW", row.AssignmentTitle);
        Assert.Equal("show working", row.AssignmentDescription);
        Assert.Equal("C", row.ClassName);
        Assert.Equal("Math", row.SubjectName);
        Assert.Equal("T", row.TeacherName);
        Assert.Equal("S", row.StudentName);
        Assert.Equal("x = 5", row.Answer);
    }

    [Fact]
    public async Task Student_Can_Get_Own_Submission()
    {
        As(UserRole.Teacher, _teacherId);
        var assignments = _sp.GetRequiredService<IAssignmentService>();
        var a = await assignments.CreateAsync(new CreateAssignmentRequest(
            "GetMine", "desc", DateTimeOffset.UtcNow.AddDays(3), 100, _classId, _subjectId), CancellationToken.None);
        await assignments.PublishAsync(a.Id, CancellationToken.None);

        As(UserRole.Student, _studentId);
        var submissions = _sp.GetRequiredService<ISubmissionService>();
        var created = await submissions.CreateAsync(new CreateSubmissionRequest(a.Id, "ans"), CancellationToken.None);

        var detail = await submissions.GetAsync(created.Id, CancellationToken.None);
        Assert.Equal(created.Id, detail.Id);
        Assert.Equal("GetMine", detail.AssignmentTitle);
        Assert.Equal("S", detail.StudentName);
    }

    public void Dispose()
    {
        _db.Dispose();
        _sp.Dispose();
    }
}

sealed class TestCurrentUser : ICurrentUser
{
    public static Guid UserId { get; set; }
    public static UserRole Role { get; set; }
    public static string Email { get; set; } = "test@school.com";

    Guid ICurrentUser.UserId => UserId;
    string ICurrentUser.Email => Email;
    UserRole ICurrentUser.Role => Role;
    bool ICurrentUser.IsAuthenticated => true;
}

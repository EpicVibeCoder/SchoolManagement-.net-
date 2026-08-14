using backend.Auth;
using backend.Data;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.DTOs;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace Backend.Tests;

public abstract class TestHarness : IDisposable
{
    protected readonly AppDbContext Db;
    protected readonly ServiceProvider Sp;

    protected readonly Guid AdminId = Guid.NewGuid();
    protected readonly Guid TeacherId = Guid.NewGuid();
    protected readonly Guid OtherTeacherId = Guid.NewGuid();
    protected readonly Guid UnassignedTeacherId = Guid.NewGuid();
    protected readonly Guid StudentId = Guid.NewGuid();
    protected readonly Guid OtherStudentId = Guid.NewGuid();
    protected readonly Guid ClassId = Guid.NewGuid();
    protected readonly Guid OtherClassId = Guid.NewGuid();
    protected readonly Guid SubjectId = Guid.NewGuid();
    protected readonly Guid OtherSubjectId = Guid.NewGuid();

    protected const string TeacherPassword = "TeacherPass1!";
    protected const string InactivePassword = "InactivePass1!";

    protected TestHarness()
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
        services.AddScoped<IEnrollmentService, EnrollmentService>();
        services.AddScoped<ITeacherAssignmentService, TeacherAssignmentService>();
        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<ISubjectService, SubjectService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddSingleton(Options.Create(new JwtOptions
        {
            Key = "test-jwt-signing-key-must-be-at-least-32",
            Issuer = "tests",
            Audience = "tests",
            ExpiryMinutes = 60
        }));
        services.AddSingleton<JwtTokenService>();

        Sp = services.BuildServiceProvider();
        Db = Sp.GetRequiredService<AppDbContext>();
        Seed();
    }

    private void Seed()
    {
        var now = DateTimeOffset.UtcNow;
        Db.Users.AddRange(
            new User
            {
                Id = AdminId, Email = "admin@s.com", FullName = "Admin", Role = UserRole.Admin,
                PasswordHash = PasswordHasher.Hash("AdminPass1!"), CreatedAt = now, UpdatedAt = now
            },
            new User
            {
                Id = TeacherId, Email = "t@s.com", FullName = "T", Role = UserRole.Teacher,
                PasswordHash = PasswordHasher.Hash(TeacherPassword), CreatedAt = now, UpdatedAt = now
            },
            new User
            {
                Id = OtherTeacherId, Email = "t2@s.com", FullName = "T2", Role = UserRole.Teacher,
                PasswordHash = "x", CreatedAt = now, UpdatedAt = now
            },
            new User
            {
                Id = UnassignedTeacherId, Email = "t3@s.com", FullName = "T3", Role = UserRole.Teacher,
                PasswordHash = "x", CreatedAt = now, UpdatedAt = now
            },
            new User
            {
                Id = StudentId, Email = "s@s.com", FullName = "S", Role = UserRole.Student,
                PasswordHash = "x", CreatedAt = now, UpdatedAt = now
            },
            new User
            {
                Id = OtherStudentId, Email = "s2@s.com", FullName = "S2", Role = UserRole.Student,
                PasswordHash = "x", CreatedAt = now, UpdatedAt = now
            });
        Db.Classes.AddRange(
            new Class { Id = ClassId, Name = "C", Code = "C1", AcademicYear = "2026", CreatedAt = now, UpdatedAt = now },
            new Class { Id = OtherClassId, Name = "C2", Code = "C2", AcademicYear = "2026", CreatedAt = now, UpdatedAt = now });
        Db.Subjects.AddRange(
            new Subject { Id = SubjectId, Name = "Math", Code = "M", CreatedAt = now, UpdatedAt = now },
            new Subject { Id = OtherSubjectId, Name = "Physics", Code = "P", CreatedAt = now, UpdatedAt = now });
        Db.TeacherAssignments.AddRange(
            new TeacherAssignment
            {
                Id = Guid.NewGuid(), TeacherId = TeacherId, ClassId = ClassId, SubjectId = SubjectId, CreatedAt = now
            },
            new TeacherAssignment
            {
                Id = Guid.NewGuid(), TeacherId = OtherTeacherId, ClassId = ClassId, SubjectId = SubjectId, CreatedAt = now
            });
        Db.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(), StudentId = StudentId, ClassId = ClassId, EnrolledAt = now
        });
        Db.AppSettings.Add(new AppSetting
        {
            Id = Guid.NewGuid(), Key = "AllowLateSubmissions", Value = "false", UpdatedAt = now
        });
        Db.SaveChanges();
    }

    protected static void As(UserRole role, Guid userId)
    {
        TestCurrentUser.Role = role;
        TestCurrentUser.UserId = userId;
    }

    protected IAssignmentService Assignments => Sp.GetRequiredService<IAssignmentService>();
    protected ISubmissionService Submissions => Sp.GetRequiredService<ISubmissionService>();
    protected IUserService Users => Sp.GetRequiredService<IUserService>();
    protected IAuthService Auth => Sp.GetRequiredService<IAuthService>();
    protected IClassService Classes => Sp.GetRequiredService<IClassService>();
    protected ISubjectService Subjects => Sp.GetRequiredService<ISubjectService>();
    protected IEnrollmentService Enrollments => Sp.GetRequiredService<IEnrollmentService>();
    protected ITeacherAssignmentService TeacherAssignments => Sp.GetRequiredService<ITeacherAssignmentService>();
    protected ISettingsService Settings => Sp.GetRequiredService<ISettingsService>();
    protected INotificationService Notifications => Sp.GetRequiredService<INotificationService>();

    protected async Task<(AssignmentDto Assignment, SubmissionDto Submission)> PublishedWithSubmissionAsync(
        string title = "HW", DateTimeOffset? deadline = null)
    {
        As(UserRole.Teacher, TeacherId);
        var assignment = await Assignments.CreateAsync(new CreateAssignmentRequest(
            title, "desc", deadline ?? DateTimeOffset.UtcNow.AddDays(3), 100, ClassId, SubjectId), CancellationToken.None);
        await Assignments.PublishAsync(assignment.Id, CancellationToken.None);

        As(UserRole.Student, StudentId);
        var submission = await Submissions.CreateAsync(
            new CreateSubmissionRequest(assignment.Id, "ans"), CancellationToken.None);
        return (assignment, submission);
    }

    public void Dispose()
    {
        Db.Dispose();
        Sp.Dispose();
        GC.SuppressFinalize(this);
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

using backend.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static readonly Guid AdminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid TeacherId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid Student1Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid Student2Id = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid ClassId = Guid.Parse("55555555-5555-5555-5555-555555555555");
    public static readonly Guid SubjectMathId = Guid.Parse("66666666-6666-6666-6666-666666666666");
    public static readonly Guid SubjectEngId = Guid.Parse("77777777-7777-7777-7777-777777777777");
    public static readonly Guid DraftAssignmentId = Guid.Parse("88888888-8888-8888-8888-888888888888");
    public static readonly Guid PublishedAssignmentId = Guid.Parse("99999999-9999-9999-9999-999999999999");

    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(ct))
            return;

        var now = DateTimeOffset.UtcNow;

        var admin = new User
        {
            Id = AdminId,
            Email = "admin@school.com",
            FullName = "System Admin",
            Role = UserRole.Admin,
            PasswordHash = PasswordHasher.Hash("Admin123!"),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        var teacher = new User
        {
            Id = TeacherId,
            Email = "teacher@school.com",
            FullName = "Alice Teacher",
            Role = UserRole.Teacher,
            PasswordHash = PasswordHasher.Hash("Teacher123!"),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        var student1 = new User
        {
            Id = Student1Id,
            Email = "student1@school.com",
            FullName = "Bob Student",
            Role = UserRole.Student,
            PasswordHash = PasswordHasher.Hash("Student123!"),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
        var student2 = new User
        {
            Id = Student2Id,
            Email = "student2@school.com",
            FullName = "Carol Student",
            Role = UserRole.Student,
            PasswordHash = PasswordHasher.Hash("Student123!"),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        var klass = new Class
        {
            Id = ClassId,
            Name = "Grade 10 A",
            Code = "G10A",
            AcademicYear = "2025-2026",
            CreatedAt = now,
            UpdatedAt = now
        };

        var math = new Subject
        {
            Id = SubjectMathId,
            Name = "Mathematics",
            Code = "MATH",
            CreatedAt = now,
            UpdatedAt = now
        };
        var eng = new Subject
        {
            Id = SubjectEngId,
            Name = "English",
            Code = "ENG",
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Users.AddRange(admin, teacher, student1, student2);
        db.Classes.Add(klass);
        db.Subjects.AddRange(math, eng);
        db.TeacherAssignments.Add(new TeacherAssignment
        {
            Id = Guid.NewGuid(),
            TeacherId = TeacherId,
            ClassId = ClassId,
            SubjectId = SubjectMathId,
            CreatedAt = now
        });
        db.StudentEnrollments.AddRange(
            new StudentEnrollment { Id = Guid.NewGuid(), StudentId = Student1Id, ClassId = ClassId, EnrolledAt = now },
            new StudentEnrollment { Id = Guid.NewGuid(), StudentId = Student2Id, ClassId = ClassId, EnrolledAt = now });

        db.Assignments.AddRange(
            new Assignment
            {
                Id = DraftAssignmentId,
                Title = "Algebra Practice (Draft)",
                Description = "Draft worksheet — not visible to students.",
                Deadline = now.AddDays(14),
                MaxMarks = 50,
                Status = AssignmentStatus.Draft,
                ClassId = ClassId,
                SubjectId = SubjectMathId,
                CreatedByTeacherId = TeacherId,
                CreatedAt = now,
                UpdatedAt = now
            },
            new Assignment
            {
                Id = PublishedAssignmentId,
                Title = "Linear Equations Quiz",
                Description = "Solve the given linear equations. Show your working.",
                Deadline = now.AddDays(7),
                MaxMarks = 100,
                Status = AssignmentStatus.Published,
                ClassId = ClassId,
                SubjectId = SubjectMathId,
                CreatedByTeacherId = TeacherId,
                CreatedAt = now,
                UpdatedAt = now
            });

        db.Submissions.Add(new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = PublishedAssignmentId,
            StudentId = Student1Id,
            Answer = "x = 5 for equation 2x + 3 = 13.",
            SubmittedAt = now.AddHours(-2),
            UpdatedAt = now.AddHours(-2),
            Status = SubmissionStatus.Submitted
        });

        db.AppSettings.Add(new AppSetting
        {
            Id = Guid.NewGuid(),
            Key = "AllowLateSubmissions",
            Value = "false",
            UpdatedAt = now
        });

        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Student1Id,
            Type = "assignment_published",
            Title = "New assignment published",
            Body = "Linear Equations Quiz is now available.",
            IsRead = false,
            CreatedAt = now
        });

        await db.SaveChangesAsync(ct);
    }
}

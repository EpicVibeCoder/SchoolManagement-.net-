using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
    public ICollection<StudentEnrollment> StudentEnrollments { get; set; } = [];
    public ICollection<Assignment> CreatedAssignments { get; set; } = [];
    public ICollection<Submission> Submissions { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}
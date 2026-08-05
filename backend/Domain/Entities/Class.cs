namespace backend.Domain.Entities;

public class Class
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<Subject> Subjects { get; set; } = [];
    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
    public ICollection<StudentEnrollment> StudentEnrollments { get; set; } = [];
    public ICollection<Assignment> Assignments { get; set; } = [];
}
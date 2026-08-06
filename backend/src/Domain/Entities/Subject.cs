namespace backend.Domain.Entities;

public class Subject
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = [];
    public ICollection<Assignment> Assignments { get; set; } = [];
}
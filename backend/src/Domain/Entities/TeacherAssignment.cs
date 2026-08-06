namespace backend.Domain.Entities;

public class TeacherAssignment
{
    public Guid Id { get; set; }
    public Guid TeacherId { get; set; }
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public User Teacher { get; set; } = null!;
    public Class Class { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
}
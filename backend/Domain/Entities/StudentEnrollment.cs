namespace backend.Domain.Entities;

public class StudentEnrollment
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public Guid ClassId { get; set; }
    public DateTimeOffset EnrolledAt { get; set; }

    public User Student { get; set; } = null!;
    public Class Class { get; set; } = null!;
}
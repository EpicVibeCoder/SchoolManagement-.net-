using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Assignment
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTimeOffset Deadline { get; set; }
    public int MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid CreatedByTeacherId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Class Class { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
    public User CreatedByTeacher { get; set; } = null!;
    public ICollection<Submission> Submissions { get; set; } = [];
}
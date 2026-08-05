using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Submission
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; }
    public string Answer { get; set; } = string.Empty;
    public DateTimeOffset SubmittedAt { get; set; }
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
    public int? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Assignment Assignment { get; set; } = null!;
    public User Student { get; set; } = null!;
}
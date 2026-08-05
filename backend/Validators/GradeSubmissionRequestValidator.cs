using backend.DTOs;
using backend.Domain.Enums;
using FluentValidation;

namespace backend.Validators;

public class GradeSubmissionRequestValidator : AbstractValidator<GradeSubmissionRequest>
{
    public GradeSubmissionRequestValidator()
    {
        RuleFor(x => x.Marks).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Feedback).NotNull().MaximumLength(4000);
        RuleFor(x => x.Status)
            .Must(s => s is null || s == SubmissionStatus.Graded || s == SubmissionStatus.Returned)
            .WithMessage("Status must be Graded or Returned.");
    }
}

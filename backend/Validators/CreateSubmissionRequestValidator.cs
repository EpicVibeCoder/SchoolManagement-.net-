using backend.DTOs;
using FluentValidation;

namespace backend.Validators;

public class CreateSubmissionRequestValidator : AbstractValidator<CreateSubmissionRequest>
{
    public CreateSubmissionRequestValidator()
    {
        RuleFor(x => x.AssignmentId).NotEmpty();
        RuleFor(x => x.Answer).NotEmpty().MaximumLength(8000);
    }
}

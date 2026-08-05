namespace backend.DTOs;

public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

public record ApiError(string Message, string? Code = null, object? Details = null);

public record DashboardStatsDto(
    int Users,
    int Classes,
    int Assignments,
    int Submissions,
    int PendingGrading,
    int DueSoon);

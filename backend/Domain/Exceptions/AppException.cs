namespace backend.Domain.Exceptions;

public class AppException : Exception
{
    public int StatusCode { get; }
    public string? Code { get; }

    public AppException(string message, int statusCode = 400, string? code = null)
        : base(message)
    {
        StatusCode = statusCode;
        Code = code;
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, 404, "not_found") { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Forbidden") : base(message, 403, "forbidden") { }
}

public class UnauthorizedAppException : AppException
{
    public UnauthorizedAppException(string message = "Unauthorized") : base(message, 401, "unauthorized") { }
}

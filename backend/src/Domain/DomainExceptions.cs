// ============================================================
// GrouponClone.Domain — Custom Exceptions
// ============================================================

namespace GrouponClone.Domain.Exceptions;

public class DomainException(string message) : Exception(message);
public class NotFoundException(string message) : Exception(message)
{
    public NotFoundException(string entityName, object key)
        : this($"{entityName} with key '{key}' was not found.") { }
}
public class UnauthorizedException(string message = "Unauthorized.") : Exception(message);
public class ForbiddenException(string message = "You do not have permission to perform this action.") : Exception(message);
public class ConflictException(string message) : Exception(message);

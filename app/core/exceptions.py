"""Application-wide exception hierarchy.

Every domain error raised anywhere in the codebase should subclass
`AppException` so the FastAPI exception handlers registered in
`app.main` can translate it into a consistent JSON error envelope
without each endpoint needing its own try/except boilerplate.
"""

from __future__ import annotations


class AppException(Exception):
    """Base class for all application-raised (as opposed to unexpected) errors."""

    status_code: int = 500
    error_code: str = "internal_error"

    def __init__(self, detail: str, *, error_code: str | None = None) -> None:
        self.detail = detail
        if error_code:
            self.error_code = error_code
        super().__init__(detail)


class InvalidCredentialsError(AppException):
    status_code = 401
    error_code = "invalid_credentials"

    def __init__(self, detail: str = "Incorrect email or password.") -> None:
        super().__init__(detail)


class AccountLockedError(AppException):
    status_code = 423
    error_code = "account_locked"

    def __init__(self, detail: str = "Account temporarily locked due to repeated failed logins.") -> None:
        super().__init__(detail)


class InactiveUserError(AppException):
    status_code = 403
    error_code = "inactive_user"

    def __init__(self, detail: str = "This user account is inactive.") -> None:
        super().__init__(detail)


class TokenError(AppException):
    status_code = 401
    error_code = "invalid_token"

    def __init__(self, detail: str = "Could not validate credentials.") -> None:
        super().__init__(detail)


class PermissionDeniedError(AppException):
    status_code = 403
    error_code = "permission_denied"

    def __init__(self, detail: str = "You do not have permission to perform this action.") -> None:
        super().__init__(detail)


class UserAlreadyExistsError(AppException):
    status_code = 409
    error_code = "user_already_exists"

    def __init__(self, detail: str = "A user with this email already exists.") -> None:
        super().__init__(detail)


class NotFoundError(AppException):
    status_code = 404
    error_code = "not_found"

    def __init__(self, detail: str = "Resource not found.") -> None:
        super().__init__(detail)


class ValidationAppError(AppException):
    status_code = 422
    error_code = "validation_error"

    def __init__(self, detail: str = "Validation failed.") -> None:
        super().__init__(detail)

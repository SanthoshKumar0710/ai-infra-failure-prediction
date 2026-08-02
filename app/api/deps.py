"""FastAPI dependency providers: DB sessions, repositories, services,
current-user resolution, and RBAC guards.

Centralizing dependencies here means endpoints declare *what* they need
(`current_user: User = Depends(get_current_user)`) without knowing
*how* it's constructed, which keeps endpoint modules thin and the
object graph swappable (e.g. for tests).
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import InactiveUserError, PermissionDeniedError, TokenError
from app.core.redis_client import get_redis
from app.core.security import TokenType, decode_token
from app.db.session import get_db
from app.models.enums import ROLE_HIERARCHY, UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def get_user_repository(session: Annotated[AsyncSession, Depends(get_db)]) -> UserRepository:
    return UserRepository(session)


def get_auth_service(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> AuthService:
    return AuthService(user_repository, redis)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
    redis: Annotated[Redis, Depends(get_redis)],
) -> User:
    """Resolve and validate the requesting user from a bearer access token."""
    payload = decode_token(token, expected_type=TokenType.ACCESS)

    if await redis.exists(f"revoked_jti:{payload.jti}") == 1:
        raise TokenError("Token has been revoked.")

    try:
        user_id = uuid.UUID(payload.sub)
    except ValueError as exc:
        raise TokenError("Malformed subject claim.") from exc

    user = await user_repository.get_by_id(user_id)
    if user is None:
        raise TokenError("User no longer exists.")
    if not user.is_active:
        raise InactiveUserError()

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(minimum_role: UserRole):
    """Dependency factory enforcing a minimum RBAC role.

    Usage: `Depends(require_role(UserRole.ADMIN))`. Roles are compared
    via `ROLE_HIERARCHY` so `require_role(UserRole.OPERATOR)` also
    admits `ML_ENGINEER` and `ADMIN`, matching typical RBAC semantics
    where higher privilege implies lower privilege.
    """

    async def _checker(current_user: CurrentUser) -> User:
        if ROLE_HIERARCHY[current_user.role] < ROLE_HIERARCHY[minimum_role]:
            raise PermissionDeniedError(
                f"Requires role '{minimum_role.value}' or higher; you have '{current_user.role.value}'."
            )
        return current_user

    return _checker

"""
FastAPI dependency providers.

Provides:

- Database sessions
- Repositories
- Services
- Current authenticated user
- RBAC guards
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    InactiveUserError,
    PermissionDeniedError,
    TokenError,
)
from app.core.redis_client import get_redis
from app.core.security import TokenType, decode_token
from app.db.session import get_db

from app.models.enums import ROLE_HIERARCHY, UserRole
from app.models.user import User

from app.repositories.alert_repository import AlertRepository
from app.repositories.metric_repository import MetricRepository
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.server_repository import ServerRepository
from app.repositories.user_repository import UserRepository

from app.services.alert_service import AlertService
from app.services.auth_service import AuthService
from app.services.prediction_service import PredictionService


# ============================================================
# OAuth2
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login"
)


# ============================================================
# Database Session
# ============================================================

DatabaseSession = Annotated[
    AsyncSession,
    Depends(get_db),
]


# ============================================================
# User Repository
# ============================================================

def get_user_repository(
    session: DatabaseSession,
) -> UserRepository:
    return UserRepository(session)


# ============================================================
# Server Repository
# ============================================================

def get_server_repository(
    session: DatabaseSession,
) -> ServerRepository:
    return ServerRepository(session)


# ============================================================
# Metric Repository
# ============================================================

def get_metric_repository(
    session: DatabaseSession,
) -> MetricRepository:
    return MetricRepository(session)


# ============================================================
# Prediction Repository
# ============================================================

def get_prediction_repository(
    session: DatabaseSession,
) -> PredictionRepository:
    return PredictionRepository(session)


# ============================================================
# Alert Repository
# ============================================================

def get_alert_repository(
    session: DatabaseSession,
) -> AlertRepository:
    return AlertRepository(session)


# ============================================================
# Auth Service
# ============================================================

def get_auth_service(
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository),
    ],
    redis: Annotated[
        Redis,
        Depends(get_redis),
    ],
) -> AuthService:

    return AuthService(
        user_repository,
        redis,
    )


# ============================================================
# Alert Service
# ============================================================

def get_alert_service(
    alert_repository: Annotated[
        AlertRepository,
        Depends(get_alert_repository),
    ],
) -> AlertService:

    return AlertService(
        alert_repository=alert_repository,
    )


# ============================================================
# Prediction Service
# ============================================================

def get_prediction_service(
    prediction_repository: Annotated[
        PredictionRepository,
        Depends(get_prediction_repository),
    ],
    metric_repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
    alert_service: Annotated[
        AlertService,
        Depends(get_alert_service),
    ],
) -> PredictionService:

    return PredictionService(
        prediction_repository=prediction_repository,
        metric_repository=metric_repository,
        alert_service=alert_service,
    )



# ============================================================
# Current User
# ============================================================

async def get_current_user(
    token: Annotated[
        str,
        Depends(oauth2_scheme),
    ],
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository),
    ],
    redis: Annotated[
        Redis,
        Depends(get_redis),
    ],
) -> User:

    # --------------------------------------------------------
    # Decode access token
    # --------------------------------------------------------

    payload = decode_token(
        token,
        expected_type=TokenType.ACCESS,
    )

    # --------------------------------------------------------
    # Check token revocation
    # --------------------------------------------------------

    if await redis.exists(
        f"revoked_jti:{payload.jti}"
    ) == 1:

        raise TokenError(
            "Token has been revoked."
        )

    # --------------------------------------------------------
    # Extract user ID
    # --------------------------------------------------------

    try:

        user_id = uuid.UUID(
            payload.sub
        )

    except ValueError as exc:

        raise TokenError(
            "Malformed subject claim."
        ) from exc

    # --------------------------------------------------------
    # Get user
    # --------------------------------------------------------

    user = await user_repository.get_by_id(
        user_id
    )

    if user is None:

        raise TokenError(
            "User no longer exists."
        )

    # --------------------------------------------------------
    # Check active status
    # --------------------------------------------------------

    if not user.is_active:

        raise InactiveUserError()

    return user


# ============================================================
# Current User Dependency
# ============================================================

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


# ============================================================
# Role-Based Access Control (RBAC)
# ============================================================

def require_role(
    minimum_role: UserRole,
):
    """
    Require the authenticated user to have
    the specified role or a higher role.
    """

    async def _checker(
        current_user: CurrentUser,
    ) -> User:

        if (
            ROLE_HIERARCHY[current_user.role]
            < ROLE_HIERARCHY[minimum_role]
        ):

            raise PermissionDeniedError(
                f"Requires role '{minimum_role.value}' "
                f"or higher; "
                f"you have '{current_user.role.value}'."
            )

        return current_user

    return _checker
"""User-facing and admin-facing user management endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.api.deps import get_user_repository, require_role
from app.models.enums import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# ------------------------------------------------------------------
# List Users
# ------------------------------------------------------------------

@router.get(
    "",
    response_model=list[UserRead],
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)
async def list_users(
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository)
    ],
    limit: int = 100,
    offset: int = 0,
) -> list[UserRead]:

    service = UserService(user_repository)

    users = await service.list_users(
        limit=limit,
        offset=offset,
    )

    return [
        UserRead.model_validate(user)
        for user in users
    ]


# ------------------------------------------------------------------
# Search Users
# ------------------------------------------------------------------

@router.get(
    "/search",
    response_model=list[UserRead],
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)
async def search_users(
    keyword: str,
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository)
    ],
) -> list[UserRead]:

    service = UserService(user_repository)

    users = await service.search_users(keyword)

    return [
        UserRead.model_validate(user)
        for user in users
    ]


# ------------------------------------------------------------------
# Get User By ID
# ------------------------------------------------------------------

@router.get(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)
async def get_user_by_id(
    user_id: uuid.UUID,
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository)
    ],
) -> UserRead:

    service = UserService(user_repository)

    user = await service.get_user_by_id(user_id)

    return UserRead.model_validate(user)


# ------------------------------------------------------------------
# Update User
# ------------------------------------------------------------------

@router.put(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository)
    ],
) -> UserRead:

    service = UserService(user_repository)

    user = await service.update_user(
        user_id=user_id,
        payload=payload,
    )

    return UserRead.model_validate(user)


# ------------------------------------------------------------------
# Delete User
# ------------------------------------------------------------------

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(UserRole.ADMIN))]
)
async def delete_user(
    user_id: uuid.UUID,
    user_repository: Annotated[
        UserRepository,
        Depends(get_user_repository)
    ],
) -> Response:

    service = UserService(user_repository)

    await service.delete_user(user_id)

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
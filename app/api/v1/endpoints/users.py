"""User-facing and admin-facing user management endpoints.

Deliberately minimal in Module 1 (just enough to prove out RBAC end to
end); full CRUD, pagination, and search land in Module 2 (User & Server
Management).
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import get_user_repository, require_role
from app.models.enums import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserRead], dependencies=[Depends(require_role(UserRole.ADMIN))])
async def list_users(
    user_repository: Annotated[UserRepository, Depends(get_user_repository)],
    limit: int = 100,
    offset: int = 0,
) -> list[UserRead]:
    """List all platform users. Restricted to ADMIN role via RBAC dependency."""
    users = await user_repository.list_all(limit=limit, offset=offset)
    return [UserRead.model_validate(u) for u in users]

"""User service layer."""

from __future__ import annotations

import uuid

from app.core.exceptions import NotFoundError
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate


class UserService:
    """Business logic for user management."""

    def __init__(self, user_repository: UserRepository) -> None:
        self._users = user_repository

    # ------------------------------------------------------------------
    # Get User by ID
    # ------------------------------------------------------------------

    async def get_user_by_id(
        self,
        user_id: uuid.UUID,
    ) -> User:
        """Return one user."""

        user = await self._users.get_by_id(user_id)

        if user is None:
            raise NotFoundError("User not found.")

        return user

    # ------------------------------------------------------------------
    # List Users
    # ------------------------------------------------------------------

    async def list_users(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[User]:
        """Return all users."""

        return await self._users.list_all(
            limit=limit,
            offset=offset,
        )

    # ------------------------------------------------------------------
    # Search Users
    # ------------------------------------------------------------------

    async def search_users(
        self,
        keyword: str,
    ) -> list[User]:
        """Search users by email or full name."""

        return await self._users.search_users(keyword)

    # ------------------------------------------------------------------
    # Update User
    # ------------------------------------------------------------------

    async def update_user(
        self,
        user_id: uuid.UUID,
        payload: UserUpdate,
    ) -> User:
        """Update an existing user."""

        user = await self._users.get_by_id(user_id)

        if user is None:
            raise NotFoundError("User not found.")

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(user, field, value)

        return await self._users.update(user)

    # ------------------------------------------------------------------
    # Delete User
    # ------------------------------------------------------------------

    async def delete_user(
        self,
        user_id: uuid.UUID,
    ) -> None:
        """Delete a user."""

        user = await self._users.get_by_id(user_id)

        if user is None:
            raise NotFoundError("User not found.")

        await self._users.delete(user_id)
"""SQLAlchemy implementation of the User repository."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import AbstractRepository


class UserRepository(AbstractRepository[User]):
    """Persistence gateway for the User model."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, entity_id: uuid.UUID) -> User | None:
        return await self._session.get(User, entity_id)

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def add(self, entity: User) -> User:
        self._session.add(entity)
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def update(self, entity: User) -> User:
        await self._session.commit()
        await self._session.refresh(entity)
        return entity

    async def delete(self, entity_id: uuid.UUID) -> None:
        user = await self.get_by_id(entity_id)

        if user is not None:
            await self._session.delete(user)
            await self._session.commit()

    async def record_failed_login(
        self,
        user: User,
        *,
        max_attempts: int,
        lockout_until: datetime | None,
    ) -> User:

        user.failed_login_attempts += 1

        if (
            user.failed_login_attempts >= max_attempts
            and lockout_until is not None
        ):
            user.locked_until = lockout_until

        await self._session.commit()
        await self._session.refresh(user)

        return user

    async def record_successful_login(
        self,
        user: User,
        *,
        login_time: datetime,
    ) -> User:

        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = login_time

        await self._session.commit()
        await self._session.refresh(user)

        return user

    async def list_all(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[User]:

        result = await self._session.execute(
            select(User)
            .offset(offset)
            .limit(limit)
        )

        return list(result.scalars().all())

    # ------------------------------------------------------------------
    # Search Users
    # ------------------------------------------------------------------

    async def search_users(
        self,
        keyword: str,
    ) -> list[User]:

        result = await self._session.execute(
            select(User).where(
                or_(
                    User.email.ilike(f"%{keyword}%"),
                    User.full_name.ilike(f"%{keyword}%"),
                )
            )
        )

        return list(result.scalars().all())
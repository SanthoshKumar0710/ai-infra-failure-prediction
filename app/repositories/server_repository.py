"""SQLAlchemy implementation of the Server repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.server import Server


class ServerRepository:
    """Persistence gateway for the Server model."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(
        self,
        server_id: uuid.UUID,
    ) -> Server | None:
        """Return a server by its ID."""
        return await self._session.get(Server, server_id)

    async def get_by_hostname(
        self,
        hostname: str,
    ) -> Server | None:
        """Return a server by hostname."""
        result = await self._session.execute(
            select(Server).where(Server.hostname == hostname)
        )
        return result.scalar_one_or_none()

    async def add(
        self,
        server: Server,
    ) -> Server:
        """Create a new server."""
        self._session.add(server)
        await self._session.commit()
        await self._session.refresh(server)
        return server

    async def update(
        self,
        server: Server,
    ) -> Server:
        """Update an existing server."""
        await self._session.commit()
        await self._session.refresh(server)
        return server

    async def delete(
        self,
        server: Server,
    ) -> None:
        """Delete a server."""
        await self._session.delete(server)
        await self._session.commit()

    async def list_all(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Server]:
        """Return all servers."""
        result = await self._session.execute(
            select(Server)
            .offset(offset)
            .limit(limit)
        )
        return list(result.scalars().all())
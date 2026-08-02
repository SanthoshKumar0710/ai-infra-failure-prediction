"""Business logic for server management."""

from __future__ import annotations

import uuid

from app.core.exceptions import NotFoundError
from app.models.server import Server
from app.repositories.server_repository import ServerRepository
from app.schemas.server import ServerCreate, ServerUpdate


class ServerService:
    """Business logic for server management."""

    def __init__(
        self,
        server_repository: ServerRepository,
    ) -> None:
        self._servers = server_repository

    # ----------------------------------------------------------
    # Create Server
    # ----------------------------------------------------------

    async def create_server(
        self,
        payload: ServerCreate,
    ) -> Server:
        server = Server(**payload.model_dump())

        return await self._servers.add(server)

    # ----------------------------------------------------------
    # Get Server
    # ----------------------------------------------------------

    async def get_server_by_id(
        self,
        server_id: uuid.UUID,
    ) -> Server:

        server = await self._servers.get_by_id(server_id)

        if server is None:
            raise NotFoundError("Server not found.")

        return server

    # ----------------------------------------------------------
    # List Servers
    # ----------------------------------------------------------

    async def list_servers(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Server]:

        return await self._servers.list_all(
            limit=limit,
            offset=offset,
        )

    # ----------------------------------------------------------
    # Update Server
    # ----------------------------------------------------------

    async def update_server(
        self,
        server_id: uuid.UUID,
        payload: ServerUpdate,
    ) -> Server:

        server = await self._servers.get_by_id(server_id)

        if server is None:
            raise NotFoundError("Server not found.")

        update_data = payload.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(server, field, value)

        return await self._servers.update(server)

    # ----------------------------------------------------------
    # Delete Server
    # ----------------------------------------------------------

    async def delete_server(
        self,
        server_id: uuid.UUID,
    ) -> None:

        server = await self._servers.get_by_id(server_id)

        if server is None:
            raise NotFoundError("Server not found.")

        await self._servers.delete(server)
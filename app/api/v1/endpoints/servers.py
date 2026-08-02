"""Server management endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.deps import (
    get_server_repository,
    require_role,
)
from app.models.enums import UserRole
from app.repositories.server_repository import ServerRepository
from app.schemas.server import (
    ServerCreate,
    ServerRead,
    ServerUpdate,
)
from app.services.server_service import ServerService

router = APIRouter(
    prefix="/servers",
    tags=["Servers"],
)


# ------------------------------------------------------------------
# Create Server
# ------------------------------------------------------------------

@router.post(
    "",
    response_model=ServerRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def create_server(
    payload: ServerCreate,
    repository: Annotated[
        ServerRepository,
        Depends(get_server_repository),
    ],
) -> ServerRead:

    service = ServerService(repository)

    server = await service.create_server(payload)

    return ServerRead.model_validate(server)


# ------------------------------------------------------------------
# List Servers
# ------------------------------------------------------------------

@router.get(
    "",
    response_model=list[ServerRead],
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def list_servers(
    repository: Annotated[
        ServerRepository,
        Depends(get_server_repository),
    ],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[ServerRead]:

    service = ServerService(repository)

    servers = await service.list_servers(
        limit=limit,
        offset=offset,
    )

    return [
        ServerRead.model_validate(server)
        for server in servers
    ]


# ------------------------------------------------------------------
# Get Server by ID
# ------------------------------------------------------------------

@router.get(
    "/{server_id}",
    response_model=ServerRead,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def get_server(
    server_id: uuid.UUID,
    repository: Annotated[
        ServerRepository,
        Depends(get_server_repository),
    ],
) -> ServerRead:

    service = ServerService(repository)

    server = await service.get_server_by_id(server_id)

    return ServerRead.model_validate(server)


# ------------------------------------------------------------------
# Update Server
# ------------------------------------------------------------------

@router.put(
    "/{server_id}",
    response_model=ServerRead,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def update_server(
    server_id: uuid.UUID,
    payload: ServerUpdate,
    repository: Annotated[
        ServerRepository,
        Depends(get_server_repository),
    ],
) -> ServerRead:

    service = ServerService(repository)

    server = await service.update_server(
        server_id,
        payload,
    )

    return ServerRead.model_validate(server)


# ------------------------------------------------------------------
# Delete Server
# ------------------------------------------------------------------

@router.delete(
    "/{server_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def delete_server(
    server_id: uuid.UUID,
    repository: Annotated[
        ServerRepository,
        Depends(get_server_repository),
    ],
) -> Response:

    service = ServerService(repository)

    await service.delete_server(server_id)

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
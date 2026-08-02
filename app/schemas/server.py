"""Pydantic schemas for Server CRUD."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.server_enums import (
    ServerEnvironment,
    ServerStatus,
)


class ServerBase(BaseModel):
    hostname: str = Field(
        min_length=2,
        max_length=255,
    )

    ip_address: str

    operating_system: str = Field(
        max_length=100,
    )

    environment: ServerEnvironment

    status: ServerStatus = ServerStatus.ONLINE

    description: str | None = Field(
        default=None,
        max_length=500,
    )


class ServerCreate(ServerBase):
    """Schema used when creating a server."""

    pass


class ServerUpdate(BaseModel):
    hostname: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )

    ip_address: str | None = None

    operating_system: str | None = Field(
        default=None,
        max_length=100,
    )

    environment: ServerEnvironment | None = None

    status: ServerStatus | None = None

    description: str | None = Field(
        default=None,
        max_length=500,
    )


class ServerRead(ServerBase):
    """Schema returned by the API."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    created_at: datetime

    updated_at: datetime
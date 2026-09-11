"""Pydantic schemas for Alert CRUD."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.alert_enums import AlertSeverity


class AlertCreate(BaseModel):
    """Schema for creating an alert."""

    server_id: uuid.UUID
    prediction_id: uuid.UUID | None = None
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    severity: AlertSeverity = AlertSeverity.WARNING


class AlertUpdate(BaseModel):
    """Schema for updating an alert."""

    is_read: bool | None = None


class AlertRead(BaseModel):
    """Schema returned to API clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    server_id: uuid.UUID
    prediction_id: uuid.UUID | None = None
    title: str
    message: str
    severity: AlertSeverity
    is_read: bool
    created_at: datetime

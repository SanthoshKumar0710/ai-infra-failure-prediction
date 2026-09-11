"""Pydantic schemas for Prediction."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.prediction_enums import PredictionRisk


class PredictionCreate(BaseModel):
    """Request schema for generating a prediction."""

    server_id: uuid.UUID
    metric_id: uuid.UUID


class PredictionRead(BaseModel):
    """Response schema returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    server_id: uuid.UUID
    metric_id: uuid.UUID

    failure_probability: float
    risk_level: PredictionRisk
    predicted_failure: bool

    model_version: str
    created_at: datetime
"""Enums for prediction results."""

from __future__ import annotations

from enum import StrEnum


class PredictionRisk(StrEnum):
    """Risk level predicted by the ML model."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
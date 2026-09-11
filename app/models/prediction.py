"""Prediction ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.prediction_enums import PredictionRisk


class Prediction(Base):
    """Stores AI failure predictions for server metrics."""

    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    server_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("servers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    metric_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("metrics.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    failure_probability: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    risk_level: Mapped[PredictionRisk] = mapped_column(
        Enum(
            PredictionRisk,
            name="prediction_risk",
            native_enum=True,
        ),
        nullable=False,
    )

    predicted_failure: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="v1.0",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    server = relationship(
        "Server",
        back_populates="predictions",
    )

    metric = relationship(
        "Metric",
        back_populates="prediction",
    )

    def __repr__(self) -> str:
        return (
            f"<Prediction("
            f"id={self.id}, "
            f"risk={self.risk_level.value}, "
            f"probability={self.failure_probability})>"
        )
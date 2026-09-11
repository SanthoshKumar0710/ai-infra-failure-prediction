"""Alert ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.alert_enums import AlertSeverity


class Alert(Base):
    """Represents an infrastructure alert generated from
    failure predictions or infrastructure anomalies.
    """

    __tablename__ = "alerts"

    # ---------------------------------------------------------
    # Primary Key
    # ---------------------------------------------------------

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ---------------------------------------------------------
    # Server
    # ---------------------------------------------------------

    server_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "servers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # ---------------------------------------------------------
    # Prediction
    # ---------------------------------------------------------

    prediction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "predictions.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    # ---------------------------------------------------------
    # Alert Information
    # ---------------------------------------------------------

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # ---------------------------------------------------------
    # Severity
    # ---------------------------------------------------------
    #
    # IMPORTANT:
    #
    # Python enum:
    #
    #     INFO     = "info"
    #     WARNING  = "warning"
    #     CRITICAL = "critical"
    #
    # PostgreSQL enum:
    #
    #     info
    #     warning
    #     critical
    #
    # values_callable makes SQLAlchemy store the enum VALUES
    # instead of the Python enum member names.
    # ---------------------------------------------------------

    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(
            AlertSeverity,
            name="alert_severity",
            native_enum=True,
            values_callable=lambda enum_class: [
                member.value
                for member in enum_class
            ],
        ),
        nullable=False,
        default=AlertSeverity.WARNING,
    )

    # ---------------------------------------------------------
    # Read Status
    # ---------------------------------------------------------

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    # ---------------------------------------------------------
    # Created At
    # ---------------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ---------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------

    server = relationship(
        "Server",
        backref="alerts",
    )

    prediction = relationship(
        "Prediction",
        backref="alerts",
    )

    # ---------------------------------------------------------
    # Representation
    # ---------------------------------------------------------

    def __repr__(self) -> str:
        return (
            f"<Alert("
            f"id={self.id}, "
            f"server_id={self.server_id}, "
            f"severity={self.severity.value}, "
            f"title='{self.title}'"
            f")>"
        )
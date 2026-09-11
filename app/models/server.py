"""Server ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.server_enums import (
    ServerEnvironment,
    ServerStatus,
)


class Server(Base):
    """
    Represents a monitored server.

    A server may be:
    - Physical Machine
    - Virtual Machine
    - Cloud Instance (AWS EC2, Azure VM, etc.)
    - Kubernetes Node

    Relationships:
    - One Server → Many Metrics
    - One Server → Many Predictions
    """

    __tablename__ = "servers"

    # ---------------------------------------------------------
    # Primary Key
    # ---------------------------------------------------------

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ---------------------------------------------------------
    # Server Information
    # ---------------------------------------------------------

    hostname: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    ip_address: Mapped[str] = mapped_column(
        String(45),
        unique=True,
        nullable=False,
    )

    operating_system: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    environment: Mapped[ServerEnvironment] = mapped_column(
        Enum(
            ServerEnvironment,
            name="server_environment",
            native_enum=True,
        ),
        nullable=False,
        default=ServerEnvironment.DEVELOPMENT,
    )

    status: Mapped[ServerStatus] = mapped_column(
        Enum(
            ServerStatus,
            name="server_status",
            native_enum=True,
        ),
        nullable=False,
        default=ServerStatus.ONLINE,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # ---------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------

    metrics: Mapped[list["Metric"]] = relationship(
        "Metric",
        back_populates="server",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    predictions: Mapped[list["Prediction"]] = relationship(
        "Prediction",
        back_populates="server",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # ---------------------------------------------------------
    # Audit Fields
    # ---------------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ---------------------------------------------------------
    # String Representation
    # ---------------------------------------------------------

    def __repr__(self) -> str:
        return (
            f"<Server("
            f"id={self.id}, "
            f"hostname='{self.hostname}', "
            f"ip='{self.ip_address}', "
            f"status='{self.status.value}')>"
        )
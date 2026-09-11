"""Metric ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Integer,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Metric(Base):
    """
    Represents a snapshot of infrastructure metrics
    collected from a server.

    The metric fields correspond to the 18 features
    used by the ML failure prediction model.
    """

    __tablename__ = "metrics"

    # =========================================================
    # Primary Key
    # =========================================================

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # =========================================================
    # Foreign Key
    # =========================================================

    server_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "servers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =========================================================
    # Basic Infrastructure Metrics
    # =========================================================

    cpu_usage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    memory_usage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    disk_usage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    network_usage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    temperature: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    running_processes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # =========================================================
    # Disk Metrics
    # =========================================================

    disk_read_speed: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    disk_write_speed: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # =========================================================
    # Memory / Swap
    # =========================================================

    swap_usage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # =========================================================
    # Network Metrics
    # =========================================================

    network_latency: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    packet_loss: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # =========================================================
    # Server Health
    # =========================================================

    uptime_hours: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # =========================================================
    # Log Metrics
    # =========================================================

    error_logs: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    warning_logs: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    critical_logs: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # =========================================================
    # Hardware Metrics
    # =========================================================

    power_consumption: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    gpu_usage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    fan_speed: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    # =========================================================
    # Timestamp
    # =========================================================

    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # =========================================================
    # Relationships
    # =========================================================

    server = relationship(
        "Server",
        back_populates="metrics",
    )

    # One Metric -> One Prediction
    prediction = relationship(
        "Prediction",
        back_populates="metric",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # =========================================================
    # Representation
    # =========================================================

    def __repr__(self) -> str:
        return (
            f"<Metric("
            f"id={self.id}, "
            f"server_id={self.server_id}, "
            f"cpu={self.cpu_usage}, "
            f"memory={self.memory_usage}, "
            f"disk={self.disk_usage})>"
        )
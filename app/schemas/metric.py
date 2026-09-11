"""Pydantic schemas for Metric CRUD."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MetricBase(BaseModel):
    """Base schema for infrastructure metrics."""

    server_id: uuid.UUID

    # ---------------------------------------------------------
    # Basic Infrastructure Metrics
    # ---------------------------------------------------------

    cpu_usage: float = Field(
        ge=0,
        le=100,
    )

    memory_usage: float = Field(
        ge=0,
        le=100,
    )

    disk_usage: float = Field(
        ge=0,
        le=100,
    )

    network_usage: float = Field(
        ge=0,
    )

    temperature: float | None = Field(
        default=None,
    )

    running_processes: int = Field(
        ge=0,
    )

    # ---------------------------------------------------------
    # Disk Metrics
    # ---------------------------------------------------------

    disk_read_speed: float = Field(
        ge=0,
    )

    disk_write_speed: float = Field(
        ge=0,
    )

    # ---------------------------------------------------------
    # Memory / Swap
    # ---------------------------------------------------------

    swap_usage: float = Field(
        ge=0,
        le=100,
    )

    # ---------------------------------------------------------
    # Network Metrics
    # ---------------------------------------------------------

    network_latency: float = Field(
        ge=0,
    )

    packet_loss: float = Field(
        ge=0,
        le=100,
    )

    # ---------------------------------------------------------
    # Server Health
    # ---------------------------------------------------------

    uptime_hours: float = Field(
        ge=0,
    )

    # ---------------------------------------------------------
    # Log Metrics
    # ---------------------------------------------------------

    error_logs: int = Field(
        ge=0,
    )

    warning_logs: int = Field(
        ge=0,
    )

    critical_logs: int = Field(
        ge=0,
    )

    # ---------------------------------------------------------
    # Hardware Metrics
    # ---------------------------------------------------------

    power_consumption: float = Field(
        ge=0,
    )

    gpu_usage: float = Field(
        ge=0,
        le=100,
    )

    fan_speed: float = Field(
        ge=0,
    )


class MetricCreate(MetricBase):
    """Schema for creating a metric."""

    pass


class MetricUpdate(BaseModel):
    """Schema for updating a metric."""

    # ---------------------------------------------------------
    # Basic Infrastructure Metrics
    # ---------------------------------------------------------

    cpu_usage: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    memory_usage: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    disk_usage: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    network_usage: float | None = Field(
        default=None,
        ge=0,
    )

    temperature: float | None = Field(
        default=None,
    )

    running_processes: int | None = Field(
        default=None,
        ge=0,
    )

    # ---------------------------------------------------------
    # Disk Metrics
    # ---------------------------------------------------------

    disk_read_speed: float | None = Field(
        default=None,
        ge=0,
    )

    disk_write_speed: float | None = Field(
        default=None,
        ge=0,
    )

    # ---------------------------------------------------------
    # Memory / Swap
    # ---------------------------------------------------------

    swap_usage: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    # ---------------------------------------------------------
    # Network Metrics
    # ---------------------------------------------------------

    network_latency: float | None = Field(
        default=None,
        ge=0,
    )

    packet_loss: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    # ---------------------------------------------------------
    # Server Health
    # ---------------------------------------------------------

    uptime_hours: float | None = Field(
        default=None,
        ge=0,
    )

    # ---------------------------------------------------------
    # Log Metrics
    # ---------------------------------------------------------

    error_logs: int | None = Field(
        default=None,
        ge=0,
    )

    warning_logs: int | None = Field(
        default=None,
        ge=0,
    )

    critical_logs: int | None = Field(
        default=None,
        ge=0,
    )

    # ---------------------------------------------------------
    # Hardware Metrics
    # ---------------------------------------------------------

    power_consumption: float | None = Field(
        default=None,
        ge=0,
    )

    gpu_usage: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    fan_speed: float | None = Field(
        default=None,
        ge=0,
    )


class MetricRead(MetricBase):
    """Schema returned to clients."""

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: uuid.UUID

    collected_at: datetime
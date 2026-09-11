"""Enums for Alert domain."""

from __future__ import annotations

from enum import StrEnum


class AlertSeverity(StrEnum):
    """Severity level of an infrastructure alert."""

    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

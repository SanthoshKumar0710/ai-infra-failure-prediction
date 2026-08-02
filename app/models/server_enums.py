"""Shared enums for the server domain."""

from __future__ import annotations

from enum import StrEnum


class ServerEnvironment(StrEnum):
    """Deployment environment."""

    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class ServerStatus(StrEnum):
    """Current server status."""

    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"
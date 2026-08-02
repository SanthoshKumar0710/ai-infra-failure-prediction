"""Shared enums for the user/auth domain."""

from __future__ import annotations

from enum import StrEnum


class UserRole(StrEnum):
    """Platform roles used for RBAC.

    Ordered loosely by increasing privilege; `has_at_least` in
    `app.api.deps` relies on this ordering for hierarchical checks.
    """

    VIEWER = "viewer"
    OPERATOR = "operator"
    ML_ENGINEER = "ml_engineer"
    ADMIN = "admin"


ROLE_HIERARCHY: dict[UserRole, int] = {
    UserRole.VIEWER: 0,
    UserRole.OPERATOR: 1,
    UserRole.ML_ENGINEER: 2,
    UserRole.ADMIN: 3,
}

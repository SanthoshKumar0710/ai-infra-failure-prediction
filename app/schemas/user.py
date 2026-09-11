"""Pydantic schemas for user-related request/response bodies."""

from __future__ import annotations

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.config import settings
from app.models.enums import UserRole


# -------------------------------------------------------------------------
# Base Schema
# -------------------------------------------------------------------------

class UserBase(BaseModel):
    """Common user fields."""

    email: EmailStr
    full_name: str = Field(
        min_length=1,
        max_length=255,
    )


# -------------------------------------------------------------------------
# User Registration
# -------------------------------------------------------------------------

class UserCreate(UserBase):
    """Payload for self-registration."""

    password: str = Field(
        min_length=settings.MIN_PASSWORD_LENGTH,
        max_length=128,
    )

    @field_validator("password")
    @classmethod
    def password_complexity(cls, value: str) -> str:

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain at least one uppercase letter."
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain at least one lowercase letter."
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain at least one digit."
            )

        if not re.search(r"[^\w\s]", value):
            raise ValueError(
                "Password must contain at least one special character."
            )

        return value


# -------------------------------------------------------------------------
# Admin Create User
# -------------------------------------------------------------------------

class UserAdminCreate(UserCreate):
    """Payload used by admins to create users."""

    role: UserRole = UserRole.VIEWER


# -------------------------------------------------------------------------
# Update User
# -------------------------------------------------------------------------

class UserUpdate(BaseModel):
    """Payload used by admins to update an existing user."""

    full_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    role: UserRole | None = None

    password: str | None = Field(
        default=None,
        min_length=settings.MIN_PASSWORD_LENGTH,
    )

    is_active: bool | None = None

    is_verified: bool | None = None


# -------------------------------------------------------------------------
# Read User
# -------------------------------------------------------------------------

class UserRead(UserBase):
    """Returned to API clients."""

    model_config = ConfigDict(
        from_attributes=True
    )

    id: uuid.UUID

    role: UserRole

    is_active: bool

    is_verified: bool

    last_login_at: datetime | None

    created_at: datetime


# -------------------------------------------------------------------------
# Database Model
# -------------------------------------------------------------------------

class UserInDB(UserRead):
    """Internal schema including sensitive fields."""

    hashed_password: str

    failed_login_attempts: int

    locked_until: datetime | None
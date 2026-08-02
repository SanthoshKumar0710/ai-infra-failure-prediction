"""Pydantic schemas for user-related request/response bodies."""

from __future__ import annotations

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.core.config import settings
from app.models.enums import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)


class UserCreate(UserBase):
    """Payload for self-registration. Role defaults to VIEWER; only an
    admin (via `UserAdminCreate`) may assign an elevated role directly."""

    password: str = Field(min_length=settings.MIN_PASSWORD_LENGTH, max_length=128)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[^\w\s]", v):
            raise ValueError("Password must contain at least one special character.")
        return v


class UserAdminCreate(UserCreate):
    """Payload used by admins to create a user with an explicit role."""

    role: UserRole = UserRole.VIEWER


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    is_active: bool | None = None
    role: UserRole | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: UserRole
    is_active: bool
    is_verified: bool
    last_login_at: datetime | None
    created_at: datetime


class UserInDB(UserRead):
    hashed_password: str
    failed_login_attempts: int
    locked_until: datetime | None

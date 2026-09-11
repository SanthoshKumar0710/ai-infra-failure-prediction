"""Pydantic schemas for authentication endpoints."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, value: str) -> str:
        if not value.lower().endswith("@gmail.com"):
            raise ValueError("Only @gmail.com email addresses are permitted.")
        return value.lower()


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, value: str) -> str:
        if not value.lower().endswith("@gmail.com"):
            raise ValueError("Only @gmail.com email addresses are permitted.")
        return value.lower()


class SendOtpRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, value: str) -> str:
        if not value.lower().endswith("@gmail.com"):
            raise ValueError("Only @gmail.com email addresses are permitted.")
        return value.lower()


class SendOtpResponse(BaseModel):
    message: str
    email: str
    expires_in_minutes: int


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, description="6-digit verification code")
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, value: str) -> str:
        if not value.lower().endswith("@gmail.com"):
            raise ValueError("Only @gmail.com email addresses are permitted.")
        return value.lower()


class GoogleAuthRequest(BaseModel):
    id_token: str | None = None
    email: EmailStr | None = None
    name: str | None = None

    @field_validator("email")
    @classmethod
    def validate_gmail(cls, value: str | None) -> str | None:
        if value and not value.lower().endswith("@gmail.com"):
            raise ValueError("Only @gmail.com accounts are permitted.")
        return value.lower() if value else None


class ErrorResponse(BaseModel):
    """Consistent error envelope returned by every 4xx/5xx response."""

    error_code: str
    detail: str

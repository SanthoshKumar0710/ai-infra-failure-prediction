"""Password hashing and JWT issuance / verification.

Isolated from the service layer so the cryptographic primitives can be
unit tested in isolation and swapped out (e.g. bcrypt -> argon2) without
touching business logic.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, ValidationError

from app.core.config import settings
from app.core.exceptions import TokenError

_pwd_context = CryptContext(schemes=[settings.PASSWORD_HASH_SCHEME], deprecated="auto")


class TokenType(StrEnum):
    ACCESS = "access"
    REFRESH = "refresh"


class TokenPayload(BaseModel):
    """Validated shape of the JWT claims this service issues and trusts."""

    sub: str  # user id
    role: str
    jti: str
    type: TokenType
    iat: int
    exp: int
    iss: str


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password with the configured scheme (bcrypt by default)."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Constant-time comparison of a plaintext password against its hash."""
    return _pwd_context.verify(plain_password, hashed_password)


def _create_token(subject: str, role: str, token_type: TokenType, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    claims: dict[str, Any] = {
        "sub": subject,
        "role": role,
        "jti": str(uuid.uuid4()),
        "type": token_type.value,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
        "iss": settings.JWT_ISSUER,
    }
    return jwt.encode(claims, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(subject: str, role: str) -> str:
    return _create_token(
        subject, role, TokenType.ACCESS,
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(subject: str, role: str) -> str:
    return _create_token(
        subject, role, TokenType.REFRESH,
        timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
    )


def decode_token(token: str, *, expected_type: TokenType | None = None) -> TokenPayload:
    """Decode and validate a JWT, raising `TokenError` on any failure.

    Validates signature, issuer, expiry (handled internally by `jose`),
    payload shape, and optionally the token "type" claim so an access
    token cannot be replayed as a refresh token or vice versa.
    """
    try:
        raw_claims = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer=settings.JWT_ISSUER,
        )
    except JWTError as exc:
        raise TokenError("Token is invalid or expired.") from exc

    try:
        payload = TokenPayload.model_validate(raw_claims)
    except ValidationError as exc:
        raise TokenError("Token payload is malformed.") from exc

    if expected_type is not None and payload.type != expected_type:
        raise TokenError(f"Expected a {expected_type.value} token.")

    return payload

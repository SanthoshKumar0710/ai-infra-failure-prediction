"""Unit tests for `app.services.auth_service.AuthService`."""

from __future__ import annotations

import os

import pytest
import pytest_asyncio

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-that-is-at-least-32-chars-long")
os.environ.setdefault("POSTGRES_PASSWORD", "test-password")

from app.core.config import settings
from app.core.exceptions import (
    AccountLockedError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
)
from app.core.security import TokenType, decode_token
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate
from app.services.auth_service import AuthService

pytestmark = pytest.mark.asyncio


@pytest_asyncio.fixture
async def auth_service(db_session, fake_redis) -> AuthService:
    return AuthService(UserRepository(db_session), fake_redis)


VALID_PASSWORD = "Sup3rSecure!Pass"


class TestRegistration:
    async def test_register_creates_user_with_viewer_role(self, auth_service: AuthService) -> None:
        user = await auth_service.register_user(
            UserCreate(email="new@example.com", full_name="New User", password=VALID_PASSWORD)
        )
        assert user.email == "new@example.com"
        assert user.role.value == "viewer"
        assert user.hashed_password != VALID_PASSWORD

    async def test_register_duplicate_email_raises(self, auth_service: AuthService) -> None:
        payload = UserCreate(email="dup@example.com", full_name="Dup", password=VALID_PASSWORD)
        await auth_service.register_user(payload)
        with pytest.raises(UserAlreadyExistsError):
            await auth_service.register_user(payload)


class TestAuthenticate:
    async def test_login_with_correct_credentials_returns_token_pair(self, auth_service: AuthService) -> None:
        await auth_service.register_user(
            UserCreate(email="ok@example.com", full_name="OK", password=VALID_PASSWORD)
        )
        tokens = await auth_service.authenticate("ok@example.com", VALID_PASSWORD)
        assert tokens.access_token
        assert tokens.refresh_token
        payload = decode_token(tokens.access_token, expected_type=TokenType.ACCESS)
        assert payload.role == "viewer"

    async def test_login_with_wrong_password_raises(self, auth_service: AuthService) -> None:
        await auth_service.register_user(
            UserCreate(email="ok2@example.com", full_name="OK", password=VALID_PASSWORD)
        )
        with pytest.raises(InvalidCredentialsError):
            await auth_service.authenticate("ok2@example.com", "WrongPass!123")

    async def test_login_with_unknown_email_raises_invalid_credentials(
        self, auth_service: AuthService
    ) -> None:
        with pytest.raises(InvalidCredentialsError):
            await auth_service.authenticate("nobody@example.com", VALID_PASSWORD)

    async def test_account_locks_after_max_failed_attempts(self, auth_service: AuthService) -> None:
        await auth_service.register_user(
            UserCreate(email="lockme@example.com", full_name="Lock Me", password=VALID_PASSWORD)
        )
        for _ in range(settings.LOGIN_MAX_ATTEMPTS - 1):
            with pytest.raises(InvalidCredentialsError):
                await auth_service.authenticate("lockme@example.com", "WrongPass!123")

        with pytest.raises(AccountLockedError):
            await auth_service.authenticate("lockme@example.com", "WrongPass!123")

        # Even the correct password is rejected while locked.
        with pytest.raises(AccountLockedError):
            await auth_service.authenticate("lockme@example.com", VALID_PASSWORD)


class TestRefreshAndLogout:
    async def test_refresh_rotates_and_revokes_old_token(self, auth_service: AuthService) -> None:
        await auth_service.register_user(
            UserCreate(email="refresh@example.com", full_name="R", password=VALID_PASSWORD)
        )
        tokens = await auth_service.authenticate("refresh@example.com", VALID_PASSWORD)
        new_tokens = await auth_service.refresh(tokens.refresh_token)
        assert new_tokens.refresh_token != tokens.refresh_token

        from app.core.exceptions import TokenError

        with pytest.raises(TokenError):
            await auth_service.refresh(tokens.refresh_token)

    async def test_logout_revokes_access_and_refresh_tokens(self, auth_service: AuthService) -> None:
        await auth_service.register_user(
            UserCreate(email="logout@example.com", full_name="L", password=VALID_PASSWORD)
        )
        tokens = await auth_service.authenticate("logout@example.com", VALID_PASSWORD)
        await auth_service.logout(tokens.access_token, tokens.refresh_token)

        from app.core.exceptions import TokenError

        with pytest.raises(TokenError):
            await auth_service.refresh(tokens.refresh_token)

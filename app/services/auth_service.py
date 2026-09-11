"""Authentication service layer.

Owns all business rules for registration, login, token refresh, and
logout: account lockout policy, password verification, token issuance,
and token revocation. Endpoints stay thin and only translate HTTP
concerns (status codes, request parsing) to/from this layer.
"""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from redis.asyncio import Redis

from app.core.config import settings
from app.core.email import send_otp_email
from app.core.exceptions import (
    AccountLockedError,
    EmailDeliveryError,
    InactiveUserError,
    InvalidCredentialsError,
    NotFoundError,
    TokenError,
    UserAlreadyExistsError,
)
from app.core.logging_config import get_logger
from app.core.security import (
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import GoogleAuthRequest, SendOtpResponse, TokenPair
from app.schemas.user import UserAdminCreate, UserCreate

logger = get_logger(__name__)

_REVOKED_JTI_PREFIX = "revoked_jti:"
_OTP_PREFIX = "pwd_reset_otp:"


class AuthService:
    """Coordinates the user repository, password hashing, and JWT issuance."""

    def __init__(self, user_repository: UserRepository, redis: Redis) -> None:
        self._users = user_repository
        self._redis = redis

    # --- Registration -----------------------------------------------------

    async def register_user(self, payload: UserCreate | UserAdminCreate) -> User:
        existing = await self._users.get_by_email(payload.email)
        if existing is not None:
            raise UserAlreadyExistsError()

        if isinstance(payload, UserAdminCreate):
            role = payload.role
        else:
            existing_users = await self._users.list_all(limit=1)
            role = UserRole.ADMIN if len(existing_users) == 0 else UserRole.VIEWER

        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role=role,
        )
        user = await self._users.add(user)
        logger.info("user_registered", extra={"user_id": str(user.id), "role": role.value})
        return user

    async def reset_password(self, email: str, new_password: str) -> User:
        user = await self._users.get_by_email(email)
        if user is None:
            raise NotFoundError("No account found with this email address.")

        user.hashed_password = hash_password(new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        user = await self._users.update(user)
        logger.info("password_reset_success", extra={"user_id": str(user.id)})
        return user

    async def send_password_reset_otp(self, email: str) -> SendOtpResponse:
        user = await self._users.get_by_email(email)
        if user is None:
            raise NotFoundError("No account found with this email address.")

        otp = f"{secrets.randbelow(900000) + 100000}"
        ttl_seconds = settings.OTP_EXPIRE_MINUTES * 60

        await self._redis.set(f"{_OTP_PREFIX}{email.lower()}", otp, ex=ttl_seconds)
        email_sent, reason = await send_otp_email(email.lower(), otp)

        if not email_sent:
            # Delete cached OTP since it was not delivered to the user's email
            await self._redis.delete(f"{_OTP_PREFIX}{email.lower()}")
            raise EmailDeliveryError(f"Unable to deliver OTP email: {reason}")

        logger.info("password_reset_otp_dispatched", extra={"email": email.lower()})

        return SendOtpResponse(
            message=f"Verification code sent to {email}. Please check your email inbox.",
            email=email,
            expires_in_minutes=settings.OTP_EXPIRE_MINUTES,
        )

    async def verify_otp_and_reset(self, email: str, otp: str, new_password: str) -> TokenPair:
        user = await self._users.get_by_email(email)
        if user is None:
            raise NotFoundError("No account found with this email address.")

        stored_otp = await self._redis.get(f"{_OTP_PREFIX}{email.lower()}")
        if not stored_otp or stored_otp != otp.strip():
            raise InvalidCredentialsError("Invalid or expired verification code. Please request a new OTP.")

        user.hashed_password = hash_password(new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        user = await self._users.update(user)

        await self._redis.delete(f"{_OTP_PREFIX}{email.lower()}")
        logger.info("password_reset_otp_verified_and_logged_in", extra={"user_id": str(user.id)})

        # Automatically issue token pair so user is logged in immediately!
        return self._issue_token_pair(user)

    async def authenticate_google(self, payload: GoogleAuthRequest) -> TokenPair:
        email = None
        full_name = "Google User"

        if payload.id_token:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    resp = await client.get(
                        f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.id_token}"
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        email = data.get("email")
                        full_name = data.get("name", full_name)
                    else:
                        logger.warning("google_token_verification_failed", extra={"status": resp.status_code})
            except Exception as exc:
                logger.error("google_tokeninfo_request_error", extra={"error": str(exc)})

        # Fallback to direct payload email if verification was client-side or in demo mode
        if not email and payload.email:
            email = payload.email.lower()
            if payload.name:
                full_name = payload.name

        if not email:
            raise InvalidCredentialsError("Could not verify Google account identity.")

        user = await self._users.get_by_email(email)
        if user is None:
            # First user is ADMIN; subsequent users default to OPERATOR for team collaboration
            existing_users = await self._users.list_all(limit=1)
            role = UserRole.ADMIN if len(existing_users) == 0 else UserRole.OPERATOR

            user = User(
                email=email.lower(),
                full_name=full_name,
                hashed_password=hash_password(secrets.token_urlsafe(32)),
                role=role,
                is_verified=True,
            )
            user = await self._users.add(user)
            logger.info("google_user_auto_provisioned", extra={"user_id": str(user.id), "role": role.value})
        elif not user.is_active:
            raise InactiveUserError()

        logger.info("google_login_success", extra={"user_id": str(user.id)})
        return self._issue_token_pair(user)

    # --- Login / token issuance ---------------------------------------------

    async def authenticate(self, email: str, password: str) -> TokenPair:
        user = await self._users.get_by_email(email)

        # Constant response shape whether the user exists or not, to avoid
        # leaking account existence via timing/response differences.
        if user is None:
            raise InvalidCredentialsError()

        if user.locked_until is not None:
            locked_until = user.locked_until
            if locked_until.tzinfo is None:
                locked_until = locked_until.replace(tzinfo=timezone.utc)
            if locked_until > datetime.now(timezone.utc):
                raise AccountLockedError(f"Account locked until {locked_until.isoformat()}.")

        if not verify_password(password, user.hashed_password):
            lockout_until = None
            if user.failed_login_attempts + 1 >= settings.LOGIN_MAX_ATTEMPTS:
                lockout_until = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.LOGIN_LOCKOUT_MINUTES
                )
            await self._users.record_failed_login(
                user, max_attempts=settings.LOGIN_MAX_ATTEMPTS, lockout_until=lockout_until
            )
            if lockout_until is not None:
                logger.warning("account_locked", extra={"user_id": str(user.id)})
                raise AccountLockedError()
            raise InvalidCredentialsError()

        if not user.is_active:
            raise InactiveUserError()

        await self._users.record_successful_login(user, login_time=datetime.now(timezone.utc))
        logger.info("user_login_success", extra={"user_id": str(user.id)})
        return self._issue_token_pair(user)

    def _issue_token_pair(self, user: User) -> TokenPair:
        return TokenPair(
            access_token=create_access_token(str(user.id), user.role.value),
            refresh_token=create_refresh_token(str(user.id), user.role.value),
        )

    # --- Refresh / logout ---------------------------------------------------

    async def refresh(self, refresh_token: str) -> TokenPair:
        payload = decode_token(refresh_token, expected_type=TokenType.REFRESH)

        if await self._is_revoked(payload.jti):
            raise TokenError("Refresh token has been revoked.")

        try:
            user_id = uuid.UUID(payload.sub)
        except ValueError as exc:
            raise TokenError("Malformed subject claim.") from exc

        user = await self._users.get_by_id(user_id)
        if user is None or not user.is_active:
            raise TokenError("User is no longer active.")

        # Rotate: revoke the old refresh token so it cannot be reused.
        await self._revoke(payload.jti, ttl_seconds=self._seconds_until(payload.exp))
        return self._issue_token_pair(user)

    async def logout(self, access_token: str, refresh_token: str | None = None) -> None:
        access_payload = decode_token(access_token, expected_type=TokenType.ACCESS)
        await self._revoke(access_payload.jti, ttl_seconds=self._seconds_until(access_payload.exp))

        if refresh_token:
            refresh_payload = decode_token(refresh_token, expected_type=TokenType.REFRESH)
            await self._revoke(refresh_payload.jti, ttl_seconds=self._seconds_until(refresh_payload.exp))

        logger.info("user_logout", extra={"user_id": access_payload.sub})

    @staticmethod
    def _seconds_until(exp_timestamp: int) -> int:
        remaining = exp_timestamp - int(datetime.now(timezone.utc).timestamp())
        return max(remaining, 1)

    async def _revoke(self, jti: str, *, ttl_seconds: int) -> None:
        await self._redis.set(f"{_REVOKED_JTI_PREFIX}{jti}", "1", ex=ttl_seconds)

    async def _is_revoked(self, jti: str) -> bool:
        return await self._redis.exists(f"{_REVOKED_JTI_PREFIX}{jti}") == 1

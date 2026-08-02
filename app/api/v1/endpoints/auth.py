"""Authentication API endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, get_auth_service, oauth2_scheme
from app.schemas.auth import RefreshRequest, TokenPair
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserCreate,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> UserRead:
    """Self-service registration. New users always start as VIEWER;
    role elevation is performed by an admin via the user-management
    endpoints in Module 2."""
    user = await auth_service.register_user(payload)
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenPair)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenPair:
    """OAuth2-compatible login (form-encoded `username`/`password`) so the
    interactive `/docs` "Authorize" button and standard OAuth2 clients
    work out of the box. `username` is the user's email."""
    return await auth_service.authenticate(form_data.username, form_data.password)


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    payload: RefreshRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenPair:
    """Exchange a valid, non-revoked refresh token for a new token pair.
    The presented refresh token is revoked as part of rotation."""
    return await auth_service.refresh(payload.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def logout(
    payload: RefreshRequest,
    current_user: CurrentUser,
    access_token: Annotated[str, Depends(oauth2_scheme)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> None:
    """Revoke the caller's tokens. `current_user` forces the access token
    to already be valid before we bother revoking anything; the raw
    bearer string is re-obtained via `oauth2_scheme` (FastAPI caches the
    request-scoped result, so this is not a second header parse) and,
    together with the refresh token in the body, both are blacklisted."""
    await auth_service.logout(access_token, payload.refresh_token)


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: CurrentUser) -> UserRead:
    """Return the authenticated user's own profile."""
    return UserRead.model_validate(current_user)

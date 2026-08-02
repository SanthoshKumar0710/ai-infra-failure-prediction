"""Integration tests exercising the auth HTTP endpoints end to end."""

from __future__ import annotations

import pytest

pytestmark = pytest.mark.asyncio

VALID_PASSWORD = "Sup3rSecure!Pass"


class TestRegisterEndpoint:
    async def test_register_returns_201_and_user(self, app_client) -> None:
        resp = await app_client.post(
            "/api/v1/auth/register",
            json={"email": "api@example.com", "full_name": "API User", "password": VALID_PASSWORD},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert body["email"] == "api@example.com"
        assert "hashed_password" not in body

    async def test_register_weak_password_returns_422(self, app_client) -> None:
        resp = await app_client.post(
            "/api/v1/auth/register",
            json={"email": "weak@example.com", "full_name": "Weak", "password": "short"},
        )
        assert resp.status_code == 422

    async def test_register_duplicate_email_returns_409(self, app_client) -> None:
        payload = {"email": "dup2@example.com", "full_name": "Dup", "password": VALID_PASSWORD}
        first = await app_client.post("/api/v1/auth/register", json=payload)
        assert first.status_code == 201
        second = await app_client.post("/api/v1/auth/register", json=payload)
        assert second.status_code == 409
        assert second.json()["error_code"] == "user_already_exists"


class TestLoginFlow:
    async def test_login_then_access_protected_me_endpoint(self, app_client) -> None:
        await app_client.post(
            "/api/v1/auth/register",
            json={"email": "flow@example.com", "full_name": "Flow", "password": VALID_PASSWORD},
        )
        login_resp = await app_client.post(
            "/api/v1/auth/login",
            data={"username": "flow@example.com", "password": VALID_PASSWORD},
        )
        assert login_resp.status_code == 200
        tokens = login_resp.json()

        me_resp = await app_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "flow@example.com"

    async def test_me_without_token_returns_401(self, app_client) -> None:
        resp = await app_client.get("/api/v1/auth/me")
        assert resp.status_code == 401

    async def test_login_wrong_password_returns_401(self, app_client) -> None:
        await app_client.post(
            "/api/v1/auth/register",
            json={"email": "wp@example.com", "full_name": "WP", "password": VALID_PASSWORD},
        )
        resp = await app_client.post(
            "/api/v1/auth/login",
            data={"username": "wp@example.com", "password": "WrongPass!123"},
        )
        assert resp.status_code == 401
        assert resp.json()["error_code"] == "invalid_credentials"


class TestRBAC:
    async def test_non_admin_cannot_list_users(self, app_client) -> None:
        await app_client.post(
            "/api/v1/auth/register",
            json={"email": "plain@example.com", "full_name": "Plain", "password": VALID_PASSWORD},
        )
        login_resp = await app_client.post(
            "/api/v1/auth/login",
            data={"username": "plain@example.com", "password": VALID_PASSWORD},
        )
        token = login_resp.json()["access_token"]

        resp = await app_client.get(
            "/api/v1/users", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 403
        assert resp.json()["error_code"] == "permission_denied"

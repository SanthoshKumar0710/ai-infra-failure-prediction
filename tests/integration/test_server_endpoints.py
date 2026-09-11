"""Integration tests for Server CRUD endpoints and RBAC roles."""

from __future__ import annotations

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.enums import UserRole
from app.models.user import User


@pytest.fixture
async def viewer_headers(db_session: AsyncSession) -> dict[str, str]:
    user = User(
        id=uuid.uuid4(),
        email="viewer@example.com",
        full_name="Viewer User",
        hashed_password=hash_password("Pass1234!Word"),
        role=UserRole.VIEWER,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def operator_headers(db_session: AsyncSession) -> dict[str, str]:
    user = User(
        id=uuid.uuid4(),
        email="operator@example.com",
        full_name="Operator User",
        hashed_password=hash_password("Pass1234!Word"),
        role=UserRole.OPERATOR,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def admin_headers(seed_admin: User) -> dict[str, str]:
    token = create_access_token(subject=seed_admin.id, role=seed_admin.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_server_rbac_flow(
    app_client: AsyncClient,
    viewer_headers: dict[str, str],
    operator_headers: dict[str, str],
    admin_headers: dict[str, str],
):
    # 1. Viewer cannot create server (should return 403)
    server_data = {
        "hostname": "srv-web-01",
        "ip_address": "192.168.1.100",
        "operating_system": "Ubuntu 22.04",
        "environment": "production",
        "status": "online",
        "description": "Production Web Server",
    }
    res = await app_client.post("/api/v1/servers", json=server_data, headers=viewer_headers)
    assert res.status_code == 403

    # 2. Operator can create server (201)
    res = await app_client.post("/api/v1/servers", json=server_data, headers=operator_headers)
    assert res.status_code == 201
    created_server = res.json()
    server_id = created_server["id"]
    assert created_server["hostname"] == "srv-web-01"

    # 3. Viewer can list and get server (200)
    res = await app_client.get("/api/v1/servers", headers=viewer_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1

    res = await app_client.get(f"/api/v1/servers/{server_id}", headers=viewer_headers)
    assert res.status_code == 200

    # 4. Operator cannot delete server (403)
    res = await app_client.delete(f"/api/v1/servers/{server_id}", headers=operator_headers)
    assert res.status_code == 403

    # 5. Admin can delete server (204)
    res = await app_client.delete(f"/api/v1/servers/{server_id}", headers=admin_headers)
    assert res.status_code == 204

"""Integration test for health probe endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoints(app_client: AsyncClient):
    # 1. /health
    res = await app_client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

    # 2. /health/live
    res = await app_client.get("/health/live")
    assert res.status_code == 200
    assert res.json() == {"status": "alive"}

    # 3. /health/ready
    res = await app_client.get("/health/ready")
    assert res.status_code in (200, 503)
    data = res.json()
    assert "status" in data
    assert "database" in data
    assert "redis" in data
    assert "ml_model" in data

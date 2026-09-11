"""Integration test verifying end-to-end flow:
Submit Metric -> Generate Prediction -> Trigger Alert -> Fetch Predictions/Alerts.
"""

from __future__ import annotations

import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.server import Server
from app.models.server_enums import ServerEnvironment, ServerStatus


@pytest.fixture
async def operator_headers(db_session: AsyncSession) -> dict[str, str]:
    from app.core.security import hash_password
    from app.models.user import User

    user = User(
        id=uuid.uuid4(),
        email="operator2@example.com",
        full_name="Operator User 2",
        hashed_password=hash_password("Pass1234!Word"),
        role=UserRole.OPERATOR,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def test_server(db_session: AsyncSession) -> Server:
    server = Server(
        id=uuid.uuid4(),
        hostname="srv-db-critical-01",
        ip_address="10.0.0.50",
        operating_system="Ubuntu 22.04",
        environment=ServerEnvironment.PRODUCTION,
        status=ServerStatus.ONLINE,
    )
    db_session.add(server)
    await db_session.commit()
    return server


@pytest.mark.asyncio
async def test_end_to_end_metric_prediction_alert(
    app_client: AsyncClient,
    operator_headers: dict[str, str],
    test_server: Server,
):
    # 1. Post metric with high stress indicators (CPU > 90, Temp > 85, Critical logs > 5)
    metric_payload = {
        "server_id": str(test_server.id),
        "cpu_usage": 98.5,
        "memory_usage": 95.0,
        "disk_usage": 92.0,
        "network_usage": 450.0,
        "temperature": 89.0,
        "running_processes": 350,
        "disk_read_speed": 120.0,
        "disk_write_speed": 90.0,
        "swap_usage": 85.0,
        "network_latency": 190.0,
        "packet_loss": 6.5,
        "uptime_hours": 4500.0,
        "error_logs": 25,
        "warning_logs": 50,
        "critical_logs": 8,
        "power_consumption": 480.0,
        "gpu_usage": 75.0,
        "fan_speed": 4200.0,
    }

    res = await app_client.post("/api/v1/metrics", json=metric_payload, headers=operator_headers)
    assert res.status_code == 201
    created_metric = res.json()
    metric_id = created_metric["id"]

    # 2. Verify prediction was created automatically for this server/metric
    res = await app_client.get("/api/v1/predictions", headers=operator_headers)
    assert res.status_code == 200
    predictions = res.json()
    assert len(predictions) >= 1

    matched_pred = next((p for p in predictions if p["metric_id"] == metric_id), None)
    assert matched_pred is not None
    assert matched_pred["server_id"] == str(test_server.id)

    # 3. Verify Alert was automatically generated for high risk prediction
    res = await app_client.get("/api/v1/alerts", headers=operator_headers)
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    matched_alert = next((a for a in alerts if a["server_id"] == str(test_server.id)), None)
    assert matched_alert is not None
    assert matched_alert["severity"] in ("warning", "critical")

    # 4. Mark alert as read
    alert_id = matched_alert["id"]
    res = await app_client.put(f"/api/v1/alerts/{alert_id}/read", headers=operator_headers)
    assert res.status_code == 200
    assert res.json()["is_read"] is True

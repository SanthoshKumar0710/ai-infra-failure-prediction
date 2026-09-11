"""Alert management endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.deps import get_alert_service, require_role
from app.models.enums import UserRole
from app.schemas.alert import AlertRead, AlertUpdate
from app.services.alert_service import AlertService

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get(
    "",
    response_model=list[AlertRead],
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def list_alerts(
    alert_service: Annotated[AlertService, Depends(get_alert_service)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    unread_only: bool = Query(default=False),
) -> list[AlertRead]:
    alerts = await alert_service.list_alerts(
        limit=limit,
        offset=offset,
        unread_only=unread_only,
    )
    return [AlertRead.model_validate(alert) for alert in alerts]


@router.get(
    "/{alert_id}",
    response_model=AlertRead,
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def get_alert(
    alert_id: uuid.UUID,
    alert_service: Annotated[AlertService, Depends(get_alert_service)],
) -> AlertRead:
    alert = await alert_service.get_alert(alert_id)
    return AlertRead.model_validate(alert)


@router.get(
    "/server/{server_id}",
    response_model=list[AlertRead],
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def list_server_alerts(
    server_id: uuid.UUID,
    alert_service: Annotated[AlertService, Depends(get_alert_service)],
) -> list[AlertRead]:
    alerts = await alert_service.list_server_alerts(server_id)
    return [AlertRead.model_validate(alert) for alert in alerts]


@router.put(
    "/{alert_id}/read",
    response_model=AlertRead,
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def mark_alert_read(
    alert_id: uuid.UUID,
    alert_service: Annotated[AlertService, Depends(get_alert_service)],
) -> AlertRead:
    alert = await alert_service.update_alert(alert_id, AlertUpdate(is_read=True))
    return AlertRead.model_validate(alert)


@router.delete(
    "/{alert_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def delete_alert(
    alert_id: uuid.UUID,
    alert_service: Annotated[AlertService, Depends(get_alert_service)],
) -> Response:
    await alert_service.delete_alert(alert_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

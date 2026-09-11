"""Metric management endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.api.deps import (
    get_metric_repository,
    get_prediction_service,
    require_role,
)

from app.models.enums import UserRole

from app.repositories.metric_repository import MetricRepository

from app.schemas.metric import (
    MetricCreate,
    MetricRead,
    MetricUpdate,
)

from app.services.metric_service import MetricService
from app.services.prediction_service import PredictionService


router = APIRouter(
    prefix="/metrics",
    tags=["Metrics"],
)


# ============================================================
# Create Metric + Automatic ML Prediction
# ============================================================

@router.post(
    "",
    response_model=MetricRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(UserRole.OPERATOR))],
)
async def create_metric(
    payload: MetricCreate,
    repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
    prediction_service: Annotated[
        PredictionService,
        Depends(get_prediction_service),
    ],
) -> MetricRead:

    # --------------------------------------------------------
    # 1. Save metric
    # --------------------------------------------------------

    metric_service = MetricService(repository)

    metric = await metric_service.create_metric(payload)

    # --------------------------------------------------------
    # 2. Generate ML prediction automatically
    # --------------------------------------------------------

    await prediction_service.create_prediction_from_metrics(
        server_id=metric.server_id,
        metric_id=metric.id,

        cpu_usage=metric.cpu_usage,
        memory_usage=metric.memory_usage,
        disk_usage=metric.disk_usage,
        network_usage=metric.network_usage,
        temperature=metric.temperature or 0.0,
        running_processes=metric.running_processes,

        disk_read_speed=metric.disk_read_speed,
        disk_write_speed=metric.disk_write_speed,
        swap_usage=metric.swap_usage,
        network_latency=metric.network_latency,
        packet_loss=metric.packet_loss,
        uptime_hours=metric.uptime_hours,
        error_logs=metric.error_logs,
        warning_logs=metric.warning_logs,
        critical_logs=metric.critical_logs,
        power_consumption=metric.power_consumption,
        gpu_usage=metric.gpu_usage,
        fan_speed=metric.fan_speed,
    )

    # --------------------------------------------------------
    # 3. Return saved metric
    # --------------------------------------------------------

    return MetricRead.model_validate(metric)


# ============================================================
# List Metrics
# ============================================================

@router.get(
    "",
    response_model=list[MetricRead],
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def list_metrics(
    repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
) -> list[MetricRead]:

    service = MetricService(repository)

    metrics = await service.list_metrics(
        limit=limit,
        offset=offset,
    )

    return [
        MetricRead.model_validate(metric)
        for metric in metrics
    ]


# ============================================================
# Get Metric by ID
# ============================================================

@router.get(
    "/{metric_id}",
    response_model=MetricRead,
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def get_metric(
    metric_id: uuid.UUID,
    repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
) -> MetricRead:

    service = MetricService(repository)

    metric = await service.get_metric(metric_id)

    return MetricRead.model_validate(metric)


# ============================================================
# Update Metric
# ============================================================

@router.put(
    "/{metric_id}",
    response_model=MetricRead,
    dependencies=[Depends(require_role(UserRole.OPERATOR))],
)
async def update_metric(
    metric_id: uuid.UUID,
    payload: MetricUpdate,
    repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
) -> MetricRead:

    service = MetricService(repository)

    metric = await service.update_metric(
        metric_id,
        payload,
    )

    return MetricRead.model_validate(metric)


# ============================================================
# Delete Metric
# ============================================================

@router.delete(
    "/{metric_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
async def delete_metric(
    metric_id: uuid.UUID,
    repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
) -> Response:

    service = MetricService(repository)

    await service.delete_metric(metric_id)

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )


# ============================================================
# List Metrics by Server
# ============================================================

@router.get(
    "/server/{server_id}",
    response_model=list[MetricRead],
    dependencies=[Depends(require_role(UserRole.VIEWER))],
)
async def list_server_metrics(
    server_id: uuid.UUID,
    repository: Annotated[
        MetricRepository,
        Depends(get_metric_repository),
    ],
) -> list[MetricRead]:

    service = MetricService(repository)

    metrics = await service.list_server_metrics(
        server_id
    )

    return [
        MetricRead.model_validate(metric)
        for metric in metrics
    ]
"""Metric service layer."""

from __future__ import annotations

import uuid

from app.core.exceptions import NotFoundError
from app.models.metric import Metric
from app.repositories.metric_repository import MetricRepository
from app.schemas.metric import MetricCreate, MetricUpdate


class MetricService:
    """Business logic for metrics."""

    def __init__(
        self,
        metric_repository: MetricRepository,
    ) -> None:
        self._metrics = metric_repository

    async def create_metric(
        self,
        payload: MetricCreate,
    ) -> Metric:

        metric = Metric(**payload.model_dump())

        return await self._metrics.add(metric)

    async def get_metric(
        self,
        metric_id: uuid.UUID,
    ) -> Metric:

        metric = await self._metrics.get_by_id(metric_id)

        if metric is None:
            raise NotFoundError("Metric not found.")

        return metric

    async def list_metrics(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Metric]:

        return await self._metrics.list_all(
            limit=limit,
            offset=offset,
        )

    async def list_server_metrics(
        self,
        server_id: uuid.UUID,
    ) -> list[Metric]:

        return await self._metrics.list_by_server(server_id)

    async def update_metric(
        self,
        metric_id: uuid.UUID,
        payload: MetricUpdate,
    ) -> Metric:

        metric = await self._metrics.get_by_id(metric_id)

        if metric is None:
            raise NotFoundError("Metric not found.")

        update_data = payload.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(metric, field, value)

        return await self._metrics.update(metric)

    async def delete_metric(
        self,
        metric_id: uuid.UUID,
    ) -> None:

        metric = await self._metrics.get_by_id(metric_id)

        if metric is None:
            raise NotFoundError("Metric not found.")

        await self._metrics.delete(metric_id)
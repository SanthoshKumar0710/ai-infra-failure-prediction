"""SQLAlchemy implementation of Metric repository."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.metric import Metric
from app.repositories.base import AbstractRepository


class MetricRepository(AbstractRepository[Metric]):
    """Persistence layer for Metric."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(
        self,
        metric_id: uuid.UUID,
    ) -> Metric | None:
        return await self._session.get(Metric, metric_id)

    async def add(
        self,
        entity: Metric,
    ) -> Metric:
        self._session.add(entity)

        await self._session.commit()
        await self._session.refresh(entity)

        return entity

    async def update(
        self,
        entity: Metric,
    ) -> Metric:
        await self._session.commit()
        await self._session.refresh(entity)

        return entity

    async def delete(
        self,
        metric_id: uuid.UUID,
    ) -> None:
        metric = await self.get_by_id(metric_id)

        if metric is not None:
            await self._session.delete(metric)
            await self._session.commit()

    async def list_all(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Metric]:

        result = await self._session.execute(
            select(Metric)
            .offset(offset)
            .limit(limit)
        )

        return list(result.scalars().all())

    async def list_by_server(
        self,
        server_id: uuid.UUID,
    ) -> list[Metric]:

        result = await self._session.execute(
            select(Metric)
            .where(Metric.server_id == server_id)
            .order_by(Metric.collected_at.desc())
        )

        return list(result.scalars().all())
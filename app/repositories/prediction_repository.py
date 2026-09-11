"""Repository for Prediction database operations."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.prediction import Prediction


class PredictionRepository:
    """Handles all database operations for Prediction."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ---------------------------------------------------------
    # Create Prediction
    # ---------------------------------------------------------

    async def create(self, prediction: Prediction) -> Prediction:
        self.session.add(prediction)
        await self.session.commit()
        await self.session.refresh(prediction)
        return prediction

    # ---------------------------------------------------------
    # Get Prediction by ID
    # ---------------------------------------------------------

    async def get_by_id(
        self,
        prediction_id: uuid.UUID,
    ) -> Prediction | None:

        result = await self.session.execute(
            select(Prediction).where(
                Prediction.id == prediction_id
            )
        )

        return result.scalar_one_or_none()

    # ---------------------------------------------------------
    # Get Prediction by Metric ID
    # ---------------------------------------------------------

    async def get_by_metric_id(
        self,
        metric_id: uuid.UUID,
    ) -> Prediction | None:

        result = await self.session.execute(
            select(Prediction).where(
                Prediction.metric_id == metric_id
            )
        )

        return result.scalar_one_or_none()


    # ---------------------------------------------------------
    # List All Predictions
    # ---------------------------------------------------------

    async def list_all(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Prediction]:

        result = await self.session.execute(
            select(Prediction)
            .offset(offset)
            .limit(limit)
            .order_by(Prediction.created_at.desc())
        )

        return list(result.scalars().all())

    # ---------------------------------------------------------
    # List Predictions by Server
    # ---------------------------------------------------------

    async def list_by_server(
        self,
        server_id: uuid.UUID,
    ) -> list[Prediction]:

        result = await self.session.execute(
            select(Prediction)
            .where(Prediction.server_id == server_id)
            .order_by(Prediction.created_at.desc())
        )

        return list(result.scalars().all())

    # ---------------------------------------------------------
    # Update Prediction
    # ---------------------------------------------------------

    async def update(
        self,
        prediction: Prediction,
    ) -> Prediction:

        await self.session.commit()
        await self.session.refresh(prediction)
        return prediction

    # ---------------------------------------------------------
    # Delete Prediction
    # ---------------------------------------------------------

    async def delete(
        self,
        prediction: Prediction,
    ) -> None:

        await self.session.delete(prediction)
        await self.session.commit()
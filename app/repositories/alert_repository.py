"""Repository for Alert database operations."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert


class AlertRepository:
    """Handles database operations for Alert model."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ---------------------------------------------------------
    # Create Alert
    # ---------------------------------------------------------

    async def create(self, alert: Alert) -> Alert:
        """Create an alert and safely rollback on database errors."""

        try:
            self.session.add(alert)
            await self.session.commit()
            await self.session.refresh(alert)
            return alert

        except Exception:
            await self.session.rollback()
            raise

    # ---------------------------------------------------------
    # Get Alert by ID
    # ---------------------------------------------------------

    async def get_by_id(
        self,
        alert_id: uuid.UUID,
    ) -> Alert | None:

        result = await self.session.execute(
            select(Alert).where(
                Alert.id == alert_id
            )
        )

        return result.scalar_one_or_none()

    # ---------------------------------------------------------
    # List Alerts
    # ---------------------------------------------------------

    async def list_all(
        self,
        limit: int = 100,
        offset: int = 0,
        unread_only: bool = False,
    ) -> list[Alert]:

        stmt = select(Alert)

        if unread_only:
            stmt = stmt.where(
                Alert.is_read.is_(False)
            )

        stmt = (
            stmt
            .order_by(Alert.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(stmt)

        return list(result.scalars().all())

    # ---------------------------------------------------------
    # List Alerts by Server
    # ---------------------------------------------------------

    async def list_by_server(
        self,
        server_id: uuid.UUID,
    ) -> list[Alert]:

        result = await self.session.execute(
            select(Alert)
            .where(
                Alert.server_id == server_id
            )
            .order_by(
                Alert.created_at.desc()
            )
        )

        return list(result.scalars().all())

    # ---------------------------------------------------------
    # Update Alert
    # ---------------------------------------------------------

    async def update(
        self,
        alert: Alert,
    ) -> Alert:

        try:
            await self.session.commit()
            await self.session.refresh(alert)
            return alert

        except Exception:
            await self.session.rollback()
            raise

    # ---------------------------------------------------------
    # Delete Alert
    # ---------------------------------------------------------

    async def delete(
        self,
        alert: Alert,
    ) -> None:

        try:
            await self.session.delete(alert)
            await self.session.commit()

        except Exception:
            await self.session.rollback()
            raise
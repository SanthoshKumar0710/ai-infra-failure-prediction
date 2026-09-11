"""Alert service layer."""

from __future__ import annotations

import logging
import uuid

from app.core.exceptions import NotFoundError
from app.models.alert import Alert
from app.models.alert_enums import AlertSeverity
from app.models.prediction import Prediction
from app.models.prediction_enums import PredictionRisk
from app.repositories.alert_repository import AlertRepository
from app.schemas.alert import AlertCreate, AlertUpdate

logger = logging.getLogger(__name__)


class AlertService:
    """Business logic for infrastructure alerts."""

    def __init__(
        self,
        alert_repository: AlertRepository,
    ) -> None:
        self._alerts = alert_repository

    async def create_alert(
        self,
        payload: AlertCreate,
    ) -> Alert:

        alert = Alert(
            **payload.model_dump()
        )

        return await self._alerts.create(alert)

    async def create_alert_from_prediction(
        self,
        prediction: Prediction,
    ) -> Alert | None:
        """
        Automatically create an alert when a prediction indicates
        medium/high infrastructure risk or predicted failure.
        """

        risk_level = prediction.risk_level

        # Convert enum/string safely.
        risk_value = getattr(
            risk_level,
            "value",
            risk_level,
        )

        if (
            risk_value == PredictionRisk.HIGH.value
            or prediction.predicted_failure
        ):
            severity = AlertSeverity.CRITICAL
            title = "Critical Failure Predicted"
            message = (
                "AI model predicted server failure with "
                f"{prediction.failure_probability * 100:.1f}% probability."
            )

        elif risk_value == PredictionRisk.MEDIUM.value:
            severity = AlertSeverity.WARNING
            title = "Elevated Infrastructure Risk"
            message = (
                "Server failure probability elevated at "
                f"{prediction.failure_probability * 100:.1f}%."
            )

        else:
            logger.debug(
                "alert_not_required",
                extra={
                    "prediction_id": str(prediction.id),
                    "risk_level": str(risk_value),
                    "predicted_failure": prediction.predicted_failure,
                },
            )
            return None

        alert = Alert(
            server_id=prediction.server_id,
            prediction_id=prediction.id,
            title=title,
            message=message,
            severity=severity,
            is_read=False,
        )

        created_alert = await self._alerts.create(alert)

        logger.info(
            "alert_created",
            extra={
                "alert_id": str(created_alert.id),
                "prediction_id": str(prediction.id),
                "severity": str(severity),
            },
        )

        return created_alert

    async def get_alert(
        self,
        alert_id: uuid.UUID,
    ) -> Alert:

        alert = await self._alerts.get_by_id(
            alert_id
        )

        if alert is None:
            raise NotFoundError(
                "Alert not found."
            )

        return alert

    async def list_alerts(
        self,
        limit: int = 100,
        offset: int = 0,
        unread_only: bool = False,
    ) -> list[Alert]:

        return await self._alerts.list_all(
            limit=limit,
            offset=offset,
            unread_only=unread_only,
        )

    async def list_server_alerts(
        self,
        server_id: uuid.UUID,
    ) -> list[Alert]:

        return await self._alerts.list_by_server(
            server_id
        )

    async def update_alert(
        self,
        alert_id: uuid.UUID,
        payload: AlertUpdate,
    ) -> Alert:

        alert = await self._alerts.get_by_id(
            alert_id
        )

        if alert is None:
            raise NotFoundError(
                "Alert not found."
            )

        update_data = payload.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(
                alert,
                field,
                value,
            )

        return await self._alerts.update(
            alert
        )

    async def delete_alert(
        self,
        alert_id: uuid.UUID,
    ) -> None:

        alert = await self._alerts.get_by_id(
            alert_id
        )

        if alert is None:
            raise NotFoundError(
                "Alert not found."
            )

        await self._alerts.delete(
            alert
        )
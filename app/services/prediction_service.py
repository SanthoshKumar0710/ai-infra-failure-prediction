"""
Prediction service.

Connects infrastructure metrics with the trained ML model
and stores the resulting prediction and related alerts.
"""

from __future__ import annotations

import logging
import uuid

from app.core.exceptions import NotFoundError
from app.models.metric import Metric
from app.models.prediction import Prediction
from app.repositories.metric_repository import MetricRepository
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.prediction import PredictionCreate
from ml.predict import predict_failure

logger = logging.getLogger(__name__)


class PredictionService:
    """Service responsible for generating and storing predictions."""

    def __init__(
        self,
        prediction_repository: PredictionRepository,
        metric_repository: MetricRepository,
        alert_service=None,
    ) -> None:
        self.prediction_repository = prediction_repository
        self.metric_repository = metric_repository
        self.alert_service = alert_service

    # =========================================================
    # Internal Alert Helper
    # =========================================================

    async def _create_alert_if_required(
        self,
        prediction: Prediction,
    ) -> None:
        """
        Create an alert for a medium/high-risk prediction.

        Alert creation must never make the prediction API fail.
        """

        if self.alert_service is None:
            logger.warning(
                "alert_service_not_configured",
                extra={
                    "prediction_id": str(prediction.id),
                },
            )
            return

        # Store primitive values BEFORE calling alert service.
        # This prevents SQLAlchemy expired-attribute problems
        # if another repository commits/rolls back the session.
        prediction_id = prediction.id
        server_id = prediction.server_id
        risk_level = prediction.risk_level
        predicted_failure = prediction.predicted_failure

        try:
            alert = await self.alert_service.create_alert_from_prediction(
                prediction
            )

            if alert is not None:
                logger.info(
                    "prediction_alert_created",
                    extra={
                        "prediction_id": str(prediction_id),
                        "alert_id": str(alert.id),
                        "risk_level": str(risk_level),
                    },
                )
            else:
                logger.info(
                    "no_alert_required_for_prediction",
                    extra={
                        "prediction_id": str(prediction_id),
                        "risk_level": str(risk_level),
                        "predicted_failure": predicted_failure,
                    },
                )

        except Exception:
            # Alert creation is secondary.
            # Prediction creation must remain successful.
            logger.exception(
                "alert_creation_failed",
                extra={
                    "prediction_id": str(prediction_id),
                    "server_id": str(server_id),
                },
            )

    # =========================================================
    # Create Prediction from Metric
    # =========================================================

    async def create_prediction_from_metric(
        self,
        metric: Metric,
    ) -> Prediction:
        """Generate an ML prediction from an existing Metric."""

        existing = await self.prediction_repository.get_by_metric_id(
            metric.id
        )

        if existing is not None:
            return existing

        features = [
            metric.cpu_usage,
            metric.memory_usage,
            metric.disk_usage,
            metric.network_usage,
            metric.temperature or 0.0,
            metric.running_processes,
            metric.disk_read_speed,
            metric.disk_write_speed,
            metric.swap_usage,
            metric.network_latency,
            metric.packet_loss,
            metric.uptime_hours,
            metric.error_logs,
            metric.warning_logs,
            metric.critical_logs,
            metric.power_consumption,
            metric.gpu_usage,
            metric.fan_speed,
        ]

        result = predict_failure(features)

        prediction = Prediction(
            server_id=metric.server_id,
            metric_id=metric.id,
            failure_probability=result["failure_probability"],
            risk_level=result["risk_level"],
            predicted_failure=result["predicted_failure"],
            model_version="v1.0",
        )

        saved_prediction = await self.prediction_repository.create(
            prediction
        )

        # Create alert.
        # Any alert failure is intentionally isolated.
        await self._create_alert_if_required(
            saved_prediction
        )

        # Reload prediction after alert transaction.
        refreshed_prediction = (
            await self.prediction_repository.get_by_id(
                saved_prediction.id
            )
        )

        if refreshed_prediction is None:
            raise NotFoundError(
                f"Prediction {saved_prediction.id} not found "
                "after creation."
            )

        return refreshed_prediction

    # =========================================================
    # Create Prediction from Individual Metrics
    # =========================================================

    async def create_prediction_from_metrics(
        self,
        *,
        server_id: uuid.UUID,
        metric_id: uuid.UUID,
        cpu_usage: float,
        memory_usage: float,
        disk_usage: float,
        network_usage: float,
        temperature: float,
        running_processes: int,
        disk_read_speed: float,
        disk_write_speed: float,
        swap_usage: float,
        network_latency: float,
        packet_loss: float,
        uptime_hours: float,
        error_logs: int,
        warning_logs: int,
        critical_logs: int,
        power_consumption: float,
        gpu_usage: float,
        fan_speed: float,
    ) -> Prediction:
        """Generate and store a prediction from individual metrics."""

        existing = await self.prediction_repository.get_by_metric_id(
            metric_id
        )

        if existing is not None:
            return existing

        features = [
            cpu_usage,
            memory_usage,
            disk_usage,
            network_usage,
            temperature,
            running_processes,
            disk_read_speed,
            disk_write_speed,
            swap_usage,
            network_latency,
            packet_loss,
            uptime_hours,
            error_logs,
            warning_logs,
            critical_logs,
            power_consumption,
            gpu_usage,
            fan_speed,
        ]

        result = predict_failure(features)

        prediction = Prediction(
            server_id=server_id,
            metric_id=metric_id,
            failure_probability=result["failure_probability"],
            risk_level=result["risk_level"],
            predicted_failure=result["predicted_failure"],
            model_version="v1.0",
        )

        saved_prediction = await self.prediction_repository.create(
            prediction
        )

        await self._create_alert_if_required(
            saved_prediction
        )

        refreshed_prediction = (
            await self.prediction_repository.get_by_id(
                saved_prediction.id
            )
        )

        if refreshed_prediction is None:
            raise NotFoundError(
                f"Prediction {saved_prediction.id} not found "
                "after creation."
            )

        return refreshed_prediction

    # =========================================================
    # Create Prediction through API Payload
    # =========================================================

    async def create_prediction(
        self,
        payload: PredictionCreate,
    ) -> Prediction:
        """Create a prediction from a stored metric."""

        existing = await self.prediction_repository.get_by_metric_id(
            payload.metric_id
        )

        if existing is not None:
            return existing

        metric = await self.metric_repository.get_by_id(
            payload.metric_id
        )

        if metric is None:
            raise NotFoundError(
                f"Metric {payload.metric_id} not found."
            )

        if metric.server_id != payload.server_id:
            raise ValueError(
                f"Metric {payload.metric_id} does not belong "
                f"to server {payload.server_id}."
            )

        return await self.create_prediction_from_metric(
            metric
        )

    # =========================================================
    # Get Prediction
    # =========================================================

    async def get_prediction(
        self,
        prediction_id: uuid.UUID,
    ) -> Prediction:

        prediction = await self.prediction_repository.get_by_id(
            prediction_id
        )

        if prediction is None:
            raise NotFoundError(
                f"Prediction {prediction_id} not found."
            )

        return prediction

    # =========================================================
    # List Predictions
    # =========================================================

    async def list_predictions(
        self,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Prediction]:

        return await self.prediction_repository.list_all(
            limit=limit,
            offset=offset,
        )

    # =========================================================
    # List Server Predictions
    # =========================================================

    async def list_server_predictions(
        self,
        server_id: uuid.UUID,
    ) -> list[Prediction]:

        return await self.prediction_repository.list_by_server(
            server_id
        )

    # =========================================================
    # Delete Prediction
    # =========================================================

    async def delete_prediction(
        self,
        prediction_id: uuid.UUID,
    ) -> None:

        prediction = await self.prediction_repository.get_by_id(
            prediction_id
        )

        if prediction is None:
            raise NotFoundError(
                f"Prediction {prediction_id} not found."
            )

        await self.prediction_repository.delete(
            prediction
        )
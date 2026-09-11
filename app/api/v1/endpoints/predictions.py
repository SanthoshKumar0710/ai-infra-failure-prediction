"""Prediction management endpoints."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)

from app.api.deps import (
    get_prediction_service,
    require_role,
)
from app.models.enums import UserRole
from app.schemas.prediction import (
    PredictionCreate,
    PredictionRead,
)
from app.services.prediction_service import PredictionService


router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"],
)


# ============================================================
# Create Prediction
# ============================================================

@router.post(
    "",
    response_model=PredictionRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_role(UserRole.OPERATOR))
    ],
)
async def create_prediction(
    payload: PredictionCreate,
    service: Annotated[
        PredictionService,
        Depends(get_prediction_service),
    ],
) -> PredictionRead:

    prediction = await service.create_prediction(
        payload
    )

    return PredictionRead.model_validate(
        prediction
    )


# ============================================================
# List Predictions
# ============================================================

@router.get(
    "",
    response_model=list[PredictionRead],
    dependencies=[
        Depends(require_role(UserRole.VIEWER))
    ],
)
async def list_predictions(
    service: Annotated[
        PredictionService,
        Depends(get_prediction_service),
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
) -> list[PredictionRead]:

    predictions = await service.list_predictions(
        limit=limit,
        offset=offset,
    )

    return [
        PredictionRead.model_validate(prediction)
        for prediction in predictions
    ]


# ============================================================
# Get Prediction
# ============================================================

@router.get(
    "/{prediction_id}",
    response_model=PredictionRead,
    dependencies=[
        Depends(require_role(UserRole.VIEWER))
    ],
)
async def get_prediction(
    prediction_id: uuid.UUID,
    service: Annotated[
        PredictionService,
        Depends(get_prediction_service),
    ],
) -> PredictionRead:

    prediction = await service.get_prediction(
        prediction_id
    )

    return PredictionRead.model_validate(
        prediction
    )


# ============================================================
# List Server Predictions
# ============================================================

@router.get(
    "/server/{server_id}",
    response_model=list[PredictionRead],
    dependencies=[
        Depends(require_role(UserRole.VIEWER))
    ],
)
async def list_server_predictions(
    server_id: uuid.UUID,
    service: Annotated[
        PredictionService,
        Depends(get_prediction_service),
    ],
) -> list[PredictionRead]:

    predictions = await service.list_server_predictions(
        server_id
    )

    return [
        PredictionRead.model_validate(prediction)
        for prediction in predictions
    ]


# ============================================================
# Delete Prediction
# ============================================================

@router.delete(
    "/{prediction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_role(UserRole.ADMIN))
    ],
)
async def delete_prediction(
    prediction_id: uuid.UUID,
    service: Annotated[
        PredictionService,
        Depends(get_prediction_service),
    ],
) -> Response:

    await service.delete_prediction(
        prediction_id
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )
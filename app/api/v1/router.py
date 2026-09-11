"""Aggregates all v1 endpoint routers under a single APIRouter.

Later modules add their own `endpoints/<module>.py` +
`router.include_router(...)` line here; the versioned prefix
and module wiring stays in exactly one place.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    alerts,
    auth,
    metrics,
    predictions,
    servers,
    users,
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router)

# User Management
api_router.include_router(users.router)

# Server Management
api_router.include_router(servers.router)

# Metrics Management
api_router.include_router(metrics.router)

# Prediction Management
api_router.include_router(predictions.router)

# Alert Management
api_router.include_router(alerts.router)
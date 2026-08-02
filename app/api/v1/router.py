"""Aggregates all v1 endpoint routers under a single APIRouter.

Later modules add their own `endpoints/<module>.py` + `router.include_router(...)`
line here; the versioned prefix and module wiring stays in exactly one place.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, servers

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(servers.router)
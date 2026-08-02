"""FastAPI application entrypoint.

Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

In production this is served by Uvicorn workers behind Gunicorn (see
`docker/Dockerfile`) or directly as a Kubernetes Deployment.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.error_handlers import register_exception_handlers
from app.core.logging_config import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware
from app.core.redis_client import close_redis_pool, get_redis
from app.db.session import engine

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup/shutdown hooks: verify infra connectivity fast (fail-fast
    on misconfiguration) and clean up pooled connections on shutdown."""
    logger.info("application_starting", extra={"environment": settings.ENVIRONMENT})

    redis = get_redis()
    await redis.ping()
    logger.info("redis_connection_ok")

    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    logger.info("database_connection_ok")

    yield

    await close_redis_pool()
    await engine.dispose()
    logger.info("application_shutdown_complete")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/health", tags=["Health"])
    async def health() -> dict[str, str]:
        """Liveness/readiness probe target for Docker/Kubernetes."""
        return {"status": "ok"}

    return app


app = create_app()

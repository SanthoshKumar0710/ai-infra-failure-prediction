"""Application configuration.

All runtime configuration is centralized here and loaded from environment
variables (or a `.env` file in local development) via pydantic-settings.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ============================================================
    # General
    # ============================================================

    APP_NAME: str = "AI Infrastructure Failure Prediction Platform"

    ENVIRONMENT: Literal[
        "development",
        "staging",
        "production",
        "test",
    ] = "development"

    DEBUG: bool = False

    API_V1_PREFIX: str = "/api/v1"

    LOG_LEVEL: Literal[
        "DEBUG",
        "INFO",
        "WARNING",
        "ERROR",
        "CRITICAL",
    ] = "INFO"

    LOG_JSON: bool = True

    # ============================================================
    # Security / JWT
    # ============================================================

    JWT_SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="HMAC signing secret for JWTs",
    )

    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    JWT_ISSUER: str = "ai-infra-failure-prediction"

    # ============================================================
    # Password hashing
    # ============================================================

    PASSWORD_HASH_SCHEME: str = "bcrypt"

    MIN_PASSWORD_LENGTH: int = 12

    # ============================================================
    # Database
    # ============================================================

    POSTGRES_HOST: str = "localhost"

    POSTGRES_PORT: int = 5432

    POSTGRES_USER: str = "postgres"

    POSTGRES_PASSWORD: str = Field(
        default="",
        description="Postgres password",
    )

    POSTGRES_DB: str = "ai_infra_failure_prediction"

    DATABASE_POOL_SIZE: int = 10

    DATABASE_MAX_OVERFLOW: int = 20

    DATABASE_ECHO: bool = False

    SQLALCHEMY_DATABASE_URI: str | PostgresDsn | None = Field(
        default=None,
        validation_alias=AliasChoices("SQLALCHEMY_DATABASE_URI", "DATABASE_URL"),
    )

    @field_validator(
        "SQLALCHEMY_DATABASE_URI",
        mode="before",
    )
    @classmethod
    def assemble_db_uri(
        cls,
        v: str | None,
        info,
    ) -> str:

        if isinstance(v, str) and v:
            if v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
            return v

        data = info.data

        return (
            f"postgresql+asyncpg://"
            f"{data.get('POSTGRES_USER', 'postgres')}:"
            f"{data.get('POSTGRES_PASSWORD', '')}"
            f"@{data.get('POSTGRES_HOST', 'localhost')}:"
            f"{data.get('POSTGRES_PORT', 5432)}/"
            f"{data.get('POSTGRES_DB', 'ai_infra_failure_prediction')}"
        )

    # ============================================================
    # Redis
    # ============================================================

    REDIS_HOST: str = "localhost"

    REDIS_PORT: int = 6379

    REDIS_DB: int = 0

    REDIS_PASSWORD: str | None = None

    REDIS_URL: RedisDsn | None = None

    @field_validator(
        "REDIS_URL",
        mode="before",
    )
    @classmethod
    def assemble_redis_url(
        cls,
        v: str | None,
        info,
    ) -> str:

        if isinstance(v, str) and v:
            return v

        data = info.data

        auth = (
            f":{data['REDIS_PASSWORD']}@"
            if data.get("REDIS_PASSWORD")
            else ""
        )

        return (
            f"redis://{auth}"
            f"{data['REDIS_HOST']}:"
            f"{data['REDIS_PORT']}/"
            f"{data['REDIS_DB']}"
        )

    # ============================================================
    # Kafka
    # ============================================================

    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"

    KAFKA_METRICS_TOPIC: str = "infra.metrics.raw"

    KAFKA_ALERTS_TOPIC: str = "infra.alerts"

    KAFKA_CONSUMER_GROUP: str = (
        "ai-infra-failure-prediction"
    )

    # ============================================================
    # MLflow
    # ============================================================

    MLFLOW_TRACKING_URI: str = "http://localhost:5000"

    MLFLOW_EXPERIMENT_NAME: str = (
        "infra-failure-prediction"
    )

    # ============================================================
    # Rate limiting / lockout
    # ============================================================

    LOGIN_MAX_ATTEMPTS: int = 5

    LOGIN_LOCKOUT_MINUTES: int = 15

    # ============================================================
    # CORS
    # ============================================================

    # React + Vite frontend
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ============================================================
    # Environment helper
    # ============================================================

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


# ================================================================
# Settings singleton
# ================================================================

@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""

    return Settings()  # type: ignore[call-arg]


settings = get_settings()
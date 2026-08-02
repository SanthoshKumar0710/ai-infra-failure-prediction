"""Centralized structured logging setup.

Uses stdlib `logging` with a JSON formatter suitable for ingestion by
log aggregators (ELK, Loki, CloudWatch, etc.). A `request_id` contextvar
is threaded through so every log line emitted during a request can be
correlated, which is critical for debugging distributed, async services.
"""

from __future__ import annotations

import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, ClassVar

from app.core.config import settings

request_id_ctx_var: ContextVar[str | None] = ContextVar("request_id", default=None)
user_id_ctx_var: ContextVar[str | None] = ContextVar("user_id", default=None)


class JSONFormatter(logging.Formatter):
    """Renders log records as single-line JSON objects."""

    RESERVED_ATTRS: ClassVar[set[str]] = {
        "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
        "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
        "created", "msecs", "relativeCreated", "thread", "threadName",
        "processName", "process", "message", "asctime",
    }

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "request_id": request_id_ctx_var.get(),
            "user_id": user_id_ctx_var.get(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        for key, value in record.__dict__.items():
            if key not in self.RESERVED_ATTRS and not key.startswith("_") and key not in payload:
                try:
                    json.dumps(value)
                    payload[key] = value
                except TypeError:
                    payload[key] = str(value)

        return json.dumps(payload, default=str)


class HumanFormatter(logging.Formatter):
    """Readable formatter for local development."""

    def __init__(self) -> None:
        super().__init__(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )


def configure_logging() -> None:
    """Configure root logging handlers exactly once at process startup."""
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL)

    # Avoid duplicate handlers if called more than once (e.g. under reload).
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter() if settings.LOG_JSON else HumanFormatter())
    root_logger.addHandler(handler)

    # Tame noisy third-party loggers.
    for noisy in ("uvicorn.access", "sqlalchemy.engine", "aiokafka"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Convenience accessor so callers don't import stdlib logging directly."""
    return logging.getLogger(name)

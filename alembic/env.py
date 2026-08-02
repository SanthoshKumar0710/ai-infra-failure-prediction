"""Alembic migration environment.

Wired to the application's async engine and settings so migrations run
against the same database URL the app itself uses, with no duplicated
configuration. Import every ORM model module here so Alembic's
autogenerate can see the full metadata.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.db.session import Base

# ------------------------------------------------------------------
# Import ALL SQLAlchemy models here
# ------------------------------------------------------------------
from app.models.user import User  # noqa: F401
from app.models.server import Server  # noqa: F401

# ------------------------------------------------------------------
# Alembic Configuration
# ------------------------------------------------------------------

config = context.config

config.set_main_option(
    "sqlalchemy.url",
    str(settings.SQLALCHEMY_DATABASE_URI),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ------------------------------------------------------------------
# Offline Migrations
# ------------------------------------------------------------------

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""

    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ------------------------------------------------------------------
# Online Migrations
# ------------------------------------------------------------------

def do_run_migrations(connection: Connection) -> None:
    """Run migrations with a live database connection."""

    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Create async engine and run migrations."""

    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# ------------------------------------------------------------------
# Entry Point
# ------------------------------------------------------------------

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
"""Shared pytest fixtures for the auth test suite.

Uses an in-memory SQLite database (via aiosqlite) for speed and
isolation instead of spinning up real Postgres in unit tests; the
schema is created fresh per test function. `fakeredis` provides a
drop-in async Redis substitute so token-revocation logic is exercised
without a real Redis instance. Integration tests that need real
Postgres/Redis behavior belong in `tests/integration` and are marked
accordingly (see `pytest.ini`/CI config, not shown in Module 1).
"""

from __future__ import annotations

import os
import uuid
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-that-is-at-least-32-chars-long")
os.environ.setdefault("POSTGRES_PASSWORD", "test-password")

from app.core.security import hash_password
from app.db.session import Base, get_db
from app.models.enums import UserRole
from app.models.user import User


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def fake_redis():
    import fakeredis.aioredis

    client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    yield client
    await client.flushall()
    await client.aclose()


@pytest_asyncio.fixture
async def app_client(db_session: AsyncSession, fake_redis) -> AsyncGenerator[AsyncClient, None]:
    from app.core.redis_client import get_redis
    from app.main import app

    async def _override_get_db():
        yield db_session

    async def _override_get_redis():
        return fake_redis

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_redis] = _override_get_redis

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seed_admin(db_session: AsyncSession) -> User:
    admin = User(
        id=uuid.uuid4(),
        email="admin@example.com",
        full_name="Admin User",
        hashed_password=hash_password("Sup3rSecure!Pass"),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db_session.add(admin)
    await db_session.flush()
    return admin

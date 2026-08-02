"""Async Redis client singleton.

Used in Module 1 for: (a) JWT revocation (logout blacklists a token's
`jti` until its natural expiry), and (b) login-attempt rate limiting.
Later modules reuse this same client for metrics caching.
"""

from __future__ import annotations

from redis.asyncio import ConnectionPool, Redis

from app.core.config import settings

_pool: ConnectionPool = ConnectionPool.from_url(
    str(settings.REDIS_URL),
    max_connections=50,
    decode_responses=True,
)


def get_redis() -> Redis:
    """Return a Redis client bound to the shared connection pool.

    A new lightweight `Redis` wrapper is returned per call (cheap - it
    does not open a new socket), while the underlying connection pool
    is process-wide, which is the pattern recommended by redis-py for
    async applications.
    """
    return Redis(connection_pool=_pool)


async def close_redis_pool() -> None:
    """Disconnect the pool on application shutdown."""
    await _pool.disconnect()

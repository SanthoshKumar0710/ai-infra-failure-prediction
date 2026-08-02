# AI Infrastructure Failure Prediction Platform

Predicts server/infrastructure failures before they happen: ingests CPU,
RAM, disk, GPU, network, temperature, log, and power metrics; detects
anomalies; predicts failures; explains predictions (SHAP); raises alerts;
and recommends maintenance actions.

**Status:** Module 1 (Authentication & RBAC) complete. Modules 2–14 land
incrementally — see the root task tracker / conversation history.

## Architecture

Clean Architecture, layered as:

```
API layer (FastAPI routers) -> Service layer (business rules)
    -> Repository layer (data access) -> ORM models -> PostgreSQL
```

Cross-cutting concerns (config, security, logging, exceptions, Redis,
middleware) live under `app/core/`. Every service depends on repository
*abstractions* (`app/repositories/base.py`), not concrete SQLAlchemy
classes, satisfying Dependency Inversion and keeping services unit
testable with in-memory fakes.

## Module 1: Authentication & RBAC

- **JWT** access + refresh tokens (HS256), refresh rotation, and
  Redis-backed revocation (logout / rotate blacklists a token's `jti`
  until its natural expiry).
- **RBAC** via `require_role(...)` FastAPI dependency with a role
  hierarchy (`viewer < operator < ml_engineer < admin`).
- **Account lockout** after `LOGIN_MAX_ATTEMPTS` failed logins for
  `LOGIN_LOCKOUT_MINUTES`.
- **Password policy** enforced at the schema layer (length + character
  class complexity) and hashed with bcrypt — plaintext passwords are
  never persisted or logged.
- **Structured JSON logging** with request-ID correlation
  (`app/core/middleware.py`) for every request.
- **Consistent error envelope** (`{"error_code": ..., "detail": ...}`)
  for all application-raised and unexpected exceptions.

## Quickstart (local, Docker)

```bash
cp .env.example .env
# edit .env: set JWT_SECRET_KEY and POSTGRES_PASSWORD at minimum

docker compose up --build
# API:   http://localhost:8000
# Docs:  http://localhost:8000/docs

# Apply the initial migration (users table):
docker compose exec api alembic upgrade head
```

## Quickstart (local, no Docker)

```bash
python3.13 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env  # edit as above; point POSTGRES_HOST/REDIS_HOST at local instances

alembic upgrade head
uvicorn app.main:app --reload
```

## Running tests

```bash
pip install -r requirements.txt
pytest
```

Unit tests (`tests/unit/`) run against an in-memory SQLite DB and
`fakeredis` — no external services required. Integration tests
(`tests/integration/`) exercise the full ASGI app through the same
fakes for CI speed; a separate `docker-compose.test.yml` targeting real
Postgres/Redis is planned as part of Module 13 (Monitoring & Logging /
CI hardening).

## API surface (Module 1)

| Method | Path                     | Auth        | Description                          |
|--------|--------------------------|-------------|---------------------------------------|
| POST   | `/api/v1/auth/register`  | none        | Self-register (role defaults to viewer) |
| POST   | `/api/v1/auth/login`     | none        | OAuth2 password login -> token pair    |
| POST   | `/api/v1/auth/refresh`   | none        | Rotate a refresh token                 |
| POST   | `/api/v1/auth/logout`    | bearer      | Revoke access + refresh tokens         |
| GET    | `/api/v1/auth/me`        | bearer      | Current user's profile                 |
| GET    | `/api/v1/users`          | bearer, ADMIN | List all users                       |
| GET    | `/health`                | none        | Liveness/readiness probe               |

## Project layout

```
app/
  core/        # config, security, logging, exceptions, redis, middleware
  db/          # SQLAlchemy engine/session/base
  models/      # ORM models + enums
  schemas/     # Pydantic request/response models
  repositories/# data-access layer (abstract + SQLAlchemy impl)
  services/    # business logic
  api/v1/      # FastAPI routers ("thin" HTTP layer)
alembic/       # DB migrations
tests/
  unit/        # service + security unit tests (SQLite + fakeredis)
  integration/ # full-stack HTTP tests
docker/        # Dockerfile
k8s/           # Kubernetes manifests
```

## Next module

**Module 2: User & Server Management** — full user CRUD/admin endpoints,
server registry (host inventory, tags, metadata), and the DB schema for
`servers` that Module 3 (Data Ingestion) will attach metrics to. Awaiting
approval to proceed.

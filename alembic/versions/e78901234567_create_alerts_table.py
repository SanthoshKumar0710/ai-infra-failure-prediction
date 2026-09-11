"""create_alerts_table

Revision ID: e78901234567
Revises: 11dc31e749bb
Create Date: 2026-08-21
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "e78901234567"
down_revision: str | None = "11dc31e749bb"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ALERT_SEVERITY_ENUM = postgresql.ENUM(
    "info", "warning", "critical", name="alert_severity"
)


def upgrade() -> None:
    bind = op.get_bind()
    ALERT_SEVERITY_ENUM.create(bind, checkfirst=True)

    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "server_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("servers.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "prediction_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("predictions.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "severity",
            postgresql.ENUM(
                "info",
                "warning",
                "critical",
                name="alert_severity",
                create_type=False,
            ),
            nullable=False,
            server_default="warning",
        ),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_alerts_server_id", "alerts", ["server_id"], unique=False)
    op.create_index("ix_alerts_prediction_id", "alerts", ["prediction_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_alerts_prediction_id", table_name="alerts")
    op.drop_index("ix_alerts_server_id", table_name="alerts")
    op.drop_table("alerts")
    ALERT_SEVERITY_ENUM.drop(op.get_bind(), checkfirst=True)

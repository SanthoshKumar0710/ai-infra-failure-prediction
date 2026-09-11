"""add ml infrastructure metrics

Revision ID: 11dc31e749bb
Revises: 041a52c8b0b8
Create Date: 2026-08-08
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "11dc31e749bb"
down_revision: Union[str, None] = "041a52c8b0b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---------------------------------------------------------
    # Add ML infrastructure metric columns.
    #
    # server_default=0 allows existing rows to be populated
    # safely when these columns are added.
    # ---------------------------------------------------------

    op.add_column(
        "metrics",
        sa.Column(
            "disk_read_speed",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "disk_write_speed",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "swap_usage",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "network_latency",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "packet_loss",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "uptime_hours",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )


    op.add_column(
        "metrics",
        sa.Column(
            "error_logs",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "warning_logs",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "critical_logs",
            sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "power_consumption",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "gpu_usage",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    op.add_column(
        "metrics",
        sa.Column(
            "fan_speed",
            sa.Float(),
            nullable=False,
            server_default=sa.text("0"),
        ),
    )

    # ---------------------------------------------------------
    # Remove database defaults after existing rows are filled.
    # New values will come from the application/model.
    # ---------------------------------------------------------

    op.alter_column(
        "metrics",
        "disk_read_speed",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "disk_write_speed",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "swap_usage",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "network_latency",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "packet_loss",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "uptime_hours",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "error_logs",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "warning_logs",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "critical_logs",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "power_consumption",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "gpu_usage",
        server_default=None,
    )

    op.alter_column(
        "metrics",
        "fan_speed",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("metrics", "fan_speed")
    op.drop_column("metrics", "gpu_usage")
    op.drop_column("metrics", "power_consumption")
    op.drop_column("metrics", "critical_logs")
    op.drop_column("metrics", "warning_logs")
    op.drop_column("metrics", "error_logs")
    op.drop_column("metrics", "uptime_hours")
    op.drop_column("metrics", "packet_loss")
    op.drop_column("metrics", "network_latency")
    op.drop_column("metrics", "swap_usage")
    op.drop_column("metrics", "disk_write_speed")
    op.drop_column("metrics", "disk_read_speed")
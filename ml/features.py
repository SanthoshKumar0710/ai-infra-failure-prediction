"""
Centralized ML Feature Definitions and Validations.
"""

from __future__ import annotations

from typing import Any

FEATURE_COLUMNS: list[str] = [
    "cpu_usage",
    "memory_usage",
    "disk_usage",
    "network_usage",
    "temperature",
    "running_processes",
    "disk_read_speed",
    "disk_write_speed",
    "swap_usage",
    "network_latency",
    "packet_loss",
    "uptime_hours",
    "error_logs",
    "warning_logs",
    "critical_logs",
    "power_consumption",
    "gpu_usage",
    "fan_speed",
]


def validate_features(features: list[float] | list[Any]) -> list[float]:
    """
    Validate input feature list for model prediction.

    Parameters
    ----------
    features:
        List containing raw feature values.

    Returns
    -------
    list[float]
        Validated list of float values.
    """
    if not isinstance(features, (list, tuple)):
        raise ValueError("Features input must be a list or tuple.")

    if len(features) != len(FEATURE_COLUMNS):
        raise ValueError(
            f"Expected exactly {len(FEATURE_COLUMNS)} features, "
            f"received {len(features)}."
        )

    validated: list[float] = []
    for idx, (name, val) in enumerate(zip(FEATURE_COLUMNS, features)):
        if val is None:
            raise ValueError(f"Feature '{name}' at index {idx} cannot be None.")
        try:
            val_float = float(val)
        except (ValueError, TypeError) as exc:
            raise ValueError(
                f"Feature '{name}' at index {idx} must be numeric, got {val!r}."
            ) from exc
        validated.append(val_float)

    return validated

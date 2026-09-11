"""Unit tests for ML prediction logic and feature validation."""

from __future__ import annotations

import pytest

from ml.features import FEATURE_COLUMNS, validate_features
from ml.predict import predict_failure


def test_feature_columns_count():
    assert len(FEATURE_COLUMNS) == 18


def test_validate_features_valid():
    raw = [50.0] * 18
    validated = validate_features(raw)
    assert len(validated) == 18
    assert all(isinstance(x, float) for x in validated)


def test_validate_features_invalid_length():
    with pytest.raises(ValueError, match="Expected exactly 18 features"):
        validate_features([1.0] * 10)


def test_validate_features_invalid_type():
    with pytest.raises(ValueError, match="must be numeric"):
        validate_features([50.0] * 17 + ["invalid_number"])


def test_predict_failure_runs_and_returns_dict():
    # Normal metrics
    features = [
        35.0,  # cpu_usage
        45.0,  # memory_usage
        50.0,  # disk_usage
        100.0, # network_usage
        45.0,  # temperature
        120,   # running_processes
        50.0,  # disk_read_speed
        30.0,  # disk_write_speed
        5.0,   # swap_usage
        15.0,  # network_latency
        0.0,   # packet_loss
        720,   # uptime_hours
        1,     # error_logs
        3,     # warning_logs
        0,     # critical_logs
        250.0, # power_consumption
        10.0,  # gpu_usage
        2200,  # fan_speed
    ]

    result = predict_failure(features)

    assert "failure_probability" in result
    assert "predicted_failure" in result
    assert "risk_level" in result

    assert isinstance(result["failure_probability"], float)
    assert isinstance(result["predicted_failure"], bool)
    assert result["risk_level"] in ("low", "medium", "high")

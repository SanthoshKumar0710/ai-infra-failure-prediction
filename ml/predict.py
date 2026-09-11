"""
Infrastructure Failure Prediction.
"""

from __future__ import annotations

import pandas as pd

from ml.features import FEATURE_COLUMNS, validate_features
from ml.model_loader import load_model


def predict_failure(features: list[float]) -> dict:
    """
    Predict infrastructure failure.

    Parameters
    ----------
    features:
        List containing exactly 18 ML input features.

    Returns
    -------
    dict
        Failure probability, prediction and risk level.
    """

    validated_features = validate_features(features)
    model, scaler = load_model()

    # Create DataFrame with the exact feature names used during model training
    X = pd.DataFrame(
        [validated_features],
        columns=FEATURE_COLUMNS,
    )

    # Apply the same scaler used during training
    X_scaled = scaler.transform(X)

    # Probability of class 1 = infrastructure failure
    probability = float(model.predict_proba(X_scaled)[0][1])

    # Final binary prediction
    prediction = bool(model.predict(X_scaled)[0])

    # Risk classification
    if probability < 0.30:
        risk_level = "low"
    elif probability < 0.70:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "failure_probability": round(probability, 4),
        "predicted_failure": prediction,
        "risk_level": risk_level,
    }
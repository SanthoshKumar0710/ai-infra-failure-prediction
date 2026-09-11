"""
Load trained Machine Learning model.
"""

from __future__ import annotations

from pathlib import Path

import joblib

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "model.pkl"
SCALER_PATH = BASE_DIR / "scaler.pkl"

model = None
scaler = None


def load_model():
    """
    Load trained model and scaler.
    """

    global model
    global scaler

    if model is None:
        model = joblib.load(MODEL_PATH)

    if scaler is None:
        scaler = joblib.load(SCALER_PATH)

    return model, scaler
"""
Train Machine Learning Model for
AI Infrastructure Failure Prediction
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from ml.features import FEATURE_COLUMNS

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = BASE_DIR / "dataset.csv"
MODEL_PATH = BASE_DIR / "model.pkl"
SCALER_PATH = BASE_DIR / "scaler.pkl"
METADATA_PATH = BASE_DIR / "metadata.json"

# ==========================================================
# Load Dataset
# ==========================================================

print("=" * 60)
print("Loading Dataset...")
print("=" * 60)

df = pd.read_csv(DATASET_PATH)

print(f"Dataset Shape : {df.shape}")

# ==========================================================
# Features & Target
# ==========================================================

X = df[FEATURE_COLUMNS]
y = df["failure"]

# ==========================================================
# Train Test Split
# ==========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print(f"Training Samples : {len(X_train)}")
print(f"Testing Samples  : {len(X_test)}")

# ==========================================================
# Feature Scaling
# ==========================================================

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)

X_test = scaler.transform(X_test)

joblib.dump(scaler, SCALER_PATH)

print("\nScaler Saved Successfully")

# ==========================================================
# Model Training
# ==========================================================

print("\nTraining Random Forest Model...")

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    random_state=42,
    n_jobs=-1,
)

model.fit(X_train, y_train)

print("Training Completed Successfully")

# ==========================================================
# Prediction
# ==========================================================

y_pred = model.predict(X_test)

y_prob = model.predict_proba(X_test)[:, 1]

# ==========================================================
# Evaluation
# ==========================================================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(y_test, y_pred)

recall = recall_score(y_test, y_pred)

f1 = f1_score(y_test, y_pred)

roc_auc = roc_auc_score(y_test, y_prob)

cm = confusion_matrix(y_test, y_pred)

report = classification_report(y_test, y_pred)

# ==========================================================
# Save Model & Metadata
# ==========================================================

joblib.dump(model, MODEL_PATH)

print("\nModel Saved Successfully")
print(MODEL_PATH)

metadata = {
    "model_version": "v1.0",
    "algorithm": "RandomForestClassifier",
    "trained_at": datetime.now(timezone.utc).isoformat(),
    "feature_columns": FEATURE_COLUMNS,
    "dataset_type": "synthetic",
    "dataset_rows": len(df),
    "metrics": {
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
    },
    "note": "Trained on synthetic infrastructure dataset for failure prediction.",
}

with open(METADATA_PATH, "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print(f"Metadata Saved Successfully to {METADATA_PATH}")

# ==========================================================
# Results
# ==========================================================

print("\n" + "=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC-AUC   : {roc_auc:.4f}")

print("\nConfusion Matrix")
print(cm)

print("\nClassification Report")
print(report)

print("=" * 60)
print("Training Finished Successfully")
print("=" * 60)
"""
Preprocess the Infrastructure Failure dataset.
"""

from pathlib import Path

import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from ml.features import FEATURE_COLUMNS

# -----------------------------------------------------
# Paths
# -----------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATASET_PATH = BASE_DIR / "dataset.csv"

SCALER_PATH = BASE_DIR / "scaler.pkl"

# -----------------------------------------------------
# Load Dataset
# -----------------------------------------------------

df = pd.read_csv(DATASET_PATH)

print("=" * 60)
print("Dataset Loaded Successfully")
print("=" * 60)

print(df.head())

print()

print(df.isnull().sum())

# -----------------------------------------------------
# Features
# -----------------------------------------------------

X = df[FEATURE_COLUMNS]
y = df["failure"]


# -----------------------------------------------------
# Split Dataset
# -----------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print()

print(f"Training Samples : {len(X_train)}")

print(f"Testing Samples  : {len(X_test)}")

# -----------------------------------------------------
# Feature Scaling
# -----------------------------------------------------

scaler = StandardScaler()

X_train = scaler.fit_transform(X_train)

X_test = scaler.transform(X_test)

joblib.dump(scaler, SCALER_PATH)

print()

print("Scaler saved successfully!")

print(SCALER_PATH)

print("=" * 60)
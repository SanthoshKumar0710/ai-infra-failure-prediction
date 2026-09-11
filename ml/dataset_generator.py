"""
Generate a synthetic dataset for AI Infrastructure Failure Prediction.
"""

from __future__ import annotations

import random
import uuid
from pathlib import Path

import pandas as pd

from ml.features import FEATURE_COLUMNS

# ==========================================================
# Configuration
# ==========================================================

ROWS = 20_000

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"

# ==========================================================
# Generate Dataset
# ==========================================================

data: list[list] = []

for _ in range(ROWS):

    cpu_usage = round(random.uniform(5, 100), 2)
    memory_usage = round(random.uniform(10, 100), 2)
    disk_usage = round(random.uniform(10, 100), 2)
    network_usage = round(random.uniform(10, 1000), 2)

    temperature = round(random.uniform(25, 95), 2)

    running_processes = random.randint(40, 600)

    disk_read_speed = round(random.uniform(10, 600), 2)
    disk_write_speed = round(random.uniform(10, 500), 2)

    swap_usage = round(random.uniform(0, 100), 2)

    network_latency = round(random.uniform(1, 250), 2)

    packet_loss = round(random.uniform(0, 10), 2)

    uptime_hours = random.randint(1, 12000)

    error_logs = random.randint(0, 40)

    warning_logs = random.randint(0, 100)

    critical_logs = random.randint(0, 10)

    power_consumption = round(random.uniform(100, 700), 2)

    gpu_usage = round(random.uniform(0, 100), 2)

    fan_speed = random.randint(900, 5000)

    # ======================================================
    # Failure Rule (Synthetic Label)
    # ======================================================

    risk_score = 0

    if cpu_usage > 90:
        risk_score += 2

    if memory_usage > 90:
        risk_score += 2

    if disk_usage > 90:
        risk_score += 2

    if temperature > 80:
        risk_score += 2

    if packet_loss > 5:
        risk_score += 1

    if network_latency > 180:
        risk_score += 1

    if critical_logs > 5:
        risk_score += 3

    if swap_usage > 80:
        risk_score += 1

    if error_logs > 20:
        risk_score += 1

    failure = 1 if risk_score >= 6 else 0

    data.append(
        [
            str(uuid.uuid4()),
            cpu_usage,
            memory_usage,
            disk_usage,
            network_usage,
            temperature,
            running_processes,
            disk_read_speed,
            disk_write_speed,
            swap_usage,
            network_latency,
            packet_loss,
            uptime_hours,
            error_logs,
            warning_logs,
            critical_logs,
            power_consumption,
            gpu_usage,
            fan_speed,
            failure,
        ]
    )

# ==========================================================
# Create DataFrame
# ==========================================================

columns = ["server_id"] + FEATURE_COLUMNS + ["failure"]

df = pd.DataFrame(data, columns=columns)


# ==========================================================
# Save Dataset
# ==========================================================

df.to_csv(DATASET_PATH, index=False)

# ==========================================================
# Display Information
# ==========================================================

print("=" * 60)
print("Synthetic Dataset Generated Successfully")
print("=" * 60)
print(f"Rows    : {len(df):,}")
print(f"Columns : {len(df.columns)}")
print(f"Saved   : {DATASET_PATH}")
print()

print(df.head())

print()

print(df.describe())

print("=" * 60)
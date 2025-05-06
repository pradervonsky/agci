# water_management.py
import random
from datetime import datetime
import pandas as pd
import numpy as np


class WaterManagementSimulator:
    def __init__(self, seed=None):
        """Initialize with optional random seed for reproducibility"""
        if seed:
            random.seed(seed)
            np.random.seed(seed)

        # Baseline values for Aarhus/Denmark
        self.baseline_consumption = 105  # L/capita/day (Danish average)
        self.baseline_ili = 2.5  # Infrastructure Leakage Index
        self.baseline_treatment = 98.5  # % compliance with UWWTD

        # Seasonal variation factors
        self.months = range(1, 13)
        # Consumption is higher in summer months
        self.seasonal_consumption = {
            1: 0.9,
            2: 0.9,
            3: 0.95,
            4: 1.0,
            5: 1.05,
            6: 1.15,
            7: 1.2,
            8: 1.15,
            9: 1.05,
            10: 1.0,
            11: 0.95,
            12: 0.9,
        }

    def get_current_data(self):
        """Generate water metrics for the current day"""
        today = datetime.now()
        current_month = today.month
        day_of_year = today.timetuple().tm_yday

        # Apply seasonal factor to consumption
        season_factor = self.seasonal_consumption[current_month]

        # Add some daily noise (±5%)
        daily_noise = 1 + (random.random() * 0.1 - 0.05)

        # Calculate today's consumption
        consumption = self.baseline_consumption * season_factor * daily_noise

        # ILI typically changes slowly (infrastructure changes)
        # Small random walk with slight improvement trend
        ili_change = random.normalvariate(0, 0.01) - 0.001  # Slight improving trend
        ili = max(1.1, min(6.0, self.baseline_ili + ili_change))

        # Treatment compliance usually high and stable
        # But can have occasional dips due to maintenance or issues
        treatment_dip = 0
        if random.random() < 0.05:  # 5% chance of a treatment issue
            treatment_dip = random.uniform(0.5, 2.0)

        treatment = max(90.0, min(100.0, self.baseline_treatment - treatment_dip))

        return {
            "consumption": round(consumption, 1),
            "ili": round(ili, 2),
            "treatment_compliance": round(treatment, 1),
        }

    def normalize_metrics(self, metrics):
        """Convert raw metrics to 0-100 scores"""
        normalized = {}

        # Water consumption (L/capita/day): 100=100L, 0=300L, linear
        if "consumption" in metrics:
            consumption = metrics["consumption"]
            normalized["consumption"] = max(0, min(100, 100 - (consumption - 100)))

        # ILI: 100=1.0, 0=6.0, linear
        if "ili" in metrics:
            ili = metrics["ili"]
            normalized["ili"] = max(0, min(100, 100 - (ili - 1.0) * 20))

        # Treatment compliance: 100=100%, 0=50%, linear
        if "treatment_compliance" in metrics:
            compliance = metrics["treatment_compliance"]
            normalized["treatment_compliance"] = max(0, min(100, (compliance - 50) * 2))

        # Overall water score
        if normalized:
            normalized["overall"] = sum(normalized.values()) / len(normalized)

        return normalized

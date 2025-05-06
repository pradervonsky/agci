# waste_circular_economy.py
import random
from datetime import datetime, timedelta


class WasteSimulator:
    def __init__(self):
        # Baseline values for Aarhus/Denmark
        self.baseline_waste_per_capita = 0.45  # tonnes/year
        self.baseline_recycling_rate = 48.0  # percentage
        self.baseline_landfill_rate = 5.0  # percentage (low in Denmark)

        # Danish holidays with increased waste
        self.holidays = [
            "01-01",  # New Year's Day
            "04-09",  # Easter (approximate)
            "04-10",  # Easter (approximate)
            "06-05",  # Constitution Day
            "12-24",  # Christmas Eve
            "12-25",  # Christmas Day
            "12-26",  # Second Christmas Day
            "12-31",  # New Year's Eve
        ]

        # Track improvements over time
        self.days_passed = 0

    def get_current_data(self):
        """Generate waste metrics for the current day"""
        today = datetime.now()
        month_day = today.strftime("%m-%d")
        day_of_week = today.weekday()  # 0=Monday, 6=Sunday

        # Track days for improvement trends
        self.days_passed += 1

        # Base daily waste (tonnes per capita per day)
        daily_waste = self.baseline_waste_per_capita / 365

        # Weekend adjustment (more waste on weekends)
        if day_of_week >= 5:  # Weekend
            daily_waste *= 1.15

        # Holiday adjustment
        if month_day in self.holidays:
            daily_waste *= 1.4  # 40% more waste on holidays

        # Seasonal adjustment (more in summer)
        month = today.month
        if 6 <= month <= 8:  # Summer months
            daily_waste *= 1.1

        # Calculate annual equivalent
        annual_waste_per_capita = daily_waste * 365

        # Recycling rate slowly improving over time
        recycling_improvement = self.days_passed * 0.003  # ~1% improvement per year
        current_recycling = min(
            75.0, self.baseline_recycling_rate + recycling_improvement
        )

        # Landfill rate slowly decreasing
        landfill_reduction = self.days_passed * 0.001  # ~0.3% reduction per year
        current_landfill = max(0.5, self.baseline_landfill_rate - landfill_reduction)

        # Add small random fluctuations
        waste_noise = 1 + (random.random() * 0.06 - 0.03)  # ±3%
        recycling_noise = 1 + (random.random() * 0.04 - 0.02)  # ±2%
        landfill_noise = 1 + (random.random() * 0.08 - 0.04)  # ±4%

        return {
            "waste_per_capita": round(annual_waste_per_capita * waste_noise, 3),
            "recycling_rate": round(current_recycling * recycling_noise, 1),
            "landfill_rate": round(current_landfill * landfill_noise, 1),
        }

    def normalize_metrics(self, metrics):
        """Convert raw metrics to 0-100 scores"""
        normalized = {}

        # Waste per capita: 100=0.2t, 0=0.7t, linear
        if "waste_per_capita" in metrics:
            waste = metrics["waste_per_capita"]
            normalized["waste_per_capita"] = max(
                0, min(100, 100 - ((waste - 0.2) * 200))
            )

        # Recycling rate: Score = actual %
        if "recycling_rate" in metrics:
            recycling = metrics["recycling_rate"]
            normalized["recycling_rate"] = recycling

        # Landfill rate: 100=0%, 0=60%, linear
        if "landfill_rate" in metrics:
            landfill = metrics["landfill_rate"]
            normalized["landfill_rate"] = max(0, min(100, 100 - (landfill * 5 / 3)))

        # Overall score
        if normalized:
            normalized["overall"] = sum(normalized.values()) / len(normalized)

        return normalized

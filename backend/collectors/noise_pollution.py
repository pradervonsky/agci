# noise_pollution.py
import random
from datetime import datetime
import requests


class NoiseSimulator:
    def __init__(self):
        # Baseline values for urban areas
        self.baseline_lden_exposed = 25.0  # % population exposed to Lden ≥ 55 dB
        self.baseline_lnight_exposed = 18.0  # % population exposed to Lnight ≥ 50 dB
        self.baseline_sleep_disturbed = 8.5  # % population with high sleep disturbance

        # Traffic factors by day type (index values)
        self.traffic_factors = {
            0: 1.1,  # Monday
            1: 1.05,  # Tuesday
            2: 1.05,  # Wednesday
            3: 1.05,  # Thursday
            4: 1.15,  # Friday
            5: 0.8,  # Saturday
            6: 0.6,  # Sunday
        }

        # Weather effects (more noise disruption with good weather - open windows)
        self.min_temp = 5  # Celsius
        self.max_temp = 25  # Celsius

    def _get_weather_factor(self):
        """Get weather factor based on current temperature"""
        # Simulate temperature or use a weather API
        current_month = datetime.now().month

        # Simplified seasonal temperature model for Denmark
        avg_temp = 0
        if 3 <= current_month <= 5:  # Spring
            avg_temp = 8
        elif 6 <= current_month <= 8:  # Summer
            avg_temp = 18
        elif 9 <= current_month <= 11:  # Fall
            avg_temp = 10
        else:  # Winter
            avg_temp = 2

        # Add random variation
        temp = avg_temp + random.uniform(-3, 3)

        # Calculate weather factor (higher with better weather - more open windows)
        # More noise exposure when windows are open
        weather_factor = 0.9 + 0.2 * (
            max(self.min_temp, min(self.max_temp, temp)) - self.min_temp
        ) / (self.max_temp - self.min_temp)

        return weather_factor

    def get_current_data(self):
        """Generate noise metrics for the current day"""
        today = datetime.now()
        day_of_week = today.weekday()  # 0=Monday, 6=Sunday

        # Get traffic factor for today
        traffic_factor = self.traffic_factors[day_of_week]

        # Get weather factor
        weather_factor = self._get_weather_factor()

        # Special events (random occurrence)
        event_factor = 1.0
        if random.random() < 0.05:  # 5% chance of a special event
            event_types = ["concert", "construction", "festival", "sports event"]
            event = random.choice(event_types)
            event_factor = 1.15  # 15% more noise exposure
            print(f"Special noise event today: {event}")

        # Calculate today's metrics
        lden_exposed = (
            self.baseline_lden_exposed * traffic_factor * weather_factor * event_factor
        )
        lnight_exposed = (
            self.baseline_lnight_exposed
            * traffic_factor
            * weather_factor
            * event_factor
            * 0.9
        )  # Less traffic at night

        # Sleep disturbance correlates with night exposure but with individual variation
        sleep_disturbed = (
            self.baseline_sleep_disturbed
            * (lnight_exposed / self.baseline_lnight_exposed)
            * random.uniform(0.95, 1.05)
        )

        return {
            "lden_exposed_pct": round(lden_exposed, 1),
            "lnight_exposed_pct": round(lnight_exposed, 1),
            "sleep_disturbed_pct": round(sleep_disturbed, 1),
        }

    def normalize_metrics(self, metrics):
        """Convert raw metrics to 0-100 scores"""
        normalized = {}

        # Population exposed to Lden ≥ 55 dB: 100=0%, 0=40%
        if "lden_exposed_pct" in metrics:
            lden = metrics["lden_exposed_pct"]
            normalized["lden_exposed_pct"] = max(0, min(100, 100 - (lden * 2.5)))

        # Population exposed to Lnight ≥ 50 dB: 100=0%, 0=40%
        if "lnight_exposed_pct" in metrics:
            lnight = metrics["lnight_exposed_pct"]
            normalized["lnight_exposed_pct"] = max(0, min(100, 100 - (lnight * 2.5)))

        # Population with high sleep disturbance: 100=0%, 0=25%
        if "sleep_disturbed_pct" in metrics:
            disturbed = metrics["sleep_disturbed_pct"]
            normalized["sleep_disturbed_pct"] = max(0, min(100, 100 - (disturbed * 4)))

        # Overall score
        if normalized:
            normalized["overall"] = sum(normalized.values()) / len(normalized)

        return normalized

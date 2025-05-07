# air_quality.py
import requests
import pandas as pd
from datetime import datetime, timedelta


class AirQualityCollector:
    def __init__(self, latitude=56.1567, longitude=10.2108):
        self.latitude = latitude
        self.longitude = longitude
        self.base_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    def fetch_current_data(self):
        """Fetch today's air quality data"""
        today = datetime.now().strftime("%Y-%m-%d")

        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": ["pm10", "pm2_5", "nitrogen_dioxide"],
            "current": "european_aqi",
            "start_date": today,
            "end_date": today,
        }

        response = requests.get(self.base_url, params=params)
        data = response.json()

        # Process the response
        current_data = {
            "pm10": self._get_daily_average(data, "pm10"),
            "pm2_5": self._get_daily_average(data, "pm2_5"),
            "no2": self._get_daily_average(data, "nitrogen_dioxide"),
            "european_aqi": data.get("current", {}).get("european_aqi", None),
        }

        return current_data

    def _get_daily_average(self, data, metric):
        """Calculate daily average for a metric from hourly data"""
        if "hourly" not in data or f"{metric}" not in data["hourly"]:
            return None

        values = data["hourly"][f"{metric}"]
        return sum(values) / len(values) if values else None

    def normalize_metrics(self, metrics):
        """Convert raw metrics to 0-100 scores"""
        normalized = {}

        # PM2.5 normalization (WHO guideline: 5µg/m³, EU limit: 25µg/m³)
        if "pm2_5" in metrics and metrics["pm2_5"] is not None:
            pm25 = metrics["pm2_5"]
            # 5 or below = 100, 25 or above = 0, linear in between
            normalized["pm2_5"] = max(0, min(100, 100 - ((pm25 - 5) * 5)))

        # PM10 normalization (WHO guideline: 15µg/m³, EU limit: 40µg/m³)
        if "pm10" in metrics and metrics["pm10"] is not None:
            pm10 = metrics["pm10"]
            # 15 or below = 100, 40 or above = 0, linear in between
            normalized["pm10"] = max(0, min(100, 100 - ((pm10 - 15) * 4)))

        # NO2 normalization (WHO guideline: 10µg/m³, EU limit: 40µg/m³)
        if "no2" in metrics and metrics["no2"] is not None:
            no2 = metrics["no2"]
            # 10 or below = 100, 40 or above = 0, linear in between
            normalized["no2"] = max(0, min(100, 100 - ((no2 - 10) * 3.33)))

        # Calculate overall air quality score (average of all normalized metrics)
        if normalized:
            normalized["overall"] = sum(normalized.values()) / len(normalized)

        return normalized

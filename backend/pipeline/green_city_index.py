# green_city_index.py
from datetime import datetime
import json
import os

# Change this import
from backend.storage.supabase_client import SupabaseManager

# Fix these imports too
from backend.collectors.air_quality import AirQualityCollector
from backend.collectors.water_management import WaterManagementSimulator
from backend.collectors.nature_biodiversity import NatureBiodiversitySimulator
from backend.collectors.waste_circular_economy import WasteSimulator
from backend.collectors.noise_pollution import NoiseSimulator


class GreenCityIndex:
    def __init__(self):
        """Initialize the Green City Index calculator"""
        self.air_collector = AirQualityCollector()
        self.water_simulator = WaterManagementSimulator()
        self.nature_simulator = NatureBiodiversitySimulator()
        self.waste_simulator = WasteSimulator()
        self.noise_simulator = NoiseSimulator()

        self.supabase = SupabaseManager()

        # Dimension weights (equal by default)
        self.weights = {
            "air": 0.2,
            "water": 0.2,
            "nature": 0.2,
            "waste": 0.2,
            "noise": 0.2,
        }

    def collect_all_data(self):
        """Collect data from all dimensions"""
        print("Collecting Green City Index data...")

        # Collect raw data
        raw_data = {
            "air": self.air_collector.fetch_current_data(),
            "water": self.water_simulator.get_current_data(),
            "nature": self.nature_simulator.get_current_data(),
            "waste": self.waste_simulator.get_current_data(),
            "noise": self.noise_simulator.get_current_data(),
            "timestamp": datetime.now().isoformat(),
        }

        # Store raw data
        self._store_raw_data(raw_data)

        return raw_data

    def calculate_index(self, raw_data=None):
        """Calculate normalized scores and overall index"""
        if raw_data is None:
            raw_data = self.collect_all_data()

        # Calculate normalized scores for each dimension
        normalized = {
            "air": self.air_collector.normalize_metrics(raw_data["air"]),
            "water": self.water_simulator.normalize_metrics(raw_data["water"]),
            "nature": self.nature_simulator.normalize_metrics(raw_data["nature"]),
            "waste": self.waste_simulator.normalize_metrics(raw_data["waste"]),
            "noise": self.noise_simulator.normalize_metrics(raw_data["noise"]),
            "timestamp": datetime.now().isoformat(),
        }

        # Calculate dimension scores (overall for each dimension)
        dimension_scores = {
            "air": normalized["air"].get("overall", 0),
            "water": normalized["water"].get("overall", 0),
            "nature": normalized["nature"].get("overall", 0),
            "waste": normalized["waste"].get("overall", 0),
            "noise": normalized["noise"].get("overall", 0),
        }

        # Calculate weighted overall index
        overall_index = sum(
            score * self.weights[dim] for dim, score in dimension_scores.items()
        )

        # Create index object
        index = {
            "overall_score": round(overall_index, 1),
            "dimension_scores": {
                dim: round(score, 1) for dim, score in dimension_scores.items()
            },
            "normalized_metrics": normalized,
            "raw_data": raw_data,
            "timestamp": datetime.now().isoformat(),
            "date": datetime.now().strftime("%Y-%m-%d"),
        }

        # Store index data
        self._store_index(index)

        return index

    def _store_raw_data(self, raw_data):
        """Store raw data in Supabase"""
        for dimension, metrics in raw_data.items():
            if dimension == "timestamp":
                continue

            for name, value in metrics.items():
                self.supabase.store_raw_metric(
                    dimension=dimension,
                    metric_name=name,
                    value=value,
                    unit=self._get_unit(dimension, name),
                    source="API" if dimension == "air" else "Simulated",
                )

    def _store_index(self, index):
        """Store index data in Supabase"""
        # Store overall index
        self.supabase.store_index(
            date=index["date"],
            overall_score=index["overall_score"],
            dimension_scores=index["dimension_scores"],
            target_score=70,  # Example target
        )

        # Store normalized scores
        for dimension, metrics in index["normalized_metrics"].items():
            if dimension == "timestamp":
                continue

            for name, score in metrics.items():
                if name != "overall":
                    raw_value = index["raw_data"][dimension].get(name, None)
                    self.supabase.store_normalized_score(
                        dimension=dimension,
                        metric_name=name,
                        raw_value=raw_value,
                        normalized_score=int(score),
                        calculation_method="linear_scaling",
                        date=index["date"],
                    )

    def _get_unit(self, dimension, metric_name):
        """Get the unit for a specific metric"""
        units = {
            "air": {
                "pm10": "μg/m³",
                "pm2_5": "μg/m³",
                "no2": "μg/m³",
                "european_aqi": "index",
            },
            "water": {
                "consumption": "L/capita/day",
                "ili": "ratio",
                "treatment_compliance": "%",
            },
            "nature": {
                "protected_area_pct": "%",
                "tree_canopy_pct": "%",
                "bird_species_count": "count",
                "bird_species_change_pct": "%",
            },
            "waste": {
                "waste_per_capita": "tonnes/year",
                "recycling_rate": "%",
                "landfill_rate": "%",
            },
            "noise": {
                "lden_exposed_pct": "%",
                "lnight_exposed_pct": "%",
                "sleep_disturbed_pct": "%",
            },
        }

        return units.get(dimension, {}).get(metric_name, "")

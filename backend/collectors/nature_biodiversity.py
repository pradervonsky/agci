# nature_biodiversity.py
import requests
import random
from datetime import datetime
import math


class NatureBiodiversitySimulator:
    def __init__(self, city_area_km2=91):  # Aarhus area ~91 km²
        self.city_area = city_area_km2

        # Baseline values
        self.protected_area_pct = 8.5  # % of city that's protected/natural areas
        self.tree_canopy_pct = 19.3  # % tree coverage
        self.baseline_bird_species = 112  # Estimated species in urban Aarhus

        # Events
        self.special_events = {
            # Format: date_string: (description, impact)
            "2025-05-21": (
                "City-wide tree planting day",
                {"tree_canopy_pct": 0.2, "protected_area_pct": 0},
            ),
            "2025-06-15": (
                "New nature reserve opening",
                {"tree_canopy_pct": 0.1, "protected_area_pct": 0.3},
            ),
        }

        # Track changes over time
        self.cumulative_tree_change = 0
        self.cumulative_area_change = 0

    def _check_special_events(self):
        """Check if any special events occur today"""
        today = datetime.now().strftime("%Y-%m-%d")

        impact = {"tree_canopy_pct": 0, "protected_area_pct": 0}
        if today in self.special_events:
            event, event_impact = self.special_events[today]
            impact = event_impact
            print(f"Special event today: {event}")

        return impact

    def _simulate_bird_species(self):
        """Simulate bird species count based on season"""
        today = datetime.now()
        day_of_year = today.timetuple().tm_yday

        # Seasonal pattern with peak in spring/summer
        seasonal_factor = 0.85 + 0.3 * math.sin((day_of_year - 100) * 2 * math.pi / 365)

        # Add random variation (±5%)
        noise = 1 + (random.random() * 0.1 - 0.05)

        # Calculate species count
        species_count = round(self.baseline_bird_species * seasonal_factor * noise)

        # Calculate percent change from baseline
        percent_change = (
            (species_count - self.baseline_bird_species) / self.baseline_bird_species
        ) * 100

        return species_count, round(percent_change, 1)

    def get_current_data(self):
        """Generate nature & biodiversity metrics for the current day"""
        # Check for special events
        event_impact = self._check_special_events()

        # Update cumulative changes
        self.cumulative_tree_change += event_impact["tree_canopy_pct"]
        self.cumulative_area_change += event_impact["protected_area_pct"]

        # Slow natural growth (tiny daily increases)
        self.cumulative_tree_change += 0.0003  # ~0.1% per year natural growth

        # Current values with cumulative changes
        current_tree_canopy = self.tree_canopy_pct + self.cumulative_tree_change
        current_protected_area = self.protected_area_pct + self.cumulative_area_change

        # Simulate bird species
        species_count, species_change = self._simulate_bird_species()

        return {
            "protected_area_pct": round(current_protected_area, 2),
            "tree_canopy_pct": round(current_tree_canopy, 2),
            "bird_species_count": species_count,
            "bird_species_change_pct": species_change,
        }

    def normalize_metrics(self, metrics):
        """Convert raw metrics to 0-100 scores"""
        normalized = {}

        # Protected areas: 0=0%, 100=10%+
        if "protected_area_pct" in metrics:
            protected = metrics["protected_area_pct"]
            normalized["protected_area_pct"] = max(0, min(100, protected * 10))

        # Tree canopy: 0=5%, 100=30%
        if "tree_canopy_pct" in metrics:
            canopy = metrics["tree_canopy_pct"]
            normalized["tree_canopy_pct"] = max(0, min(100, (canopy - 5) * 4))

        # Bird species change: 0=-20%, 100=+20%
        if "bird_species_change_pct" in metrics:
            change = metrics["bird_species_change_pct"]
            normalized["bird_species_change_pct"] = max(
                0, min(100, (change + 20) * 2.5)
            )

        # Overall score
        if normalized:
            normalized["overall"] = sum(normalized.values()) / len(normalized)

        return normalized

"""
Historic Data Generator for AGCI Project

This script generates realistic historical data for the Aarhus Green City Index
using pre-defined mock data as a baseline, then applying seasonal patterns
and long-term trends to simulate historical values.
"""

import random
import json
import os
from datetime import datetime, timedelta
from backend.pipeline.green_city_index import GreenCityIndex
from backend.storage.supabase_client import SupabaseManager


class SimplifiedHistoricDataGenerator:
    def __init__(self):
        """Initialize the historic data generator with mock data"""
        self.gci = GreenCityIndex()
        self.supabase = SupabaseManager()

        # Base data from yesterday (2025-05-05)
        self.base_data = {
            "air": {
                "pm10": 4.995833333333333,
                "pm2_5": 2.975,
                "no2": 3.983333333333333,
                "european_aqi": 38,
            },
            "water": {"consumption": 108.4, "ili": 2.51, "treatment_compliance": 98.5},
            "nature": {
                "protected_area_pct": 8.5,
                "tree_canopy_pct": 19.3,
                "bird_species_count": 114,
                "bird_species_change_pct": 1.8,
            },
            "waste": {
                "waste_per_capita": 0.453,
                "recycling_rate": 47.2,
                "landfill_rate": 5.1,
            },
            "noise": {
                "lden_exposed_pct": 26.2,
                "lnight_exposed_pct": 17.0,
                "sleep_disturbed_pct": 7.7,
            },
        }

        # Base seasonal patterns (multipliers by month)
        self.seasonal_patterns = {
            "air": {  # Better in summer, worse in winter (due to heating)
                1: 0.85,
                2: 0.88,
                3: 0.92,
                4: 0.95,
                5: 1.00,
                6: 1.05,
                7: 1.08,
                8: 1.05,
                9: 1.00,
                10: 0.95,
                11: 0.90,
                12: 0.85,
            },
            "water": {  # Higher consumption in summer
                1: 1.05,
                2: 1.00,
                3: 0.95,
                4: 0.90,
                5: 0.85,
                6: 0.80,
                7: 0.75,
                8: 0.80,
                9: 0.85,
                10: 0.90,
                11: 0.95,
                12: 1.05,
            },
            "nature": {  # Higher biodiversity in spring/summer
                1: 0.75,
                2: 0.80,
                3: 0.90,
                4: 1.05,
                5: 1.15,
                6: 1.20,
                7: 1.20,
                8: 1.15,
                9: 1.05,
                10: 0.95,
                11: 0.85,
                12: 0.75,
            },
            "waste": {  # Higher waste during holidays
                1: 1.10,
                2: 0.98,
                3: 0.95,
                4: 0.92,
                5: 0.90,
                6: 0.95,
                7: 1.00,
                8: 1.05,
                9: 0.98,
                10: 0.95,
                11: 1.05,
                12: 1.20,
            },
            "noise": {  # More outdoor activity in summer
                1: 0.90,
                2: 0.90,
                3: 0.95,
                4: 1.00,
                5: 1.05,
                6: 1.10,
                7: 1.15,
                8: 1.10,
                9: 1.05,
                10: 1.00,
                11: 0.95,
                12: 0.90,
            },
        }

        # Long-term trends (annual change)
        self.annual_trends = {
            "air": 0.03,  # 3% improvement per year
            "water": 0.025,  # 2.5% improvement per year
            "nature": 0.01,  # 1% improvement per year
            "waste": 0.02,  # 2% improvement per year
            "noise": 0.015,  # 1.5% improvement per year
        }

        # Special events that affect specific dimensions
        self.special_events = {
            # Format: "MM-DD": {"dimension": impact_factor}
            "01-01": {"waste": 1.3, "noise": 1.3},  # New Year's
            "04-22": {"nature": 1.15},  # Earth Day
            "06-05": {"air": 1.1, "nature": 1.1},  # World Environment Day
            "12-24": {"waste": 1.4, "noise": 0.8},  # Christmas Eve
            "12-25": {"waste": 1.3, "noise": 0.8},  # Christmas Day
        }

    def _apply_seasonal_modifier(self, dimension, date, base_value):
        """Apply seasonal modifier based on month"""
        month = date.month
        season_mod = self.seasonal_patterns[dimension].get(month, 1.0)
        return base_value * season_mod

    def _apply_trend_modifier(self, dimension, date, base_value):
        """Apply long-term trend based on years from now"""
        now = datetime.now()
        years_diff = (now.year - date.year) + ((now.month - date.month) / 12)
        trend_factor = 1.0 - (self.annual_trends[dimension] * years_diff)
        return base_value * trend_factor

    def _apply_special_event(self, dimension, date, base_value):
        """Apply special event modifier if applicable"""
        month_day = date.strftime("%m-%d")
        if (
            month_day in self.special_events
            and dimension in self.special_events[month_day]
        ):
            return base_value * self.special_events[month_day][dimension]
        return base_value

    def _apply_random_noise(self, base_value, noise_level=0.05):
        """Apply random noise to values"""
        noise = 1.0 + random.uniform(-noise_level, noise_level)
        return base_value * noise

    def generate_data_for_date(self, target_date):
        """Generate environmental data for a specific date with all modifiers"""
        # Use random seed based on date for consistency
        random.seed(int(target_date.timestamp()))

        # Create deep copies of the base data
        air_data = dict(self.base_data["air"])
        water_data = dict(self.base_data["water"])
        nature_data = dict(self.base_data["nature"])
        waste_data = dict(self.base_data["waste"])
        noise_data = dict(self.base_data["noise"])

        # Apply modifiers to air data
        for metric in air_data:
            base = air_data[metric]
            base = self._apply_seasonal_modifier("air", target_date, base)
            base = self._apply_trend_modifier("air", target_date, base)
            base = self._apply_special_event("air", target_date, base)
            base = self._apply_random_noise(base)
            air_data[metric] = base

        # Apply modifiers to water data
        for metric in water_data:
            base = water_data[metric]
            base = self._apply_seasonal_modifier("water", target_date, base)
            base = self._apply_trend_modifier("water", target_date, base)
            base = self._apply_special_event("water", target_date, base)
            base = self._apply_random_noise(base)
            water_data[metric] = base

        # Apply modifiers to nature data
        for metric in nature_data:
            if isinstance(nature_data[metric], (int, float)):
                base = nature_data[metric]
                base = self._apply_seasonal_modifier("nature", target_date, base)
                base = self._apply_trend_modifier("nature", target_date, base)
                base = self._apply_special_event("nature", target_date, base)
                base = self._apply_random_noise(base)
                nature_data[metric] = base

        # Apply modifiers to waste data
        for metric in waste_data:
            base = waste_data[metric]
            base = self._apply_seasonal_modifier("waste", target_date, base)
            base = self._apply_trend_modifier("waste", target_date, base)
            base = self._apply_special_event("waste", target_date, base)
            base = self._apply_random_noise(base)
            waste_data[metric] = base

        # Apply modifiers to noise data
        for metric in noise_data:
            base = noise_data[metric]
            base = self._apply_seasonal_modifier("noise", target_date, base)
            base = self._apply_trend_modifier("noise", target_date, base)
            base = self._apply_special_event("noise", target_date, base)
            base = self._apply_random_noise(base)
            noise_data[metric] = base

        # Compile all data
        raw_data = {
            "air": air_data,
            "water": water_data,
            "nature": nature_data,
            "waste": waste_data,
            "noise": noise_data,
            "timestamp": target_date.isoformat(),
        }

        return raw_data

    def generate_historic_dataset(self, start_date, end_date=None, sampling="daily"):
        """
        Generate a historic dataset from start_date to end_date

        Args:
            start_date: Start date (datetime object or YYYY-MM-DD string)
            end_date: End date (datetime or string, default: today)
            sampling: 'daily', 'weekly', or 'monthly'

        Returns:
            List of index data for the date range
        """
        # Convert string dates to datetime if needed
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d")

        if end_date is None:
            end_date = datetime.now()
        elif isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d")

        # Determine sampling interval
        if sampling == "weekly":
            delta = timedelta(days=7)
        elif sampling == "monthly":
            delta = timedelta(days=30)  # Approximate
        else:  # Default to daily
            delta = timedelta(days=1)

        # Generate data for each date in the range
        current_date = start_date
        all_indexes = []

        total_points = ((end_date - start_date).days // delta.days) + 1
        print(
            f"Generating {total_points} data points from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        )

        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            print(f"Generating data for {date_str}...")

            # Generate raw data for this date
            raw_data = self.generate_data_for_date(current_date)

            # Calculate index
            index = self.gci.calculate_index(raw_data)

            # Explicitly set the date
            index["date"] = date_str

            # Add to collection
            all_indexes.append(index)

            # Move to next date
            current_date += delta

        print(f"Generated {len(all_indexes)} historical data points")
        return all_indexes

    def save_to_json(self, data, filename=None):
        """Save generated data to JSON file"""
        if not filename:
            filename = (
                f"green_city_index_history_{datetime.now().strftime('%Y%m%d')}.json"
            )

        # Ensure the processed directory exists
        os.makedirs("data/processed", exist_ok=True)

        # Full path to save
        filepath = os.path.join("data/processed", filename)

        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

        print(f"Saved historical data to {filepath}")
        return filepath

    def save_to_database(self, data):
        """Save all generated historical data to database"""
        saved_count = 0
        for index in data:
            date_str = index["date"]

            # Store in Supabase
            try:
                success = self.supabase.store_index(
                    date=date_str,
                    overall_score=index["overall_score"],
                    dimension_scores=index["dimension_scores"],
                    target_score=70.0,  # Example target
                )

                if success:
                    saved_count += 1
            except Exception as e:
                print(f"Failed to store index for {date_str}: {e}")

        print(f"Successfully stored {saved_count} of {len(data)} historical records")
        return saved_count


if __name__ == "__main__":
    generator = SimplifiedHistoricDataGenerator()

    # Parse command line arguments
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate historical data for Aarhus Green City Index"
    )
    parser.add_argument(
        "--start",
        help="Start date (YYYY-MM-DD)",
        default=(datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d"),
    )
    parser.add_argument(
        "--end", help="End date (YYYY-MM-DD), defaults to today", default=None
    )
    parser.add_argument(
        "--sampling",
        choices=["daily", "weekly", "monthly"],
        default="daily",
        help="Data frequency",
    )
    parser.add_argument("--save-db", action="store_true", help="Save to database")
    args = parser.parse_args()

    print(f"Generating {args.sampling} data from {args.start} to {args.end or 'today'}")

    # Generate the dataset
    historical_data = generator.generate_historic_dataset(
        start_date=args.start, end_date=args.end, sampling=args.sampling
    )

    # Save the complete dataset to one file
    json_path = generator.save_to_json(
        historical_data, "green_city_index_complete_history.json"
    )

    # Optionally save to database
    if args.save_db and historical_data:
        saved_count = generator.save_to_database(historical_data)
        print(f"Saved {saved_count} of {len(historical_data)} records to database")

# test_simulation.py
import json
from collectors.nature_biodiversity import NatureBiodiversitySimulator
from collectors.waste_circular_economy import WasteSimulator
from collectors.noise_pollution import NoiseSimulator
from pipeline.green_city_index import GreenCityIndex
from collectors.air_quality import AirQualityCollector
from collectors.water_management import WaterManagementSimulator


def test_all_simulators():
    """Run all simulators and print results"""
    # Initialize simulators
    air = AirQualityCollector()
    water = WaterManagementSimulator()
    nature = NatureBiodiversitySimulator()
    waste = WasteSimulator()
    noise = NoiseSimulator()

    # Collect data
    print("=== RAW DATA ===")
    air_data = air.fetch_current_data()
    print(f"Air Quality: {json.dumps(air_data, indent=2)}")

    water_data = water.get_current_data()
    print(f"Water Management: {json.dumps(water_data, indent=2)}")

    nature_data = nature.get_current_data()
    print(f"Nature & Biodiversity: {json.dumps(nature_data, indent=2)}")

    waste_data = waste.get_current_data()
    print(f"Waste & Circular Economy: {json.dumps(waste_data, indent=2)}")

    noise_data = noise.get_current_data()
    print(f"Noise Pollution: {json.dumps(noise_data, indent=2)}")

    # Normalize data
    print("\n=== NORMALIZED SCORES ===")
    air_norm = air.normalize_metrics(air_data)
    print(f"Air Quality: {json.dumps(air_norm, indent=2)}")

    water_norm = water.normalize_metrics(water_data)
    print(f"Water Management: {json.dumps(water_norm, indent=2)}")

    nature_norm = nature.normalize_metrics(nature_data)
    print(f"Nature & Biodiversity: {json.dumps(nature_norm, indent=2)}")

    waste_norm = waste.normalize_metrics(waste_data)
    print(f"Waste & Circular Economy: {json.dumps(waste_norm, indent=2)}")

    noise_norm = noise.normalize_metrics(noise_data)
    print(f"Noise Pollution: {json.dumps(noise_norm, indent=2)}")

    # Calculate overall index
    gci = GreenCityIndex()
    index = gci.calculate_index(
        {
            "air": air_data,
            "water": water_data,
            "nature": nature_data,
            "waste": waste_data,
            "noise": noise_data,
            "timestamp": "2025-05-05T12:00:00",
        }
    )

    print("\n=== GREEN CITY INDEX ===")
    print(f"Overall Score: {index['overall_score']}")
    print(f"Dimension Scores: {json.dumps(index['dimension_scores'], indent=2)}")


if __name__ == "__main__":
    test_all_simulators()

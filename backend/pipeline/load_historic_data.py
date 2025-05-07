"""
Script to load previously generated historic data from JSON into Supabase database
"""

import json
import argparse
from backend.storage.supabase_client import SupabaseManager


def load_json_to_supabase(json_file_path, target_score=70.0):
    """
    Load historic AGCI data from JSON file to Supabase

    Args:
        json_file_path: Path to JSON file containing historic data
        target_score: Target score to use (default: 70.0)
    """
    print(f"Loading data from {json_file_path}")

    # Load the JSON data
    with open(json_file_path, "r") as f:
        data = json.load(f)

    # Initialize Supabase client
    supabase = SupabaseManager()
    print(f"Loaded {len(data)} records from file")

    # Store each record in database
    saved_count = 0
    for index in data:
        if (
            "date" not in index
            or "overall_score" not in index
            or "dimension_scores" not in index
        ):
            print(f"Skipping incomplete record: {index.get('date', 'unknown date')}")
            continue

        date_str = index["date"]

        try:
            success = supabase.store_index(
                date=date_str,
                overall_score=index["overall_score"],
                dimension_scores=index["dimension_scores"],
                target_score=target_score,
            )

            if success:
                saved_count += 1
                if saved_count % 10 == 0:  # Status update every 10 records
                    print(f"Saved {saved_count}/{len(data)} records...")
        except Exception as e:
            print(f"Failed to store index for {date_str}: {e}")

    print(f"Successfully stored {saved_count} of {len(data)} historical records")
    return saved_count


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Load historic AGCI data from JSON to Supabase"
    )
    parser.add_argument(
        "--file",
        default="data/processed/green_city_index_complete_history.json",
        help="Path to JSON file containing historic data",
    )
    parser.add_argument(
        "--target", type=float, default=70.0, help="Target score to use"
    )
    args = parser.parse_args()

    # Load data
    load_json_to_supabase(args.file, args.target)

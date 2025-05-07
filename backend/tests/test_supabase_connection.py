# backend/tests/test_supabase_connection.py

import sys
import os
import logging
from datetime import date

# Add parent directory to path to import SupabaseManager
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from storage.supabase_client import SupabaseManager

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_connection():
    """Test the connection to Supabase"""
    try:
        db = SupabaseManager()
        client = db.get_client()

        if client:
            logger.info("Successfully connected to Supabase")
            return True
        else:
            logger.error("Failed to connect to Supabase")
            return False
    except Exception as e:
        logger.error(f"Error connecting to Supabase: {e}")
        return False


def test_basic_operations():
    """Test basic CRUD operations"""
    db = SupabaseManager()

    # Test date
    today = date.today().isoformat()

    # Test operations
    operations = [
        {
            "name": "Store raw metric",
            "func": db.store_raw_metric,
            "args": {
                "dimension": "test",
                "metric_name": "test_metric",
                "value": 42.5,
                "unit": "test_unit",
                "source": "test",
            },
        },
        {
            "name": "Store normalized score",
            "func": db.store_normalized_score,
            "args": {
                "dimension": "test",
                "metric_name": "test_metric",
                "raw_value": 42.5,
                "normalized_score": 75,
                "calculation_method": "test_method",
                "date": today,
            },
        },
        {
            "name": "Store dimension score",
            "func": db.store_dimension_score,
            "args": {"dimension": "test", "score": 75, "date": today},
        },
        {
            "name": "Store index",
            "func": db.store_index,
            "args": {
                "date": today,
                "overall_score": 70,
                "dimension_scores": {
                    "air": 80,
                    "water": 75,
                    "nature": 65,
                    "waste": 70,
                    "noise": 60,
                },
                "target_score": 75,
            },
        },
    ]

    # Run tests
    for op in operations:
        try:
            result = op["func"](**op["args"])
            if result:
                logger.info(f"✅ {op['name']} successful")
            else:
                logger.error(f"❌ {op['name']} failed")
        except Exception as e:
            logger.error(f"❌ {op['name']} error: {e}")

    # Test retrieval
    try:
        latest_index = db.get_latest_index()
        if latest_index:
            logger.info(f"✅ Get latest index successful: {latest_index}")
        else:
            logger.error("❌ Get latest index failed")
    except Exception as e:
        logger.error(f"❌ Get latest index error: {e}")


if __name__ == "__main__":
    if test_connection():
        test_basic_operations()

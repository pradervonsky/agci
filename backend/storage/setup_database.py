# backend/storage/setup_database.py
from backend.storage.supabase_client import SupabaseManager
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_connection():
    """Test the connection to Supabase"""
    db = SupabaseManager()
    client = db.get_client()

    if client:
        logger.info("Successfully connected to Supabase")
        return True
    else:
        logger.error("Failed to connect to Supabase")
        return False


if __name__ == "__main__":
    test_connection()

# backend/storage/supabase_client.py
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
from datetime import datetime

# Configure logging
logger = logging.getLogger(__name__)


class SupabaseManager:
    """
    Manages Supabase connections and provides methods for database operations
    """

    _instance = None

    def __new__(cls):
        """Singleton pattern to ensure only one client instance exists"""
        if cls._instance is None:
            cls._instance = super(SupabaseManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize the Supabase client"""
        # Load environment variables
        load_dotenv()

        # Get Supabase credentials
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_API_KEY")

        # Initialize client
        self.client = None
        if self.supabase_url and self.supabase_key:
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Successfully initialized Supabase client")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                raise
        else:
            logger.warning("Supabase credentials not found in environment variables")

    def get_client(self) -> Client:
        """
        Get the Supabase client

        Returns:
            Client: Supabase client or None if not initialized
        """
        return self.client

    def store_raw_metric(self, dimension, metric_name, value, unit, source):
        """
        Store a raw metric in the raw_metrics table

        Args:
            dimension: Category of the metric (Air, Water, etc.)
            metric_name: Name of the metric
            value: Numeric value
            unit: Unit of measurement
            source: Source of the data (API, Simulated, etc.)

        Returns:
            bool: Success status
        """
        if not self.client:
            logger.warning("No Supabase client available")
            return False

        try:
            result = (
                self.client.table("raw_metrics")
                .insert(
                    {
                        "dimension": dimension,
                        "metric_name": metric_name,
                        "value": value,
                        "unit": unit,
                        "source": source,
                        "collection_timestamp": datetime.now().isoformat(),
                    }
                )
                .execute()
            )

            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Failed to store raw metric: {e}")
            return False

    def store_normalized_score(
        self,
        dimension,
        metric_name,
        raw_value,
        normalized_score,
        calculation_method,
        date,
    ):
        """
        Store a normalized score in the normalized_scores table

        Args:
            dimension: Category of the metric
            metric_name: Name of the metric
            raw_value: Original raw value
            normalized_score: Score on 0-100 scale
            calculation_method: Description of normalization method
            date: Date of the score

        Returns:
            bool: Success status
        """
        if not self.client:
            logger.warning("No Supabase client available")
            return False

        try:
            result = (
                self.client.table("normalized_scores")
                .insert(
                    {
                        "dimension": dimension,
                        "metric_name": metric_name,
                        "raw_value": raw_value,
                        "normalized_score": normalized_score,
                        "calculation_method": calculation_method,
                        "date": date,
                    }
                )
                .execute()
            )

            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Failed to store normalized score: {e}")
            return False

    def store_dimension_score(self, dimension, score, date):
        """
        Store a dimension score in the dimension_scores table

        Args:
            dimension: Category (Air, Water, etc.)
            score: Dimension score (0-100)
            date: Date of the score

        Returns:
            bool: Success status
        """
        if not self.client:
            logger.warning("No Supabase client available")
            return False

        try:
            # Check if record already exists
            existing = (
                self.client.table("dimension_scores")
                .select("*")
                .eq("dimension", dimension)
                .eq("date", date)
                .execute()
            )

            if len(existing.data) > 0:
                # Update existing record
                result = (
                    self.client.table("dimension_scores")
                    .update({"score": score})
                    .eq("dimension", dimension)
                    .eq("date", date)
                    .execute()
                )
            else:
                # Insert new record
                result = (
                    self.client.table("dimension_scores")
                    .insert({"dimension": dimension, "score": score, "date": date})
                    .execute()
                )

            return True
        except Exception as e:
            logger.error(f"Failed to store dimension score: {e}")
            return False

    def store_index(self, date, overall_score, dimension_scores, target_score):
        """
        Store the overall Green City Index and dimension scores

        Args:
            date: Date of the index
            overall_score: Overall GCI score (0-100)
            dimension_scores: Dict of dimension scores
            target_score: Target score for comparison

        Returns:
            bool: Success status
        """
        if not self.client:
            logger.warning("No Supabase client available")
            return False

        try:
            # Check if record already exists
            existing = (
                self.client.table("green_city_index")
                .select("*")
                .eq("date", date)
                .execute()
            )

            if len(existing.data) > 0:
                # Update existing record
                result = (
                    self.client.table("green_city_index")
                    .update(
                        {
                            "overall_score": overall_score,
                            "air_score": dimension_scores["air"],
                            "water_score": dimension_scores["water"],
                            "nature_score": dimension_scores["nature"],
                            "waste_score": dimension_scores["waste"],
                            "noise_score": dimension_scores["noise"],
                            "target_score": target_score,
                        }
                    )
                    .eq("date", date)
                    .execute()
                )
            else:
                # Insert new record
                result = (
                    self.client.table("green_city_index")
                    .insert(
                        {
                            "date": date,
                            "overall_score": overall_score,
                            "air_score": dimension_scores["air"],
                            "water_score": dimension_scores["water"],
                            "nature_score": dimension_scores["nature"],
                            "waste_score": dimension_scores["waste"],
                            "noise_score": dimension_scores["noise"],
                            "target_score": target_score,
                        }
                    )
                    .execute()
                )

            # Also store individual dimension scores
            for dim, score in dimension_scores.items():
                self.store_dimension_score(dim, score, date)

            return True
        except Exception as e:
            logger.error(f"Failed to store index: {e}")
            return False

    def get_latest_index(self):
        """
        Get the most recent Green City Index

        Returns:
            dict: Latest index data or None if not available
        """
        if not self.client:
            logger.warning("No Supabase client available")
            return None

        try:
            result = (
                self.client.table("green_city_index")
                .select("*")
                .order("date", desc=True)
                .limit(1)
                .execute()
            )

            if result.data and len(result.data) > 0:
                return result.data[0]
            else:
                return None
        except Exception as e:
            logger.error(f"Failed to get latest index: {e}")
            return None

    def get_historical_index(self, days=30):
        """
        Get historical index data for the past N days

        Args:
            days: Number of days of history to retrieve

        Returns:
            list: Historical index data or empty list if error
        """
        if not self.client:
            logger.warning("No Supabase client available")
            return []

        try:
            # Get records from the past N days
            result = (
                self.client.table("green_city_index")
                .select("*")
                .order("date", desc=True)
                .limit(days)
                .execute()
            )

            if result.data:
                return result.data
            else:
                return []
        except Exception as e:
            logger.error(f"Failed to get historical index: {e}")
            return []

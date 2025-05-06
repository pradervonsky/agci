# run_daily_update.py
import logging
from datetime import datetime
from backend.pipeline.green_city_index import GreenCityIndex


def main():
    # Set up logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(
                f"logs/gci_update_{datetime.now().strftime('%Y%m%d')}.log"
            ),
            logging.StreamHandler(),
        ],
    )
    logger = logging.getLogger("green_city_index")

    # Initialize Green City Index
    gci = GreenCityIndex()

    try:
        # Collect data and calculate index
        logger.info("Starting data collection...")
        raw_data = gci.collect_all_data()
        logger.info("Raw data collected successfully")

        # Calculate the index
        logger.info("Calculating Green City Index...")
        index = gci.calculate_index(raw_data)

        # Log results
        logger.info(
            f"Green City Index calculated successfully: {index['overall_score']}"
        )
        logger.info(f"Dimension scores: {index['dimension_scores']}")

        return True
    except Exception as e:
        logger.error(f"Error in Green City Index update: {e}")
        return False


if __name__ == "__main__":
    main()

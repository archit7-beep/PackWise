import logging
import sys


def setup_logging(debug: bool = False):
    level = logging.DEBUG if debug else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    
    # Create application logger
    logger = logging.getLogger("packwise")
    logger.setLevel(level)
    return logger

logger = logging.getLogger("packwise")

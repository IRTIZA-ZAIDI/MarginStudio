import logging
from app.core.config import settings


def setup_logging():
    level = getattr(logging, settings.LITELLM_LOG.upper(), logging.WARNING)
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

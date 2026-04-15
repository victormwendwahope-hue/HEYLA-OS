import os
import logging
from app import create_app

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = create_app(os.getenv("FLASK_ENV", "production"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = "0.0.0.0"
    logger.info(f"Starting server on {host}:{port} (FLASK_ENV={os.getenv('FLASK_ENV')})")
    app.run(host=host, port=port, debug=False)



import logging
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    FRONTEND_URL: str
    GCP_PROJECT_ID: str | None = "local-project"
    RENDER_TOPIC_ID: str = "manim-render-requests"
    GEMINI_API_KEY: str | None = None
    DB_URL: str | None = None
    REDIS_RL_URL: str | None = None
    emulator_host: str | None = None
    INTERNAL_API_SECRET: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

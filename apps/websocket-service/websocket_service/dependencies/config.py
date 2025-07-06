import logging

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    VALKEY_URI: str | None = None
    REDIS_HOST: str | None = None
    REDIS_PORT: int | None = None
    REDIS_CHANNEL: str = "video_links"
    FIREBASE_SERVICE_ACCOUNT_KEY: str | None = None
    DB_URL: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

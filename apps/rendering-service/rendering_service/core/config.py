import logging

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DROPBOX_APP_KEY: str | None = None
    DROPBOX_APP_SECRET: str | None = None
    DROPBOX_REFRESH_TOKEN: str | None = None

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_CHANNEL: str = "video_links"

    VIDEO_OUTPUT_DIR: str = "/tmp/media"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

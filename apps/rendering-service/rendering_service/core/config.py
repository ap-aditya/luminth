import logging

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DROPBOX_APP_KEY: str | None = None
    DROPBOX_APP_SECRET: str | None = None
    DROPBOX_REFRESH_TOKEN: str | None = None
    VALKEY_URI: str | None = None
    REDIS_HOST: str | None = None
    REDIS_PORT: int | None = None
    REDIS_CHANNEL: str | None = "video_links"
    SUBSCRIPTION_NAME: str | None = "manim-render-requests-sub"
    VIDEO_OUTPUT_DIR: str | None = "/tmp/media"

    class Config:
        env_file =  ".env"
        env_file_encoding = "utf-8"


settings = Settings()
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

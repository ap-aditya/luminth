from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    FIREBASE_SERVICE_ACCOUNT_KEY: str | None = None
    FRONTEND_URL: str = "http://localhost:3000"
    GCP_PROJECT_ID: str | None = "local-project"
    RENDER_TOPIC_ID: str = "manim-render-requests"
    GEMINI_API_KEY: str | None = None
    DB_URL: str | None = None
    REDIS_RL_URL: str | None = "redis://localhost:6380"
    emulator_host: str | None = None
    INTERNAL_API_SECRET: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

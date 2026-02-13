from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "MarginAI Backend"
    ENV: str = "dev"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: str = "http://localhost:3000"
    STORAGE_DIR: str = "storage"
    PDF_DIR: str = "storage/pdfs"
    IMAGE_DIR: str = "storage/images"

    DATABASE_URL: str = "sqlite+aiosqlite:///./storage/app.db"

    DEFAULT_MODEL: str = "gpt-4o-mini"

    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")

    LITELLM_LOG: str = "WARNING"

    class Config:
        env_file = ".env"
        extra = "ignore"

    def cors_origins_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()

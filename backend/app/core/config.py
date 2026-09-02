import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "PackWise API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    FRONTEND_ORIGINS: str = "[\"*\"]"
    
    # Placeholders for future subsystems
    DATABASE_URL: str = ""
    TEST_DATABASE_URL: str = ""
    TESTING: bool = False
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../.env"), 
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def frontend_origins_list(self) -> list[str]:
        try:
            return json.loads(self.FRONTEND_ORIGINS)
        except Exception:
            return ["*"]

settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    #JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # ~24 hours

    #Database
    database_url: str

    #CORS — comma-separated origins for production (e.g. https://app.vercel.app)
    cors_origins: str = ""

    #seed for initial admin user
    admin_email: str
    admin_password: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
        )


settings = Settings()
